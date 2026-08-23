import type { Generator } from '../types';
import { atLevel, build, solve } from '../build';
import { PHRASALS } from '../corpus/phrasals';
import { CONFUSABLES } from '../corpus/confusables';
import { VOCAB } from '../corpus/vocab';
import {
  DEPENDENT_PREPS,
  DO_COLLOCATIONS,
  MAKE_COLLOCATIONS,
  PREP_DISTRACTORS,
  PREP_HINTS,
} from '../corpus/usage';
import { SAY_TELL, withPack } from '../corpus/authored';
import { PACKS } from '../corpus/packs';
import { UI } from '../../ui/strings';

export const phrasalVerbs: Generator = (rng, level) => {
  const pool = atLevel(PHRASALS, level);
  const target = rng.pick(pool);
  const others = pool.filter((p) => p.verb !== target.verb);

  // Two question shapes from the same entry: fill the gap, or explain the
  // meaning. The second is harder, so it appears more often at higher levels.
  const askMeaning = rng.next() < 0.3 + level * 0.1;

  if (askMeaning) {
    const chosen = rng.sample(others, 3);
    return build(rng, {
      skill: 'phrasal-verbs',
      level,
      prompt: UI.prompts.phrasalMeaning(target.verb),
      text: solve(target.example, target.verb),
      correct: target.meaning,
      wrong: chosen.map((p) => p.meaning),
      teaching: `«${target.verb}» означает: ${target.ru}.`,
      whys: {
        [target.meaning]: `Верно. «${target.verb}» — ${target.ru}.`,
        // Each wrong meaning belongs to a real phrasal verb, so naming that
        // verb turns a wrong answer into a second thing learned.
        ...Object.fromEntries(
          chosen.map((p) => [p.meaning, `Это значение глагола «${p.verb}»: ${p.ru}.`]),
        ),
      },
      speak: solve(target.example, target.verb),
    });
  }

  return build(rng, {
    skill: 'phrasal-verbs',
    level,
    prompt: UI.prompts.phrasalFit,
    text: target.example,
    correct: target.verb,
    wrong: rng.sample(others, 3).map((p) => p.verb),
    teaching: `«${target.verb}» означает: ${target.ru}.`,
    whys: Object.fromEntries(pool.map((p) => [p.verb, `«${p.verb}» — ${p.ru}.`])),
  });
};

export const confusables: Generator = (rng, level) => {
  const groups = CONFUSABLES.filter((g) => g.items.some((i) => i.level <= level));
  const group = rng.pick(groups.length ? groups : CONFUSABLES);
  const item = rng.pick(atLevel(group.items, level));
  const answerWord = group.words.find((w) => w.w === item.answer);

  const teaching = [answerWord ? `«${item.answer}» — ${answerWord.gloss}.` : '', group.trap ?? '']
    .filter(Boolean)
    .join(' ');

  return build(rng, {
    skill: 'confusables',
    level,
    prompt: UI.prompts.word,
    text: item.text,
    correct: item.answer,
    wrong: rng.shuffle(group.words.filter((w) => w.w !== item.answer).map((w) => w.w)),
    // A two-word group stays a two-choice question on purpose: the whole
    // point is the contrast between exactly these two words.
    choiceCount: Math.min(4, group.words.length),
    teaching,
    whys: Object.fromEntries(
      group.words.map((w) => [
        w.w,
        w.w === item.answer ? `Верно. «${w.w}» — ${w.gloss}.` : `«${w.w}» — ${w.gloss}. Здесь это не подходит.`,
      ]),
    ),
  });
};

