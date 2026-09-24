import AVFoundation
import Observation

/// One piece of speech in a sequence.
struct Utterance {
    var text: String
    /// Silence after this piece, before the next one starts.
    var pauseAfter: TimeInterval = 0
    /// Multiplies the chosen speaking speed; below 1 is slower.
    var rateScale: Double = 1
    /// Called when this piece starts playing, so a screen can follow along.
    var onStart: (() -> Void)?
}

/// Reads text aloud with the chosen voice and speed.
///
/// Everything goes through one synthesizer, so starting new speech anywhere in the app stops whatever was
/// playing. Whoever started that speech hears about it through `onStop`.
@MainActor
@Observable
final class Speaker: NSObject, AVSpeechSynthesizerDelegate {
    private(set) var isSpeaking = false

    @ObservationIgnored private let synthesizer = AVSpeechSynthesizer()
    @ObservationIgnored private let settings: AppSettings
    /// The queued pieces, keyed by the synthesizer's utterance. Holding the utterance keeps its identity unique.
    @ObservationIgnored private var queued: [ObjectIdentifier: (utterance: AVSpeechUtterance, piece: Utterance)] = [:]
    @ObservationIgnored private var lastID: ObjectIdentifier?
    @ObservationIgnored private var onFinish: (() -> Void)?
    @ObservationIgnored private var onStop: (() -> Void)?

    init(settings: AppSettings) {
        self.settings = settings
        super.init()
        synthesizer.delegate = self
    }

    func speak(_ text: String, rateScale: Double = 1, then onFinish: (() -> Void)? = nil) {
        speak([Utterance(text: text, rateScale: rateScale)], then: onFinish)
    }

    /// Stops anything already playing, then plays `pieces` in order.
    /// - Parameters:
    ///   - onFinish: called after the last piece has been spoken.
    ///   - onStop: called instead if the speech is stopped or replaced before it finishes.
    func speak(_ pieces: [Utterance], then onFinish: (() -> Void)? = nil, onStop: (() -> Void)? = nil) {
        stop()
        guard !pieces.isEmpty else {
            onFinish?()
            return
        }
        AudioSession.usePlayback()
        let voice = VoiceCatalog.voice(identifier: settings.voiceIdentifier)
        for piece in pieces {
            let utterance = AVSpeechUtterance(string: piece.text)
            utterance.voice = voice
            utterance.rate = Float(settings.speechRate * piece.rateScale)
            utterance.postUtteranceDelay = piece.pauseAfter
            let id = ObjectIdentifier(utterance)
            queued[id] = (utterance, piece)
            lastID = id
            synthesizer.speak(utterance)
        }
        self.onFinish = onFinish
        self.onStop = onStop
        isSpeaking = true
    }

    func stop() {
        let interrupted = onStop
        queued.removeAll()
        lastID = nil
        onFinish = nil
        onStop = nil
        if synthesizer.isSpeaking || synthesizer.isPaused {
            synthesizer.stopSpeaking(at: .immediate)
        }
        isSpeaking = false
        interrupted?()
    }

    // MARK: AVSpeechSynthesizerDelegate

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        Task { @MainActor [weak self] in
            self?.started(utterance)
        }
    }

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        Task { @MainActor [weak self] in
            self?.finished(utterance)
        }
    }

    private func started(_ utterance: AVSpeechUtterance) {
        queued[ObjectIdentifier(utterance)]?.piece.onStart?()
    }

    private func finished(_ utterance: AVSpeechUtterance) {
        let id = ObjectIdentifier(utterance)
        // Anything no longer queued belongs to speech that was stopped or replaced.
        guard queued.removeValue(forKey: id) != nil, id == lastID else { return }
        let finish = onFinish
        lastID = nil
        onFinish = nil
        onStop = nil
        isSpeaking = false
        finish?()
    }
}
