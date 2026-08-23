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
  why: 'The result matters now, so English uses the present perfect.',
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
