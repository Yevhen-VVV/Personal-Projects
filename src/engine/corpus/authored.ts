/**
 * Items written out in full, for the skills where correctness depends on
 * context rather than on a rule a template can apply. Present perfect needs a
 * time expression that makes exactly one tense right; modals need a situation
 * that rules out the alternatives. Templating these would produce grammatical
 * sentences that nobody says.
 */

export interface AuthoredItem {
  text: string;
  correct: string;
  wrong: string[];
  why: string;
  level: 1 | 2 | 3;
}

/**
 * Present perfect vs past simple. Slavic aspect maps onto neither cleanly, so
 * learners reach for the past simple everywhere. Every item here contains a
 * time expression that decides the answer, and the explanation names it.
 */
export const PERFECT_VS_PAST: AuthoredItem[] = [
  {
    text: 'I ␣ in this house since 1998.',
    correct: 'have lived',
    wrong: ['lived', 'live', 'am living'],
    why: '"since" gives a starting point and the situation still continues, so English needs the present perfect.',
    level: 2,
  },
  {
    text: 'She ␣ her keys — she cannot get into the flat.',
    correct: 'has lost',
    wrong: ['lost', 'loses', 'is losing'],
    why: 'The action was in the past, but we are talking about the result now. That is the present perfect.',
    level: 2,
  },
  {
    text: 'We ␣ the Petrenkos for over thirty years.',
    correct: 'have known',
    wrong: ['know', 'knew', 'are knowing'],
    why: '"for" + a length of time that reaches the present takes the present perfect.',
    level: 2,
  },
  {
    text: 'He ␣ his tablets already, so do not remind him.',
    correct: 'has taken',
    wrong: ['took', 'takes', 'is taking'],
    why: '"already" points to something finished that matters now — present perfect.',
    level: 2,
  },
  {
    text: 'I ␣ to Scotland, but I would love to go one day.',
    correct: 'have never been',
    wrong: ['never was', 'never go', 'am never going'],
    why: '"never" here means "not at any time up to now", which is the present perfect.',
    level: 3,
  },
  {
    text: 'The post ␣ already — it is on the table.',
    correct: 'has arrived',
    wrong: ['arrived', 'arrives', 'is arriving'],
    why: '"already", with the result visible now, calls for the present perfect.',
    level: 2,
  },
  {
    text: 'I ␣ my sister three times this week.',
    correct: 'have telephoned',
    wrong: ['telephoned', 'telephone', 'was telephoning'],
    why: '"this week" is not finished yet, so the period is still open — present perfect.',
    level: 3,
  },
  {
    text: 'We ␣ this house in 1987.',
    correct: 'bought',
    wrong: ['have bought', 'buy', 'have been buying'],
    why: '"in 1987" is a finished time, so English uses the past simple — never the present perfect.',
    level: 2,
  },
  {
    text: 'She ␣ him at a dance in 1962.',
    correct: 'met',
    wrong: ['has met', 'meets', 'has been meeting'],
    why: 'A finished date always takes the past simple.',
    level: 2,
  },
  {
    text: 'I ␣ to the doctor yesterday morning.',
    correct: 'went',
    wrong: ['have gone', 'go', 'have been going'],
    why: '"yesterday" is finished time — past simple.',
    level: 1,
  },
  {
    text: 'They ␣ here for twenty years, but they moved away in 2010.',
    correct: 'lived',
    wrong: ['have lived', 'live', 'have been living'],
    why: 'Even with "for twenty years", the period is over — they moved away. Finished period, past simple.',
    level: 3,
  },
  {
    text: 'He ␣ his glasses two days ago.',
    correct: 'broke',
    wrong: ['has broken', 'breaks', 'is breaking'],
    why: '"ago" always means finished time — past simple.',
    level: 1,
  },
  {
    text: 'When I ␣ young, we had no telephone in the house.',
    correct: 'was',
    wrong: ['have been', 'am', 'was being'],
    why: 'A finished period of your life takes the past simple.',
    level: 1,
  },
  {
    text: 'The parcel ␣ last Tuesday.',
    correct: 'arrived',
    wrong: ['has arrived', 'arrives', 'has been arriving'],
    why: '"last Tuesday" is finished time — past simple.',
    level: 1,
  },
];

/**
 * Modals. The item that matters most is "must not" vs "do not have to":
 * these look like opposites of the same thing but mean forbidden and
 * unnecessary, and confusing them can be genuinely serious in a hospital or
 * a pharmacy.
 */
