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
  { expr: 'nine o’clock', prep: 'at', level: 1, when: 'any', why: 'clock times take "at"' },
  { expr: 'half past six', prep: 'at', level: 2, when: 'any', why: 'clock times take "at"' },
  { expr: 'midnight', prep: 'at', level: 1, when: 'any', why: '"at midnight" and "at noon" are fixed' },
  { expr: 'lunchtime', prep: 'at', level: 2, when: 'any', why: 'points in the day take "at"' },
  { expr: 'night', prep: 'at', level: 1, when: 'habit', why: '"at night" is fixed — but "in the morning"' },
  { expr: 'the weekend', prep: 'at', level: 2, when: 'any', why: 'British English uses "at the weekend"' },
  { expr: 'Christmas', prep: 'at', level: 2, when: 'any', why: 'holiday periods take "at"' },

  { expr: 'Monday', prep: 'on', level: 1, when: 'any', why: 'days of the week take "on"' },
  { expr: 'Friday evening', prep: 'on', level: 2, when: 'any', why: 'a named day takes "on", even with a part of the day' },
  { expr: 'my birthday', prep: 'on', level: 1, when: 'any', why: 'specific days take "on"' },
  { expr: 'the third of May', prep: 'on', level: 2, when: 'any', why: 'dates take "on"' },
  { expr: 'New Year’s Day', prep: 'on', level: 2, when: 'any', why: 'a single named day takes "on"' },
  { expr: 'Tuesdays', prep: 'on', level: 2, when: 'habit', why: 'repeated days take "on"' },

  { expr: 'July', prep: 'in', level: 1, when: 'any', why: 'months take "in"' },
  { expr: 'the morning', prep: 'in', level: 1, when: 'habit', why: '"in the morning/afternoon/evening" — but "at night"' },
  { expr: 'the evening', prep: 'in', level: 1, when: 'habit', why: '"in the evening" is fixed' },
  { expr: 'summer', prep: 'in', level: 1, when: 'any', why: 'seasons take "in"' },
  { expr: 'winter', prep: 'in', level: 1, when: 'any', why: 'seasons take "in"' },
  { expr: '1998', prep: 'in', level: 2, when: 'past', why: 'years take "in"' },
  { expr: 'the 1960s', prep: 'in', level: 3, when: 'past', why: 'decades take "in"' },
  { expr: 'two hours', prep: 'in', level: 2, when: 'future', why: '"in two hours" means after that much time has passed' },
  { expr: 'the moment', prep: 'at', level: 2, when: 'any', frame: 'She is not at home ␣ the moment.', why: '"at the moment" is fixed' },

  { expr: 'yesterday', prep: '—', level: 1, when: 'past', why: '"yesterday", "today" and "tomorrow" take no preposition' },
  { expr: 'tomorrow', prep: '—', level: 1, when: 'future', why: 'no preposition before "tomorrow"' },
  { expr: 'last week', prep: '—', level: 2, when: 'past', why: 'no preposition after "last", "next", "this" or "every"' },
  { expr: 'next month', prep: '—', level: 2, when: 'future', why: 'no preposition after "last", "next", "this" or "every"' },
  { expr: 'every day', prep: '—', level: 2, when: 'habit', why: 'no preposition after "every"' },
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
  { expr: 'the bus stop', prep: 'at', level: 1, why: '"at" marks a point or a meeting place' },
  { expr: 'home', prep: 'at', level: 1, why: '"at home" is fixed — never "in home"' },
  { expr: 'work', prep: 'at', level: 1, why: '"at work" is fixed' },
  { expr: 'the doctor’s', prep: 'at', level: 2, why: '"at" is used for places you visit for a purpose' },
  { expr: 'the station', prep: 'at', level: 2, why: '"at the station" — a point on a journey' },

  { expr: 'the table', prep: 'on', level: 1, why: '"on" means touching a surface' },
  { expr: 'the wall', prep: 'on', level: 1, why: '"on" for things attached to a surface' },
  { expr: 'the second floor', prep: 'on', level: 2, why: 'floors of a building take "on"' },
  { expr: 'the bus', prep: 'on', level: 1, why: 'public transport takes "on" — but "in the car"' },
  { expr: 'the train', prep: 'on', level: 1, why: 'public transport takes "on"' },

  { expr: 'the kitchen', prep: 'in', level: 1, why: '"in" means inside an enclosed space' },
  { expr: 'the car', prep: 'in', level: 1, why: 'small private vehicles take "in" — but "on the bus"' },
  { expr: 'my pocket', prep: 'in', level: 1, why: '"in" means inside' },
  { expr: 'London', prep: 'in', level: 1, why: 'towns and cities take "in"' },
  { expr: 'the garden', prep: 'in', level: 1, why: 'enclosed outdoor areas take "in"' },

  { expr: 'the top of the page', prep: 'at', level: 3, frame: 'Write your name ␣ the top of the page.', why: '"at the top" and "at the bottom" are fixed' },
  { expr: 'the left', prep: 'on', level: 2, frame: 'The pharmacy is ␣ the left, just past the church.', why: '"on the left" and "on the right" are fixed' },
  { expr: 'the newspaper', prep: 'in', level: 2, frame: 'I read about it ␣ the newspaper.', why: 'text is inside it, so "in the newspaper"' },
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
