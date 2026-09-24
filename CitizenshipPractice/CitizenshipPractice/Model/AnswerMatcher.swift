import Foundation

/// The outcome of checking a reply automatically.
enum Verdict: Equatable {
    case correct
    case incorrect
    /// Nothing to check against: the answer depends on details the learner has not entered yet.
    case unchecked
}

struct MatchResult: Equatable {
    let verdict: Verdict
    /// Indexes of the answers the reply matched, for highlighting.
    let matched: [Int]
    let required: Int
}

/// Decides whether a typed or spoken reply gives an accepted answer.
///
/// The interview is spoken and the officer accepts the answer in the applicant's own words, so this is
/// deliberately forgiving: word order, filler words, plurals, a typo, and numbers said as words ("twenty-seven")
/// all still match. Words the official list puts in parentheses are optional. Every result can be overruled
/// by the learner, because no word matcher gets every paraphrase right.
enum AnswerMatcher {
    static func check(_ reply: String, against answers: [Answer], required: Int) -> MatchResult {
        guard !answers.isEmpty else {
            return MatchResult(verdict: .unchecked, matched: [], required: required)
        }
        let replyTokens = tokens(in: reply)
        guard !replyTokens.isEmpty else {
            return MatchResult(verdict: .incorrect, matched: [], required: required)
        }
        let matched = answers.indices.filter { index in
            let answer = answers[index]
            return ([answer.text] + answer.also).contains { matches(replyTokens, form: $0) }
        }
        let verdict: Verdict = matched.count >= max(required, 1) ? .correct : .incorrect
        return MatchResult(verdict: verdict, matched: matched, required: required)
    }

    /// Whether a reply covers enough of one way of stating an answer.
    ///
    /// Short answers must be matched in full ("Senate and House" needs both). Longer ones need about 70% of
    /// their words, so a natural paraphrase of a sentence-length answer still counts.
    static func matches(_ replyTokens: [String], form: String) -> Bool {
        let required = requiredTokens(in: form)
        guard !required.isEmpty else { return false }
        let found = required.filter { token in replyTokens.contains { similar($0, token) } }.count
        return found >= neededCount(for: required.count)
    }

    static func neededCount(for tokenCount: Int) -> Int {
        tokenCount <= 2 ? tokenCount : Int((Double(tokenCount) * 0.7 - 1e-9).rounded(.up))
    }

    /// The words of an answer that a reply has to contain.
    ///
    /// Parenthesised words are optional, and "United States" or "American" is dropped when anything else is left:
    /// "Obey the laws of the United States" is answered by "obey the law".
    static func requiredTokens(in answer: String) -> [String] {
        var base = tokens(in: removingParentheticals(answer))
        if base.isEmpty {
            base = tokens(in: answer.replacingOccurrences(of: "(", with: " ").replacingOccurrences(of: ")", with: " "))
        }
        var trimmed: [String] = []
        var index = 0
        while index < base.count {
            if base[index] == "united", index + 1 < base.count, base[index + 1] == "state" {
                index += 2
                continue
            }
            if !contextWords.contains(base[index]) {
                trimmed.append(base[index])
            }
            index += 1
        }
        return trimmed.isEmpty ? base : trimmed
    }

    // MARK: Tokenizing

    /// Lowercased, stemmed content words, with numbers written as digits.
    static func tokens(in text: String) -> [String] {
        var text = text.lowercased()
            .folding(options: [.diacriticInsensitive, .widthInsensitive], locale: Locale(identifier: "en_US_POSIX"))
        text = text.replacingOccurrences(of: "\u{2019}", with: "'")
            .replacingOccurrences(of: "n't", with: " not")
            .replacingOccurrences(of: "'s", with: " ")
            .replacingOccurrences(of: ".", with: "")
            .replacingOccurrences(of: "&", with: " and ")
        let cleaned = String(text.unicodeScalars.map { CharacterSet.alphanumerics.contains($0) ? Character($0) : " " })
        var words = cleaned.split(separator: " ").map(String.init)

        // "World War I" and "World War II": Roman numerals only mean numbers straight after "war".
        for index in words.indices.dropFirst() where words[index - 1] == "war" {
            if let number = romanNumerals[words[index]] {
                words[index] = number
            }
        }

        return writingNumbersAsDigits(words).compactMap { word in
            let normalized = normalize(word)
            if stopWords.contains(word) || stopWords.contains(normalized) { return nil }
            return normalized
        }
    }

    static func removingParentheticals(_ text: String) -> String {
        text.replacingOccurrences(of: "\\([^)]*\\)", with: " ", options: .regularExpression)
    }

    private static func normalize(_ word: String) -> String {
        // "4th" → "4", "1800s" → "1800"
        if let first = word.first, first.isNumber {
            let digits = word.prefix(while: \.isNumber)
            if ["", "st", "nd", "rd", "th", "s"].contains(String(word.dropFirst(digits.count))) {
                return String(digits)
            }
            return word
        }
        return stem(word)
    }

