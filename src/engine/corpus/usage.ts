/** Time and place expressions tagged with the preposition English requires. */
export interface Expr {
  expr: string;
  prep: 'in' | 'on' | 'at' | '—';
  level: 1 | 2 | 3;
  /** Why this preposition, in one clause. */
  why: string;
  /**
   * Which generic frames this expression can go in. "yesterday" cannot appear
   * in a future sentence, so an untagged corpus would generate sentences like
   * "I will telephone you yesterday" -- grammatical shape, nonsense content.
   */
  when?: 'any' | 'past' | 'future' | 'habit';
  /** A dedicated frame, for expressions no generic frame fits. */
  frame?: string;
}

export const TIME_EXPR: Expr[] = [
  { expr: 'nine o’clock', prep: 'at', level: 1, when: 'any', why: 'перед точным временем ставится «at»' },
  { expr: 'half past six', prep: 'at', level: 2, when: 'any', why: 'перед точным временем ставится «at»' },
  { expr: 'midnight', prep: 'at', level: 1, when: 'any', why: '«at midnight» и «at noon» — устойчивые сочетания' },
  { expr: 'lunchtime', prep: 'at', level: 2, when: 'any', why: 'перед моментами дня ставится «at»' },
  { expr: 'night', prep: 'at', level: 1, when: 'habit', why: '«at night» — устойчивое сочетание, а вот утром — «in the morning»' },
  { expr: 'the weekend', prep: 'at', level: 2, when: 'any', why: 'в британском варианте говорят «at the weekend»' },
  { expr: 'Christmas', prep: 'at', level: 2, when: 'any', why: 'перед праздничными периодами ставится «at»' },

  { expr: 'Monday', prep: 'on', level: 1, when: 'any', why: 'перед днями недели ставится «on»' },
  { expr: 'Friday evening', prep: 'on', level: 2, when: 'any', why: 'перед названным днём ставится «on», даже если указана часть дня' },
  { expr: 'my birthday', prep: 'on', level: 1, when: 'any', why: 'перед конкретными днями ставится «on»' },
  { expr: 'the third of May', prep: 'on', level: 2, when: 'any', why: 'перед датами ставится «on»' },
  { expr: 'New Year’s Day', prep: 'on', level: 2, when: 'any', why: 'перед отдельным названным днём ставится «on»' },
  { expr: 'Tuesdays', prep: 'on', level: 2, when: 'habit', why: 'перед повторяющимися днями ставится «on»' },

  { expr: 'July', prep: 'in', level: 1, when: 'any', why: 'перед названиями месяцев ставится «in»' },
  { expr: 'the morning', prep: 'in', level: 1, when: 'habit', why: '«in the morning», «in the afternoon», «in the evening» — но «at night»' },
  { expr: 'the evening', prep: 'in', level: 1, when: 'habit', why: '«in the evening» — устойчивое сочетание' },
  { expr: 'summer', prep: 'in', level: 1, when: 'any', why: 'перед временами года ставится «in»' },
  { expr: 'winter', prep: 'in', level: 1, when: 'any', why: 'перед временами года ставится «in»' },
  { expr: '1998', prep: 'in', level: 2, when: 'past', why: 'перед годами ставится «in»' },
  { expr: 'the 1960s', prep: 'in', level: 3, when: 'past', why: 'перед десятилетиями ставится «in»' },
  { expr: 'two hours', prep: 'in', level: 2, when: 'future', why: '«in two hours» значит «через два часа»' },
  { expr: 'the moment', prep: 'at', level: 2, when: 'any', frame: 'She is not at home ␣ the moment.', why: '«at the moment» — устойчивое сочетание' },

  { expr: 'yesterday', prep: '—', level: 1, when: 'past', why: 'перед «yesterday», «today» и «tomorrow» предлог не нужен' },
  { expr: 'tomorrow', prep: '—', level: 1, when: 'future', why: 'перед «tomorrow» предлог не ставится' },
  { expr: 'last week', prep: '—', level: 2, when: 'past', why: 'после «last», «next», «this» и «every» предлог не ставится' },
  { expr: 'next month', prep: '—', level: 2, when: 'future', why: 'после «last», «next», «this» и «every» предлог не ставится' },
  { expr: 'every day', prep: '—', level: 2, when: 'habit', why: 'после «every» предлог не ставится' },
];

