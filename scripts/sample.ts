/**
 * Prints sample questions from every skill, with the answer filled in, so the
 * English can be read and judged. Automated checks catch broken structure;
 * only reading catches a sentence that is well-formed and meaningless.
 * Run with: npm run sample
 */
import { ALL_SKILL_IDS, createRng, generateQuestion, solve } from '../src/engine';

const PER_SKILL = Number(process.argv[2] ?? 4);
const rng = createRng(Date.now() >>> 0);

for (const skill of ALL_SKILL_IDS) {
  console.log(`\n=== ${skill} ===`);
  const seen = new Set<string>();
  for (let i = 0; i < PER_SKILL; i++) {
    const q = generateQuestion(skill, 3, rng, seen);
    if (!q) continue;
    const correct = q.choices.find((c) => c.correct)!;
    console.log(`  ${solve(q.text, correct.text)}`);
    console.log(`    prompt: ${q.prompt}`);
    console.log(`    choices: ${q.choices.map((c) => (c.correct ? `[${c.label ?? c.text}]` : c.label ?? c.text)).join(' | ')}`);
    console.log(`    teaching: ${q.teaching}`);
  }
}
