/**
 * The matcher decides whether she is told "you said it" or "not quite", so it
 * is worth testing against the way speech recognition actually mangles input.
 * Run with: npm run test:match
 */
import { match, normalise, similarity } from '../src/engine/match';

let failures = 0;
const check = (name: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) {
    console.log(`        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failures++;
  }
};

check('normalises contractions', normalise("I'd like an appointment."), 'i would like an appointment');
check('normalises digits to words', normalise('At 3 o clock'), 'at three o clock');
check('strips punctuation and case', normalise('  Hello,  DOCTOR!  '), 'hello doctor');

const expect = [['appointment'], ['see', 'doctor']];
check('accepts the first alternative', match('I would like an appointment please', expect).ok, true);
check('accepts the second alternative', match('I want to see the doctor', expect).ok, true);
check('rejects an unrelated answer', match('the weather is nice', expect).ok, false);
check(
  'reports what was missing from the closest alternative',
  match('I want to see the nurse', expect).missing,
  ['doctor'],
);
check('an empty expectation always passes', match('anything at all', []).ok, true);
check('accepts a misheard filler around the keyword', match('erm I need an appointment yes', expect).ok, true);

// Whole-word matching: "pay" must not be satisfied by "paying" alone.
check('matches whole words only', match('I am paying', [['pay']]).ok, false);
check('matches a multi-word phrase', match('could you say that again please', [['say that again']]).ok, true);

check('similarity is 1 for an exact repeat', similarity('Could you help me?', 'could you help me'), 1);
check('similarity is 0 for nothing in common', similarity('the cat sat', 'could you help me'), 0);
const partial = similarity('could you help', 'could you help me');
check('similarity is partial for a partial repeat', Math.round(partial * 100) / 100, 0.75);

console.log(failures ? `\n${failures} failing` : '\nAll checks passed.');
process.exitCode = failures ? 1 : 0;
