/**
 * Saturation test: draws until the generators stop producing anything new,
 * to measure the real size of the question space rather than estimating it.
 * Run with: npm run space
 */
import { ALL_SKILL_IDS, createRng, generateQuestion } from '../src/engine';

let total = 0;
for (const skill of ALL_SKILL_IDS) {
  const ids = new Set<string>();
  const rng = createRng(12345);
  for (let i = 0; i < 60000; i++) {
    const q = generateQuestion(skill, 3, rng, new Set());
    if (q) ids.add(q.id);
  }
  total += ids.size;
  console.log(skill.padEnd(24), String(ids.size).padStart(6));
}
console.log('\nTotal distinct question stems:', total.toLocaleString());
