/**
 * Generates a large sample from every skill and checks the invariants that
 * a bad question would violate. Run with: npm run audit
 */
import { ALL_SKILL_IDS, createRng, generateQuestion, solve } from '../src/engine';
import type { Level, Question, SkillId } from '../src/engine/types';

const PER_SKILL = 400;
const LEAKED_TOKEN = /\{[A-Z]\}/;

const problems: string[] = [];
const uniqueBySkill = new Map<SkillId, Set<string>>();

function check(q: Question) {
  const where = `[${q.skill}] ${q.text}`;
  const correct = q.choices.filter((c) => c.correct);

  if (correct.length !== 1) problems.push(`${where} — ${correct.length} correct answers`);
  if (q.choices.length < 2) problems.push(`${where} — only ${q.choices.length} choices`);

  const texts = q.choices.map((c) => c.text.trim().toLowerCase());
  if (new Set(texts).size !== texts.length) problems.push(`${where} — duplicate choices: ${texts.join(' / ')}`);

  if (LEAKED_TOKEN.test(q.text)) problems.push(`${where} — unsubstituted template token`);
  for (const c of q.choices) {
    if (LEAKED_TOKEN.test(c.text)) problems.push(`${where} — token leaked into choice "${c.text}"`);
    if (!c.text.trim()) problems.push(`${where} — empty choice`);
  }

  if (!q.teaching.trim()) problems.push(`${where} — no explanation`);
  // Three skills legitimately show a complete sentence instead of a gap:
  // "which question is correct", "what does this phrasal verb mean", and the
  // definition-matching shape of the vocabulary generator.
  const gapOptional: SkillId[] = ['question-order', 'vocabulary', 'phrasal-verbs'];
  if (!q.text.includes('␣') && !gapOptional.includes(q.skill)) {
    problems.push(`${where} — no gap in the sentence`);
  }
  const solved = solve(q.text, correct[0]?.text ?? '');
  if (solved.includes('␣')) problems.push(`${where} — gap survived substitution`);
  if (/\s{2,}/.test(solved)) problems.push(`${where} — double space after substitution: "${solved}"`);
}

for (const skill of ALL_SKILL_IDS) {
  const ids = new Set<string>();
  for (const level of [1, 2, 3] as Level[]) {
    const rng = createRng(level * 7919 + skill.length);
    for (let i = 0; i < PER_SKILL; i++) {
      const q = generateQuestion(skill, level, rng, new Set());
      if (!q) {
        problems.push(`[${skill}] generator returned null at level ${level}`);
        continue;
      }
      ids.add(q.id);
      check(q);
    }
  }
  uniqueBySkill.set(skill, ids);
}

console.log('Distinct questions produced per skill (from %d draws each):', PER_SKILL * 3);
for (const [skill, ids] of uniqueBySkill) {
  console.log(`  ${skill.padEnd(24)} ${String(ids.size).padStart(4)}`);
}

console.log('\nProblems: %d', problems.length);
for (const p of [...new Set(problems)].slice(0, 40)) console.log('  ' + p);

if (problems.length) process.exitCode = 1;
