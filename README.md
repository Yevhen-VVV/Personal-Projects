# English Practice · Английский язык

An English lessons-and-quizzes app for older Russian-speaking learners, built
around a question generator rather than a fixed question bank. It runs as an
installable web app on an iPhone and on Windows, and works offline.

**The interface and every explanation are in Russian; the questions and answer
options are in English.** Explaining an English rule in English asks the learner
to solve a second puzzle before starting on the first one, and the whole value
of an explanation is that it lands immediately. So the material under test stays
English and everything around it is in the language she thinks in.

```bash
npm install
npm run dev
```

## What it does

Short lessons, then multiple-choice practice, across sixteen topics — articles,
prepositions, tenses, countability, question order, phrasal verbs, false
friends, and everyday vocabulary. A spaced-repetition scheduler brings weak
topics back sooner and mastered ones back rarely.

**Every answer option carries its own explanation.** After answering she is told
why the option *she picked* fails — not merely which one was right — and then
why the correct one is correct, and then the underlying rule. A correct answer
gets the same treatment: the reason is restated rather than just marked green.
`npm run audit` fails the build if any option anywhere is missing its
explanation, or if any explanation is not in Russian.

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
the app something real about what they do not yet know — and gets back an
explanation written for that specific mistake.

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
of the correct answer, that repeats an existing item, that is missing a
per-distractor explanation, that explains itself in English instead of Russian,
or that writes the question itself in Russian. Generated content is
checked into the repository so it can be reviewed in a diff before anyone
practises with it — and so the learner still needs no key, no account, and no
connection.

## Installing it

**iPhone, without the App Store** — open the deployed URL in Safari, then
Share → Add to Home Screen. It gets its own icon, opens full screen with no
browser chrome, and works with no signal. No account, no payment, no Mac.

**Windows** — open it in Edge or Chrome, then Install from the address bar. It
gets a Start menu entry and its own window.

**Hosting it** — `.github/workflows/deploy-pages.yml` builds and publishes to
GitHub Pages on every push. The checks run first and the deploy depends on
them, so a build carrying a missing explanation or a leaked template token
never reaches a learner. Pages serves a project repository from `/<repo>/`
rather than the domain root, so the workflow passes that path to the build as
`BASE_PATH`; the manifest and service worker use relative URLs instead, and
work at either location.

**Single-file build** — `npm run bundle` inlines the CSS, the JavaScript and the
icons into one HTML file (~330 KB) that can be hosted anywhere serving a single
page. It makes no network requests at all once loaded. Because there is no
separate `sw.js` alongside it, that build skips service-worker registration and
therefore has no offline mode — deploy the whole `dist/` directory when offline
use matters.

**Offline** is Workbox-generated, not hand-written, and that was not a
preference. The hand-written worker precached the shell and passed every other
check, but the hashed JS and CSS are fetched before a worker activates on a
first visit, so they were never cached and the app opened blank with no
network. `npm run offline` is what caught it: it loads a served build with the
network cut and fails if the app does not actually run.

**iPhone, as a real App Store app** — the Capacitor scaffolding is in
`capacitor.config.ts`, so no rewrite is needed:

```bash
npm run ios:sync     # build the web app and sync it into the iOS project
npm run ios:open     # open it in Xcode
```

Both of those steps require **macOS with Xcode**, plus an Apple Developer
account (£79/$99 a year) to sign and submit. That part cannot be done from this
repository — it is the one step that genuinely needs your own Mac.

A real Windows `.exe` is the same codebase wrapped with Tauri, and has no such
constraint.

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
| `npm run bundle` | Inline everything into one self-contained HTML file |
| `npm run offline` | Load a served build with the network cut and assert it still works |
| `npm run ios:sync` | Build and sync into the iOS project (macOS only) |

`npm run audit` is the important one. It catches broken structure — a leaked
template token, two correct answers, a gap that survived substitution, an
answer option with no explanation, an explanation written in the wrong
language. It cannot catch a sentence that is well-formed and meaningless, which
is what `npm run sample` is for; reading the output is how "Travelling by train
is bigger than driving" was found and fixed.

## Layout

```
src/engine/
  corpus/       Nouns, verbs, frames, phrasal verbs, false friends, vocabulary
                (English material + Russian glosses used only in explanations)
  generators/   One function per skill, corpus in, question out
  skills.ts     Topic metadata and the lesson text
  build.ts      Assembles a question and enforces its invariants
src/srs/        Leitner scheduler, per skill rather than per question
src/ui/         Screens, settings, text-to-speech
  strings.ts    Every Russian interface string, in one file
scripts/        Audit, sampling, smoke test, content packs
```

To add vocabulary or a new false-friend pair, edit the corpus — no generator
changes needed. To add a topic, write a generator, register it in
`src/engine/index.ts`, and add its lesson to `src/engine/skills.ts`.
