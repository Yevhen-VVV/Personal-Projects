import SwiftUI

@main
@MainActor
struct CitizenshipPracticeApp: App {
    @StateObject private var settings: AppSettings
    @State private var progress: ProgressStore
    @State private var speaker: Speaker
    @State private var listener: SpeechListener
    @State private var player: ListenPlayer

    init() {
        let settings = AppSettings()
        let speaker = Speaker(settings: settings)
        _settings = StateObject(wrappedValue: settings)
        _progress = State(initialValue: ProgressStore())
        _speaker = State(initialValue: speaker)
        _listener = State(initialValue: SpeechListener())
        _player = State(initialValue: ListenPlayer(speaker: speaker, settings: settings))
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(settings)
                .environment(progress)
                .environment(speaker)
                .environment(listener)
                .environment(player)
        }
    }
}
