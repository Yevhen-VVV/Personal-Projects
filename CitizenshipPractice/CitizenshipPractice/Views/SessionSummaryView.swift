import SwiftUI

/// The end of a sitting: the score, and the questions to go over again.
struct SessionSummaryView: View {
    let route: PracticeRoute
    let session: PracticeSession
    let onDone: () -> Void

    @EnvironmentObject private var settings: AppSettings

    private let bank = QuestionBank.standard

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 12) {
                    Image(systemName: symbol)
                        .font(.system(size: 64))
                        .foregroundStyle(tint)
                    Text(title)
                        .font(.largeTitle.weight(.bold))
                        .multilineTextAlignment(.center)
                    Text("\(session.correctCount) correct, \(session.wrongCount) missed")
                        .font(.title3)
                        .foregroundStyle(.secondary)
                    if route.kind == .interview {
                        Text("The officer asks up to \(PracticeSession.interviewLength) questions and stops once you have \(PracticeSession.passMark) right or \(PracticeSession.failMark) wrong.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.top)

                if !session.missedIDs.isEmpty {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Go over these again")
                            .font(.title3.weight(.semibold))
                        ForEach(session.missedIDs, id: \.self) { id in
                            if let question = bank.question(id: id) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("\(question.id). \(question.text)")
                                        .font(.headline)
                                        .fixedSize(horizontal: false, vertical: true)
                                    AnswerList(question: question, answers: question.resolvedAnswers(using: settings.localAnswers))
                                }
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                            }
                        }
                    }
                }

                Button {
                    onDone()
                } label: {
                    Text("Done").frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
            .padding()
        }
    }

    private var title: String {
        switch route.kind {
        case .interview:
            return session.passed ? "You passed!" : "Not yet — keep going"
        case .practice:
            return "Session complete"
        }
    }

    private var symbol: String {
        if route.kind == .interview && !session.passed {
            return "arrow.clockwise.circle.fill"
        }
        return "star.circle.fill"
    }

    private var tint: Color {
        if route.kind == .interview && !session.passed {
            return .orange
        }
        return .yellow
    }
}
