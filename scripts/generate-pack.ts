/**
 * Generates additional practice items with Claude, validates them, and writes
 * them into src/engine/corpus/packs.ts.
 *
 *   npm run pack -- present-perfect 20
 *
 * This is the "AI packs" half of the design. It runs at authoring time, never
 * at runtime: the app itself makes no network calls, so practice works offline
 * and costs nothing per question. Generated items land in a file that is
 * reviewed in a diff like any other content change.
 *
 * Only skills whose items are hand-written are supported. The templated skills
 * (articles, prepositions, past simple...) already generate thousands of
 * combinations from the corpus and gain nothing from this.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { MODALS, PERFECT_VS_PAST, SAY_TELL, type AuthoredItem } from '../src/engine/corpus/authored';
import { PACKS } from '../src/engine/corpus/packs';
import { SKILL_BY_ID } from '../src/engine/skills';
import type { SkillId } from '../src/engine/types';

const PACK_FILE = 'src/engine/corpus/packs.ts';

/** The skills this script can extend, with their existing hand-written items. */
const SUPPORTED: Partial<Record<SkillId, AuthoredItem[]>> = {
  'present-perfect': PERFECT_VS_PAST,
  modals: MODALS,
  'say-tell': SAY_TELL,
};

const ItemSchema = z.object({
  text: z.string().describe('The sentence, with ␣ (U+2423) marking the single gap.'),
  correct: z.string().describe('The word or phrase that belongs in the gap.'),
  wrong: z.array(z.string()).describe('Exactly three plausible wrong answers.'),
  why: z.string().describe('One or two plain sentences explaining why the answer is right.'),
  level: z.number().describe('Difficulty: 1 beginner, 2 improving, 3 confident.'),
});

const ResponseSchema = z.object({ items: z.array(ItemSchema) });

function prompt(skill: SkillId, existing: AuthoredItem[], count: number): string {
  const meta = SKILL_BY_ID.get(skill)!;
  return [
    `Write ${count} new multiple-choice practice items for an English-learning app.`,
    '',
    `Topic: ${meta.title} — ${meta.blurb}`,
    '',
    'The learners are older adults whose first language is Ukrainian or Russian.',
    'Write British English. Use everyday situations from their lives: appointments,',
    'the chemist, grandchildren, neighbours, pensions, the weather, getting about.',
    'Avoid school and office scenarios. Avoid contractions in the sentences.',
    '',
    'Rules, all of which are hard requirements:',
    '- Each sentence contains exactly one gap, written as the character ␣ (U+2423).',
    '- Exactly one answer is correct. The context must make the other three genuinely wrong,',
    '  not merely less natural. If a distractor could be defended, replace it.',
    '- Distractors must be errors a Ukrainian or Russian speaker actually makes.',
    '- "why" explains the rule in plain language, naming the word in the sentence that',
    '  decides the answer. No grammatical jargon beyond what you explain.',
    '',
    'Here are existing items, for style. Do not repeat them or produce near-duplicates:',
    ...existing.slice(0, 8).map((i) => `- ${i.text} → ${i.correct}`),
  ].join('\n');
}

/**
 * Rejects anything that would produce a broken or unteachable question. The
 * model is good at this task but not perfect, and a bad item is worse than a
 * missing one -- it teaches the learner something false.
 */
export function validate(item: z.infer<typeof ItemSchema>, existing: AuthoredItem[]): string | null {
  if ((item.text.match(/␣/g) ?? []).length !== 1) return 'needs exactly one ␣ gap';
  if (!item.correct.trim()) return 'empty answer';
  if (item.wrong.length !== 3) return `has ${item.wrong.length} distractors, needs 3`;

  const all = [item.correct, ...item.wrong].map((s) => s.trim().toLowerCase());
  if (new Set(all).size !== all.length) return 'duplicate choices';
  if (all.some((s) => !s)) return 'empty distractor';
  if (![1, 2, 3].includes(item.level)) return `bad level ${item.level}`;
  if (!item.why.trim()) return 'no explanation';

  const normalised = item.text.replace(/\s+/g, ' ').trim().toLowerCase();
  if (existing.some((e) => e.text.replace(/\s+/g, ' ').trim().toLowerCase() === normalised)) {
    return 'duplicate of an existing item';
  }
  return null;
}

