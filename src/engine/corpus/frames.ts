/**
 * Sentence frames.
 *
 * Where a rule applies uniformly (articles, prepositions, past tense), the
 * frame is parametrised and combines with the whole corpus -- one frame times
 * fifty nouns is fifty questions. Where correctness depends on discourse
 * context (present perfect, modals), the item is written out in full, because
 * a template there would produce sentences that are grammatical but that no
 * English speaker would actually say.
 */

import type { NounKind } from './nouns';

export type ArticleRule = 'indefinite' | 'definite' | 'zero-plural' | 'zero-uncountable';

export interface ArticleFrame {
  /** {N} singular noun, {P} plural noun, {A} the indefinite article. */
  frame: string;
  rule: ArticleRule;
  level: 1 | 2 | 3;
  /** Why this article, in one clause. */
  why: string;
  /**
   * Which kinds of noun this frame makes sense with. Omitted means any kind.
   * You can buy a car and you can buy an apple, but nobody is given a garden
   * for their birthday.
   */
  accepts?: NounKind[];
}

export const ARTICLE_FRAMES: ArticleFrame[] = [
  { frame: 'I bought ␣ {N} yesterday.', rule: 'indefinite', level: 1, accepts: ['thing'],
    why: 'first mention of one countable thing' },
  { frame: 'There is ␣ {N} in the hall.', rule: 'indefinite', level: 1, accepts: ['thing'],
    why: 'way of introducing something new with "there is"' },
  { frame: 'He gave me ␣ {N} for my birthday.', rule: 'indefinite', level: 1, accepts: ['thing'],
    why: 'first mention of one countable thing' },
  { frame: 'We need ␣ {N} for the kitchen.', rule: 'indefinite', level: 1, accepts: ['thing'],
    why: 'case where any one will do, so it is not specific' },
  { frame: 'I saw ␣ {N} outside the shop.', rule: 'indefinite', level: 2, accepts: ['thing', 'person'],
    why: 'first mention — the listener does not know which one' },
  { frame: 'She is looking for ␣ {N}.', rule: 'indefinite', level: 2, accepts: ['thing', 'place', 'room', 'person'],
    why: 'case where any one will do, so it is not specific' },
  { frame: 'She showed me ␣ {N}.', rule: 'indefinite', level: 1, accepts: ['thing', 'place', 'room'],
    why: 'first mention — the listener does not know which one' },
  { frame: 'They have opened ␣ {N} near the station.', rule: 'indefinite', level: 2, accepts: ['place'],
    why: 'first mention of one countable thing' },
  { frame: 'She spoke to ␣ {N} about it.', rule: 'indefinite', level: 2, accepts: ['person'],
    why: 'first mention — the listener does not know which one' },
  { frame: 'It was ␣ {N} that nobody had expected.', rule: 'indefinite', level: 3, accepts: ['abstract'],
    why: 'first mention of one countable thing' },

  { frame: 'I bought {A} {N} and a lamp. ␣ {N} was cheaper.', rule: 'definite', level: 2, accepts: ['thing'],
    why: 'second mention — now we both know which one' },
  { frame: 'There was {A} {N} and a chair here. ␣ {N} has gone.', rule: 'definite', level: 2, accepts: ['thing'],
    why: 'second mention — now it is specific' },
  { frame: 'It is ␣ best {N} I have ever had.', rule: 'definite', level: 2, accepts: ['thing'],
    why: 'way superlatives point to one specific thing' },
  { frame: 'This is ␣ only {N} they had left.', rule: 'definite', level: 3, accepts: ['thing'],
    why: 'way "only" makes it specific' },
  { frame: 'She chose ␣ same {N} as last time.', rule: 'definite', level: 3, accepts: ['thing'],
    why: 'way "same" makes it specific' },

  { frame: 'I like ␣ {P} very much.', rule: 'zero-plural', level: 1, accepts: ['thing'],
    why: 'rule that plural nouns in general take no article' },
  { frame: '␣ {P} are more expensive than they used to be.', rule: 'zero-plural', level: 2, accepts: ['thing'],
    why: 'case of talking about all of them in general' },
  { frame: 'She is not afraid of ␣ {P}.', rule: 'zero-plural', level: 2, accepts: ['thing', 'person'],
    why: 'case of a whole class of things, in general' },

  { frame: '', rule: 'zero-uncountable', level: 1,
    why: 'rule that uncountable nouns in general take no article' },
];

