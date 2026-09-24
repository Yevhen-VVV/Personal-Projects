import Foundation

enum PracticeKind: Hashable {
    /// Up to 20 questions, ending as soon as the learner has 12 right or 9 wrong, like the real test.
    case interview
    /// Every chosen question, however it goes.
    case practice
}

/// The order and scoring of one sitting. Pure logic, so the interview rules can be unit tested.
struct PracticeSession: Equatable {
    static let interviewLength = 20
    static let passMark = 12
    static let failMark = 9

    struct Outcome: Equatable {
        let questionID: Int
        let correct: Bool
    }

    let kind: PracticeKind
    let questionIDs: [Int]
    private(set) var outcomes: [Outcome] = []

    init(kind: PracticeKind, questionIDs: [Int]) {
        self.kind = kind
        self.questionIDs = questionIDs
    }

    var index: Int { outcomes.count }
    var correctCount: Int { outcomes.filter(\.correct).count }
    var wrongCount: Int { outcomes.count - correctCount }
    var missedIDs: [Int] { outcomes.filter { !$0.correct }.map(\.questionID) }

    var isFinished: Bool {
        if index >= questionIDs.count { return true }
        if kind == .interview {
            return correctCount >= Self.passMark || wrongCount >= Self.failMark
        }
        return false
    }

    var passed: Bool { correctCount >= Self.passMark }

    var currentID: Int? {
        isFinished ? nil : questionIDs[index]
    }

    mutating func record(correct: Bool) {
        guard let id = currentID else { return }
        outcomes.append(Outcome(questionID: id, correct: correct))
    }

    /// Twenty questions drawn at random, as the officer would.
    static func interviewQuestions(from ids: [Int]) -> [Int] {
        Array(ids.shuffled().prefix(interviewLength))
    }
}
