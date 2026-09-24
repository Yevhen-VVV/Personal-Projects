import SwiftUI

/// Asks one question at a time, out loud, and checks the learner's typed or spoken reply.
struct PracticeSessionView: View {
    let route: PracticeRoute

    @EnvironmentObject private var settings: AppSettings
    @Environment(ProgressStore.self) private var progress
    @Environment(Speaker.self) private var speaker
    @Environment(SpeechListener.self) private var listener
    @Environment(\.dismiss) private var dismiss

    @State private var session: PracticeSession
    @State private var reply = ""
    /// Nil while the learner is still answering.
    @State private var result: MatchResult?
    /// The learner's own verdict, which overrides the automatic one.
    @State private var ownVerdict: Bool?
    @State private var alwaysShowText: Bool
    @State private var revealedThisQuestion = false
    @State private var heardNothing = false
    @State private var speakingHere = false
    /// The question already set up, so that coming back from another tab doesn't wipe an answer in progress.
    @State private var begunIndex: Int?
    @FocusState private var replyFocused: Bool

    private let bank = QuestionBank.standard

    init(route: PracticeRoute) {
        self.route = route
        _session = State(initialValue: PracticeSession(kind: route.kind, questionIDs: route.questionIDs))
        _alwaysShowText = State(initialValue: !route.hidesText)
    }

