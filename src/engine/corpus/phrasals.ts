export interface Phrasal {
  verb: string;
  /** English meaning. Doubles as an answer option, so it stays in English. */
  meaning: string;
  /** Russian meaning, used only in explanations. */
  ru: string;
  /** Sentence using the phrasal verb naturally; ␣ marks where it goes. */
  example: string;
  level: 1 | 2 | 3;
}

/**
 * Phrasal verbs have no equivalent structure in Ukrainian or Russian, so they
 * are learned one at a time. Each entry doubles as a distractor for the others:
 * a wrong meaning here is always another real phrasal verb's meaning, which
 * makes the question a genuine test rather than a process of elimination.
 */
export const PHRASALS: Phrasal[] = [
  { verb: 'give up', meaning: 'stop doing something permanently', ru: 'бросить, перестать делать что-то навсегда', example: 'He decided to ␣ smoking after forty years.', level: 1 },
  { verb: 'look after', meaning: 'take care of someone or something', ru: 'заботиться, присматривать за кем-то', example: 'She has to ␣ her grandchildren on Fridays.', level: 1 },
  { verb: 'put off', meaning: 'postpone to a later time', ru: 'отложить на более поздний срок', example: 'We had to ␣ the appointment until next week.', level: 2 },
  { verb: 'turn down', meaning: 'refuse an offer', ru: 'отказаться от предложения', example: 'He decided to ␣ the job because of the travel.', level: 2 },
  { verb: 'get over', meaning: 'recover from an illness or a shock', ru: 'оправиться после болезни или потрясения', example: 'It took her a month to ␣ the flu.', level: 2 },
  { verb: 'run out of', meaning: 'have none of something left', ru: 'израсходовать, остаться без чего-то', example: 'We always seem to ␣ milk on a Sunday.', level: 1 },
  { verb: 'fill in', meaning: 'complete a form with information', ru: 'заполнить бланк', example: 'Please ␣ this form and return it to reception.', level: 1 },
  { verb: 'pick up', meaning: 'collect someone or something', ru: 'забрать, зайти за чем-то', example: 'I will ␣ the prescription on my way home.', level: 1 },
  { verb: 'take off', meaning: 'remove a piece of clothing', ru: 'снять с себя одежду', example: 'Please ␣ your coat and sit down.', level: 1 },
  { verb: 'put on', meaning: 'begin to wear something', ru: 'надеть', example: 'Do not forget to ␣ your hat — it is cold.', level: 1 },
  { verb: 'look for', meaning: 'try to find something', ru: 'искать', example: 'I need to ␣ my reading glasses.', level: 1 },
  { verb: 'find out', meaning: 'discover a fact by asking or checking', ru: 'выяснить, узнать', example: 'Could you ␣ what time the doctor opens?', level: 2 },
  { verb: 'turn up', meaning: 'arrive, often unexpectedly', ru: 'появиться, часто неожиданно', example: 'My son might ␣ at the door with flowers.', level: 2 },
  { verb: 'call off', meaning: 'cancel a planned event', ru: 'отменить намеченное', example: 'They had to ␣ the concert because of the storm.', level: 2 },
  { verb: 'pass away', meaning: 'die (a gentle, polite way to say it)', ru: 'уйти из жизни (мягкий, деликатный оборот)', example: 'She hoped to ␣ peacefully at home.', level: 2 },
  { verb: 'cut down on', meaning: 'reduce the amount of something', ru: 'сократить количество чего-то', example: 'The doctor told him to ␣ salt.', level: 3 },
  { verb: 'get by', meaning: 'manage with just enough money or skill', ru: 'обходиться малым, сводить концы с концами', example: 'They manage to ␣ on a small pension.', level: 3 },
  { verb: 'look forward to', meaning: 'feel pleased about something that will happen', ru: 'ждать чего-то с радостью', example: 'I always ␣ seeing you on Sunday.', level: 2 },
  { verb: 'bring up', meaning: 'raise a child', ru: 'растить, воспитывать детей', example: 'She managed to ␣ four children on her own.', level: 3 },
  { verb: 'come across', meaning: 'find something by chance', ru: 'случайно наткнуться, найти', example: 'You sometimes ␣ old photographs in a drawer.', level: 3 },
  { verb: 'sort out', meaning: 'organise or solve a problem', ru: 'разобраться, уладить', example: 'The bank will ␣ the mistake on your account.', level: 2 },
  { verb: 'go off', meaning: 'become bad or sour (of food)', ru: 'испортиться (о продуктах)', example: 'Milk will ␣ quickly in this heat.', level: 3 },
  { verb: 'drop off', meaning: 'fall asleep without intending to', ru: 'задремать, незаметно уснуть', example: 'He tends to ␣ in the armchair after lunch.', level: 3 },
  { verb: 'settle in', meaning: 'become comfortable in a new place', ru: 'освоиться на новом месте', example: 'It took them a year to ␣ at the new flat.', level: 3 },
];
