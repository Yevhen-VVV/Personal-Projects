import SwiftUI

struct ContentView: View {
    private enum AppTab: Hashable {
        case questions, practice, listen, settings
    }

    @State private var tab: AppTab = .questions

    var body: some View {
        TabView(selection: $tab) {
            StudyView()
                .tabItem { Label("Questions", systemImage: "list.bullet.rectangle") }
                .tag(AppTab.questions)
            PracticeHomeView()
                .tabItem { Label("Practice", systemImage: "mic") }
                .tag(AppTab.practice)
            ListenView()
                .tabItem { Label("Listen", systemImage: "headphones") }
                .tag(AppTab.listen)
            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape") }
                .tag(AppTab.settings)
        }
    }
}
