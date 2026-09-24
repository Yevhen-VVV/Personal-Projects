import SwiftUI

/// One practice sitting to open: which questions, in what order, and whether to hide their text.
struct PracticeRoute: Hashable {
    let id = UUID()
    let kind: PracticeKind
    let title: String
    let questionIDs: [Int]
    let hidesText: Bool
}

struct PracticeHomeView: View {
    @EnvironmentObject private var settings: AppSettings
    @Environment(ProgressStore.self) private var progress
    @State private var path: [PracticeRoute] = []

    private let bank = QuestionBank.standard

    var body: some View {
        NavigationStack(path: $path) {
            List {
                Section {
                    ProgressSummary(mastered: progress.masteredCount, total: bank.questions.count)
                }

                Section {
                    Button {
                        open(.interview, "Mock interview", PracticeSession.interviewQuestions(from: bank.allIDs), hidesText: true)
                    } label: {
                        ModeRow(
                            title: "Mock interview",
                            detail: "20 random questions, read aloud with the text hidden, like the real test. You pass with 12 correct.",
                            systemImage: "person.2.wave.2"
                        )
                    }
                } header: {
                    Text("Test yourself")
                }

                Section {
                    Button {
                        open(.practice, "All questions", bank.allIDs.shuffled())
                    } label: {
                        ModeRow(title: "All questions, shuffled", detail: "All 128 in random order.", systemImage: "shuffle")
                    }
                    Button {
                        open(.practice, "In order", bank.allIDs)
                    } label: {
                        ModeRow(title: "All questions, in order", detail: "From question 1 to 128.", systemImage: "list.number")
                    }
                    Button {
                        open(.practice, "Needs practice", progress.notMastered(in: bank.allIDs))
                    } label: {
                        ModeRow(
                            title: "Not learned yet",
                            detail: "Questions you haven’t answered right twice in a row, missed ones first.",
                            systemImage: "arrow.counterclockwise"
                        )
                    }
                    .disabled(progress.notMastered(in: bank.allIDs).isEmpty)
                } header: {
                    Text("Practice")
                }

                Section {
                    ForEach(bank.groups) { group in
                        Button {
                            open(.practice, group.subsection, group.questions.map(\.id))
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(group.subsection)
                                        .foregroundStyle(.primary)
                                    Text(group.section)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text("\(group.questions.count)")
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                } header: {
                    Text("By topic")
                }

                Section {
                    Toggle("Hide the question text", isOn: $settings.hideQuestionText)
                    Toggle("Read questions aloud", isOn: $settings.autoReadQuestions)
                } footer: {
                    Text("At the interview the officer reads each question to you. Hiding the text trains your ear for that. You can always tap to show it.")
                }
            }
            .navigationTitle("Practice")
            .navigationDestination(for: PracticeRoute.self) { route in
                PracticeSessionView(route: route)
            }
        }
    }

    private func open(_ kind: PracticeKind, _ title: String, _ ids: [Int], hidesText: Bool? = nil) {
        guard !ids.isEmpty else { return }
        path.append(PracticeRoute(kind: kind, title: title, questionIDs: ids, hidesText: hidesText ?? settings.hideQuestionText))
    }
}

private struct ProgressSummary: View {
    let mastered: Int
    let total: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text("\(mastered)")
                    .font(.largeTitle.weight(.bold))
                Text("of \(total) questions learned")
                    .foregroundStyle(.secondary)
            }
            ProgressView(value: Double(mastered), total: Double(total))
            Text("A question counts as learned after you answer it right twice in a row.")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}

private struct ModeRow: View {
    let title: String
    let detail: String
    let systemImage: String

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: systemImage)
                .font(.title2)
                .foregroundStyle(.tint)
                .frame(width: 36)
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(.primary)
                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(.vertical, 4)
    }
}
