import Foundation

/// One of the 128 questions on the 2025 USCIS civics test.
struct Question: Identifiable, Hashable, Decodable {
    let id: Int
    let section: String
    let subsection: String
    let text: String
    /// The official answers. Empty when the answer is `dynamic`.
    let answers: [Answer]
    /// How many different answers must be given: "Name two…" is 2.
    let required: Int
    /// USCIS's own guidance printed under the answers, such as what D.C. residents should say.
    let note: String?
    /// Set when the answer depends on who holds office now or where the learner lives.
    let dynamic: DynamicAnswer?

    private enum CodingKeys: String, CodingKey {
        case id, section, subsection, text = "question", answers, required, note, dynamic
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        section = try container.decode(String.self, forKey: .section)
        subsection = try container.decode(String.self, forKey: .subsection)
        text = try container.decode(String.self, forKey: .text)
        answers = try container.decodeIfPresent([Answer].self, forKey: .answers) ?? []
        required = try container.decodeIfPresent(Int.self, forKey: .required) ?? 1
        note = try container.decodeIfPresent(String.self, forKey: .note)
        dynamic = try container.decodeIfPresent(DynamicAnswer.self, forKey: .dynamic)
    }
}

/// An accepted answer, written the way USCIS prints it: words in parentheses are optional.
struct Answer: Hashable, Decodable {
    let text: String
    /// Other ways of saying the same thing. Accepted when checking a reply, never shown.
    let also: [String]
    /// How to read the answer aloud, when reading `text` with its parentheses removed sounds wrong.
    let say: String?

    init(text: String, also: [String] = [], say: String? = nil) {
        self.text = text
        self.also = also
        self.say = say
    }

    private enum CodingKeys: String, CodingKey {
        case text, also, say
    }

    /// Accepts either a bare string or `{"text": …, "also": […], "say": …}`.
    init(from decoder: Decoder) throws {
        if let text = try? decoder.singleValueContainer().decode(String.self) {
            self.init(text: text)
            return
        }
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.init(
            text: try container.decode(String.self, forKey: .text),
            also: try container.decodeIfPresent([String].self, forKey: .also) ?? [],
            say: try container.decodeIfPresent(String.self, forKey: .say)
        )
    }
}

/// Questions whose answer is not fixed in the question bank.
enum DynamicAnswer: String, Hashable, Decodable {
    case president, vicePresident, speaker, chiefJustice
    case senators, representative, governor, stateCapital

    /// True for the answers that change with elections and appointments rather than with where you live.
    var isCurrentOfficial: Bool {
        switch self {
        case .president, .vicePresident, .speaker, .chiefJustice: true
        case .senators, .representative, .governor, .stateCapital: false
        }
    }
}
