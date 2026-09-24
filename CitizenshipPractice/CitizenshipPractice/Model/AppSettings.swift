import Combine
import Foundation

/// Preferences and the learner's own local answers, saved on the device.
///
/// An `ObservableObject` rather than `@Observable` so that every property can save itself in `didSet`.
@MainActor
final class AppSettings: ObservableObject {
    /// Who holds these offices as of the date below. They change with elections and appointments; USCIS lists
    /// the current answers at uscis.gov/citizenship/testupdates.
    static let officialsAsOf = "September 2026"
    static let defaultPresident = "Donald J. Trump"
    static let defaultVicePresident = "JD Vance"
    static let defaultSpeaker = "Mike Johnson"
    static let defaultChiefJustice = "John G. Roberts, Jr."

    // Voice
    @Published var voiceIdentifier: String? { didSet { defaults.set(voiceIdentifier, forKey: Key.voice) } }
    /// AVSpeechUtterance rate: 0.5 is the system's normal speaking speed.
    @Published var speechRate: Double { didSet { defaults.set(speechRate, forKey: Key.rate) } }

    // Practice
    @Published var autoReadQuestions: Bool { didSet { defaults.set(autoReadQuestions, forKey: Key.autoRead) } }
    @Published var readAnswerAfterChecking: Bool { didSet { defaults.set(readAnswerAfterChecking, forKey: Key.readAnswer) } }
    @Published var hideQuestionText: Bool { didSet { defaults.set(hideQuestionText, forKey: Key.hideText) } }

    // Listen
    @Published var listenPause: Double { didSet { defaults.set(listenPause, forKey: Key.listenPause) } }
    @Published var listenReadsAllAnswers: Bool { didSet { defaults.set(listenReadsAllAnswers, forKey: Key.listenAll) } }
    @Published var listenShuffled: Bool { didSet { defaults.set(listenShuffled, forKey: Key.listenShuffled) } }

    // Where you live
    @Published var placeCode: String? { didSet { defaults.set(placeCode, forKey: Key.place) } }
    @Published var governor: String { didSet { defaults.set(governor, forKey: Key.governor) } }
    @Published var senator1: String { didSet { defaults.set(senator1, forKey: Key.senator1) } }
    @Published var senator2: String { didSet { defaults.set(senator2, forKey: Key.senator2) } }
    @Published var representative: String { didSet { defaults.set(representative, forKey: Key.representative) } }

    // Current officials
    @Published var president: String { didSet { defaults.set(president, forKey: Key.president) } }
    @Published var vicePresident: String { didSet { defaults.set(vicePresident, forKey: Key.vicePresident) } }
    @Published var speaker: String { didSet { defaults.set(speaker, forKey: Key.speaker) } }
    @Published var chiefJustice: String { didSet { defaults.set(chiefJustice, forKey: Key.chiefJustice) } }

    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        voiceIdentifier = defaults.string(forKey: Key.voice)
        speechRate = defaults.object(forKey: Key.rate) as? Double ?? 0.45
        autoReadQuestions = defaults.object(forKey: Key.autoRead) as? Bool ?? true
        readAnswerAfterChecking = defaults.object(forKey: Key.readAnswer) as? Bool ?? true
        hideQuestionText = defaults.object(forKey: Key.hideText) as? Bool ?? false
        listenPause = defaults.object(forKey: Key.listenPause) as? Double ?? 4
        listenReadsAllAnswers = defaults.object(forKey: Key.listenAll) as? Bool ?? false
        listenShuffled = defaults.object(forKey: Key.listenShuffled) as? Bool ?? false
        placeCode = defaults.string(forKey: Key.place)
        governor = defaults.string(forKey: Key.governor) ?? ""
        senator1 = defaults.string(forKey: Key.senator1) ?? ""
        senator2 = defaults.string(forKey: Key.senator2) ?? ""
        representative = defaults.string(forKey: Key.representative) ?? ""
        president = defaults.string(forKey: Key.president) ?? Self.defaultPresident
        vicePresident = defaults.string(forKey: Key.vicePresident) ?? Self.defaultVicePresident
        speaker = defaults.string(forKey: Key.speaker) ?? Self.defaultSpeaker
        chiefJustice = defaults.string(forKey: Key.chiefJustice) ?? Self.defaultChiefJustice
    }

    var place: Place? { Place.withCode(placeCode) }

    var localAnswers: LocalAnswers {
        LocalAnswers(
            president: president,
            vicePresident: vicePresident,
            speaker: speaker,
            chiefJustice: chiefJustice,
            place: place,
            governor: governor,
            senators: [senator1, senator2],
            representative: representative
        )
    }

    func restoreDefaultOfficials() {
        president = Self.defaultPresident
        vicePresident = Self.defaultVicePresident
        speaker = Self.defaultSpeaker
        chiefJustice = Self.defaultChiefJustice
    }

    private enum Key {
        static let voice = "voice"
        static let rate = "speechRate"
        static let autoRead = "autoReadQuestions"
        static let readAnswer = "readAnswerAfterChecking"
        static let hideText = "hideQuestionText"
        static let listenPause = "listenPause"
        static let listenAll = "listenReadsAllAnswers"
        static let listenShuffled = "listenShuffled"
        static let place = "place"
        static let governor = "governor"
        static let senator1 = "senator1"
        static let senator2 = "senator2"
        static let representative = "representative"
        static let president = "president"
        static let vicePresident = "vicePresident"
        static let speaker = "speaker"
        static let chiefJustice = "chiefJustice"
    }
}
