# English Practice

An English lessons-and-quizzes app for older learners, built around a question
generator rather than a fixed question bank. It runs as an installable web app
on an iPhone and on Windows, works offline, and is targeted specifically at
Ukrainian and Russian speakers.

```bash
npm install
npm run dev
```

## What it does

Short lessons, then multiple-choice practice, across sixteen topics — articles,
prepositions, tenses, countability, question order, phrasal verbs, false
friends, and everyday vocabulary. Every wrong answer gets an explanation naming
the rule that decides it. A spaced-repetition scheduler brings weak topics back
sooner and mastered ones back rarely.

Nothing is timed, nothing is penalised, and no streak is ever lost.

## How the questions are generated

Questions are built on the device by combining sentence frames with a corpus,
not drawn from a fixed list. `npm run space` reports the current size of the
space by drawing until the generators stop producing anything new:

```
past-simple    5265     articles        488     vocabulary     225
prepositions    226     countability    110     confusables     50
phrasal-verbs    48     comparatives     38     plurals         27
make-do          25     dependent-preps  20     present-perfect 14
question-order   12     modals           10     say-tell         8

Total distinct question stems: 6,566
```

Each stem also varies its distractor set, so the rendered questions outnumber
the stems considerably. At twelve questions a day that is well over a year
before a repeat — and because the scheduler is deliberately bringing weak
topics back, some repetition is the point rather than a failure.

**Two kinds of generator.** Where a rule applies uniformly — articles,
prepositions, past tense, plurals — the sentence is a parametrised frame, and
one frame times fifty nouns is fifty questions. Where correctness depends on
discourse context — present perfect, modals, say/tell — items are written out
in full, because a template there produces sentences that are grammatical and
that nobody would ever say.

That split is why `past-simple` yields over five thousand stems and `say-tell`
yields eight. Growing the templated skills is a matter of adding corpus rows; growing
the authored ones means writing items, which is what the content packs below
are for.

**Distractors are errors, not noise.** The wrong answers are generated from the
mistakes a Slavic-language speaker actually makes: the over-regularised past
(`goed`, `buyed`), the participle used as a past tense, the missing `do` in a
question, `much` where English wants `many`. A learner who picks one has told
the app something real about what they do not yet know.

## Why it targets Ukrainian and Russian speakers

Neither language has articles, so `a`/`an`/`the` is the single most persistent
error. Neither maps cleanly onto the present perfect, because both use aspect
where English chooses a tense. One verb covers *borrow* and *lend*, another
covers *learn* and *teach*, another covers *make* and *do*. And a long list of
words look familiar and mean something else — «магазин» is a shop, «актуальний»
means current, «симпатичний» means attractive.

The lessons name these collisions explicitly rather than just marking the
answer wrong, because a learner who understands *why* they keep making an error
stops making it far sooner than one who is only corrected.

## Accessibility

This is the part most language apps get wrong for this audience, so it is
treated as a requirement rather than a setting:

- Type starts large and scales to 145% without any layout breaking; pinch-zoom
  is never disabled.
- Colour pairs are chosen for at least 7:1 contrast, past the WCAG AA minimum.
- Every tap target is at least 64px tall. The smoke test fails the build if any
  button drops under 44px at any text size.
- Any sentence can be read aloud, at a slower-than-default rate.
- Light and dark backgrounds, no motion beyond a colour change, no timers.

## AI content packs

The app makes no network calls. Instead, `npm run pack` is an authoring-time
tool that asks Claude for new items in the style of the existing corpus,
validates every one, and appends the survivors to `src/engine/corpus/packs.ts`:

```bash
export ANTHROPIC_API_KEY=...        # or: ant auth login
npm run pack -- present-perfect 20
npm run audit                       # then read the diff
```

Rejected items never reach the corpus: the validator drops anything without
exactly one gap, without exactly three distinct distractors, with a duplicate
of the correct answer, or that repeats an existing item. Generated content is
checked into the repository so it can be reviewed in a diff before anyone
practises with it — and so the learner still needs no key, no account, and no
connection.

## Installing it

**iPhone** — open the deployed URL in Safari, then Share → Add to Home Screen.
It gets its own icon, opens full screen with no browser chrome, and works with
no signal.

**Windows** — open it in Edge or Chrome, then Install from the address bar. It
gets a Start menu entry and its own window.

Neither route needs an app store, an account, or a payment.

**A real App Store build** is the same codebase wrapped with Capacitor, and a
real Windows `.exe` is the same codebase wrapped with Tauri. Neither needs a
rewrite. The iOS route additionally requires a Mac, Xcode, and an Apple
Developer account — that step is not automatable from this repository.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build into `dist/` |
| `npm run check` | Typecheck the app and the scripts |
| `npm run audit` | Generate thousands of questions and assert every structural invariant |
| `npm run sample [n]` | Print sample questions per skill, answers filled in, for reading |
| `npm run space` | Measure the size of the question space |
| `npm run smoke -- <dir>` | Drive a built app end to end, check layout and tap targets |
| `npm run test:pack` | Test the content-pack validator |
| `npm run pack -- <skill>` | Generate new items with Claude |

`npm run audit` is the important one. It catches broken structure — a leaked
template token, two correct answers, a gap that survived substitution. It
cannot catch a sentence that is well-formed and meaningless, which is what
`npm run sample` is for; reading the output is how "Travelling by train is
bigger than driving" was found and fixed.

## Layout

```
src/engine/
  corpus/       Nouns, verbs, frames, phrasal verbs, false friends, vocabulary
  generators/   One function per skill, corpus in, question out
  skills.ts     Topic metadata and the lesson text
  build.ts      Assembles a question and enforces its invariants
src/srs/        Leitner scheduler, per skill rather than per question
src/ui/         Screens, settings, text-to-speech
scripts/        Audit, sampling, smoke test, content packs
```

To add vocabulary or a new false-friend pair, edit the corpus — no generator
changes needed. To add a topic, write a generator, register it in
`src/engine/index.ts`, and add its lesson to `src/engine/skills.ts`.
