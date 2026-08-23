import type { Level, SkillId } from '../engine/types';

/**
 * A Leitner box scheduler, kept per skill rather than per question.
 *
 * Classic spaced repetition tracks individual cards, which assumes a fixed
 * deck. Here questions are generated and mostly never repeat, so tracking
 * individual items would learn nothing. What is worth tracking is whether the
 * learner has the *rule*, which is what a skill represents.
 */

export interface SkillState {
  /** 0 = new or struggling, 5 = mastered. */
  box: number;
  /** ISO date of the last practice, for interval scheduling. */
  lastSeen: string | null;
  correct: number;
  wrong: number;
  /** Consecutive correct answers, which is what promotes a skill up a box. */
  streak: number;
}

export interface Progress {
  version: 1;
  level: Level;
  skills: Partial<Record<SkillId, SkillState>>;
  /** ISO dates on which at least one session was completed. */
  days: string[];
  totalAnswered: number;
  totalCorrect: number;
}

const KEY = 'esl.progress.v1';

/** Days to wait before a skill in each box is due again. */
const INTERVALS = [0, 1, 2, 4, 8, 16];

/** Consecutive correct answers needed to move up a box. */
const PROMOTE_AT = 3;

export function emptyState(): SkillState {
  return { box: 0, lastSeen: null, correct: 0, wrong: 0, streak: 0 };
}

export function emptyProgress(): Progress {
  return { version: 1, level: 1, skills: {}, days: [], totalAnswered: 0, totalCorrect: 0 };
}

export function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Progress;
    if (parsed?.version !== 1) return emptyProgress();
    return { ...emptyProgress(), ...parsed };
  } catch {
    // A corrupt or unavailable store must never block practice.
    return emptyProgress();
  }
}

export function save(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Private browsing, or a full quota. Practice still works for this session.
  }
}

export function record(progress: Progress, skill: SkillId, wasCorrect: boolean): Progress {
  const current = progress.skills[skill] ?? emptyState();
  const streak = wasCorrect ? current.streak + 1 : 0;

  let box = current.box;
  if (wasCorrect) {
    if (streak >= PROMOTE_AT) box = Math.min(INTERVALS.length - 1, box + 1);
  } else {
    // One wrong answer drops the skill two boxes. Being slightly too eager to
    // bring a skill back is much cheaper than letting a misunderstanding sit
    // untouched for sixteen days.
    box = Math.max(0, box - 2);
  }

  return {
    ...progress,
    totalAnswered: progress.totalAnswered + 1,
    totalCorrect: progress.totalCorrect + (wasCorrect ? 1 : 0),
    skills: {
      ...progress.skills,
      [skill]: {
        box,
        streak: wasCorrect && streak >= PROMOTE_AT ? 0 : streak,
        lastSeen: new Date().toISOString(),
        correct: current.correct + (wasCorrect ? 1 : 0),
        wrong: current.wrong + (wasCorrect ? 0 : 1),
      },
    },
  };
}

export function markDayComplete(progress: Progress): Progress {
  const today = new Date().toISOString().slice(0, 10);
  if (progress.days.includes(today)) return progress;
  return { ...progress, days: [...progress.days, today].slice(-400) };
}

function daysSince(iso: string | null): number {
  if (!iso) return Infinity;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Infinity;
  return (Date.now() - then) / 86_400_000;
}

/** True when a skill's interval has elapsed. */
export function isDue(state: SkillState | undefined): boolean {
  if (!state) return true;
  return daysSince(state.lastSeen) >= INTERVALS[state.box];
}

/**
 * Relative frequency for each skill in the next session.
 *
 * Weights are capped, because a learner who keeps getting articles wrong
 * should see more article questions -- but a session that is nothing but
 * articles is demoralising, and variety is itself part of what makes practice
 * stick.
 */
export function weights(
  progress: Progress,
  skills: SkillId[],
): Partial<Record<SkillId, number>> {
  const out: Partial<Record<SkillId, number>> = {};
  for (const skill of skills) {
    const state = progress.skills[skill];
    if (!state) {
      out[skill] = 3;
      continue;
    }
    const boxWeight = Math.max(1, 6 - state.box);
    const dueBoost = isDue(state) ? 2 : 0.5;
    out[skill] = Math.max(1, Math.min(8, Math.round(boxWeight * dueBoost)));
  }
  return out;
}

export interface Mastery {
  /** 0 to 1, across the skills the learner has practised. */
  fraction: number;
  mastered: SkillId[];
  needsWork: SkillId[];
}

export function mastery(progress: Progress, skills: SkillId[]): Mastery {
  const mastered: SkillId[] = [];
  const needsWork: SkillId[] = [];
  let boxSum = 0;

  for (const skill of skills) {
    const state = progress.skills[skill];
    const box = state?.box ?? 0;
    boxSum += box;
    if (box >= 4) mastered.push(skill);
    else if (state && state.wrong > 0 && box <= 1) needsWork.push(skill);
  }

  return {
    fraction: skills.length ? boxSum / (skills.length * 5) : 0,
    mastered,
    needsWork,
  };
}

/** Consecutive days of practice, counting back from today or yesterday. */
export function streakDays(progress: Progress): number {
  const set = new Set(progress.days);
  const day = new Date();
  // Starting from yesterday is deliberate: a learner who has not practised
  // yet today should still see the streak they have earned, not a zero.
  if (!set.has(day.toISOString().slice(0, 10))) day.setDate(day.getDate() - 1);

  let count = 0;
  while (set.has(day.toISOString().slice(0, 10))) {
    count++;
    day.setDate(day.getDate() - 1);
  }
  return count;
}
