/**
 * The daily drill must be stable within a day and change between days.
 * Run with: npm run test:drill
 */
import { dailyPhrases } from '../src/engine/drill';
import { DAILY_COUNT } from '../src/engine/corpus/survival';

let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) {
    if (detail) console.log(`        ${detail}`);
    failures++;
  }
};

const monday = new Date('2026-03-02T09:00:00Z');
const mondayEvening = new Date('2026-03-02T20:00:00Z');
const tuesday = new Date('2026-03-03T09:00:00Z');

const a = dailyPhrases(3, monday).map((p) => p.en);
const b = dailyPhrases(3, mondayEvening).map((p) => p.en);
const c = dailyPhrases(3, tuesday).map((p) => p.en);

check('gives a full drill', a.length === DAILY_COUNT, `got ${a.length}`);
check('is the same all day', JSON.stringify(a) === JSON.stringify(b));
check('changes the next day', JSON.stringify(a) !== JSON.stringify(c));
check('has no duplicates', new Set(a).size === a.length);

const rescue = dailyPhrases(3, monday).filter((p) => p.group === 'not-understood');
check('always includes "when you have not understood" phrases', rescue.length >= 2, `got ${rescue.length}`);

// A beginner must never be handed phrases above her level.
const beginner = dailyPhrases(1, monday);
check('respects the level', beginner.every((p) => p.level <= 1), 'a harder phrase leaked in');
check('still gives a full drill at level 1', beginner.length === DAILY_COUNT, `got ${beginner.length}`);

console.log(failures ? `\n${failures} failing` : '\nAll checks passed.');
process.exitCode = failures ? 1 : 0;
