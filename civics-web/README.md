# Civics Test Practice — web version

The citizenship practice app as a single web page: nothing to install. Open the link on a phone or
a computer and practise. It has the same 128 questions as the iPhone app in `../CitizenshipPractice`,
the same answer checker, and the same four sections:

- **Practice**: each question is read aloud, you answer, and the page checks your answer and reads
  back the right one. The **mock interview** asks 20 random questions with the text hidden and
  stops at 12 right or 9 wrong, like the real test.
- **Questions**: all 128, searchable, each one playable.
- **Listen**: hands-free. Question, a pause for you to answer out loud, then the answer.
- **Settings**: voice and speed, your state, and your officials.

## How it differs from the iPhone app

- **Speaking your answer** uses the phone keyboard's own microphone (dictation) key instead of an
  in-app microphone button. Web pages embedded in other sites can't use the microphone, and
  keyboard dictation works in any browser.
- **Listen stops when the screen locks.** Browsers pause speech in the background. The page keeps
  the screen on while it plays, where the browser allows it.
- **Progress** is kept in the browser the learner uses, so it doesn't follow them to another device.
- The voice is whatever the browser offers. On iPhone, downloading an Enhanced or Premium voice
  (Settings › Accessibility › Spoken Content › Voices › English) makes a large difference.

## Files

```
src/app.html        The page: markup, styles and app code
src/matcher.js      The answer checker, ported from AnswerMatcher.swift
build.mjs           Inlines the checker and questions.json into civics-test.html
matcher.test.mjs    The iPhone app's answer tests, run against the web checker
civics-test.html    The built page. Generated, so edit src/ instead
```

The question bank is shared: it is read from
`../CitizenshipPractice/CitizenshipPractice/Resources/questions.json`, so a correction there reaches
both apps. After changing it or anything in `src/`, rebuild and test:

```bash
node civics-web/build.mjs
node civics-web/matcher.test.mjs
```

CI runs both, and fails if `civics-test.html` wasn't rebuilt.

`civics-test.html` is self-contained apart from two Google Fonts, which fall back to system fonts
when they're unavailable. Any static host can serve it as it is.