/** Generic time frames, selected by the expression's `when` tag. */
export const TIME_FRAMES: Record<'past' | 'future' | 'habit', string[]> = {
  past: [
    'I saw the doctor ␣ {T}.',
    'We moved into this house ␣ {T}.',
    'The parcel arrived ␣ {T}.',
  ],
  future: [
    'I will telephone you ␣ {T}.',
    'The appointment is ␣ {T}.',
    'We are meeting them ␣ {T}.',
  ],
  habit: [
    'The chemist closes ␣ {T}.',
    'She visits her sister ␣ {T}.',
    'I take my tablets ␣ {T}.',
  ],
};

export const PLACE_EXPR: Expr[] = [
  { expr: 'the bus stop', prep: 'at', level: 1, why: '«at» обозначает точку или место встречи' },
  { expr: 'home', prep: 'at', level: 1, why: '«at home» — устойчивое сочетание; «in home» не говорят' },
  { expr: 'work', prep: 'at', level: 1, why: '«at work» — устойчивое сочетание' },
  { expr: 'the doctor’s', prep: 'at', level: 2, why: '«at» употребляется с местами, куда приходят с определённой целью' },
  { expr: 'the station', prep: 'at', level: 2, why: '«at the station» — точка на пути' },

  { expr: 'the table', prep: 'on', level: 1, why: '«on» значит «на поверхности»' },
  { expr: 'the wall', prep: 'on', level: 1, why: '«on» — о том, что прикреплено к поверхности' },
  { expr: 'the second floor', prep: 'on', level: 2, why: 'перед этажами ставится «on»' },
  { expr: 'the bus', prep: 'on', level: 1, why: 'с общественным транспортом употребляется «on», но «in the car»' },
  { expr: 'the train', prep: 'on', level: 1, why: 'с общественным транспортом употребляется «on»' },

  { expr: 'the kitchen', prep: 'in', level: 1, why: '«in» значит «внутри замкнутого пространства»' },
  { expr: 'the car', prep: 'in', level: 1, why: 'с личным транспортом употребляется «in», но «on the bus»' },
  { expr: 'my pocket', prep: 'in', level: 1, why: '«in» значит «внутри»' },
  { expr: 'London', prep: 'in', level: 1, why: 'перед названиями городов ставится «in»' },
  { expr: 'the garden', prep: 'in', level: 1, why: 'с огороженными участками на улице употребляется «in»' },

  { expr: 'the top of the page', prep: 'at', level: 3, frame: 'Write your name ␣ the top of the page.', why: '«at the top» и «at the bottom» — устойчивые сочетания' },
  { expr: 'the left', prep: 'on', level: 2, frame: 'The pharmacy is ␣ the left, just past the church.', why: '«on the left» и «on the right» — устойчивые сочетания' },
  { expr: 'the newspaper', prep: 'in', level: 2, frame: 'I read about it ␣ the newspaper.', why: 'текст находится внутри, поэтому «in the newspaper»' },
];

/** Generic place frames — these accept any plain location expression. */
export const PLACE_FRAMES: string[] = [
  'She is waiting ␣ {X}.',
  'I left my glasses ␣ {X}.',
  'We met the neighbours ␣ {X}.',
  'The keys are ␣ {X}.',
];

/** make/do collocations. Both are one verb in Ukrainian and Russian. */
export const MAKE_COLLOCATIONS: { obj: string; level: 1 | 2 | 3 }[] = [
  { obj: 'a mistake', level: 1 },
  { obj: 'a phone call', level: 1 },
  { obj: 'an appointment', level: 2 },
  { obj: 'a cup of tea', level: 1 },
  { obj: 'the bed', level: 1 },
  { obj: 'a noise', level: 1 },
  { obj: 'friends', level: 2 },
  { obj: 'progress', level: 2 },
  { obj: 'a mess', level: 2 },
  { obj: 'an effort', level: 3 },
  { obj: 'a suggestion', level: 3 },
  { obj: 'money', level: 2 },
  { obj: 'a complaint', level: 3 },
];

