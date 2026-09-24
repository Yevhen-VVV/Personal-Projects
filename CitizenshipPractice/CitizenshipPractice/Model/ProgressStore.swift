import Foundation
import Observation

struct QuestionStats: Codable, Equatable {
    var correct = 0
    var wrong = 0
    /// Correct answers in a row, reset by a miss.
    var streak = 0

    /// Two right in a row. One lucky answer is not enough to stop asking.
    var isMastered: Bool { streak >= 2 }
    var needsWork: Bool { wrong > 0 && streak == 0 }
    var isSeen: Bool { correct + wrong > 0 }
}

/// How the learner has done on each question, kept on the device.
@MainActor
@Observable
final class ProgressStore {
    private(set) var byQuestion: [Int: QuestionStats] = [:]

    @ObservationIgnored private let defaults: UserDefaults
    private static let key = "progress.v1"

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        if let data = defaults.data(forKey: Self.key),
           let saved = try? JSONDecoder().decode([Int: QuestionStats].self, from: data) {
            byQuestion = saved
        }
    }

    func stats(for id: Int) -> QuestionStats {
        byQuestion[id] ?? QuestionStats()
    }

    func record(_ id: Int, correct: Bool) {
        var entry = stats(for: id)
        if correct {
            entry.correct += 1
            entry.streak += 1
        } else {
            entry.wrong += 1
            entry.streak = 0
        }
        byQuestion[id] = entry
        save()
    }

    var masteredCount: Int {
        byQuestion.values.filter(\.isMastered).count
    }

    /// Questions not yet answered right twice in a row, missed ones first.
    func notMastered(in ids: [Int]) -> [Int] {
        let open = ids.filter { !stats(for: $0).isMastered }
        return open.filter { stats(for: $0).needsWork } + open.filter { !stats(for: $0).needsWork }
    }

    func reset() {
        byQuestion = [:]
        save()
    }

    private func save() {
        if let data = try? JSONEncoder().encode(byQuestion) {
            defaults.set(data, forKey: Self.key)
        }
    }
}