/** Rewrites packs.ts with the merged set, formatted so the diff stays readable. */
export function writePack(skill: SkillId, items: AuthoredItem[]): void {
  const merged: Partial<Record<SkillId, AuthoredItem[]>> = { ...PACKS, [skill]: items };
  const header = readFileSync(PACK_FILE, 'utf8').split('export const PACKS')[0];

  const body = Object.entries(merged)
    .map(([id, list]) => {
      const entries = (list as AuthoredItem[])
        .map(
          (i) =>
            `    {\n` +
            `      text: ${JSON.stringify(i.text)},\n` +
            `      correct: ${JSON.stringify(i.correct)},\n` +
            `      wrong: ${JSON.stringify(i.wrong)},\n` +
            `      why: ${JSON.stringify(i.why)},\n` +
            `      level: ${i.level},\n` +
            `    },`,
        )
        .join('\n');
      return `  ${JSON.stringify(id)}: [\n${entries}\n  ],`;
    })
    .join('\n');

  writeFileSync(PACK_FILE, `${header}export const PACKS: Partial<Record<SkillId, AuthoredItem[]>> = {\n${body}\n};\n`);
}

async function main() {
  const skill = process.argv[2] as SkillId | undefined;
  const count = Number(process.argv[3] ?? 15);

  if (!skill || !SUPPORTED[skill]) {
    console.error(`Usage: npm run pack -- <skill> [count]\nSupported: ${Object.keys(SUPPORTED).join(', ')}`);
    process.exit(1);
  }

  const existing = [...SUPPORTED[skill]!, ...(PACKS[skill] ?? [])];
  const client = new Anthropic();

  console.log(`Asking Claude for ${count} new "${skill}" items...`);

  const response = await client.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { format: zodOutputFormat(ResponseSchema) },
    system:
      'You write English-language teaching material. Accuracy matters more than volume: ' +
      'a question with two defensible answers actively harms the learner, so when in doubt, ' +
      'write fewer items and make each one unambiguous.',
    messages: [{ role: 'user', content: prompt(skill, existing, count) }],
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    console.error('Claude returned no parseable output.');
    process.exit(1);
  }

  const accepted: AuthoredItem[] = [];
  let rejected = 0;

  for (const item of parsed.items) {
    const problem = validate(item, [...existing, ...accepted]);
    if (problem) {
      console.log(`  rejected: ${item.text} — ${problem}`);
      rejected++;
      continue;
    }
    accepted.push({
      text: item.text,
      correct: item.correct,
      wrong: item.wrong,
      why: item.why,
      level: item.level as 1 | 2 | 3,
    });
  }

  console.log(`\nAccepted ${accepted.length}, rejected ${rejected}.`);
  if (!accepted.length) return;

  writePack(skill, [...(PACKS[skill] ?? []), ...accepted]);
  console.log(`Written to ${PACK_FILE}. Read the diff before committing — these are not reviewed.`);
  console.log('Then run: npm run audit');
}

// Exported for testing; main only runs when this file is the entry point.
const isEntryPoint = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop()!);

if (isEntryPoint) {
  main().catch(onError);
}

function onError(error: unknown) {
  if (error instanceof Anthropic.AuthenticationError) {
    console.error('No valid API credentials. Set ANTHROPIC_API_KEY, or run `ant auth login`.');
  } else if (error instanceof Anthropic.RateLimitError) {
    console.error('Rate limited. Try again shortly.');
  } else if (error instanceof Anthropic.APIError) {
    console.error(`API error ${error.status}: ${error.message}`);
  } else {
    console.error(error);
  }
  process.exit(1);
}
