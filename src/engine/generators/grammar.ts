import type { Generator, Level } from '../types';
import { UI } from '../../ui/strings';
import { atLevel, build } from '../build';
import { COUNTABLE, IRREGULAR_PLURALS, REGULAR_PLURALS, UNCOUNTABLE, regularPlural } from '../corpus/nouns';
import { ALL_VERBS, IRREGULAR_VERBS } from '../corpus/verbs';
import { ADJECTIVES, ARTICLE_FRAMES, SUBJECTS, VERB_CONTEXTS } from '../corpus/frames';
import { PLACE_EXPR, PLACE_FRAMES, PREP_HINTS, TIME_EXPR, TIME_FRAMES } from '../corpus/usage';
import { MODALS, PERFECT_VS_PAST, QUESTION_ITEMS, withPack } from '../corpus/authored';
import { PACKS } from '../corpus/packs';
import { authoredWhys } from './lexis';

/** What each quantity word is for. Every option gets one, right or wrong. */
const QUANTITY_WHY: Record<string, string> = {
  much: '«much» — только с неисчисляемыми: much water, much money.',
  many: '«many» — только с исчисляемыми во множественном числе: many books.',
  'a little': '«a little» — немного чего-то неисчисляемого: a little bread.',
  'a few': '«a few» — несколько исчисляемых предметов: a few chairs.',
  fewer: '«fewer» — «меньше» для исчисляемых, и это сравнение, а не количество.',
  less: '«less» — «меньше» для неисчисляемых, и это сравнение, а не количество.',
};

const ARTICLE_WHY: Record<string, string> = {
  a: '«a» ставится перед согласным звуком.',
  an: '«an» ставится перед гласным звуком.',
  the: '«the» — когда обоим собеседникам понятно, о каком именно предмете идёт речь.',
  '—': 'Без артикля — так бывает с множественным числом и с неисчисляемыми существительными в общем значении.',
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
    prompt: UI.prompts.article,
    text,
    correct,
    wrong: rng.shuffle(['a', 'an', 'the', '—'].filter((c) => c !== correct)),
    teaching: `Здесь ${correct === '—' ? 'артикль не нужен' : `нужен «${correct}»`}: ${frame.why}.`,
    whys: ARTICLE_WHY,
    labels: { '—': UI.noArticle },
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
    prompt: UI.prompts.preposition,
    text,
    correct: expr.prep,
    wrong: rng.shuffle(['in', 'on', 'at', '—'].filter((p) => p !== expr.prep)),
    teaching: `${expr.why.charAt(0).toUpperCase()}${expr.why.slice(1)}.`,
    whys: {
      ...PREP_HINTS,
      // The correct option gets the specific reason; the rest get the general
      // sense of that preposition, which is what the learner confused it with.
      [expr.prep]: `${expr.why.charAt(0).toUpperCase()}${expr.why.slice(1)}.`,
    },
    labels: { '—': UI.noPreposition },
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
    prompt: UI.prompts.pastSimple(verb.base),
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
      ? `Глагол «${verb.base}» неправильный: ${verb.base} — ${verb.past} — ${verb.participle}. Окончание «-ed» к нему не добавляется.`
      : `Глагол «${verb.base}» правильный, поэтому past simple — «${verb.past}».`,
    whys: {
      [verb.past]: irregular
        ? `«${verb.past}» — вторая форма неправильного глагола «${verb.base}». Её нужно запомнить.`
        : `«${verb.past}» — правильная форма: к «${verb.base}» добавляется «-ed».`,
      [verb.wrongEd]: `Такого слова нет. «${verb.base}» — неправильный глагол, и правило «-ed» на него не распространяется.`,
      [verb.participle]: `«${verb.participle}» — третья форма (причастие). Она требует перед собой «have» или «has».`,
      [`has ${verb.participle}`]: `Это present perfect. Но в предложении есть «${when}» — законченное время, поэтому нужен past simple.`,
      [verb.base]: `«${verb.base}» — форма настоящего времени, а предложение о прошлом («${when}»).`,
    },
  });
};

