import { createRng, daySeed } from './rng';
import { DAILY_COUNT, PHRASES, type Phrase } from './corpus/survival';
import type { Level } from './types';

/**
 * The phrases for today's drill.
 *
 * Seeded by the date, so the set is the same all day -- coming back in the
 * afternoon continues the morning's drill rather than shuffling into a fresh
 * one -- and different tomorrow.
 *
 * At least two are always from the "when you have not understood" group. Those
 * are the phrases that keep a real conversation alive, so they are worth
 * drilling more often than the rest.
 */
export function dailyPhrases(level: Level, date = new Date()): Phrase[] {
  const rng = createRng(daySeed(date));
  const pool = PHRASES.filter((p) => p.level <= level);
  const usable = pool.length >= DAILY_COUNT ? pool : PHRASES;

  const rescue = usable.filter((p) => p.group === 'not-understood');
  const rest = usable.filter((p) => p.group !== 'not-understood');

  const picked = [
    ...rng.sample(rescue, Math.min(2, rescue.length)),
    ...rng.sample(rest, DAILY_COUNT - Math.min(2, rescue.length)),
  ].slice(0, DAILY_COUNT);

  return rng.shuffle(picked);
}
