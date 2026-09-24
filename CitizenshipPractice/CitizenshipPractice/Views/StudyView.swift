import SwiftUI

/// All 128 questions, grouped as USCIS groups them, searchable.
struct StudyView: View {
    @Environment(ProgressStore.self) private var progress
    @State private var search = ""

    private let bank = QuestionBank.standard

    var body: some View {
        NavigationStack {
            List {
                ForEach(filteredGroups) { group in
                    Section {
                        ForEach(group.questions) { question in
                            NavigationLink(value: question.id) {
                                QuestionRow(question: question, stats: progress.stats(for: question.id))
                            }
                        }
                    } header: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(group.section.uppercased())
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(.secondary)
                            Text(group.subsection)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(.primary)
                        }
                        .textCase(nil)
                    }
                }
            }
            .overlay {
                if filteredGroups.isEmpty {
                    ContentUnavailableView.search(text: search)
                }
            }
            .searchable(text: $search, prompt: "Search questions and answers")
            .navigationTitle("Civics Questions")
            .navigationDestination(for: Int.self) { id in
                QuestionDetailView(questionID: id)
            }
        }
    }

    private var filteredGroups: [QuestionGroup] {
        let query = search.trimmingCharacters(in: .whitespaces)
        guard !query.isEmpty else { return bank.groups }
        return bank.groups.compactMap { group in
            let hits = group.questions.filter { question in
                String(question.id) == query
                    || question.text.localizedCaseInsensitiveContains(query)
                    || question.answers.contains { $0.text.localizedCaseInsensitiveContains(query) }
            }
            return hits.isEmpty ? nil : QuestionGroup(section: group.section, subsection: group.subsection, questions: hits)
        }
    }
}

struct QuestionRow: View {
    let question: Question
    let stats: QuestionStats

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 12) {
            Text("\(question.id)")
                .font(.subheadline.monospacedDigit().weight(.semibold))
                .foregroundStyle(.secondary)
                .frame(minWidth: 30, alignment: .trailing)
            Text(question.text)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
            if stats.isMastered {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
                    .accessibilityLabel("Learned")
            } else if stats.needsWork {
                Image(systemName: "exclamationmark.circle.fill")
                    .foregroundStyle(.orange)
                    .accessibilityLabel("Needs practice")
            }
        }
        .padding(.vertical, 2)
    }
}
