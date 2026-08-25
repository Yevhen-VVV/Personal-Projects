/**
 * Comparing what she said against what the turn was looking for.
 *
 * Deliberately generous. Speech recognition mishears, and a learner who says
 * the right thing in unexpected words has still said the right thing. The cost
 * of wrongly accepting an answer is nearly zero; the cost of wrongly rejecting
 * one is that she stops trusting the app and stops speaking.
 */

/** Alternatives; a turn passes when every keyword of any one alternative is present. */
export type Expectation = string[][];

const CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, 'i am'],
  [/\bit's\b/g, 'it is'],
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bcan't\b/g, 'can not'],
  [/\bcannot\b/g, 'can not'],
  [/\bi've\b/g, 'i have'],
  [/\bi'd\b/g, 'i would'],
  [/\bi'll\b/g, 'i will'],
  [/\bthat's\b/g, 'that is'],
  [/\bwhat's\b/g, 'what is'],
  [/\bthere's\b/g, 'there is'],
  [/\bcould you\b/g, 'could you'],
];

/** Numbers come back from recognition as digits about half the time. */
const NUMBERS: Record<string, string> = {
  '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
  '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten',
};

export function normalise(text: string): string {
  let out = ` ${text.toLowerCase()} `;
  for (const [from, to] of CONTRACTIONS) out = out.replace(from, to);
  out = out.replace(/[^\p{L}\p{N}\s']/gu, ' ');
  out = out.replace(/\b\d+\b/g, (n) => NUMBERS[n] ?? n);
  return out.replace(/\s+/g, ' ').trim();
}

function hasKeyword(said: string, keyword: string): boolean {
  const needle = normalise(keyword);
  if (!needle) return true;
  // Whole-word containment, so "pay" does not match inside "paying" only by
  // accident -- but a multi-word keyword still matches as a phrase.
  return new RegExp(`(^| )${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |$)`).test(said);
}

export interface MatchResult {
  /** True when the turn is satisfied. */
  ok: boolean;
  /** 0..1 -- how much of the closest alternative was present. */
  score: number;
  /** Keywords from the closest alternative that were missing. */
  missing: string[];
}

export function match(saidRaw: string, expect: Expectation): MatchResult {
  const said = normalise(saidRaw);
  if (!said) return { ok: false, score: 0, missing: expect[0] ?? [] };
  if (!expect.length) return { ok: true, score: 1, missing: [] };

  let best: MatchResult = { ok: false, score: 0, missing: expect[0] };

  for (const alternative of expect) {
    const missing = alternative.filter((k) => !hasKeyword(said, k));
    const score = alternative.length ? 1 - missing.length / alternative.length : 1;
    if (score > best.score) best = { ok: missing.length === 0, score, missing };
  }

  return best;
}

/**
 * How close two phrases are, 0..1, by shared words. Used by the shadowing
 * drill, where she is repeating a known phrase rather than composing one, so
 * word overlap is a fair measure of how well it came out.
 */
export function similarity(saidRaw: string, targetRaw: string): number {
  const said = normalise(saidRaw).split(' ').filter(Boolean);
  const target = normalise(targetRaw).split(' ').filter(Boolean);
  if (!target.length) return 0;

  const pool = [...said];
  let hits = 0;
  for (const word of target) {
    const at = pool.indexOf(word);
    if (at >= 0) {
      hits++;
      pool.splice(at, 1);
    }
  }
  return hits / target.length;
}
