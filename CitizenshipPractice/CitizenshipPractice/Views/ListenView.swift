import SwiftUI

/// Hands-free listening practice. Keeps playing with the screen locked or while using another app.
struct ListenView: View {
    @EnvironmentObject private var settings: AppSettings
    @Environment(ListenPlayer.self) private var player

    private let bank = QuestionBank.standard

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 28) {
                    nowPlaying
                    controls
                    options
                }
                .padding()
            }
            .navigationTitle("Listen")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        ForEach(bank.groups) { group in
                            Button(group.subsection) {
                                if let first = group.questions.first {
                                    player.jump(toQuestion: first.id)
                                }
                            }
                        }
                    } label: {
                        Label("Jump to a topic", systemImage: "text.line.first.and.arrowtriangle.forward")
                    }
                }
            }
        }
    }

    private var nowPlaying: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let question = player.current {
                Text("Question \(question.id)  ·  \(player.position + 1) of \(player.order.count)")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.secondary)
                Text(question.text)
                    .font(.title2.weight(.semibold))
                    .fixedSize(horizontal: false, vertical: true)
                    .opacity(player.isPlaying && player.phase == .answer ? 0.55 : 1)

                Divider()

                if !player.isPlaying || player.phase == .answer {
                    let answers = question.resolvedAnswers(using: settings.localAnswers)
                    Text(answers.isEmpty ? "Depends on where you live — see Settings." : answers.map(\.text).joined(separator: "  •  "))
                        .font(.title3)
                        .fixedSize(horizontal: false, vertical: true)
                } else {
                    Label("Think of your answer…", systemImage: "ellipsis.bubble")
                        .font(.title3)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, minHeight: 220, alignment: .topLeading)
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .animation(.easeInOut(duration: 0.2), value: player.phase)
    }

    private var controls: some View {
        HStack(spacing: 36) {
            Button {
                player.previous()
            } label: {
                Image(systemName: "backward.fill")
                    .font(.title)
            }
            .accessibilityLabel("Previous question")
            .disabled(player.position == 0 && player.phase == .question)

            Button {
                player.togglePlayback()
            } label: {
                Image(systemName: player.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                    .font(.system(size: 76))
            }
            .accessibilityLabel(player.isPlaying ? "Pause" : "Play")

            Button {
                player.next()
            } label: {
                Image(systemName: "forward.fill")
                    .font(.title)
            }
            .accessibilityLabel("Next question")
            .disabled(player.position >= player.order.count - 1)
        }
    }

    private var options: some View {
        VStack(alignment: .leading, spacing: 18) {
            Picker("Order", selection: $settings.listenShuffled) {
                Text("In order").tag(false)
                Text("Shuffled").tag(true)
            }
            .pickerStyle(.segmented)
            .onChange(of: settings.listenShuffled) { _, shuffled in
                player.reorder(shuffled: shuffled)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Time to think before the answer: \(Int(settings.listenPause)) seconds")
                Slider(value: $settings.listenPause, in: 1...10, step: 1) {
                    Text("Time to think")
                } onEditingChanged: { editing in
                    if !editing {
                        player.restartCurrentIfPlaying()
                    }
                }
            }

            Toggle("Read every accepted answer", isOn: $settings.listenReadsAllAnswers)
                .onChange(of: settings.listenReadsAllAnswers) { _, _ in
                    player.restartCurrentIfPlaying()
                }

            Text("Each question is read, then a pause for you to answer out loud, then the answer. It keeps playing with the screen locked, so you can listen on a walk or in the car.")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
    }
}
