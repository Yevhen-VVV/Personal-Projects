import AVFoundation
import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var settings: AppSettings
    @Environment(ProgressStore.self) private var progress
    @Environment(Speaker.self) private var speaker

    @State private var voices: [AVSpeechSynthesisVoice] = []
    @State private var confirmingReset = false

    var body: some View {
        NavigationStack {
            Form {
                voiceSection
                practiceSection
                placeSection
                officialsSection
                progressSection
                aboutSection
            }
            .navigationTitle("Settings")
            .onAppear {
                voices = VoiceCatalog.americanVoices()
            }
            .confirmationDialog("Reset your progress?", isPresented: $confirmingReset, titleVisibility: .visible) {
                Button("Reset progress", role: .destructive) {
                    progress.reset()
                }
            } message: {
                Text("This clears which questions you have learned. Your settings are kept.")
            }
        }
    }

    private var voiceSection: some View {
        Section {
            Picker("Voice", selection: $settings.voiceIdentifier) {
                Text("Best available").tag(String?.none)
                ForEach(voices, id: \.identifier) { voice in
                    Text(VoiceCatalog.label(for: voice)).tag(Optional(voice.identifier))
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Speaking speed")
                    Spacer()
                    Text(speedDescription)
                        .foregroundStyle(.secondary)
                }
                Slider(value: $settings.speechRate, in: 0.3...0.6) {
                    Text("Speaking speed")
                } minimumValueLabel: {
                    Image(systemName: "tortoise")
                } maximumValueLabel: {
                    Image(systemName: "hare")
                }
            }

            Button {
                speaker.speak("What is the supreme law of the land?")
            } label: {
                Label("Play a sample", systemImage: "play.circle")
            }
        } header: {
            Text("Voice")
        } footer: {
            Text("For a more natural voice, download an Enhanced or Premium English (US) voice in the iPhone Settings app under Accessibility › Spoken Content › Voices › English (on newer iOS: Accessibility › Read & Speak). It then appears here. The interview is at a normal pace, so work up to “Normal”.")
        }
    }

    private var speedDescription: String {
        switch settings.speechRate {
        case ..<0.38: "Slow"
        case ..<0.47: "Relaxed"
        case ..<0.53: "Normal"
        default: "Fast"
        }
    }

    private var practiceSection: some View {
        Section {
            Toggle("Read questions aloud", isOn: $settings.autoReadQuestions)
            Toggle("Read the answer after checking", isOn: $settings.readAnswerAfterChecking)
            Toggle("Hide the question text", isOn: $settings.hideQuestionText)
        } header: {
            Text("Practice")
        }
    }

    private var placeSection: some View {
        Section {
            Picker("State or territory", selection: $settings.placeCode) {
                Text("Not set").tag(String?.none)
                ForEach(Place.all) { place in
                    Text(place.name).tag(Optional(place.code))
                }
            }
            if let place = settings.place {
                LabeledContent("Capital", value: place.kind == .district ? "None — D.C. is not a state" : place.capital)
            }
            if settings.place?.kind != .district {
                LabeledTextField(label: "Governor", text: $settings.governor, prompt: "Name")
            }
            if settings.place?.kind == .state || settings.place == nil {
                LabeledTextField(label: "Senator", text: $settings.senator1, prompt: "Name")
                LabeledTextField(label: "Senator", text: $settings.senator2, prompt: "Name")
            }
            LabeledTextField(label: "Representative", text: $settings.representative, prompt: "Name")
        } header: {
            Text("Where you live")
        } footer: {
            VStack(alignment: .leading, spacing: 6) {
                Text("Questions 23, 29, 61 and 62 depend on where you live. Find your officials here:")
                Link("Your U.S. senators — senate.gov", destination: URL(string: "https://www.senate.gov/senators/senators-contact.htm")!)
                Link("Your U.S. representative — house.gov", destination: URL(string: "https://www.house.gov/representatives/find-your-representative")!)
                Link("Your governor — usa.gov", destination: URL(string: "https://www.usa.gov/state-governor")!)
            }
        }
    }

    private var officialsSection: some View {
        Section {
            LabeledTextField(label: "President", text: $settings.president, prompt: AppSettings.defaultPresident)
            LabeledTextField(label: "Vice President", text: $settings.vicePresident, prompt: AppSettings.defaultVicePresident)
            LabeledTextField(label: "Speaker of the House", text: $settings.speaker, prompt: AppSettings.defaultSpeaker)
            LabeledTextField(label: "Chief Justice", text: $settings.chiefJustice, prompt: AppSettings.defaultChiefJustice)
            Button("Restore these names") {
                settings.restoreDefaultOfficials()
            }
        } header: {
            Text("Current officials")
        } footer: {
            VStack(alignment: .leading, spacing: 6) {
                Text("Correct as of \(AppSettings.officialsAsOf). These change after elections and appointments; USCIS lists the answers it currently accepts.")
                Link("USCIS test updates", destination: URL(string: "https://www.uscis.gov/citizenship/testupdates")!)
            }
        }
    }

    private var progressSection: some View {
        Section {
            LabeledContent("Learned", value: "\(progress.masteredCount) of \(QuestionBank.standard.questions.count)")
            Button("Reset progress", role: .destructive) {
                confirmingReset = true
            }
        } header: {
            Text("Progress")
        }
    }

    private var aboutSection: some View {
        Section {
            Text("These are the 128 questions of the 2025 civics test, which applies to applications (Form N-400) filed on or after October 20, 2025. At the interview the officer asks up to 20 of them out loud, and you pass with 12 correct.")
                .font(.subheadline)
            Link("USCIS: the 2025 civics test", destination: URL(string: "https://www.uscis.gov/citizenship-resource-center/naturalization-test-and-study-resources/2025-civics-test")!)
        } header: {
            Text("About")
        }
    }
}

/// A form row with the label on the left and an editable value on the right.
private struct LabeledTextField: View {
    let label: String
    @Binding var text: String
    let prompt: String

    var body: some View {
        LabeledContent(label) {
            TextField(label, text: $text, prompt: Text(prompt))
                .multilineTextAlignment(.trailing)
                .textInputAutocapitalization(.words)
                .autocorrectionDisabled()
        }
    }
}