export const vocabulary: Generator = (rng, level) => {
  const pool = atLevel(VOCAB, level);
  const target = rng.pick(pool);
  // Same theme and level, so the question cannot be solved by topic alone.
  let siblings = pool.filter((v) => v.theme === target.theme && v.word !== target.word);
  if (siblings.length < 3) siblings = pool.filter((v) => v.word !== target.word);

  const shape = target.example && rng.next() < 0.5 ? 'cloze' : rng.next() < 0.5 ? 'word' : 'meaning';

  /** Choices are English words, so each explanation names the word's meaning. */
  const wordWhys = Object.fromEntries(
    [target, ...siblings].map((v) => [
      v.word,
      v.word === target.word ? `Верно. «${v.word}» — ${v.ru}.` : `«${v.word}» — ${v.ru}. Здесь не подходит.`,
    ]),
  );

  if (shape === 'cloze' && target.example) {
    return build(rng, {
      skill: 'vocabulary',
      level,
      prompt: UI.prompts.vocabCloze,
      text: target.example,
      correct: target.word,
      wrong: rng.sample(siblings, 3).map((v) => v.word),
      teaching: `«${target.word}» — ${target.ru}.`,
      whys: wordWhys,
    });
  }

  if (shape === 'meaning') {
    const chosen = rng.sample(siblings, 3);
    return build(rng, {
      skill: 'vocabulary',
      level,
      prompt: UI.prompts.vocabMeaning(target.word),
      text: target.example ? solve(target.example, target.word) : `Слово «${target.word}».`,
      correct: target.def,
      wrong: chosen.map((v) => v.def),
      teaching: `«${target.word}» — ${target.ru}.`,
      whys: {
        [target.def]: `Верно. «${target.word}» — ${target.ru}.`,
        ...Object.fromEntries(
          chosen.map((v) => [v.def, `Это значение слова «${v.word}»: ${v.ru}.`]),
        ),
      },
      speak: target.word,
    });
  }

  return build(rng, {
    skill: 'vocabulary',
    level,
    prompt: UI.prompts.vocabWord,
    text: target.def,
    correct: target.word,
    wrong: rng.sample(siblings, 3).map((v) => v.word),
    teaching: `«${target.word}» — ${target.ru}.`,
    whys: wordWhys,
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
    prompt: UI.prompts.makeDo,
    text: `I need to ␣ ${entry.obj} before lunch.`,
    correct,
    wrong: [useMake ? 'do' : 'make', 'take'],
    choiceCount: 3,
    teaching: useMake
      ? `Сочетание «make ${entry.obj}» устойчивое. В целом «make» — про создание чего-то нового.`
      : `Сочетание «do ${entry.obj}» устойчивое. В целом «do» — про дела, работу и занятия.`,
    whys: {
      make: useMake
        ? `Верно: говорят «make ${entry.obj}». «make» — про создание чего-то.`
        : `«make» — про создание чего-то нового. С «${entry.obj}» употребляется «do».`,
      do: useMake
        ? `«do» — про дела и занятия. С «${entry.obj}» употребляется «make».`
        : `Верно: говорят «do ${entry.obj}». «do» — про дела и занятия.`,
      take: `«take» здесь не подходит: с «${entry.obj}» это сочетание не употребляется.`,
    },
  });
};

export const sayTell: Generator = (rng, level) => {
  const item = rng.pick(atLevel(withPack(SAY_TELL, PACKS['say-tell']), level));
  return build(rng, {
    skill: 'say-tell',
    level,
    prompt: UI.prompts.sayTell,
    text: item.text,
    correct: item.correct,
    wrong: rng.shuffle(item.wrong),
    teaching: item.why,
    whys: authoredWhys(item),
  });
};

export const dependentPrepositions: Generator = (rng, level) => {
  const entry = rng.pick(atLevel(DEPENDENT_PREPS, level));
  const correctWhy = `После «${entry.phrase}» всегда идёт «${entry.prep}» — эту пару запоминают целиком.`;

  return build(rng, {
    skill: 'dependent-prepositions',
    level,
    prompt: UI.prompts.dependentPrep,
    text: entry.example,
    correct: entry.prep,
    wrong: rng.shuffle(PREP_DISTRACTORS.filter((p) => p !== entry.prep)),
    teaching: `${correctWhy} Общего правила здесь нет: у каждого слова свой предлог, и в русском он часто другой.`,
    whys: { ...PREP_HINTS, [entry.prep]: `Верно. ${correctWhy}` },
  });
};

/**
 * Per-choice explanations for a hand-written item. `wrongWhy` runs parallel to
 * `wrong`, so each distractor gets the reason it specifically fails.
 */
export function authoredWhys(item: {
  correct: string;
  wrong: string[];
  wrongWhy: string[];
  why: string;
}): Record<string, string> {
  return {
    [item.correct]: `Верно. ${item.why}`,
    ...Object.fromEntries(item.wrong.map((w, i) => [w, item.wrongWhy[i] ?? item.why])),
  };
}
