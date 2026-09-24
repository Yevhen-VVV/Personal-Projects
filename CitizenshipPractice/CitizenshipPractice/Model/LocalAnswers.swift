import Foundation

/// The answers the question bank cannot know: who holds national office today, and where the learner lives.
struct LocalAnswers: Equatable {
    var president = ""
    var vicePresident = ""
    var speaker = ""
    var chiefJustice = ""
    var place: Place?
    var governor = ""
    var senators: [String] = []
    var representative = ""
}

extension Question {
    /// The answers to show and check against. Empty when they depend on details the learner has not entered.
    func resolvedAnswers(using local: LocalAnswers) -> [Answer] {
        guard let dynamic else { return answers }
        switch dynamic {
        case .president:
            return [Answer.person(local.president)].compactMap { $0 }
        case .vicePresident:
            return [Answer.person(local.vicePresident)].compactMap { $0 }
        case .speaker:
            return [Answer.person(local.speaker)].compactMap { $0 }
        case .chiefJustice:
            return [Answer.person(local.chiefJustice)].compactMap { $0 }

        case .senators:
            guard let place = local.place else { return [] }
            if place.kind != .state {
                return [Answer(text: "\(place.shortName) has no U.S. senators", also: ["no senators", "none"])]
            }
            return local.senators.compactMap(Answer.person)

        case .representative:
            if let person = Answer.person(local.representative) {
                return [person]
            }
            if let place = local.place, place.kind != .state {
                return [Answer(
                    text: "\(place.shortName) has no voting representative in Congress",
                    also: ["no representative", "no voting representative", "none"]
                )]
            }
            return []

        case .governor:
            guard let place = local.place else { return [] }
            if place.kind == .district {
                return [Answer(text: "D.C. does not have a governor", also: ["no governor", "none"])]
            }
            return [Answer.person(local.governor)].compactMap { $0 }

        case .stateCapital:
            guard let place = local.place else { return [] }
            if place.kind == .district {
                return [Answer(
                    text: "D.C. is not a state and does not have a capital",
                    also: ["not a state", "no capital"]
                )]
            }
            return [Answer(text: place.capital, also: place.capitalAliases)]
        }
    }
}

extension Answer {
    /// A person's name, with the surname alone also accepted, the way USCIS prints "(George) Washington".
    static func person(_ fullName: String) -> Answer? {
        let name = fullName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else { return nil }
        return Answer(text: name, also: [surname(of: name)].compactMap { $0 })
    }

    /// "John G. Roberts, Jr." → "Roberts". Nil for a single word, which is already its own surname.
    static func surname(of name: String) -> String? {
        let suffixes: Set<String> = ["jr", "jr.", "sr", "sr.", "ii", "iii", "iv"]
        var parts = name.replacingOccurrences(of: ",", with: " ").split(separator: " ").map(String.init)
        while let last = parts.last, suffixes.contains(last.lowercased()) {
            parts.removeLast()
        }
        guard parts.count > 1 else { return nil }
        return parts.last
    }
}

/// A state, the District of Columbia, or a territory, with its capital.
struct Place: Identifiable, Hashable {
    enum Kind: Hashable {
        case state, district, territory
    }

    let code: String
    let name: String
    let capital: String
    let kind: Kind
    var capitalAliases: [String] = []

    var id: String { code }

    /// How the place is named in a sentence: "D.C." rather than "District of Columbia".
    var shortName: String { kind == .district ? "D.C." : name }

    static func withCode(_ code: String?) -> Place? {
        guard let code else { return nil }
        return all.first { $0.code == code }
    }

