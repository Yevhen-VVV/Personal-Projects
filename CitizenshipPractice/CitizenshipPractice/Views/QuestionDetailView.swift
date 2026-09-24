import SwiftUI

/// One question with its answers, both of which can be heard. Steps through the list with the arrows.
struct QuestionDetailView: View {
    @EnvironmentObject private var settings: AppSettings
    @Environment(ProgressStore.self) private var progress
    @Environment(Speaker.self) private var speaker

    @State private var questionID: Int
    /// Whether speech started on this screen is playing, as opposed to the Listen tab.
    @State private var speakingHere = false

    private let bank = QuestionBank.standard

    init(questionID: Int) {
        _questionID = State(initialValue: questionID)
    }

    var body: some View {
        if let question = bank.question(id: questionID) {
            content(for: question)
        } else {
            ContentUnavailableView("Question not found", systemImage: "questionmark.circle")
        }
    }

    private func content(for question: Question) -> some View {
        let answers = question.resolvedAnswers(using: settings.localAnswers)
        let stats = progress.stats(for: question.id)
        return ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(question.subsection)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(question.text)
                        .font(.title2.weight(.semibold))
                        .fixedSize(horizontal: false, vertical: true)
                }

                Button {
                    if speakingHere {
                        speaker.stop()
                    } else {
                        say(SpokenText.question(question))
                    }
                } label: {
                    Label(speakingHere ? "Stop" : "Hear the question",
                          systemImage: speakingHere ? "stop.fill" : "speaker.wave.2.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)

                AnswerList(question: question, answers: answers)

                Button {
                    say(SpokenText.answers(answers, required: question.required, readAll: true))
                } label: {
                    Label("Hear the answers", systemImage: "text.bubble")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .controlSize(.large)

                if stats.isSeen {
                    Text("In practice: right \(stats.correct) \(stats.correct == 1 ? "time" : "times"), missed \(stats.wrong).")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .padding()
        }
        .navigationTitle("Question \(question.id) of \(bank.questions.count)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItemGroup(placement: .bottomBar) {
                Button {
                    step(by: -1)
                } label: {
                    Label("Previous question", systemImage: "chevron.left")
                }
                .disabled(questionID <= 1)
                Spacer()
                Button {
                    step(by: 1)
                } label: {
                    Label("Next question", systemImage: "chevron.right")
                }
                .disabled(questionID >= bank.questions.count)
            }
        }
        .onDisappear {
            if speakingHere {
                speaker.stop()
            }
        }
    }

    private func say(_ text: String) {
        speaker.speak([Utterance(text: text)], then: { speakingHere = false }, onStop: { speakingHere = false })
        speakingHere = true
    }

    private func step(by delta: Int) {
        if speakingHere {
            speaker.stop()
        }
        questionID = min(max(questionID + delta, 1), bank.questions.count)
    }
}