/** Subjects, with the agreement information the generators need. */
export const SUBJECTS: { text: string; third: boolean; level: 1 | 2 | 3 }[] = [
  { text: 'I', third: false, level: 1 },
  { text: 'We', third: false, level: 1 },
  { text: 'They', third: false, level: 1 },
  { text: 'She', third: true, level: 1 },
  { text: 'He', third: true, level: 1 },
  { text: 'My sister', third: true, level: 2 },
  { text: 'My husband', third: true, level: 2 },
  { text: 'The neighbours', third: false, level: 2 },
  { text: 'Our daughter', third: true, level: 2 },
];

/**
 * What follows each verb, so past-tense questions read like real sentences
 * instead of "She ␣ yesterday." Each verb needs its own, because the
 * complement a verb takes is part of the verb.
 */
export const VERB_CONTEXTS: Record<string, string[]> = {
  go: ['to the doctor', 'to the market', 'home early'],
  buy: ['a newspaper', 'some bread', 'a birthday card'],
  see: ['an old friend in town', 'the specialist', 'a wonderful film'],
  eat: ['nothing all day', 'far too much cake', 'lunch at one'],
  take: ['the bus into town', 'her medicine', 'a photograph'],
  give: ['me good advice', 'the money back', 'him a lift'],
  write: ['a long letter', 'her name on the form', 'to the council'],
  speak: ['to the manager', 'very quietly', 'to my daughter about it'],
  drink: ['two cups of tea', 'a glass of water', 'nothing but coffee'],
  drive: ['to the coast', 'very slowly', 'us to the station'],
  come: ['home late', 'to the door', 'round for tea'],
  make: ['a mistake on the form', 'a cup of tea', 'an appointment'],
  find: ['my glasses at last', 'the address easily', 'a good doctor'],
  know: ['the answer straight away', 'his family for years', 'the way home'],
  think: ['about it all night', 'it was Tuesday', 'very carefully'],
  bring: ['an umbrella', 'the photographs', 'some flowers'],
  teach: ['at the local school', 'me how to drive', 'French for years'],
  catch: ['the early train', 'a bad cold', 'the last bus'],
  sleep: ['very badly', 'for nine hours', 'in the spare room'],
  leave: ['the house at eight', 'her keys at home', 'without saying goodbye'],
  lose: ['my reading glasses', 'the receipt', 'a lot of weight'],
  send: ['a parcel to Canada', 'the form back', 'us a postcard'],
  pay: ['the electricity bill', 'in cash', 'for everything'],
  meet: ['at the bus stop', 'his wife in 1975', 'the new neighbours'],
  sell: ['the old car', 'the house last year', 'everything at the market'],
  wear: ['a heavy coat', 'her good shoes', 'a hat in the sun'],
  break: ['a cup', 'his glasses', 'the window'],
  forget: ['his birthday again', 'to lock the door', 'the whole conversation'],
  choose: ['the blue one', 'a quiet table', 'not to go'],
  understand: ['every word', 'the instructions at last', 'why she was upset'],
  rise: ['very early', 'slowly from the chair'],
  grow: ['tomatoes in the garden', 'very tired of waiting'],
  walk: ['to the shops', 'the dog before breakfast', 'all the way home'],
  watch: ['the news', 'the birds in the garden', 'a film after supper'],
  call: ['the doctor', 'her every Sunday', 'a taxi'],
  wait: ['half an hour', 'for the bus', 'outside the surgery'],
  live: ['in this house for years', 'near the park', 'alone since then'],
  study: ['French at evening class', 'the timetable', 'very hard'],
  carry: ['the shopping upstairs', 'her bag for her'],
  stop: ['at the corner', 'to catch her breath'],
  plan: ['the whole journey', 'a family party'],
  travel: ['by train', 'all over Europe'],
};

/**
 * Adjectives, each with its own sentence frames.
 *
 * The frames are per-adjective rather than shared, because a shared pool
 * produces sentences like "Travelling by train is bigger than driving" --
 * correct in form and nonsense in meaning, which is worse than useless when
 * the learner is trying to work out what the sentence means.
 */
