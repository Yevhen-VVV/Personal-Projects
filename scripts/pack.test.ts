/**
 * Exercises the validator and the pack writer without calling the API, so the
 * rules that keep bad items out of the corpus are themselves tested.
 * Run with: npm run test:pack
 */
import { validate } from './generate-pack';

const GOOD = {
  text: 'I ␣ my glasses this morning and cannot find them.',
  correct: 'have lost',
  wrong: ['lost', 'lose', 'am losing'],
  why: 'Важен результат сейчас, поэтому нужен present perfect.',
  wrongWhy: [
    'Простое прошедшее не связывает действие с настоящим моментом.',
    'Настоящее простое описывает привычку.',
    'Continuous означал бы «теряю прямо сейчас».',
  ],
  level: 2,
};

const CASES: [string, Record<string, unknown>, string | null][] = [
  ['accepts a well-formed item', GOOD, null],
  ['rejects a missing gap', { ...GOOD, text: 'I lost my glasses.' }, 'needs exactly one ␣ gap'],
  ['rejects two gaps', { ...GOOD, text: '␣ I ␣ them?' }, 'needs exactly one ␣ gap'],
  ['rejects too few distractors', { ...GOOD, wrong: ['lost', 'lose'] }, 'has 2 distractors, needs 3'],
  ['rejects a distractor equal to the answer', { ...GOOD, wrong: ['lost', 'lose', 'have lost'] }, 'duplicate choices'],
  ['rejects an empty distractor', { ...GOOD, wrong: ['lost', 'lose', '  '] }, 'empty distractor'],
  ['rejects a bad level', { ...GOOD, level: 7 }, 'bad level 7'],
  ['rejects a missing explanation', { ...GOOD, why: '' }, 'no explanation'],
  [
    'rejects the wrong number of wrong-answer explanations',
    { ...GOOD, wrongWhy: ['только одно'] },
    'has 1 wrong-answer explanations, needs 3',
  ],
  [
    'rejects an English explanation',
    { ...GOOD, why: 'The result matters now.' },
    'explanation is not in Russian',
  ],
  [
    'rejects an English wrong-answer explanation',
    { ...GOOD, wrongWhy: ['Верно по-русски.', 'This one is English.', 'И снова по-русски.'] },
    'wrong-answer explanation 2 is not in Russian',
  ],
  [
    'rejects a Russian question sentence',
    { ...GOOD, text: 'Я ␣ очки сегодня утром.' },
    'the sentence should be in English, not Russian',
  ],
  [
    'rejects Russian answer options',
    { ...GOOD, correct: 'потерял' },
    'answer options should be in English, not Russian',
  ],
];

let failures = 0;

for (const [name, item, expected] of CASES) {
  const actual = validate(item as never, []);
  const ok = expected === null ? actual === null : actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) {
    console.log(`        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failures++;
  }
}

// Duplicate detection needs an existing corpus to compare against.
const dup = validate(GOOD as never, [{ ...GOOD, level: 2 as const }]);
const dupOk = dup === 'duplicate of an existing item';
console.log(`${dupOk ? 'PASS' : 'FAIL'}  rejects a duplicate of an existing item`);
if (!dupOk) failures++;

console.log(failures ? `\n${failures} failing` : '\nAll checks passed.');
process.exitCode = failures ? 1 : 0;
