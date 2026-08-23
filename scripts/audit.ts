/**
 * Generates a large sample from every skill and checks the invariants that
 * a bad question would violate. Run with: npm run audit
 */
import { ALL_SKILL_IDS, createRng, generateQuestion, solve } from '../src/engine';
import type { Level, Question, SkillId } from '../src/engine/types';

const PER_SKILL = 400;
const LEAKED_TOKEN = /\{[A-Z]\}/;
/** Explanations are shown in the learner's own language; questions are not. */
const CYRILLIC = /[\u0400-\u04FF]/;

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

  // Every choice must carry its own explanation, because the learner is told
  // why the option they picked was wrong -- not merely which one was right.
  for (const c of q.choices) {
    if (!c.why?.trim()) problems.push(`${where} — choice "${c.text}" has no explanation`);
    else if (!CYRILLIC.test(c.why)) problems.push(`${where} — choice "${c.text}" explanation is not in Russian`);
  }
  if (!CYRILLIC.test(q.teaching)) problems.push(`${where} — teaching text is not in Russian`);
  if (!CYRILLIC.test(q.prompt)) problems.push(`${where} — prompt is not in Russian`);
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

const unique = [...new Set(problems)];
console.log('\nProblems: %d (%d distinct)', problems.length, unique.length);

// Group by skill first: a single missing explanation shows up thousands of
// times, and the per-skill count is what says how much work is left.
const bySkill = new Map<string, number>();
for (const p of unique) {
  const skill = p.match(/^\[([a-z-]+)\]/)?.[1] ?? 'other';
  bySkill.set(skill, (bySkill.get(skill) ?? 0) + 1);
}
for (const [skill, n] of [...bySkill].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${skill.padEnd(24)} ${String(n).padStart(5)}`);
}

const show = Number(process.argv[2] ?? 12);
if (show > 0) {
  console.log('');
  for (const p of unique.slice(0, show)) console.log('  ' + p);
}

if (problems.length) process.exitCode = 1;
