import type { Generator, Level, Question, Rng, SkillId } from './types';
import { createRng } from './rng';
import * as grammar from './generators/grammar';
import * as lexis from './generators/lexis';

export * from './types';
export { SKILLS, SKILL_BY_ID } from './skills';
export { createRng, daySeed } from './rng';
export { solve, capitalise, gapStartsSentence } from './build';

const GENERATORS: Record<SkillId, Generator> = {
  articles: grammar.articles,
  'prepositions-time': grammar.prepositionsTime,
  'prepositions-place': grammar.prepositionsPlace,
  'past-simple': grammar.pastSimple,
  'present-perfect': grammar.presentPerfect,
  countability: grammar.countability,
  'question-order': grammar.questionOrder,
  plurals: grammar.plurals,
  comparatives: grammar.comparatives,
  modals: grammar.modals,
  'phrasal-verbs': lexis.phrasalVerbs,
  confusables: lexis.confusables,
  vocabulary: lexis.vocabulary,
  'make-do': lexis.makeDo,
  'say-tell': lexis.sayTell,
  'dependent-prepositions': lexis.dependentPrepositions,
};

/**
 * How many times to redraw before accepting a repeat.
 *
 * A generator returns null when a level filter left it too few distractors,
 * and returns a duplicate when the learner has already seen that exact
 * combination this session. Both are cheap to retry, and for the templated
 * skills the space is large enough that a retry almost always succeeds. For
 * the small authored skills it eventually gives up and repeats, which is the
 * correct behaviour -- a repeat beats an empty screen.
 */
const MAX_ATTEMPTS = 40;

export function generateQuestion(
  skill: SkillId,
  level: Level,
  rng: Rng,
  seen: Set<string> = new Set(),
): Question | null {
  const generator = GENERATORS[skill];
  if (!generator) return null;

  let fallback: Question | null = null;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const q = generator(rng, level);
    if (!q) continue;
    fallback ??= q;
    if (!seen.has(q.id)) {
      seen.add(q.id);
      return q;
    }
  }

  return fallback;
}

export interface SessionOptions {
  skills: SkillId[];
  level: Level;
  count: number;
  seed: number;
  /**
   * Relative weight per skill, from the review scheduler. Skills the learner
   * is struggling with come up more often; mastered skills come up rarely.
   */
  weights?: Partial<Record<SkillId, number>>;
}

export function generateSession(options: SessionOptions): Question[] {
  const { skills, level, count, seed, weights } = options;
  if (!skills.length) return [];

  const rng = createRng(seed);
  const seen = new Set<string>();
  const questions: Question[] = [];

  const order = weightedOrder(rng, skills, weights, count);

  for (const skill of order) {
    const q = generateQuestion(skill, level, rng, seen);
    if (q) questions.push(q);
  }

  return questions;
}

/**
 * Builds the skill sequence for a session. Two constraints matter to the
 * learner: struggling skills should appear more often, and the same skill
 * should not appear three times in a row, which feels like being nagged.
 */
function weightedOrder(
  rng: Rng,
  skills: SkillId[],
  weights: Partial<Record<SkillId, number>> | undefined,
  count: number,
): SkillId[] {
  const pool: SkillId[] = [];
  for (const skill of skills) {
    const weight = Math.max(1, Math.round(weights?.[skill] ?? 1));
    for (let i = 0; i < weight; i++) pool.push(skill);
  }

  const order: SkillId[] = [];
  for (let i = 0; i < count; i++) {
    let choice = rng.pick(pool);
    if (skills.length > 1 && order.length >= 2) {
      const [a, b] = [order[order.length - 1], order[order.length - 2]];
      let guard = 0;
      while (choice === a && choice === b && guard++ < 8) choice = rng.pick(pool);
    }
    order.push(choice);
  }
  return order;
}

/** Every skill the app can generate questions for. */
export const ALL_SKILL_IDS = Object.keys(GENERATORS) as SkillId[];