export const presentPerfect: Generator = (rng, level) => {
  const item = rng.pick(atLevel(withPack(PERFECT_VS_PAST, PACKS['present-perfect']), level));
  return build(rng, {
    skill: 'present-perfect',
    level,
    prompt: UI.prompts.verbForm,
    text: item.text,
    correct: item.correct,
    wrong: rng.shuffle(item.wrong),
    teaching: item.why,
    whys: authoredWhys(item),
  });
};

export const modals: Generator = (rng, level) => {
  const item = rng.pick(atLevel(withPack(MODALS, PACKS.modals), level));
  return build(rng, {
    skill: 'modals',
    level,
    prompt: UI.prompts.modal,
    text: item.text,
    correct: item.correct,
    wrong: rng.shuffle(item.wrong),
    teaching: item.why,
    whys: authoredWhys(item),
  });
};

export const countability: Generator = (rng, level) => {
  const uncountable = rng.next() < 0.5;

  if (uncountable) {
    const noun = rng.pick(atLevel(UNCOUNTABLE, level));
    const item = rng.pick(noun.quantity);
    const why =
      item.answer === 'much'
        ? `Слово «${noun.s}» в английском неисчисляемое, поэтому с ним употребляется «much», а не «many».`
        : `«a little» — это пара к «a few», но для неисчисляемых существительных.`;

    return build(rng, {
      skill: 'countability',
      level,
      prompt: UI.prompts.quantity,
      text: item.text,
      correct: item.answer,
      wrong: rng.shuffle(['many', 'a few', 'much', 'a little', 'fewer'].filter((w) => w !== item.answer)),
      teaching: `${why} Множественного числа у него тоже нет — слова «${regularPlural(noun.s)}» в английском не существует.`,
      whys: QUANTITY_WHY,
    });
  }

  // Concrete objects only: "too many kitchens in this room" is grammatical
  // and absurd, and the learner cannot tell which half is being tested.
  const noun = rng.pick(atLevel(COUNTABLE, level).filter((n) => n.p && n.kind === 'thing'));
  const [text, correct, why] = rng.pick([
    [`How ␣ ${noun.p} are there?`, 'many', `Слово «${noun.p}» исчисляемое, поэтому с ним употребляется «many».`],
    [`There are only ␣ ${noun.p} left.`, 'a few', `«a few» употребляется с исчисляемыми существительными во множественном числе.`],
    [`There are too ␣ ${noun.p} in this room.`, 'many', `«many» идёт с исчисляемыми во множественном числе; «much» здесь было бы ошибкой.`],
  ] as const);

  return build(rng, {
    skill: 'countability',
    level,
    prompt: UI.prompts.quantity,
    text,
    correct,
    wrong: rng.shuffle(['much', 'a little', 'many', 'a few', 'less'].filter((w) => w !== correct)),
    teaching: why,
    whys: QUANTITY_WHY,
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
    prompt: UI.prompts.plural(entry.s),
    text: `One ${entry.s}, two ␣.`,
    correct: entry.p,
    wrong: rng.shuffle([naive, bare, doubled, entry.s]),
    teaching:
      entry.p === entry.s
        ? `Слово «${entry.s}» во множественном числе не меняется: one ${entry.s}, two ${entry.p}.`
        : irregular
          ? `«${entry.s}» — исключение: множественное число «${entry.p}», а не «${naive}».`
          : `«${entry.s}» образует множественное число по общему правилу: «${entry.p}».`,
    whys: {
      [entry.p]:
        entry.p === entry.s
          ? `Верно: это слово во множественном числе не меняется.`
          : irregular
            ? `Верно. Это форма-исключение, её нужно запомнить.`
            : `Верно, по общему правилу.`,
      [naive]: `Так получится, если применить общее правило. Но «${entry.s}» ему не подчиняется.`,
      [bare]: `Простое «-s» здесь не подходит.`,
      [doubled]: `Окончание добавлено дважды: «${entry.p}» — это уже множественное число.`,
      [entry.s]: `Это форма единственного числа.`,
    },
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
      ? `«${adj.adj}» — исключение: ${adj.adj} — ${adj.comp} — ${adj.sup}.`
      : adj.kind === 'short'
        ? `Короткие прилагательные получают «-er» и «-est»: ${adj.adj} — ${adj.comp} — ${adj.sup}.`
        : `Длинные прилагательные образуют степени через «more» и «the most»: ${adj.adj} — ${adj.comp} — ${adj.sup}.`;

  return build(rng, {
    skill: 'comparatives',
    level,
    prompt: superlative ? UI.prompts.superlative(adj.adj) : UI.prompts.comparative(adj.adj),
    text,
    correct,
    wrong: rng.shuffle(wrong.filter((w) => w !== correct)),
    teaching: `${rule} Два способа сразу не используются: «more ${adj.comp}» — ошибка.`,
    whys: {
      [correct]: `Верно. ${rule}`,
      [`more ${adj.adj}`]: `«more» с коротким прилагательным не употребляется — нужно окончание «-er».`,
      [`${adj.adj}er`]: `К длинным прилагательным «-er» не добавляется — нужно «more».`,
      [adj.adj]: `Это обычная форма, без сравнения.`,
      [adj.sup]: `Это превосходная степень («самый»), а здесь сравниваются два предмета.`,
      [adj.comp]: `Это сравнительная степень, а нужна превосходная.`,
      [`the ${adj.adj}est`]: `У длинных прилагательных превосходная степень образуется через «the most».`,
      [`most ${adj.adj}`]: `Не хватает артикля: превосходная степень — «the most ...».`,
      [`the more ${adj.adj}`]: `«more» — это сравнение двух предметов, а не превосходная степень.`,
    },
  });
};

export const questionOrder: Generator = (rng, level) => {
  const item = rng.pick(atLevel(QUESTION_ITEMS, level));
  const aux = item.third ? 'does' : 'do';
  const tail = item.rest ? ` ${item.rest}` : '';

  const correct = `${item.wh} ${aux} ${item.subject} ${item.base}${tail}?`;
  // No auxiliary at all -- a direct transfer from Ukrainian and Russian.
  const noAux = `${item.wh} ${item.subject} ${item.third ? item.s : item.base}${tail}?`;
  // Tense marked twice, on the auxiliary and on the main verb.
  const doubleMarked = `${item.wh} ${aux} ${item.subject} ${item.s}${tail}?`;
  // Auxiliary after the subject instead of before it.
  const auxMisplaced = `${item.wh} ${item.subject} ${aux} ${item.base}${tail}?`;

  return build(rng, {
    skill: 'question-order',
    level,
    prompt: UI.prompts.question,
    text: '␣',
    correct,
    wrong: rng.shuffle([noAux, doubleMarked, auxMisplaced]),
    teaching: `В английском вопросе перед подлежащим обязательно стоит «do» или «does», а основной глагол остаётся в начальной форме: ${item.wh} + ${aux} + ${item.subject} + ${item.base}. Окончание «-s» уходит на «does» и на основном глаголе больше не появляется.`,
    whys: {
      [correct]: `Верно: ${item.wh} + ${aux} + подлежащее + начальная форма глагола.`,
      [noAux]: `Здесь нет вспомогательного «${aux}». В русском вопрос можно задать одной интонацией, в английском — нельзя.`,
      [doubleMarked]: `Окончание «-s» стоит дважды: оно уже есть в «${aux}», поэтому основной глагол остаётся «${item.base}».`,
      [auxMisplaced]: `«${aux}» стоит не на месте: вспомогательный глагол идёт перед подлежащим, а не после него.`,
    },
    speak: correct,
  });
};
