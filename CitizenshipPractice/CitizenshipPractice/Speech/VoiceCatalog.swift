import AVFoundation

/// The American English voices installed on the device.
enum VoiceCatalog {
    /// Best quality first. Novelty voices and the learner's own Personal Voice are left out.
    static func americanVoices() -> [AVSpeechSynthesisVoice] {
        AVSpeechSynthesisVoice.speechVoices()
            .filter { voice in
                voice.language == "en-US"
                    && !voice.voiceTraits.contains(.isNoveltyVoice)
                    && !voice.voiceTraits.contains(.isPersonalVoice)
            }
            .sorted { first, second in
                if first.quality != second.quality {
                    return first.quality.rawValue > second.quality.rawValue
                }
                return first.name < second.name
            }
    }

    /// The chosen voice, or else the best American voice installed.
    static func voice(identifier: String?) -> AVSpeechSynthesisVoice? {
        if let identifier, let chosen = AVSpeechSynthesisVoice(identifier: identifier) {
            return chosen
        }
        if let best = americanVoices().first, best.quality != .default {
            return best
        }
        return AVSpeechSynthesisVoice(language: "en-US")
    }

    static func label(for voice: AVSpeechSynthesisVoice) -> String {
        switch voice.quality {
        case .premium: "\(voice.name) (Premium)"
        case .enhanced: "\(voice.name) (Enhanced)"
        default: voice.name
        }
    }
}
