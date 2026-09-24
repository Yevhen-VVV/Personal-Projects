# Civics Test — U.S. citizenship practice for iPhone

A native SwiftUI iPhone app for the **2025 USCIS civics test**: all 128 questions and their official
answers, read aloud for listening practice, with typed or spoken replies that are checked
automatically.

The 2025 test applies to anyone who files Form N-400 on or after **October 20, 2025**. At the
interview the officer reads up to 20 of the 128 questions aloud, and you pass with 12 correct. The
test ends early once you have 12 right or 9 wrong.

## What it does

**Questions**: all 128 questions, grouped the way USCIS groups them and searchable. Each question
can be read aloud, and so can its answers. Words in (parentheses) are optional, just as on the
official list.

**Practice**: the question is read aloud, and you reply by typing or by tapping the microphone and
answering out loud. The app tells you whether you were right, highlights the answer you gave, and
reads the correct answer. Choose from:

- **Mock interview**: 20 random questions with the text hidden, scored the way the real test is
  scored.
- All questions shuffled, all in order, only the ones you haven't learned yet, or one topic.

A question counts as *learned* once you answer it right twice in a row. "Not learned yet" puts the
questions you missed first.

**Listen**: hands-free. Each question is read, then a pause for you to answer out loud, then the
answer, then the next question. It keeps playing with the screen locked, so you can practise on a
walk or in the car. You can change the pause length and choose to read every accepted answer.

**Settings**: voice and speaking speed, your state (the app knows every state capital), your
governor, senators and representative, and the current national officials.

### Listening

- Questions are read with the best American English voice installed on the phone. For a much more
  natural voice, download an **Enhanced** or **Premium** voice in the iPhone Settings app:
  *Accessibility → Spoken Content → Voices → English* (called *Read & Speak* on newer iOS). It
  then shows up in the app's voice list.
- Speech plays even when the phone is on silent.
- **Slower** replays the question at three-quarter speed, but the interview is at a normal pace, so
  build up to "Normal" in Settings.
- Hide the question text (the eye button, or the setting) to practise the way the interview works:
  by ear only.

### How answers are checked

The officer accepts an answer in your own words, so the checker is forgiving. It ignores word
order and filler words, and it accepts plurals, small typos, and numbers said as words
("twenty-seven" or "27"). For questions like "Name three national U.S. holidays" it counts how many
different answers you gave. If it gets a verdict wrong, tap **My answer was right — count it** (or
the reverse).

It can't check questions 23, 29, 61 and 62 (your senators, representative, governor and state
capital) until you choose your state and enter the names in Settings. Until then you mark those
yourself.

## Answers that change

- **President, Vice President, Speaker of the House, Chief Justice** are set to Donald J. Trump,
  JD Vance, Mike Johnson and John G. Roberts, Jr., current as of September 2026. They can be
  edited in Settings. Before your interview, check
  [uscis.gov/citizenship/testupdates](https://www.uscis.gov/citizenship/testupdates).
- **Your senators, representative and governor** depend on where you live and change after
  elections. Settings links to senate.gov, house.gov and usa.gov to look them up.

## About the question list

The questions and answers follow USCIS's *128 Civics Questions and Answers (2025 version)*. The
official PDF couldn't be downloaded while this was being built, so the list was written out from
knowledge of that document and then spot-checked against search results. That check confirmed the
current officials, the wording of questions 31–34, the "Name five" in question 81, and the Cabinet
list in question 48. Before relying on the list, compare it once against the
[official PDF](https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf).
The whole bank is in one file, `CitizenshipPractice/Resources/questions.json`, so any fix is a
one-line edit. Question 117 lists a few more tribes than the official list does, because USCIS
accepts any federally recognized tribe.

The **65/20 special consideration** (applicants 65 or older with 20 years as a permanent resident
study only 20 asterisked questions) is not marked yet. The asterisked list could not be verified
reliably, and marking the wrong 20 questions would be worse than not marking any.

Extra wordings the checker accepts but never shows are listed under `"also"` in the JSON, for
example "Secretary of Defense" for "Secretary of War (Defense)".

## Installing it on your iPhone

You need a **Mac with Xcode 16 or later** (free from the Mac App Store).

1. Open `CitizenshipPractice/CitizenshipPractice.xcodeproj` in Xcode.
2. Select the **CitizenshipPractice** target → *Signing & Capabilities* → choose your **Team**. A
   free Apple ID works. If Xcode says the bundle identifier is taken, change
   `com.voitiuk.civicspractice` to something unique.
3. Connect the iPhone with a cable, pick it as the run destination, and press **Run** (⌘R).
4. On the phone, the first time: *Settings → General → VPN & Device Management* → trust your
   developer certificate. On iOS 16 and later, also turn on *Settings → Privacy & Security →
   Developer Mode*.

With a free Apple ID the app stops opening after **7 days**; press Run again to reinstall it (your
progress is kept). A paid Apple Developer account ($99/year) removes that limit and allows
TestFlight.

**Without a Mac**: every push that touches this folder runs the *Civics iPhone app* workflow on
GitHub Actions. It builds the app, runs the tests, and uploads an unsigned
`CivicsTest-unsigned.ipa` as a download on the workflow run. Tools such as
[Sideloadly](https://sideloadly.io) (Windows or Mac) can sign it with your Apple ID and install it
over USB, with the same 7-day limit for free accounts.

## Development

```
CitizenshipPractice/
  Model/
    Question.swift          Question and Answer, decoded from questions.json
    QuestionBank.swift      Loads the bank, groups it by section
    AnswerMatcher.swift     Decides whether a reply is correct
    LocalAnswers.swift      Answers that depend on officials and where you live; states and capitals
    PracticeSession.swift   Order and scoring of a sitting, including the interview's 12/9 rule
    ProgressStore.swift     Per-question right/wrong history, saved on the device
    AppSettings.swift       Preferences, saved on the device
  Speech/
    Speaker.swift           Text-to-speech (AVSpeechSynthesizer)
    SpeechListener.swift    Speech-to-text for spoken answers (Speech framework, on-device when possible)
    ListenPlayer.swift      The hands-free Listen tab
    SpokenText.swift        What to say aloud for a question or an answer
  Views/                    SwiftUI screens
  Resources/questions.json  The 128 questions
CitizenshipPracticeTests/   Unit tests
```

Run the tests with ⌘U in Xcode, or:

```bash
xcodebuild test -project CitizenshipPractice.xcodeproj -scheme CitizenshipPractice \
  -destination 'platform=iOS Simulator,name=iPhone 16'
```

The tests check that the bank has all 128 questions in the official groups, that every official
answer is accepted as a reply to its own question, and a long list of realistic replies, both right
and wrong. When you change `questions.json`, run them.

Requires iOS 17 or later. There are no accounts and no analytics, and the app makes no network
calls of its own. Spoken answers are recognized on the phone when it supports on-device
recognition; otherwise Apple's speech recognition service handles them.