export const DO_COLLOCATIONS: { obj: string; level: 1 | 2 | 3 }[] = [
  { obj: 'the shopping', level: 1 },
  { obj: 'the washing-up', level: 1 },
  { obj: 'the housework', level: 1 },
  { obj: 'your homework', level: 1 },
  { obj: 'me a favour', level: 2 },
  { obj: 'some exercise', level: 2 },
  { obj: 'business', level: 2 },
  { obj: 'your best', level: 2 },
  { obj: 'the ironing', level: 2 },
  { obj: 'nothing', level: 1 },
  { obj: 'research', level: 3 },
  { obj: 'damage', level: 3 },
];

/** Verbs and adjectives that demand a particular preposition. */
export const DEPENDENT_PREPS: { phrase: string; prep: string; example: string; level: 1 | 2 | 3 }[] = [
  { phrase: 'depend', prep: 'on', example: 'It depends ␣ the weather.', level: 1 },
  { phrase: 'listen', prep: 'to', example: 'I listen ␣ the radio every morning.', level: 1 },
  { phrase: 'wait', prep: 'for', example: 'We waited ␣ the bus for twenty minutes.', level: 1 },
  { phrase: 'look', prep: 'at', example: 'Please look ␣ this photograph.', level: 1 },
  { phrase: 'belong', prep: 'to', example: 'This umbrella belongs ␣ my neighbour.', level: 2 },
  { phrase: 'interested', prep: 'in', example: 'She is very interested ␣ history.', level: 1 },
  { phrase: 'good', prep: 'at', example: 'He is good ␣ crosswords.', level: 1 },
  { phrase: 'afraid', prep: 'of', example: 'I am not afraid ␣ dogs.', level: 1 },
  { phrase: 'married', prep: 'to', example: 'She has been married ␣ him for forty years.', level: 2 },
  { phrase: 'different', prep: 'from', example: 'This tea is different ␣ the one we usually buy.', level: 2 },
  { phrase: 'worry', prep: 'about', example: 'Try not to worry ␣ the results.', level: 2 },
  { phrase: 'apologise', prep: 'for', example: 'He apologised ␣ being late.', level: 3 },
  { phrase: 'pay', prep: 'for', example: 'I already paid ␣ the tickets.', level: 1 },
  { phrase: 'rely', prep: 'on', example: 'You can rely ␣ her completely.', level: 3 },
  { phrase: 'suffer', prep: 'from', example: 'He suffers ␣ terrible headaches.', level: 3 },
  { phrase: 'consist', prep: 'of', example: 'The meal consists ␣ soup and bread.', level: 3 },
  { phrase: 'complain', prep: 'about', example: 'They complained ␣ the noise.', level: 2 },
  { phrase: 'remind', prep: 'of', example: 'This song reminds me ␣ my mother.', level: 3 },
  { phrase: 'agree', prep: 'with', example: 'I completely agree ␣ you.', level: 2 },
  { phrase: 'arrive', prep: 'at', example: 'We arrived ␣ the hospital at nine.', level: 2 },
];

export const PREP_DISTRACTORS = ['on', 'to', 'for', 'at', 'in', 'of', 'from', 'about', 'with'];

/**
 * What each preposition does in general. Shown against whichever option the
 * learner picked, so a wrong answer explains itself rather than only being
 * marked red.
 */
export const PREP_HINTS: Record<string, string> = {
  in: '«in» — внутри чего-то: месяцы, годы, времена года, части дня.',
  on: '«on» — на поверхности, а во времени — дни недели и даты.',
  at: '«at» — точка: точное время или конкретное место.',
  '—': 'Здесь предлог не нужен совсем.',
  to: '«to» — направление движения или адресат действия.',
  for: '«for» — ради чего или в течение какого срока.',
  of: '«of» — принадлежность или состав.',
  from: '«from» — источник или отправная точка.',
  about: '«about» — о чём идёт речь.',
  with: '«with» — вместе с кем-то или чем-то.',
};
