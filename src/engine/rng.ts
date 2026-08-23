import type { Rng } from './types';

/**
 * Deterministic PRNG (mulberry32). We seed per-session so a session can be
 * replayed exactly -- useful for debugging a bad question a learner reports,
 * and it keeps question order stable if the app is reloaded mid-quiz.
 */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;

  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (n: number) => Math.floor(next() * n);

  const shuffle = <T,>(items: readonly T[]): T[] => {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  return {
    next,
    int,
    pick: <T,>(items: readonly T[]) => items[int(items.length)],
    sample: <T,>(items: readonly T[], k: number) => shuffle(items).slice(0, k),
    shuffle,
  };
}

/** Stable 32-bit hash of a string, used for question ids. */
export function hash(input: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** A seed derived from the current day, so "today's practice" is consistent. */
export function daySeed(date = new Date()): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}