    var body: some View {
        Group {
            if session.isFinished {
                SessionSummaryView(route: route, session: session) {
                    dismiss()
                }
            } else if let question = session.currentID.flatMap(bank.question(id:)) {
                questionScreen(question)
            }
        }
        .navigationTitle(route.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if !session.isFinished {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        alwaysShowText.toggle()
                    } label: {
                        Label(alwaysShowText ? "Hide question text" : "Show question text",
                              systemImage: alwaysShowText ? "eye.slash" : "eye")
                    }
                }
            }
        }
        .onChange(of: listener.transcript) { _, text in
            if listener.isListening || listener.isSettling {
                reply = text
            }
        }
        .onDisappear {
            listener.cancel()
            if speakingHere {
                speaker.stop()
            }
        }
    }

    // MARK: Question screen

    private func questionScreen(_ question: Question) -> some View {
        let answers = question.resolvedAnswers(using: settings.localAnswers)
        return ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header
                questionCard(question)
                if let result {
                    feedback(question, answers: answers, result: result)
                } else {
                    replyArea(question, answers: answers)
                }
            }
            .padding()
        }
        .scrollDismissesKeyboard(.interactively)
        .safeAreaInset(edge: .bottom) {
            bottomBar(question, answers: answers)
        }
        .task(id: session.index) {
            await begin(question)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Question \(session.index + 1) of \(route.kind == .interview ? PracticeSession.interviewLength : session.questionIDs.count)")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.secondary)
                Spacer()
                if session.index > 0 {
                    Label("\(session.correctCount)", systemImage: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Label("\(session.wrongCount)", systemImage: "xmark.circle.fill")
                        .foregroundStyle(.red)
                        .padding(.leading, 6)
                }
            }
            .font(.subheadline)
            ProgressView(value: Double(session.index), total: Double(max(session.questionIDs.count, 1)))
        }
    }

    private func questionCard(_ question: Question) -> some View {
        let showsText = alwaysShowText || revealedThisQuestion || result != nil
        return VStack(alignment: .leading, spacing: 14) {
            if showsText {
                Text(question.text)
                    .font(.title2.weight(.semibold))
                    .fixedSize(horizontal: false, vertical: true)
            } else {
                Label("Listen to the question", systemImage: "ear")
                    .font(.title3.weight(.semibold))
                Text("The text is hidden, as it is at the interview. Play it again as often as you like.")
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            ViewThatFits(in: .horizontal) {
                HStack(spacing: 10) { playbackButtons(question, showsText: showsText) }
                VStack(alignment: .leading, spacing: 10) { playbackButtons(question, showsText: showsText) }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    @ViewBuilder
    private func playbackButtons(_ question: Question, showsText: Bool) -> some View {
        Button {
            if speakingHere {
                speaker.stop()
            } else {
                say(SpokenText.question(question))
            }
        } label: {
            Label(speakingHere ? "Stop" : "Play again", systemImage: speakingHere ? "stop.fill" : "speaker.wave.2.fill")
        }
        .buttonStyle(.borderedProminent)

        Button {
            say(SpokenText.question(question), rateScale: 0.75)
        } label: {
            Label("Slower", systemImage: "tortoise.fill")
        }
        .buttonStyle(.bordered)

        if !showsText {
            Button {
                revealedThisQuestion = true
            } label: {
                Label("Show text", systemImage: "text.alignleft")
            }
            .buttonStyle(.bordered)
        }
    }

    // MARK: Answering

    private func replyArea(_ question: Question, answers: [Answer]) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Your answer")
                .font(.headline)

            TextField("Type your answer, or tap the microphone", text: $reply, axis: .vertical)
                .font(.title3)
                .lineLimit(1...5)
                .padding(12)
                .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .focused($replyFocused)
                .disabled(listener.isListening || listener.isSettling)

            microphoneButton(question, answers: answers)

            if let problem = listener.problem {
                Label(problem, systemImage: "exclamationmark.triangle")
                    .font(.footnote)
                    .foregroundStyle(.orange)
            } else if heardNothing {
                Label("I didn’t catch that. Tap the microphone and try again, or type your answer.", systemImage: "ear.trianglebadge.exclamationmark")
                    .font(.footnote)
                    .foregroundStyle(.orange)
            }
        }
    }

    private func microphoneButton(_ question: Question, answers: [Answer]) -> some View {
        Button {
            toggleListening(question, answers: answers)
        } label: {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(listener.isListening ? Color.red : Color.accentColor)
                        .frame(width: 52, height: 52)
                    if listener.isSettling {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: listener.isListening ? "stop.fill" : "mic.fill")
                            .font(.title2)
                            .foregroundStyle(.white)
                    }
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(microphoneTitle)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text(microphoneDetail)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer(minLength: 0)
            }
        }
        .buttonStyle(.plain)
        .disabled(listener.isSettling)
        .accessibilityLabel(microphoneTitle)
    }

    private var microphoneTitle: String {
        if listener.isSettling { return "One moment…" }
        return listener.isListening ? "Listening… tap when you’re done" : "Answer out loud"
    }

    private var microphoneDetail: String {
        listener.isListening ? "Take your time. Nothing is cut off." : "Speak your answer, like at the interview."
    }

    // MARK: Feedback

    private func feedback(_ question: Question, answers: [Answer], result: MatchResult) -> some View {
        let unchecked = result.verdict == .unchecked && ownVerdict == nil
        let correct = ownVerdict ?? (result.verdict == .correct)
        return VStack(alignment: .leading, spacing: 18) {
            Group {
                if unchecked {
                    Label("Check your answer", systemImage: "info.circle.fill")
                        .foregroundStyle(.blue)
                } else if correct {
                    Label("Correct!", systemImage: "checkmark.seal.fill")
                        .foregroundStyle(.green)
                } else {
                    Label("Not quite", systemImage: "xmark.circle.fill")
                        .foregroundStyle(.orange)
                }
            }
            .font(.title2.weight(.bold))

            if !reply.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("You said")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text("“\(reply)”")
                        .font(.body.italic())
                }
            }

            if !correct, question.required > 1, !result.matched.isEmpty, !unchecked {
                Text("You named \(result.matched.count) of the \(question.required) answers needed.")
                    .foregroundStyle(.secondary)
            }
            if unchecked {
                Text("This answer depends on where you live. Add your state and officials in Settings to have it checked, or compare with the answers below.")
                    .foregroundStyle(.secondary)
            }

            AnswerList(question: question, answers: answers, matched: result.matched)

            HStack(spacing: 10) {
                Button {
                    say(SpokenText.answers(answers, required: question.required, readAll: true))
                } label: {
                    Label("Hear the answer", systemImage: "speaker.wave.2.fill")
                }
                .buttonStyle(.bordered)

                Button {
                    tryAgain()
                } label: {
                    Label("Try again", systemImage: "arrow.counterclockwise")
                }
                .buttonStyle(.bordered)
            }

            if result.verdict != .unchecked || ownVerdict != nil {
                Button(correct ? "Count this as wrong" : "My answer was right — count it") {
                    ownVerdict = !correct
                }
                .font(.subheadline)
            }
        }
    }

    // MARK: Bottom bar

    @ViewBuilder
    private func bottomBar(_ question: Question, answers: [Answer]) -> some View {
        HStack(spacing: 12) {
            if let result {
                if result.verdict == .unchecked && ownVerdict == nil {
                    Button {
                        ownVerdict = false
                        next(question)
                    } label: {
                        Text("I got it wrong").frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    Button {
                        ownVerdict = true
                        next(question)
                    } label: {
                        Text("I got it right").frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                } else {
                    Button {
                        next(question)
                    } label: {
                        Text(isLastQuestion ? "See results" : "Next question").frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }
            } else {
                Button {
                    giveUp(question, answers: answers)
                } label: {
                    Text("I don’t know").frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                Button {
                    check(question, answers: answers)
                } label: {
                    Text("Check").frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(reply.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || listener.isListening || listener.isSettling)
            }
        }
        .controlSize(.large)
        .padding()
        .background(.bar)
    }

    private var isLastQuestion: Bool {
        var preview = session
        preview.record(correct: ownVerdict ?? (result?.verdict == .correct))
        return preview.isFinished
    }

    // MARK: Actions

    private func begin(_ question: Question) async {
        guard begunIndex != session.index else { return }
        begunIndex = session.index
        reply = ""
        result = nil
        ownVerdict = nil
        revealedThisQuestion = false
        heardNothing = false
        listener.cancel()
        guard settings.autoReadQuestions else { return }
        // Let the screen settle before speaking, so the first words aren't lost to the transition.
        try? await Task.sleep(for: .milliseconds(400))
        guard !Task.isCancelled else { return }
        say(SpokenText.question(question))
    }

    private func toggleListening(_ question: Question, answers: [Answer]) {
        if listener.isListening {
            listener.stop()
            return
        }
        if speakingHere {
            speaker.stop()
        }
        replyFocused = false
        heardNothing = false
        let hints = answers.flatMap { [SpokenText.plain($0.text)] + $0.also }
        Task {
            await listener.start(hints: hints) { heard in
                if heard.isEmpty {
                    heardNothing = true
                } else {
                    reply = heard
                    check(question, answers: answers)
                }
            }
        }
    }

    private func check(_ question: Question, answers: [Answer]) {
        replyFocused = false
        let outcome = AnswerMatcher.check(reply, against: answers, required: question.required)
        result = outcome
        ownVerdict = nil
        guard settings.readAnswerAfterChecking else { return }
        switch outcome.verdict {
        case .correct:
            say("Correct.")
        case .incorrect:
            say("Not quite. " + SpokenText.answers(answers, required: question.required, readAll: false))
        case .unchecked:
            say(SpokenText.answers(answers, required: question.required, readAll: false))
        }
    }

    private func giveUp(_ question: Question, answers: [Answer]) {
        listener.cancel()
        replyFocused = false
        reply = ""
        result = MatchResult(verdict: .incorrect, matched: [], required: question.required)
        ownVerdict = false
        if settings.readAnswerAfterChecking {
            say(SpokenText.answers(answers, required: question.required, readAll: false))
        }
    }

    private func tryAgain() {
        if speakingHere {
            speaker.stop()
        }
        result = nil
        ownVerdict = nil
        reply = ""
        heardNothing = false
    }

    private func next(_ question: Question) {
        guard let result else { return }
        let correct = ownVerdict ?? (result.verdict == .correct)
        if speakingHere {
            speaker.stop()
        }
        progress.record(question.id, correct: correct)
        session.record(correct: correct)
    }

    private func say(_ text: String, rateScale: Double = 1) {
        speaker.speak(
            [Utterance(text: text, rateScale: rateScale)],
            then: { speakingHere = false },
            onStop: { speakingHere = false }
        )
        speakingHere = true
    }
}
