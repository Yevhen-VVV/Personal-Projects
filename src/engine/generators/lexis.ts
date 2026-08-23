import type { Generator } from '../types';
import { atLevel, build, solve } from '../build';
import { PHRASALS } from '../corpus/phrasals';
import { CONFUSABLES } from '../corpus/confusables';
import { VOCAB } from '../corpus/vocab';
import { DEPENDENT_PREPS, DO_COLLOCATIONS, MAKE_COLLOCATIONS, PREP_DISTRACTORS } from '../corpus/usage';
import { SAY_TELL, withPack } from '../corpus/authored';
import { PACKS } from '../corpus/packs';

export const phrasalVerbs: Generator = (rng, level) => {
  const pool = atLevel(PHRASALS, level);
  const target = rng.pick(pool);
  const others = pool.filter((p) => p.verb !== target.verb);

  // Two question shapes from the same entry: fill the gap, or explain the
  // meaning. The second is harder, so it appears more often at higher levels.
  const askMeaning = rng.next() < 0.3 + level * 0.1;

  if (askMeaning) {
    return build(rng, {
      skill: 'phrasal-verbs',
      level,
      prompt: `What does "${target.verb}" mean here?`,
      text: solve(target.example, target.verb),
      correct: target.meaning,
      wrong: rng.sample(others, 3).map((p) => p.meaning),
      teaching: `"${target.verb}" means: ${target.meaning}.`,
      speak: solve(target.example, target.verb),
    });
  }

  return build(rng, {
    skill: 'phrasal-verbs',
    level,
    prompt: 'Choose the phrasal verb that fits.',
    text: target.example,
    correct: target.verb,
    wrong: rng.sample(others, 3).map((p) => p.verb),
    teaching: `"${target.verb}" means: ${target.meaning}.`,
    whys: Object.fromEntries(others.map((p) => [p.verb, `"${p.verb}" means: ${p.meaning}.`])),
  });
};

export const confusables: Generator = (rng, level) => {
  const groups = CONFUSABLES.filter((g) => g.items.some((i) => i.level <= level));
  const group = rng.pick(groups.length ? groups : CONFUSABLES);
  const item = rng.pick(atLevel(group.items, level));
  const answerWord = group.words.find((w) => w.w === item.answer);
  const others = group.words.filter((w) => w.w !== item.answer);

  const teaching = [
    answerWord ? `"${item.answer}" — ${answerWord.gloss}.` : '',
    group.trap ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return build(rng, {
    skill: 'confusables',
    level,
    prompt: 'Choose the correct word.',
    text: item.text,
    correct: item.answer,
    wrong: rng.shuffle(others.map((w) => w.w)),
    // A two-word group stays a two-choice question on purpose: the whole
    // point is the contrast between exactly these two words.
    choiceCount: Math.min(4, group.words.length),
    teaching,
    whys: Object.fromEntries(group.words.map((w) => [w.w, `"${w.w}" — ${w.gloss}.`])),
  });
};

export const vocabulary: Generator = (rng, level) => {
  const pool = atLevel(VOCAB, level);
  const target = rng.pick(pool);
  // Same theme and level, so the question cannot be solved by topic alone.
  let siblings = pool.filter((v) => v.theme === target.theme && v.word !== target.word);
  if (siblings.length < 3) siblings = pool.filter((v) => v.word !== target.word);

  const shape = target.example && rng.next() < 0.5 ? 'cloze' : rng.next() < 0.5 ? 'word' : 'meaning';

  if (shape === 'cloze' && target.example) {
    return build(rng, {
      skill: 'vocabulary',
      level,
      prompt: 'Choose the word that fits the sentence.',
      text: target.example,
      correct: target.word,
      wrong: rng.sample(siblings, 3).map((v) => v.word),
      teaching: `"${target.word}" — ${target.def}.`,
      whys: Object.fromEntries(siblings.map((v) => [v.word, `"${v.word}" means ${v.def}.`])),
    });
  }

  if (shape === 'meaning') {
    return build(rng, {
      skill: 'vocabulary',
      level,
      prompt: `What does "${target.word}" mean?`,
      text: target.example ? solve(target.example, target.word) : `Think about the word "${target.word}".`,
      correct: target.def,
      wrong: rng.sample(siblings, 3).map((v) => v.def),
      teaching: `"${target.word}" — ${target.def}.`,
      speak: target.word,
    });
  }

  return build(rng, {
    skill: 'vocabulary',
    level,
    prompt: 'Which word matches this meaning?',
    text: target.def,
    correct: target.word,
    wrong: rng.sample(siblings, 3).map((v) => v.word),
    teaching: `"${target.word}" — ${target.def}.`,
    speak: target.word,
  });
};

export const makeDo: Generator = (rng, level) => {
  const useMake = rng.next() < 0.5;
  const entry = useMake
    ? rng.pick(atLevel(MAKE_COLLOCATIONS, level))
    : rng.pick(atLevel(DO_COLLOCATIONS, level));
  const correct = useMake ? 'make' : 'do';

  return build(rng, {
    skill: 'make-do',
    level,
    prompt: 'Choose "make" or "do".',
    text: `I need to ␣ ${entry.obj} before lunch.`,
    correct,
    wrong: [useMake ? 'do' : 'make', 'take'],
    choiceCount: 3,
    teaching: useMake
      ? `"${correct} ${entry.obj}" is fixed. In general, "make" is for creating or producing something.`
      : `"${correct} ${entry.obj}" is fixed. In general, "do" is for tasks, jobs and activities.`,
  });
};

export const sayTell: Generator = (rng, level) => {
  const item = rng.pick(atLevel(withPack(SAY_TELL, PACKS['say-tell']), level));
  return build(rng, {
    skill: 'say-tell',
    level,
    prompt: 'Choose the correct verb.',
    text: item.text,
    correct: item.correct,
    wrong: rng.shuffle(item.wrong),
    teaching: item.why,
  });
};

export const dependentPrepositions: Generator = (rng, level) => {
  const entry = rng.pick(atLevel(DEPENDENT_PREPS, level));
  return build(rng, {
    skill: 'dependent-prepositions',
    level,
    prompt: 'Choose the preposition that goes with this word.',
    text: entry.example,
    correct: entry.prep,
    wrong: rng.shuffle(PREP_DISTRACTORS.filter((p) => p !== entry.prep)),
    teaching: `"${entry.phrase}" always takes "${entry.prep}". There is no rule behind these pairs — each one is learned as a unit.`,
  });
};
