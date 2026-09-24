import Foundation
import Observation

/// Hands-free listening: each question, a pause to answer in your head, then the answer, then the next one.
///
/// The whole remaining list is queued in the synthesizer at once, with the pauses built into the utterances,
/// so playback carries on with the screen locked instead of waiting on the app to schedule the next question.
@MainActor
@Observable
final class ListenPlayer {
    enum Phase {
        case question, answer
    }

    private(set) var order: [Int]
    private(set) var position = 0
    private(set) var phase: Phase = .question
    private(set) var isPlaying = false

    @ObservationIgnored private let speaker: Speaker
    @ObservationIgnored private let settings: AppSettings
    @ObservationIgnored private let bank: QuestionBank

    init(speaker: Speaker, settings: AppSettings, bank: QuestionBank = .standard) {
        self.speaker = speaker
        self.settings = settings
        self.bank = bank
        order = settings.listenShuffled ? bank.allIDs.shuffled() : bank.allIDs
    }

    var current: Question? {
        order.indices.contains(position) ? bank.question(id: order[position]) : nil
    }

    func togglePlayback() {
        isPlaying ? pause() : play()
    }

    func play() {
        guard !order.isEmpty else { return }
        if position >= order.count {
            position = 0
        }
        speak(from: position)
    }

    func pause() {
        speaker.stop()
        isPlaying = false
    }

    func next() {
        move(to: position + 1)
    }

    func previous() {
        // Like a music player: during the answer, go back to the start of this question; during the question,
        // go to the one before.
        move(to: phase == .answer ? position : position - 1)
    }

    func jump(toQuestion id: Int) {
        guard let index = order.firstIndex(of: id) else { return }
        move(to: index)
    }

    /// Re-deals the questions, in order or shuffled, and starts again from the first.
    func reorder(shuffled: Bool) {
        let wasPlaying = isPlaying
        pause()
        order = shuffled ? bank.allIDs.shuffled() : bank.allIDs
        position = 0
        phase = .question
        if wasPlaying {
            play()
        }
    }

    /// Picks up changed settings, such as the pause length, from the current question.
    func restartCurrentIfPlaying() {
        if isPlaying {
            speak(from: position)
        }
    }

    private func move(to index: Int) {
        position = min(max(index, 0), max(order.count - 1, 0))
        phase = .question
        if isPlaying {
            speak(from: position)
        }
    }

    private func speak(from start: Int) {
        var pieces: [Utterance] = []
        for index in start..<order.count {
            guard let question = bank.question(id: order[index]) else { continue }
            let answers = question.resolvedAnswers(using: settings.localAnswers)
            pieces.append(Utterance(
                text: "Question \(question.id). \(SpokenText.question(question))",
                pauseAfter: settings.listenPause,
                onStart: { [weak self] in
                    self?.position = index
                    self?.phase = .question
                }
            ))
            pieces.append(Utterance(
                text: SpokenText.answers(answers, required: question.required, readAll: settings.listenReadsAllAnswers),
                pauseAfter: 1.5,
                onStart: { [weak self] in
                    self?.phase = .answer
                }
            ))
        }
        guard !pieces.isEmpty else {
            isPlaying = false
            return
        }
        speaker.speak(
            pieces,
            then: { [weak self] in
                guard let self else { return }
                self.isPlaying = false
                self.position = 0
                self.phase = .question
            },
            onStop: { [weak self] in
                self?.isPlaying = false
            }
        )
        // Set after speaking: replacing our own earlier queue calls its onStop, which clears the flag.
        isPlaying = true
    }
}