    /// A deliberately crude plural stripper. It only has to treat the reply and the answer the same way.
    private static func stem(_ word: String) -> String {
        guard word.count > 3 else { return word }
        if word.hasSuffix("ies"), word.count > 4 {
            return String(word.dropLast(3)) + "y"
        }
        for suffix in ["sses", "xes", "ches", "shes"] where word.hasSuffix(suffix) {
            return String(word.dropLast(2))
        }
        if word.hasSuffix("ss") || word.hasSuffix("us") || word.hasSuffix("is") {
            return word
        }
        if word.hasSuffix("s") {
            return String(word.dropLast())
        }
        return word
    }

    /// Equal, or a small typo apart. Numbers must match exactly.
    static func similar(_ a: String, _ b: String) -> Bool {
        if a == b { return true }
        if a.allSatisfy(\.isNumber) || b.allSatisfy(\.isNumber) { return false }
        let longer = max(a.count, b.count)
        guard longer >= 5 else { return false }
        return editDistance(a, b) <= (longer >= 9 ? 2 : 1)
    }

    static func editDistance(_ a: String, _ b: String) -> Int {
        let a = Array(a), b = Array(b)
        if a.isEmpty { return b.count }
        if b.isEmpty { return a.count }
        var previous = Array(0...b.count)
        for i in 1...a.count {
            var current = [i] + Array(repeating: 0, count: b.count)
            for j in 1...b.count {
                current[j] = min(
                    previous[j] + 1,
                    current[j - 1] + 1,
                    previous[j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1)
                )
            }
            previous = current
        }
        return previous[b.count]
    }

    // MARK: Numbers

    private enum NumberWord: Equatable {
        case small(Int)     // zero through nineteen
        case tens(Int)      // twenty, thirty, …
        case ordinal(Int)   // first, second, … twentieth
        case hundred
        case thousand

        init?(_ word: String) {
            if let value = AnswerMatcher.smallNumbers[word] {
                self = .small(value)
            } else if let value = AnswerMatcher.tensNumbers[word] {
                self = .tens(value)
            } else if let value = AnswerMatcher.ordinalNumbers[word] {
                self = .ordinal(value)
            } else if word == "hundred" {
                self = .hundred
            } else if word == "thousand" {
                self = .thousand
            } else {
                return nil
            }
        }

        /// Whether this word can continue a number that ended with `previous`.
        func canFollow(_ previous: NumberWord?) -> Bool {
            guard let previous else { return true }
            switch (previous, self) {
            case (.small, .hundred), (.small, .thousand): return true
            case (.tens, .small(let value)), (.tens, .ordinal(let value)): return (1...9).contains(value)
            case (.hundred, .small), (.hundred, .tens), (.hundred, .ordinal), (.hundred, .thousand): return true
            case (.thousand, .small), (.thousand, .tens), (.thousand, .ordinal), (.thousand, .hundred): return true
            default: return false
            }
        }
    }

    /// "four hundred thirty five" → "435", "twenty second" → "22".
    static func writingNumbersAsDigits(_ words: [String]) -> [String] {
        var output: [String] = []
        var index = 0
        while index < words.count {
            guard NumberWord(words[index]) != nil else {
                output.append(words[index])
                index += 1
                continue
            }
            var total = 0
            var current = 0
            var previous: NumberWord?
            while index < words.count, let word = NumberWord(words[index]), word.canFollow(previous) {
                switch word {
                case .small(let value), .tens(let value), .ordinal(let value):
                    current += value
                case .hundred:
                    current = max(current, 1) * 100
                case .thousand:
                    total += max(current, 1) * 1000
                    current = 0
                }
                previous = word
                index += 1
                if case .ordinal = word { break }
            }
            output.append(String(total + current))
        }
        return output
    }

    // MARK: Word lists

    private static let smallNumbers: [String: Int] = [
        "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8,
        "nine": 9, "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
        "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
    ]

    private static let tensNumbers: [String: Int] = [
        "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
    ]

    private static let ordinalNumbers: [String: Int] = [
        "first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5, "sixth": 6, "seventh": 7, "eighth": 8,
        "ninth": 9, "tenth": 10, "eleventh": 11, "twelfth": 12, "thirteenth": 13, "fourteenth": 14,
        "fifteenth": 15, "sixteenth": 16, "seventeenth": 17, "eighteenth": 18, "nineteenth": 19,
        "twentieth": 20, "thirtieth": 30, "fortieth": 40, "fiftieth": 50,
    ]

    private static let romanNumerals: [String: String] = ["i": "1", "ii": "2"]

    /// Words that carry no meaning for matching. "Day" and "year" are here so that "Christmas" answers
    /// "Christmas Day" and "six" answers "Six (6) years".
    private static let stopWords: Set<String> = [
        "a", "an", "the", "of", "to", "and", "or", "in", "on", "for", "by", "is", "are", "was", "were", "be", "been",
        "being", "it", "its", "they", "their", "them", "that", "this", "these", "those", "from", "with", "as", "at",
        "so", "do", "does", "did", "has", "have", "had", "who", "what", "which", "because", "there", "he", "she",
        "his", "her", "we", "our", "you", "your", "i", "me", "my", "also", "about", "into", "if", "than", "can",
        "will", "would", "should", "could", "day", "year", "says", "say", "just", "like", "think",
    ]

    /// Dropped from an answer's required words when something else is left, because people leave them out.
    private static let contextWords: Set<String> = ["us", "america", "american"]
}
