import type { Generator, Level } from '../types';
import { atLevel, build } from '../build';
import { COUNTABLE, IRREGULAR_PLURALS, REGULAR_PLURALS, UNCOUNTABLE, regularPlural } from '../corpus/nouns';
import { ALL_VERBS, IRREGULAR_VERBS } from '../corpus/verbs';
import { ADJECTIVES, ARTICLE_FRAMES, SUBJECTS, VERB_CONTEXTS } from '../corpus/frames';
import { PLACE_EXPR, PLACE_FRAMES, TIME_EXPR, TIME_FRAMES } from '../corpus/usage';
import { MODALS, PERFECT_VS_PAST, QUESTION_ITEMS, withPack } from '../corpus/authored';
import { PACKS } from '../corpus/packs';

const ARTICLE_WHY: Record<string, string> = {
  a: '"a" goes before a consonant sound.',
  an: '"an" goes before a vowel sound.',
  the: '"the" is for when both speakers know which one is meant.',
  '—': 'No article at all — correct for plurals and uncountable nouns in general statements.',
};

export const articles: Generator = (rng, level) => {
  const frame = rng.pick(atLevel(ARTICLE_FRAMES, level));
  const fits = (n: { kind: string }) => !frame.accepts || frame.accepts.includes(n.kind as never);

  let text: string;
  let correct: string;

  if (frame.rule === 'zero-uncountable') {
    const noun = rng.pick(atLevel(UNCOUNTABLE, level));
    text = noun.article;
    correct = '—';
  } else if (frame.rule === 'zero-plural') {
    const pool = atLevel(COUNTABLE, level).filter((n) => n.p && fits(n));
    if (!pool.length) return null;
    const noun = rng.pick(pool);
    text = frame.frame.replace(/\{P\}/g, noun.p!);
    correct = '—';
  } else {
    const pool = atLevel(COUNTABLE, level).filter(fits);
    if (!pool.length) return null;
    const noun = rng.pick(pool);
    const indefinite = noun.vowelSound ? 'an' : 'a';
    text = frame.frame.replace(/\{N\}/g, noun.s).replace(/\{A\}/g, indefinite);
    correct = frame.rule === 'definite' ? 'the' : indefinite;
  }

  return build(rng, {
    skill: 'articles',
    level,
    prompt: 'Choose the correct article.',
    text,
    correct,
    wrong: rng.shuffle(['a', 'an', 'the', '—'].filter((c) => c !== correct)),
    teaching: `Here it is ${correct === '—' ? 'no article at all' : `"${correct}"`}, because this is the ${frame.why}.`,
    whys: ARTICLE_WHY,
    labels: { '—': '— no article needed' },
  });
};

function prepositionQuestion(
  rng: Parameters<Generator>[0],
  level: Level,
  skill: 'prepositions-time' | 'prepositions-place',
) {
  const isTime = skill === 'prepositions-time';
  const expr = rng.pick(atLevel(isTime ? TIME_EXPR : PLACE_EXPR, level));

  let text: string;
  if (expr.frame) {
    text = expr.frame;
  } else if (isTime) {
    const kind = expr.when && expr.when !== 'any' ? expr.when : rng.pick(['past', 'future', 'habit'] as const);
    text = rng.pick(TIME_FRAMES[kind]).replace('{T}', expr.expr);
  } else {
    text = rng.pick(PLACE_FRAMES).replace('{X}', expr.expr);
  }

  return build(rng, {
    skill,
    level,
    prompt: 'Choose the correct preposition.',
    text,
    correct: expr.prep,
    wrong: rng.shuffle(['in', 'on', 'at', '—'].filter((p) => p !== expr.prep)),
    teaching: `${expr.why.charAt(0).toUpperCase()}${expr.why.slice(1)}.`,
    whys: { '—': 'No preposition at all.' },
    labels: { '—': '— no preposition needed' },
  });
}

export const prepositionsTime: Generator = (rng, level) =>
  prepositionQuestion(rng, level, 'prepositions-time');

