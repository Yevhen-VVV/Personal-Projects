import SwiftUI

/// The accepted answers to a question, with any the learner gave marked.
struct AnswerList: View {
    let question: Question
    let answers: [Answer]
    var matched: [Int] = []

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(heading)
                .font(.headline)

            if answers.isEmpty {
                Label {
                    Text("This answer depends on where you live. Choose your state and add your officials in the Settings tab.")
                } icon: {
                    Image(systemName: "mappin.and.ellipse")
                }
                .foregroundStyle(.secondary)
            } else {
                ForEach(Array(answers.enumerated()), id: \.offset) { index, answer in
                    let given = matched.contains(index)
                    HStack(alignment: .firstTextBaseline, spacing: 10) {
                        Image(systemName: given ? "checkmark.circle.fill" : "circle.fill")
                            .font(given ? Font.body : Font.system(size: 7))
                            .foregroundStyle(given ? Color.green : Color.secondary)
                            .frame(width: 22)
                        Text(answer.text)
                            .fontWeight(given ? .semibold : .regular)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel(given ? "Your answer: \(SpokenText.answer(answer))" : SpokenText.answer(answer))
                }
            }

            if answers.contains(where: { $0.text.contains("(") }) {
                Text("Words in (parentheses) are optional.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            if let note = question.note {
                Text(note)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            if question.dynamic?.isCurrentOfficial == true {
                Text("Correct as of \(AppSettings.officialsAsOf). Officials change after elections and appointments — check uscis.gov/citizenship/testupdates before your interview, and update the name in Settings if needed.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var heading: String {
        if question.required > 1 {
            return "Give any \(question.required) of these answers"
        }
        return answers.count > 1 ? "Give any one of these answers" : "Answer"
    }
}