    static let all: [Place] = [
        Place(code: "AL", name: "Alabama", capital: "Montgomery", kind: .state),
        Place(code: "AK", name: "Alaska", capital: "Juneau", kind: .state),
        Place(code: "AZ", name: "Arizona", capital: "Phoenix", kind: .state),
        Place(code: "AR", name: "Arkansas", capital: "Little Rock", kind: .state),
        Place(code: "CA", name: "California", capital: "Sacramento", kind: .state),
        Place(code: "CO", name: "Colorado", capital: "Denver", kind: .state),
        Place(code: "CT", name: "Connecticut", capital: "Hartford", kind: .state),
        Place(code: "DE", name: "Delaware", capital: "Dover", kind: .state),
        Place(code: "FL", name: "Florida", capital: "Tallahassee", kind: .state),
        Place(code: "GA", name: "Georgia", capital: "Atlanta", kind: .state),
        Place(code: "HI", name: "Hawaii", capital: "Honolulu", kind: .state),
        Place(code: "ID", name: "Idaho", capital: "Boise", kind: .state),
        Place(code: "IL", name: "Illinois", capital: "Springfield", kind: .state),
        Place(code: "IN", name: "Indiana", capital: "Indianapolis", kind: .state),
        Place(code: "IA", name: "Iowa", capital: "Des Moines", kind: .state),
        Place(code: "KS", name: "Kansas", capital: "Topeka", kind: .state),
        Place(code: "KY", name: "Kentucky", capital: "Frankfort", kind: .state),
        Place(code: "LA", name: "Louisiana", capital: "Baton Rouge", kind: .state),
        Place(code: "ME", name: "Maine", capital: "Augusta", kind: .state),
        Place(code: "MD", name: "Maryland", capital: "Annapolis", kind: .state),
        Place(code: "MA", name: "Massachusetts", capital: "Boston", kind: .state),
        Place(code: "MI", name: "Michigan", capital: "Lansing", kind: .state),
        Place(code: "MN", name: "Minnesota", capital: "Saint Paul", kind: .state, capitalAliases: ["St. Paul"]),
        Place(code: "MS", name: "Mississippi", capital: "Jackson", kind: .state),
        Place(code: "MO", name: "Missouri", capital: "Jefferson City", kind: .state),
        Place(code: "MT", name: "Montana", capital: "Helena", kind: .state),
        Place(code: "NE", name: "Nebraska", capital: "Lincoln", kind: .state),
        Place(code: "NV", name: "Nevada", capital: "Carson City", kind: .state),
        Place(code: "NH", name: "New Hampshire", capital: "Concord", kind: .state),
        Place(code: "NJ", name: "New Jersey", capital: "Trenton", kind: .state),
        Place(code: "NM", name: "New Mexico", capital: "Santa Fe", kind: .state),
        Place(code: "NY", name: "New York", capital: "Albany", kind: .state),
        Place(code: "NC", name: "North Carolina", capital: "Raleigh", kind: .state),
        Place(code: "ND", name: "North Dakota", capital: "Bismarck", kind: .state),
        Place(code: "OH", name: "Ohio", capital: "Columbus", kind: .state),
        Place(code: "OK", name: "Oklahoma", capital: "Oklahoma City", kind: .state),
        Place(code: "OR", name: "Oregon", capital: "Salem", kind: .state),
        Place(code: "PA", name: "Pennsylvania", capital: "Harrisburg", kind: .state),
        Place(code: "RI", name: "Rhode Island", capital: "Providence", kind: .state),
        Place(code: "SC", name: "South Carolina", capital: "Columbia", kind: .state),
        Place(code: "SD", name: "South Dakota", capital: "Pierre", kind: .state),
        Place(code: "TN", name: "Tennessee", capital: "Nashville", kind: .state),
        Place(code: "TX", name: "Texas", capital: "Austin", kind: .state),
        Place(code: "UT", name: "Utah", capital: "Salt Lake City", kind: .state),
        Place(code: "VT", name: "Vermont", capital: "Montpelier", kind: .state),
        Place(code: "VA", name: "Virginia", capital: "Richmond", kind: .state),
        Place(code: "WA", name: "Washington", capital: "Olympia", kind: .state),
        Place(code: "WV", name: "West Virginia", capital: "Charleston", kind: .state),
        Place(code: "WI", name: "Wisconsin", capital: "Madison", kind: .state),
        Place(code: "WY", name: "Wyoming", capital: "Cheyenne", kind: .state),
        Place(code: "DC", name: "District of Columbia", capital: "", kind: .district),
        Place(code: "AS", name: "American Samoa", capital: "Pago Pago", kind: .territory),
        Place(code: "GU", name: "Guam", capital: "Hagåtña", kind: .territory, capitalAliases: ["Hagatna", "Agana"]),
        Place(code: "MP", name: "Northern Mariana Islands", capital: "Saipan", kind: .territory),
        Place(code: "PR", name: "Puerto Rico", capital: "San Juan", kind: .territory),
        Place(code: "VI", name: "U.S. Virgin Islands", capital: "Charlotte Amalie", kind: .territory),
    ]
}