export const prepositionsPlace: Generator = (rng, level) =>
  prepositionQuestion(rng, level, 'prepositions-place');

export const pastSimple: Generator = (rng, level) => {
  const pool = atLevel(ALL_VERBS, level).filter((v) => VERB_CONTEXTS[v.base]);
  const verb = rng.pick(pool);
  const subject = rng.pick(atLevel(SUBJECTS, level));
  const context = rng.pick(VERB_CONTEXTS[verb.base]);
  const when = rng.pick(['yesterday', 'last week', 'on Monday', 'two days ago', 'last night']);
  const irregular = IRREGULAR_VERBS.some((v) => v.base === verb.base);

  return build(rng, {
    skill: 'past-simple',
    level,
    prompt: `Put "${verb.base}" into the past simple.`,
    text: `${subject.text} ␣ ${context} ${when}.`,
    correct: verb.past,
    // The over-regularised form and the past participle are the two errors
    // learners actually make, so they earn their place as distractors.
    wrong: rng.shuffle([
      verb.wrongEd,
      verb.participle === verb.past ? `has ${verb.participle}` : verb.participle,
      verb.base,
    ]),
    teaching: irregular
      ? `"${verb.base}" is irregular: ${verb.base} — ${verb.past} — ${verb.participle}. It never takes "-ed".`
      : `"${verb.base}" is regular, so the past simple is "${verb.past}".`,
    whys: {
      [verb.wrongEd]: `"${verb.wrongEd}" is not a word. ${verb.base} is irregular, so the "-ed" rule does not apply.`,
      [verb.participle]: `"${verb.participle}" is the past participle. It needs "have" or "has" in front of it.`,
      [verb.base]: `"${verb.base}" is the present form, but this sentence is about ${when}.`,
    },
  });
};

export const presentPerfect: Generator = (rng, level) => {
  const item = rng.pick(atLevel(withPack(PERFECT_VS_PAST, PACKS['present-perfect']), level));
  return build(rng, {
    skill: 'present-perfect',
    level,
    prompt: 'Choose the correct form of the verb.',
    text: item.text,
    correct: item.correct,
    wrong: rng.shuffle(item.wrong),
    teaching: item.why,
  });
};

export const modals: Generator = (rng, level) => {
  const item = rng.pick(atLevel(withPack(MODALS, PACKS.modals), level));
  return build(rng, {
    skill: 'modals',
    level,
    prompt: 'Choose the correct modal verb.',
    text: item.text,
    correct: item.correct,
    wrong: rng.shuffle(item.wrong),
    teaching: item.why,
  });
};

export const countability: Generator = (rng, level) => {
  const uncountable = rng.next() < 0.5;

  if (uncountable) {
    const noun = rng.pick(atLevel(UNCOUNTABLE, level));
    const item = rng.pick(noun.quantity);
    const why =
      item.answer === 'much'
        ? `"${noun.s}" is uncountable in English, so it takes "much", never "many".`
        : `"a little" is the uncountable partner of "a few".`;

    return build(rng, {
      skill: 'countability',
      level,
      prompt: 'Choose the correct quantity word.',
      text: item.text,
      correct: item.answer,
      wrong: rng.shuffle(['many', 'a few', 'much', 'a little', 'fewer'].filter((w) => w !== item.answer)),
      teaching: `${why} There is also no plural — "${regularPlural(noun.s)}" is not a word in English.`,
    });
  }

  // Concrete objects only: "too many kitchens in this room" is grammatical
  // and absurd, and the learner cannot tell which half is being tested.
  const noun = rng.pick(atLevel(COUNTABLE, level).filter((n) => n.p && n.kind === 'thing'));
  const [text, correct, why] = rng.pick([
    [`How ␣ ${noun.p} are there?`, 'many', `"${noun.p}" is countable, so it takes "many".`],
    [`There are only ␣ ${noun.p} left.`, 'a few', `"a few" is used with countable plural nouns.`],
    [`There are too ␣ ${noun.p} in this room.`, 'many', `"many" goes with countable plurals; "much" would be wrong.`],
  ] as const);

  return build(rng, {
    skill: 'countability',
    level,
    prompt: 'Choose the correct quantity word.',
    text,
    correct,
    wrong: rng.shuffle(['much', 'a little', 'many', 'a few', 'less'].filter((w) => w !== correct)),
    teaching: why,
  });
};

