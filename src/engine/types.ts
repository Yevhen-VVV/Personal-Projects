/**
 * Core types for the question engine.
 *
 * A Skill is a teachable unit (e.g. "articles"). Every generated Question
 * carries its skill id so the spaced-repetition scheduler can track mastery
 * per skill rather than per individual question -- questions are generated
 * combinatorially and mostly never repeat, so per-item tracking is useless.
 */

export type SkillId =
  | 'articles'
  | 'prepositions-time'
  | 'prepositions-place'
  | 'past-simple'
  | 'present-perfect'
  | 'countability'
  | 'question-order'
  | 'phrasal-verbs'
  | 'confusables'
  | 'vocabulary'
  | 'plurals'
  | 'comparatives'
  | 'modals'
  | 'make-do'
  | 'say-tell'
  | 'dependent-prepositions';

export type Category = 'grammar' | 'vocabulary' | 'usage';

export type Level = 1 | 2 | 3;

export interface Choice {
  /**
   * The answer as it is substituted into the sentence. For "no word needed"
   * answers this is an em dash, which is why `label` exists.
   */
  text: string;
  /**
   * What the learner reads on the button, when that differs from `text`.
   * "—" alone is unhelpful; "— no article needed" says what is being chosen.
   */
  label?: string;
  /** True for exactly one choice per question. */
  correct: boolean;
  /**
   * Shown after answering, explaining why this specific choice is right or
   * wrong. This is where most of the teaching actually happens.
   */
  why?: string;
}

export interface Question {
  /**
   * Stable hash of the question's semantic content. Used to avoid showing the
   * same generated item twice in a session, and to seed nothing else.
   */
  id: string;
  skill: SkillId;
  level: Level;
  /** The instruction line, e.g. "Choose the correct word." */
  prompt: string;
  /**
   * The sentence or phrase under test. A gap is marked with the BLANK token
   * so the UI can render it as a styled blank rather than raw underscores.
   */
  text: string;
  choices: Choice[];
  /** Shown after answering, regardless of which choice was picked. */
  teaching: string;
  /**
   * Read aloud AFTER answering: the sentence with the answer in place.
   * Defaults to the solved text.
   */
  speak?: string;
  /**
   * Read aloud BEFORE answering: the sentence with the gap spoken as the word
   * "blank", never filled in. These must stay separate -- reading the solved
   * sentence up front announces the answer and makes the question pointless.
   * An empty string means there is nothing useful to read yet.
   */
  speakPrompt?: string;
}

export interface Skill {
  id: SkillId;
  title: string;
  category: Category;
  /** One line shown on the skill picker. */
  blurb: string;
  /**
   * Why this skill specifically trips up Ukrainian and Russian speakers.
   * Shown in the lesson before the quiz starts.
   */
  lesson: Lesson;
}

export interface Lesson {
  /** Plain-language explanation. Short paragraphs, no jargon. */
  paragraphs: string[];
  /** Worked examples: correct sentence, and the mistake it replaces. */
  examples: { good: string; bad?: string; note?: string }[];
}

/** Placeholder token marking the gap in Question.text. */
export const BLANK = '␣';

/** A generator produces one question from a seeded random source. */
export type Generator = (rng: Rng, level: Level) => Question | null;

export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [0, n). */
  int(n: number): number;
  /** Uniform pick. */
  pick<T>(items: readonly T[]): T;
  /** k distinct uniform picks; returns fewer than k if the pool is small. */
  sample<T>(items: readonly T[], k: number): T[];
  /** In-place-safe shuffled copy. */
  shuffle<T>(items: readonly T[]): T[];
}
