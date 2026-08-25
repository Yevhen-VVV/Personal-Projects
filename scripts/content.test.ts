/**
 * Structural checks on the hand-written speaking and listening content.
 * Run with: npm run test:content
 *
 * None of this is generated, so nothing else would catch an authoring slip:
 * a gap whose answer is missing from its own options, a comprehension answer
 * pointing at the wrong index, a phrase with no Russian. Each of those looks
 * fine in the editor and is broken on the screen.
 */
import { SCENARIOS } from '../src/engine/corpus/scenarios';
import { PASSAGES, spokenSeconds } from '../src/engine/corpus/listening';
import { GROUP_TITLES, PHRASES, type PhraseGroup } from '../src/engine/corpus/survival';
import { match } from '../src/engine/match';

const problems: string[] = [];
const CYRILLIC = /[Ѐ-ӿ]/;
const LATIN = /[A-Za-z]/;

// ---- role-play ----
const scenarioIds = new Set<string>();
for (const s of SCENARIOS) {
  const at = `[${s.id}]`;
  if (scenarioIds.has(s.id)) problems.push(`${at} duplicate scenario id`);
  scenarioIds.add(s.id);
  if (!CYRILLIC.test(s.title)) problems.push(`${at} title is not in Russian`);
  if (!CYRILLIC.test(s.setting)) problems.push(`${at} setting is not in Russian`);
  if (s.turns.length < 3) problems.push(`${at} only ${s.turns.length} turns`);

  s.turns.forEach((t, i) => {
    const where = `${at} turn ${i + 1}`;
    if (!LATIN.test(t.partner)) problems.push(`${where}: partner line is not in English`);
    if (!CYRILLIC.test(t.partnerRu)) problems.push(`${where}: partner translation is not in Russian`);
    if (!LATIN.test(t.model)) problems.push(`${where}: model phrase is not in English`);
    if (!CYRILLIC.test(t.modelRu)) problems.push(`${where}: model translation is not in Russian`);
    if (t.note && !CYRILLIC.test(t.note)) problems.push(`${where}: note is not in Russian`);
    if (!t.expect.length) problems.push(`${where}: no expectation`);
    if (t.expect.some((alt) => alt.length === 0)) problems.push(`${where}: an empty alternative accepts anything`);

    // The phrase offered by the escape hatch must itself satisfy the turn --
    // otherwise the app tells her to say something it then marks as wrong.
    if (!match(t.model, t.expect).ok) {
      problems.push(`${where}: the model phrase "${t.model}" does not satisfy its own expectation`);
    }
  });
}

// ---- listening ----
const passageIds = new Set<string>();
for (const p of PASSAGES) {
  const at = `[${p.id}]`;
  if (passageIds.has(p.id)) problems.push(`${at} duplicate passage id`);
  passageIds.add(p.id);
  if (!CYRILLIC.test(p.title)) problems.push(`${at} title is not in Russian`);
  if (!LATIN.test(p.text)) problems.push(`${at} passage is not in English`);
  if (!CYRILLIC.test(p.ru)) problems.push(`${at} translation is not in Russian`);

  // "Thirty-second clips" should actually be about thirty seconds.
  const seconds = spokenSeconds(p.text);
  if (seconds < 20 || seconds > 40) problems.push(`${at} is ${seconds}s, not around 30s`);

  const questions = [p.gist, ...p.details];
  questions.forEach((q, i) => {
    const where = `${at} question ${i + 1}`;
    if (!CYRILLIC.test(q.q)) problems.push(`${where}: not in Russian`);
    if (q.options.length < 3) problems.push(`${where}: only ${q.options.length} options`);
    if (q.answer < 0 || q.answer >= q.options.length) problems.push(`${where}: answer index out of range`);
    if (new Set(q.options).size !== q.options.length) problems.push(`${where}: duplicate options`);
  });

  p.gaps.forEach((g, i) => {
    const where = `${at} gap ${i + 1}`;
    if (!g.sentence.includes('␣')) problems.push(`${where}: no gap marker`);
    if (!g.options.includes(g.answer)) problems.push(`${where}: answer is not among its own options`);
    if (new Set(g.options).size !== g.options.length) problems.push(`${where}: duplicate options`);
    // The gap sentence must come from the passage, or she is asked about
    // something she never heard. Compared case- and apostrophe-insensitively:
    // a gap sentence is capitalised as a sentence of its own, and typographic
    // apostrophes differ between the two.
    const flatten = (t: string) => t.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');
    const stem = flatten(g.sentence.split('␣')[0]).trim().replace(/[.,!?]$/, '');
    if (stem.length > 12 && !flatten(p.text).includes(stem.slice(0, 12))) {
      problems.push(`${where}: sentence does not appear in the passage`);
    }
  });
}

// ---- survival phrases ----
const seen = new Set<string>();
for (const phrase of PHRASES) {
  const at = `["${phrase.en}"]`;
  if (seen.has(phrase.en)) problems.push(`${at} duplicate phrase`);
  seen.add(phrase.en);
  if (!LATIN.test(phrase.en)) problems.push(`${at} phrase is not in English`);
  if (!CYRILLIC.test(phrase.ru)) problems.push(`${at} translation is not in Russian`);
  if (!CYRILLIC.test(phrase.when)) problems.push(`${at} usage note is not in Russian`);
  if (!GROUP_TITLES[phrase.group]) problems.push(`${at} unknown group "${phrase.group}"`);
}

for (const group of Object.keys(GROUP_TITLES) as PhraseGroup[]) {
  const count = PHRASES.filter((p) => p.group === group).length;
  if (count < 4) problems.push(`[${group}] only ${count} phrases -- too thin for a drill`);
  // Every group must be usable by a beginner, or her level filter empties it.
  if (!PHRASES.some((p) => p.group === group && p.level === 1)) {
    problems.push(`[${group}] has nothing at level 1`);
  }
}

console.log(`Scenarios ${SCENARIOS.length}, turns ${SCENARIOS.reduce((n, s) => n + s.turns.length, 0)}`);
console.log(`Passages  ${PASSAGES.length}, questions ${PASSAGES.reduce((n, p) => n + 1 + p.details.length + p.gaps.length, 0)}`);
console.log(`Phrases   ${PHRASES.length} across ${Object.keys(GROUP_TITLES).length} groups`);
console.log(`\nProblems: ${problems.length}`);
for (const p of problems) console.log('  ' + p);
process.exitCode = problems.length ? 1 : 0;