export const plurals: Generator = (rng, level) => {
  const irregular = rng.next() < 0.65;
  const entry = irregular
    ? rng.pick(atLevel(IRREGULAR_PLURALS, level))
    : rng.pick(atLevel(REGULAR_PLURALS, level));

  // Applying the regular rule is precisely the error this question tests for,
  // so the regular form is the distractor -- and for a regular noun it is the
  // right answer, in which case build() drops it as a duplicate.
  const naive = regularPlural(entry.s);
  const bare = `${entry.s}s`;
  const doubled = `${entry.p}s`;

  return build(rng, {
    skill: 'plurals',
    level,
    prompt: `What is the plural of "${entry.s}"?`,
    text: `One ${entry.s}, two ␣.`,
    correct: entry.p,
    wrong: rng.shuffle([naive, bare, doubled, entry.s]),
    teaching:
      entry.p === entry.s
        ? `"${entry.s}" does not change in the plural — one ${entry.s}, two ${entry.p}.`
        : irregular
          ? `"${entry.s}" is irregular: the plural is "${entry.p}", not "${naive}".`
          : `"${entry.s}" takes the regular plural "${entry.p}".`,
  });
};

export const comparatives: Generator = (rng, level) => {
  const adj = rng.pick(atLevel(ADJECTIVES, level));
  const superlative = rng.next() < 0.35;
  const text = superlative ? adj.supFrame : adj.frame;
  const correct = superlative ? adj.sup : adj.comp;

  const wrong = superlative
    ? [`the ${adj.adj}est`, `most ${adj.adj}`, `the more ${adj.adj}`, adj.comp]
    : [`more ${adj.adj}`, `${adj.adj}er`, `${adj.adj}`, adj.sup];

  const rule =
    adj.kind === 'irregular'
      ? `"${adj.adj}" is irregular: ${adj.adj} — ${adj.comp} — ${adj.sup}.`
      : adj.kind === 'short'
        ? `Short adjectives add "-er" and "-est": ${adj.adj} — ${adj.comp} — ${adj.sup}.`
        : `Long adjectives use "more" and "the most": ${adj.adj} — ${adj.comp} — ${adj.sup}.`;

  return build(rng, {
    skill: 'comparatives',
    level,
    prompt: superlative
      ? `Use the superlative of "${adj.adj}".`
      : `Use the comparative of "${adj.adj}".`,
    text,
    correct,
    wrong: rng.shuffle(wrong.filter((w) => w !== correct)),
    teaching: `${rule} Never use both methods at once — "more ${adj.comp}" is wrong.`,
  });
};

export const questionOrder: Generator = (rng, level) => {
  const item = rng.pick(atLevel(QUESTION_ITEMS, level));
  const aux = item.third ? 'does' : 'do';
  const tail = item.rest ? ` ${item.rest}` : '';

  const correct = `${item.wh} ${aux} ${item.subject} ${item.base}${tail}?`;

  return build(rng, {
    skill: 'question-order',
    level,
    prompt: 'Which question is correct English?',
    text: '␣',
    correct,
    wrong: rng.shuffle([
      // No auxiliary at all -- direct transfer from Ukrainian and Russian.
      `${item.wh} ${item.subject} ${item.third ? item.s : item.base}${tail}?`,
      // Tense marked twice.
      `${item.wh} ${aux} ${item.subject} ${item.s}${tail}?`,
      // Auxiliary after the subject instead of before it.
      `${item.wh} ${item.subject} ${aux} ${item.base}${tail}?`,
    ]),
    teaching: `English questions need "do" or "does" before the subject, and the main verb stays in its plain form: ${item.wh} + ${aux} + ${item.subject} + ${item.base}. The "-s" moves onto "does", so it never appears on the main verb as well.`,
    speak: correct,
  });
};
