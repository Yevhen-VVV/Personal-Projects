import Foundation

/// Turns printed questions and answers into what should be said aloud.
enum SpokenText {
    static func question(_ question: Question) -> String {
        plain(question.text)
    }

    /// "(U.S.) Constitution" → "U.S. Constitution", "Twenty-seven (27)" → "Twenty-seven".
    static func answer(_ answer: Answer) -> String {
        answer.say ?? plain(answer.text)
    }

    static func plain(_ text: String) -> String {
        text.replacingOccurrences(of: "\\s*\\(\\d+\\)", with: "", options: .regularExpression)
            .replacingOccurrences(of: "(", with: "")
            .replacingOccurrences(of: ")", with: "")
            .replacingOccurrences(of: "/", with: " or ")
    }

    /// The answers as one passage: "Answer: Republic. Or: Representative democracy."
    ///
    /// Long lists are cut to a few so that listening stays brisk; `readAll` reads every accepted answer.
    static func answers(_ answers: [Answer], required: Int, readAll: Bool) -> String {
        guard !answers.isEmpty else {
            return "This answer depends on where you live. Add your details in Settings."
        }
        let count = readAll ? answers.count : min(answers.count, max(required, 3))
        let spoken = answers.prefix(count).map { trimmingFinalPeriod(answer($0)) }
        if required > 1 {
            return "Give \(required) answers. For example: " + spoken.joined(separator: ". ") + "."
        }
        return "Answer: " + spoken.joined(separator: ". Or: ") + "."
    }

    private static func trimmingFinalPeriod(_ text: String) -> String {
        text.hasSuffix(".") ? String(text.dropLast()) : text
    }
}