export const MODALS: AuthoredItem[] = [
  {
    text: 'You ␣ smoke here — this is a hospital.',
    correct: 'must not',
    wrong: ['do not have to', 'need not', 'might not'],
    why: '"must not" means it is forbidden. "Do not have to" would mean it is simply not necessary.',
    level: 2,
  },
  {
    text: 'You ␣ pay — the bus is free for over-sixties.',
    correct: 'do not have to',
    wrong: ['must not', 'cannot', 'should not'],
    why: '"Do not have to" means it is not necessary. "Must not" would mean paying is forbidden.',
    level: 2,
  },
  {
    text: 'I ␣ read the small print without my glasses.',
    correct: 'cannot',
    wrong: ['must not', 'do not have to', 'may not'],
    why: '"cannot" is about ability — it is not possible for me.',
    level: 1,
  },
  {
    text: 'You look tired. You ␣ sit down for a while.',
    correct: 'should',
    wrong: ['must not', 'cannot', 'do not have to'],
    why: '"should" gives friendly advice.',
    level: 1,
  },
  {
    text: 'She ␣ be at home — her car is outside and the lights are on.',
    correct: 'must',
    wrong: ['cannot', 'need not', 'should not'],
    why: '"must" here is not an order. It means: I am confident this is true.',
    level: 3,
  },
  {
    text: 'He ␣ be at home — I saw him in town ten minutes ago.',
    correct: 'cannot',
    wrong: ['must', 'should', 'need not'],
    why: '"cannot" here means: I am confident this is not true. It is the opposite of "must be".',
    level: 3,
  },
  {
    text: 'It ␣ rain this afternoon, so take an umbrella just in case.',
    correct: 'might',
    wrong: ['must', 'cannot', 'should not'],
    why: '"might" means it is possible but not certain.',
    level: 2,
  },
  {
    text: 'You ␣ worry about the results — everything was normal.',
    correct: 'need not',
    wrong: ['must not', 'cannot', 'should not have'],
    why: '"need not" means there is no reason to.',
    level: 3,
  },
  {
    text: 'When I was young, I ␣ walk five miles without stopping.',
    correct: 'could',
    wrong: ['can', 'must', 'should'],
    why: '"could" is the past of "can" — an ability you had then.',
    level: 2,
  },
  {
    text: 'Visitors ␣ report to reception before going to the wards.',
    correct: 'must',
    wrong: ['need not', 'might', 'could not'],
    why: '"must" states a rule.',
    level: 2,
  },
];

/** say / tell / speak / talk. One verb covers most of these in Slavic languages. */
export const SAY_TELL: AuthoredItem[] = [
  {
    text: 'Could you ␣ me your address, please?',
    correct: 'tell',
    wrong: ['say', 'speak', 'talk'],
    why: '"tell" is followed directly by the person: tell me, tell her, tell the doctor.',
    level: 1,
  },
  {
    text: 'She did not ␣ anything about the letter.',
    correct: 'say',
    wrong: ['tell', 'speak', 'talk'],
    why: '"say" is followed by the words, not the person. To add the person you need "to": say something to her.',
    level: 1,
  },
  {
    text: 'He ␣ three languages fluently.',
    correct: 'speaks',
    wrong: ['says', 'tells', 'talks'],
    why: 'Only "speak" is used with the name of a language.',
    level: 1,
  },
  {
    text: 'I need to ␣ to you about Sunday.',
    correct: 'talk',
    wrong: ['say', 'tell', 'speak about'],
    why: '"talk to someone about something" is the normal pattern for a conversation.',
    level: 2,
  },
  {
    text: '␣ me the truth — were you frightened?',
    correct: 'Tell',
    wrong: ['Say', 'Speak', 'Talk'],
    why: '"tell the truth", "tell a lie", "tell a story" and "tell a joke" are fixed with "tell".',
    level: 2,
  },
  {
    text: 'What did the doctor ␣ about your knee?',
    correct: 'say',
    wrong: ['tell', 'speak', 'talk'],
    why: 'There is no person after the verb here, so it is "say".',
    level: 2,
  },
  {
    text: 'He ␣ us a long story about the war.',
    correct: 'told',
    wrong: ['said', 'spoke', 'talked'],
    why: '"tell someone something" — the person comes straight after the verb.',
    level: 2,
  },
  {
    text: 'Please do not ␣ to me in that tone.',
    correct: 'speak',
    wrong: ['say', 'tell', 'talk about'],
    why: '"speak to someone" is used about the manner of speaking.',
    level: 3,
  },
];

/**
 * Question word order. English requires do/does support and keeps the main
 * verb in its base form -- two things Ukrainian and Russian questions do not
 * need, so the errors here are extremely consistent.
 */
export const QUESTION_ITEMS: {
  wh: string;
  subject: string;
  third: boolean;
  base: string;
  /** Third-person -s form, used to build the "double marking" distractor. */
  s: string;
  rest: string;
  level: 1 | 2 | 3;
}[] = [
  { wh: 'Where', subject: 'you', third: false, base: 'live', s: 'lives', rest: '', level: 1 },
  { wh: 'What time', subject: 'the chemist', third: true, base: 'close', s: 'closes', rest: '', level: 1 },
  { wh: 'When', subject: 'the bus', third: true, base: 'arrive', s: 'arrives', rest: '', level: 1 },
  { wh: 'Why', subject: 'she', third: true, base: 'want', s: 'wants', rest: 'to move', level: 2 },
  { wh: 'How often', subject: 'you', third: false, base: 'see', s: 'sees', rest: 'the doctor', level: 2 },
  { wh: 'Where', subject: 'your daughter', third: true, base: 'work', s: 'works', rest: '', level: 1 },
  { wh: 'What', subject: 'they', third: false, base: 'need', s: 'needs', rest: 'from the shop', level: 2 },
  { wh: 'How much', subject: 'it', third: true, base: 'cost', s: 'costs', rest: '', level: 1 },
  { wh: 'When', subject: 'you', third: false, base: 'take', s: 'takes', rest: 'your tablets', level: 2 },
  { wh: 'Why', subject: 'the shop', third: true, base: 'open', s: 'opens', rest: 'so late', level: 3 },
  { wh: 'How', subject: 'your husband', third: true, base: 'feel', s: 'feels', rest: 'today', level: 2 },
  { wh: 'What', subject: 'the nurse', third: true, base: 'say', s: 'says', rest: 'about it', level: 3 },
];

/**
 * The full item pool for an authored skill: the hand-written items plus any
 * reviewed AI-generated pack items for the same skill.
 */
export function withPack(base: AuthoredItem[], packed: AuthoredItem[] | undefined): AuthoredItem[] {
  return packed?.length ? [...base, ...packed] : base;
}
