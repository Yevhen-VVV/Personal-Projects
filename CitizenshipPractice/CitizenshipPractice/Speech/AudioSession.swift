import AVFoundation

/// Switches the shared audio session between reading aloud and listening to the microphone.
enum AudioSession {
    /// Speech plays even with the ring/silent switch on silent, and keeps going with the screen locked.
    static func usePlayback() {
        let session = AVAudioSession.sharedInstance()
        if session.category != .playback || session.mode != .spokenAudio {
            try? session.setCategory(.playback, mode: .spokenAudio)
        }
        try? session.setActive(true)
    }

    static func useRecording() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playAndRecord, mode: .measurement, options: [.duckOthers, .defaultToSpeaker, .allowBluetooth])
        try session.setActive(true, options: .notifyOthersOnDeactivation)
    }
}