export const ADJECTIVES: {
  adj: string;
  comp: string;
  sup: string;
  kind: 'short' | 'long' | 'irregular';
  /** Comparative frame. */
  frame: string;
  /** Superlative frame. The article is part of `sup`, not the frame. */
  supFrame: string;
  level: 1 | 2 | 3;
}[] = [
  { adj: 'cold', comp: 'colder', sup: 'the coldest', kind: 'short', level: 1,
    frame: 'Today is ␣ than yesterday.', supFrame: 'It was ␣ day of the whole winter.' },
  { adj: 'warm', comp: 'warmer', sup: 'the warmest', kind: 'short', level: 1,
    frame: 'This coat is ␣ than my old one.', supFrame: 'That was ␣ day of the year.' },
  { adj: 'cheap', comp: 'cheaper', sup: 'the cheapest', kind: 'short', level: 1,
    frame: 'The market is ␣ than the supermarket.', supFrame: 'This is ␣ shop in town.' },
  { adj: 'young', comp: 'younger', sup: 'the youngest', kind: 'short', level: 1,
    frame: 'My sister is ␣ than me.', supFrame: 'She is ␣ of the three sisters.' },
  { adj: 'quiet', comp: 'quieter', sup: 'the quietest', kind: 'short', level: 2,
    frame: 'This street is ␣ than the one we left.', supFrame: 'It is ␣ room in the house.' },
  { adj: 'busy', comp: 'busier', sup: 'the busiest', kind: 'short', level: 2,
    frame: 'The shop is ␣ on Saturdays than on Mondays.', supFrame: 'Saturday is ␣ day of the week.' },
  { adj: 'easy', comp: 'easier', sup: 'the easiest', kind: 'short', level: 1,
    frame: 'This crossword is ␣ than yesterday’s.', supFrame: 'That was ␣ question on the form.' },
  { adj: 'heavy', comp: 'heavier', sup: 'the heaviest', kind: 'short', level: 2,
    frame: 'This bag is ␣ than the other one.', supFrame: 'It was ␣ suitcase of them all.' },
  { adj: 'big', comp: 'bigger', sup: 'the biggest', kind: 'short', level: 1,
    frame: 'Their garden is ␣ than ours.', supFrame: 'It is ␣ room in the house.' },
  { adj: 'hot', comp: 'hotter', sup: 'the hottest', kind: 'short', level: 1,
    frame: 'The kitchen is ␣ than the hall.', supFrame: 'July was ␣ month of the summer.' },
  { adj: 'comfortable', comp: 'more comfortable', sup: 'the most comfortable', kind: 'long', level: 2,
    frame: 'This armchair is ␣ than the old one.', supFrame: 'It is ␣ chair in the house.' },
  { adj: 'expensive', comp: 'more expensive', sup: 'the most expensive', kind: 'long', level: 1,
    frame: 'The chemist is ␣ than the supermarket.', supFrame: 'That is ␣ shop in town.' },
  { adj: 'difficult', comp: 'more difficult', sup: 'the most difficult', kind: 'long', level: 2,
    frame: 'This form is ␣ than the last one.', supFrame: 'That was ␣ part of the journey.' },
  { adj: 'careful', comp: 'more careful', sup: 'the most careful', kind: 'long', level: 2,
    frame: 'She is ␣ than her brother.', supFrame: 'He is ␣ driver I know.' },
  { adj: 'useful', comp: 'more useful', sup: 'the most useful', kind: 'long', level: 2,
    frame: 'This little tool is ␣ than the big one.', supFrame: 'It is ␣ present I have ever had.' },
  { adj: 'interesting', comp: 'more interesting', sup: 'the most interesting', kind: 'long', level: 2,
    frame: 'The second book was ␣ than the first.', supFrame: 'It was ␣ programme of the week.' },
  { adj: 'good', comp: 'better', sup: 'the best', kind: 'irregular', level: 1,
    frame: 'The weather today is ␣ than yesterday.', supFrame: 'It was ␣ day of the holiday.' },
  { adj: 'bad', comp: 'worse', sup: 'the worst', kind: 'irregular', level: 1,
    frame: 'My knee is ␣ than it was last week.', supFrame: 'That was ␣ winter I remember.' },
  { adj: 'far', comp: 'further', sup: 'the furthest', kind: 'irregular', level: 3,
    frame: 'The station is ␣ than the bus stop.', supFrame: 'That is ␣ I have walked this year.' },
];
