import Foundation

/// A run of consecutive questions that share a section and subsection, as USCIS groups them.
struct QuestionGroup: Identifiable, Hashable {
    let section: String
    let subsection: String
    let questions: [Question]

    var id: String { "\(section)/\(subsection)" }
}

/// The full question list, loaded once from `questions.json` in the app bundle.
struct QuestionBank {
    let questions: [Question]
    let groups: [QuestionGroup]
    private let byID: [Int: Question]

    init(questions: [Question]) {
        let sorted = questions.sorted { $0.id < $1.id }
        self.questions = sorted
        byID = Dictionary(sorted.map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })

        var groups: [QuestionGroup] = []
        for question in sorted {
            if let last = groups.last, last.section == question.section, last.subsection == question.subsection {
                groups[groups.count - 1] = QuestionGroup(
                    section: last.section,
                    subsection: last.subsection,
                    questions: last.questions + [question]
                )
            } else {
                groups.append(QuestionGroup(section: question.section, subsection: question.subsection, questions: [question]))
            }
        }
        self.groups = groups
    }

    func question(id: Int) -> Question? {
        byID[id]
    }

    var allIDs: [Int] {
        questions.map(\.id)
    }

    // MARK: Loading

    enum LoadError: Error {
        case missingFile
    }

    private struct File: Decodable {
        let version: String
        let questions: [Question]
    }

    static func load(from bundle: Bundle = .main) throws -> QuestionBank {
        guard let url = bundle.url(forResource: "questions", withExtension: "json") else {
            throw LoadError.missingFile
        }
        let file = try JSONDecoder().decode(File.self, from: Data(contentsOf: url))
        return QuestionBank(questions: file.questions)
    }

    /// The bundled question bank. The file ships inside the app, so failing to read it is a build error, not a
    /// runtime condition worth recovering from; the unit tests load it on every run.
    static let standard: QuestionBank = {
        do {
            return try load()
        } catch {
            fatalError("questions.json is missing or malformed: \(error)")
        }
    }()
}
