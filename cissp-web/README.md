# CISSP Prep

A private study app for the ISC2 CISSP exam, built as a single web page that runs inside Claude as an
artifact, on a phone or in any browser. It has 484 original practice questions mapped to the exam
outline that took effect on April 15, 2024. Every answer option comes with its own explanation, and
the app adds an adaptive mock exam, a study tracker, a plan running to the exam date, and an Arcade
of game-like practice modes.

## What it does

- **Practice** with instant feedback. After each answer you see why every option is right or
  wrong, plus the one-line key point. Smart sessions bring back missed questions on a spaced
  schedule, then lean on the domains where your first-try accuracy is lowest, weighted by how much
  each domain counts on the exam. You can also drill by domain, by weak objective, missed questions
  or flagged questions.
- **Arcade**, the experimental side of Practice (switch between Classic and Arcade at the top).
  The question games use the same bank and count toward the same record and review schedule:
  - *Daily 5*: five medium or hard questions from five domains, the same on every device, one go a day.
  - *Survival*: three lives; the questions get harder the longer you last.
  - *Pace run*: ten questions on the real exam's pace of 72 seconds each, explanations at the end.
  - *Confidence bets*: bet Guess (+1/0), Likely (+2/−1) or Sure (+3/−6) on each answer. The payoffs
    make an honest bet the best one, and the Arcade shows how often each kind of bet is right, so
    overconfidence shows up before the exam does.
  - *Eliminate two*: strike two wrong options before answering.
  - *Blind recall*: read the stem, answer in your head, then see the options.
  - *Sequence it* and *Match up*: drills from `bank/drills.json` that put processes in order (incident
    steps, the RMF, DR tests, the kill chain, PASTA…) and pair terms with definitions (security models,
    fire classes, recovery metrics…).

  Every answer anywhere in the app earns experience: 10 points plus 5 per difficulty step for a right
  answer, 2 for a miss. Levels run from Intern to Board advisor, and 15 badges mark milestones such as
  a seven-day streak, a well-calibrated Sure, or a passing full mock.
- **Mock exam** that behaves like the real English CAT exam: 100–150 items in 3 hours (or a 50–75
  item half version), no going back, and it stops as soon as it is 95% sure you are above or below
  the passing line. The result comes as an estimated score on the 0–1000 scale with 700 as the pass
  mark, plus a domain-by-domain proficiency report like the one ISC2 gives candidates who fail.
- **Tracker**: the exam date and a countdown, per-domain statistics, 1–5 self-ratings, notes,
  scores from other practice tests, a 30-day activity chart, the weakest objectives, and a
  week-by-week plan that reorders itself as accuracy changes.
- **Library**: how to think like a CISSP, exam facts, every key point grouped by objective, a
  question browser, and links to official and free resources.
- **Claude features**, when the page is opened in Claude and allowed to use it: ask follow-up
  questions about any item, generate fresh questions on a weak objective (labelled AI-written and
  kept out of mocks), and import an existing study tracker from pasted text.

## Where progress is kept

Opened in Claude by its owner, the page stores progress in the artifact's own database, with rules
that let only the owner read or write it, so a phone and a laptop share one record. Anywhere else
(signed out, or someone you share the link with) it falls back to that browser's local storage. A
copy is always kept locally for a fast start.

Documents: `me/profile` (exam date, ratings, notes, external scores), `me/progress` (one compact
record per question plus daily counts), `me/mock` (an exam in progress), `me/game` (experience,
badges, Arcade bests, calibration and drill records), and the `sessions`,
`flags` and `gen` collections. Flags carry an optional note, so disputed questions can be found and
fixed later.

## The question bank

Questions live in `bank/d1.txt` to `bank/d8.txt` as plain text, one block per question:

```
## D3-014 | 3.6 | 2
Q: The stem.
A) A wrong option
= Why it is wrong.
B)* The keyed answer
= Correct. Why it is right.
C) ...
D) ...
>> The one-line key point.
```

The header is `id | outline objective | difficulty (1–3)`. Ids are permanent because progress is
stored against them: add new questions with new ids and never renumber. Options are shuffled on
screen, so no option may refer to another by letter.

`build.mjs` rejects the bank if any question has a missing explanation, a duplicate id or stem, an
objective outside its domain, an option that depends on order, or a keyed explanation that does not
open with "Correct." It also prints statistics a question writer should watch: domain shares against
the exam weights, answer positions, and how often the keyed answer is the single longest option (a
give-away that test-wise readers exploit; it should stay below 25%).

Some give-aways need judgment rather than a rule, so the bank was also audited by reading, with
scratch scripts to find candidates: distractors built on absolute words ("always", "never", "only")
that test-wise readers learn to discard, throwaway distractors nobody would pick, and stems whose
distinctive words reappear only in the keyed answer. All three were cut back.

The drills live in `bank/drills.json`. Each sequence lists its steps in the correct order and each
match set lists `[term, definition]` pairs; the page shuffles both. The build checks ids, objectives,
step and pair counts and duplicates.

The questions are original. They follow the reasoning of the ISC2 CISSP Official Study Guide but do
not copy any published question bank.

## Scoring model

Each question's difficulty rating gives it a place on a Rasch (one-parameter) scale: −1, 0 or +1.
The mock estimates ability after every answer by maximum a posteriori estimation with a standard
normal prior, picks the next item from the domain furthest behind its exam weight at the difficulty
closest to the current estimate, and applies the 95% confidence stopping rule. The passing line
sits where a candidate answers about 71% of medium questions correctly. It is a practice estimate,
not ISC2's scoring. `engine.test.mjs` simulates candidates of known ability to check that strong ones
pass, weak ones fail, and borderline ones take longer.

## Files

```
src/app.html        The page: markup, styles and app code
src/engine.js       Scheduling, statistics, the adaptive mock, the study plan and the Arcade's rules
bank.mjs            Parses and validates the questions and drills; holds the exam outline
bank/d1–d8.txt      The questions
bank/drills.json    Sequences and match sets for the Arcade drills
build.mjs           Inlines the engine, the bank and the drills into cissp-prep.html
engine.test.mjs     Tests for the engine, including the mock simulation and the Arcade
cissp-prep.html     The built page. Generated, so edit src/ and bank/ instead
```

After changing anything, rebuild and test:

```bash
node cissp-web/build.mjs
node cissp-web/engine.test.mjs
```

CI runs both and fails if `cissp-prep.html` was not rebuilt.
