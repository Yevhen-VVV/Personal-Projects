import AVFoundation
import Observation
import Speech

/// Turns the learner's spoken answer into text.
///
/// Listening ends only when the learner taps to stop: someone composing an answer in a second language pauses
/// mid-sentence, and cutting them off at the first pause is the fastest way to teach them to stop speaking.
@MainActor
@Observable
final class SpeechListener {
    private(set) var transcript = ""
    private(set) var isListening = false
    /// Stopped, and waiting for the recognizer to deliver the last words.
    private(set) var isSettling = false
    /// Why listening could not start, in words the learner can act on.
    private(set) var problem: String?

    @ObservationIgnored private var engine: AVAudioEngine?
    @ObservationIgnored private var request: SFSpeechAudioBufferRecognitionRequest?
    @ObservationIgnored private var task: SFSpeechRecognitionTask?
    @ObservationIgnored private var completion: ((String) -> Void)?
    /// Bumped whenever a session ends, so late callbacks from an old session are ignored.
    @ObservationIgnored private var generation = 0

    /// Starts listening. `completion` receives the final transcript (possibly empty) once the learner stops.
    /// - Parameter hints: words likely to be said, such as names from the accepted answers.
    func start(hints: [String] = [], completion: @escaping (String) -> Void) async {
        guard !isListening, !isSettling else { return }
        problem = nil
        transcript = ""
        guard await permissionsGranted() else { return }

        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US")), recognizer.isAvailable else {
            problem = "Speech recognition isn’t available right now. Check your internet connection, or type your answer."
            return
        }

        do {
            try AudioSession.useRecording()
            let engine = AVAudioEngine()
            let input = engine.inputNode
            let format = input.outputFormat(forBus: 0)
            guard format.sampleRate > 0, format.channelCount > 0 else {
                throw ListenerError.noMicrophone
            }

            let request = SFSpeechAudioBufferRecognitionRequest()
            request.shouldReportPartialResults = true
            request.contextualStrings = Array(hints.prefix(100))
            if recognizer.supportsOnDeviceRecognition {
                request.requiresOnDeviceRecognition = true
            }

            Self.installTap(on: input, format: format, feeding: request)
            engine.prepare()
            try engine.start()

            generation += 1
            let current = generation
            self.engine = engine
            self.request = request
            self.completion = completion
            isListening = true
            task = recognizer.recognitionTask(
                with: request,
                resultHandler: Self.resultHandler { [weak self] text, isFinal, failed in
                    self?.receive(text: text, isFinal: isFinal, failed: failed, generation: current)
                }
            )
        } catch {
            problem = "Couldn’t start the microphone. Try again, or type your answer."
            tearDown()
        }
    }

    /// The learner has finished speaking. The recognizer settles a moment later and then calls `completion`.
    func stop() {
        guard isListening else { return }
        engine?.stop()
        engine?.inputNode.removeTap(onBus: 0)
        request?.endAudio()
        isListening = false
        isSettling = true

        // If the recognizer never reports a final result, finish with what was heard so far.
        let current = generation
        Task { @MainActor [weak self] in
            try? await Task.sleep(for: .seconds(2))
            guard let self, self.generation == current, self.completion != nil else { return }
            self.finish()
        }
    }

    /// Abandons listening without reporting anything, for example when leaving the screen.
    func cancel() {
        completion = nil
        tearDown()
        transcript = ""
    }

    // MARK: Private

    private enum ListenerError: Error {
        case noMicrophone
    }

    private func receive(text: String?, isFinal: Bool, failed: Bool, generation: Int) {
        guard generation == self.generation else { return }
        if let text {
            transcript = text
        }
        // A failure also ends the session, for instance when the recognizer gives up after a long silence;
        // whatever it heard before that is kept.
        if isFinal || failed {
            finish()
        }
    }

    private func finish() {
        let completion = self.completion
        self.completion = nil
        let heard = transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        tearDown()
        completion?(heard)
    }

    private func tearDown() {
        generation += 1
        task?.cancel()
        task = nil
        if let engine {
            engine.stop()
            engine.inputNode.removeTap(onBus: 0)
        }
        engine = nil
        request = nil
        isListening = false
        isSettling = false
        AudioSession.usePlayback()
    }

    private func permissionsGranted() async -> Bool {
        let speechStatus = await withCheckedContinuation { (continuation: CheckedContinuation<SFSpeechRecognizerAuthorizationStatus, Never>) in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }
        guard speechStatus == .authorized else {
            problem = "Speech recognition is turned off for this app. Turn it on in Settings › Privacy & Security › Speech Recognition, or type your answer."
            return false
        }
        guard await AVAudioApplication.requestRecordPermission() else {
            problem = "The microphone is turned off for this app. Turn it on in Settings › Privacy & Security › Microphone, or type your answer."
            return false
        }
        return true
    }

    // These are built outside the main actor on purpose: the audio tap runs on a real-time audio thread and the
    // recognizer calls back on its own queue, so neither closure may be isolated to the main actor.

    nonisolated private static func installTap(
        on input: AVAudioInputNode,
        format: AVAudioFormat,
        feeding request: SFSpeechAudioBufferRecognitionRequest
    ) {
        input.removeTap(onBus: 0)
        input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
            request.append(buffer)
        }
    }

    nonisolated private static func resultHandler(
        _ deliver: @escaping @Sendable @MainActor (String?, Bool, Bool) -> Void
    ) -> @Sendable (SFSpeechRecognitionResult?, Error?) -> Void {
        { result, error in
            let text = result?.bestTranscription.formattedString
            let isFinal = result?.isFinal ?? false
            let failed = error != nil
            Task { @MainActor in
                deliver(text, isFinal, failed)
            }
        }
    }
}
