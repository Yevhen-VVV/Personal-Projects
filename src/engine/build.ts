import type { Choice, Level, Question, Rng, SkillId } from './types';
import { hash } from './rng';

export interface BuildInput {
  skill: SkillId;
  level: Level;
  prompt: string;
  text: string;
  correct: string;
  wrong: string[];
  teaching: string;
  /** Optional per-choice explanations, keyed by choice text. */
  whys?: Record<string, string>;
  /** Optional per-choice display labels, keyed by choice text. */
  labels?: Record<string, string>;
  speak?: string;
  speakPrompt?: string;
  /**
   * How many choices to offer. Defaults to 4. Minimal pairs -- borrow/lend,
   * make/do -- are set lower on purpose: padding them with a third unrelated
   * word would make the question easier, not harder, because the learner
   * could eliminate the filler without knowing the distinction being taught.
   */
  choiceCount?: number;
}

const DEFAULT_CHOICE_COUNT = 4;

/**
 * Assembles a question and enforces the invariants every generator depends on:
 * exactly one correct answer, no duplicate choices, and a stable id.
 *
 * Returns null rather than throwing when a generator produces too few distinct
 * distractors -- that happens legitimately when a small corpus slice is
 * filtered by level, and the caller simply retries with a different draw.
 */
export function build(rng: Rng, input: BuildInput): Question | null {
  const count = input.choiceCount ?? DEFAULT_CHOICE_COUNT;
  const seen = new Set([norm(input.correct)]);
  const distractors: string[] = [];

  for (const w of input.wrong) {
    const key = norm(w);
    if (seen.has(key)) continue;
    seen.add(key);
    distractors.push(w);
    if (distractors.length === count - 1) break;
  }

  if (distractors.length < count - 1) return null;

  const choices: Choice[] = rng.shuffle([
    {
      text: input.correct,
      correct: true,
      why: input.whys?.[input.correct],
      label: input.labels?.[input.correct],
    },
    ...distractors.map((text) => ({
      text,
      correct: false,
      why: input.whys?.[text],
      label: input.labels?.[text],
    })),
  ]);

  return {
    id: hash(`${input.skill}|${input.text}|${input.correct}`),
    skill: input.skill,
    level: input.level,
    prompt: input.prompt,
    text: input.text,
    choices,
    teaching: input.teaching,
    speak: input.speak ?? solve(input.text, input.correct),
    speakPrompt: input.speakPrompt ?? blanked(input.text),
  };
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * True when the gap opens a sentence, so the answer needs a capital letter.
 * Second-mention article items put the gap right after a full stop, and
 * "the apple has gone" would quietly teach bad punctuation.
 */
export function gapStartsSentence(before: string): boolean {
  return before.trim() === '' || /[.!?]\s*$/.test(before);
}

/** Capitalises the first letter, leaving the rest alone. */
export function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * The sentence as it should be read BEFORE answering: the gap spoken as the
 * word "blank" rather than removed. Removing it produces "I left my glasses
 * the kitchen", which sounds like broken English; filling it in gives the
 * answer away.
 *
 * "blank" is English because the sentence is English and one voice reads it.
 */
export function blanked(text: string): string {
  if (!text.includes('␣')) return text;
  const [before = '', after = ''] = text.split('␣');
  const word = gapStartsSentence(before) ? 'Blank' : 'blank';
  return `${before}${word}${after}`.replace(/\s{2,}/g, ' ').trim();
}

/** Replaces the gap with the correct answer, for text-to-speech playback. */
export function solve(text: string, answer: string): string {
  // Some question shapes show a complete sentence and ask about it, rather
  // than hiding a word. There is nothing to substitute into those.
  if (!text.includes('␣')) return text;

  const [before = '', after = ''] = text.split('␣');
  const raw = answer === '—' ? '' : answer;
  const filled = raw && gapStartsSentence(before) ? capitalise(raw) : raw;
  return `${before}${filled}${after}`
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,?!])/g, '$1')
    .trim();
}

/** Picks the corpus entries at or below the requested level. */
export function atLevel<T extends { level: number }>(items: readonly T[], level: Level): T[] {
  const pool = items.filter((i) => i.level <= level);
  return pool.length ? pool : items.slice();
}
