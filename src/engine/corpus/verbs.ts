/**
 * Verb bank.
 *
 * `wrongEd` is the over-regularised form ("goed", "buyed"). It is the single
 * most useful distractor we have: it is exactly the error a learner makes when
 * they apply the regular rule to an irregular verb, so choosing it tells us
 * something real about what they know.
 */
export interface Verb {
  base: string;
  past: string;
  participle: string;
  /** Over-regularised past, used as a distractor. */
  wrongEd: string;
  /** -ing form, used as a distractor in question-order items. */
  ing: string;
  level: 1 | 2 | 3;
}

export const IRREGULAR_VERBS: Verb[] = [
  { base: 'go', past: 'went', participle: 'gone', wrongEd: 'goed', ing: 'going', level: 1 },
  { base: 'buy', past: 'bought', participle: 'bought', wrongEd: 'buyed', ing: 'buying', level: 1 },
  { base: 'see', past: 'saw', participle: 'seen', wrongEd: 'seed', ing: 'seeing', level: 1 },
  { base: 'eat', past: 'ate', participle: 'eaten', wrongEd: 'eated', ing: 'eating', level: 1 },
  { base: 'take', past: 'took', participle: 'taken', wrongEd: 'taked', ing: 'taking', level: 1 },
  { base: 'give', past: 'gave', participle: 'given', wrongEd: 'gived', ing: 'giving', level: 1 },
  { base: 'write', past: 'wrote', participle: 'written', wrongEd: 'writed', ing: 'writing', level: 1 },
  { base: 'speak', past: 'spoke', participle: 'spoken', wrongEd: 'speaked', ing: 'speaking', level: 1 },
  { base: 'drink', past: 'drank', participle: 'drunk', wrongEd: 'drinked', ing: 'drinking', level: 1 },
  { base: 'drive', past: 'drove', participle: 'driven', wrongEd: 'drived', ing: 'driving', level: 1 },
  { base: 'come', past: 'came', participle: 'come', wrongEd: 'comed', ing: 'coming', level: 1 },
  { base: 'make', past: 'made', participle: 'made', wrongEd: 'maked', ing: 'making', level: 1 },
  { base: 'find', past: 'found', participle: 'found', wrongEd: 'finded', ing: 'finding', level: 1 },
  { base: 'know', past: 'knew', participle: 'known', wrongEd: 'knowed', ing: 'knowing', level: 1 },
  { base: 'think', past: 'thought', participle: 'thought', wrongEd: 'thinked', ing: 'thinking', level: 2 },
  { base: 'bring', past: 'brought', participle: 'brought', wrongEd: 'bringed', ing: 'bringing', level: 2 },
  { base: 'teach', past: 'taught', participle: 'taught', wrongEd: 'teached', ing: 'teaching', level: 2 },
  { base: 'catch', past: 'caught', participle: 'caught', wrongEd: 'catched', ing: 'catching', level: 2 },
  { base: 'sleep', past: 'slept', participle: 'slept', wrongEd: 'sleeped', ing: 'sleeping', level: 2 },
  { base: 'leave', past: 'left', participle: 'left', wrongEd: 'leaved', ing: 'leaving', level: 2 },
  { base: 'lose', past: 'lost', participle: 'lost', wrongEd: 'losed', ing: 'losing', level: 2 },
  { base: 'send', past: 'sent', participle: 'sent', wrongEd: 'sended', ing: 'sending', level: 2 },
  { base: 'pay', past: 'paid', participle: 'paid', wrongEd: 'payed', ing: 'paying', level: 2 },
  { base: 'meet', past: 'met', participle: 'met', wrongEd: 'meeted', ing: 'meeting', level: 2 },
  { base: 'sell', past: 'sold', participle: 'sold', wrongEd: 'selled', ing: 'selling', level: 2 },
  { base: 'wear', past: 'wore', participle: 'worn', wrongEd: 'weared', ing: 'wearing', level: 2 },
  { base: 'break', past: 'broke', participle: 'broken', wrongEd: 'breaked', ing: 'breaking', level: 2 },
  { base: 'forget', past: 'forgot', participle: 'forgotten', wrongEd: 'forgetted', ing: 'forgetting', level: 3 },
  { base: 'choose', past: 'chose', participle: 'chosen', wrongEd: 'choosed', ing: 'choosing', level: 3 },
  { base: 'understand', past: 'understood', participle: 'understood', wrongEd: 'understanded', ing: 'understanding', level: 3 },
  { base: 'rise', past: 'rose', participle: 'risen', wrongEd: 'rised', ing: 'rising', level: 3 },
  { base: 'grow', past: 'grew', participle: 'grown', wrongEd: 'growed', ing: 'growing', level: 3 },
];

/** Regular verbs, so past-tense practice is not exclusively irregular. */
export const REGULAR_VERBS: Verb[] = [
  { base: 'walk', past: 'walked', participle: 'walked', wrongEd: 'walkd', ing: 'walking', level: 1 },
  { base: 'watch', past: 'watched', participle: 'watched', wrongEd: 'watchd', ing: 'watching', level: 1 },
  { base: 'call', past: 'called', participle: 'called', wrongEd: 'calld', ing: 'calling', level: 1 },
  { base: 'wait', past: 'waited', participle: 'waited', wrongEd: 'waitd', ing: 'waiting', level: 1 },
  { base: 'live', past: 'lived', participle: 'lived', wrongEd: 'liveed', ing: 'living', level: 1 },
  { base: 'study', past: 'studied', participle: 'studied', wrongEd: 'studyed', ing: 'studying', level: 2 },
  { base: 'carry', past: 'carried', participle: 'carried', wrongEd: 'carryed', ing: 'carrying', level: 2 },
  { base: 'stop', past: 'stopped', participle: 'stopped', wrongEd: 'stoped', ing: 'stopping', level: 2 },
  { base: 'plan', past: 'planned', participle: 'planned', wrongEd: 'planed', ing: 'planning', level: 2 },
  { base: 'travel', past: 'travelled', participle: 'travelled', wrongEd: 'traveled', ing: 'travelling', level: 3 },
];

export const ALL_VERBS: Verb[] = [...IRREGULAR_VERBS, ...REGULAR_VERBS];
