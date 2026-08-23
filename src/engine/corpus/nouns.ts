/**
 * Noun bank.
 *
 * `vowelSound` is about pronunciation, not spelling -- "an hour", "a university".
 * Getting this wrong would teach the learner the wrong rule, so it is tagged by
 * hand rather than derived from the first letter.
 */
export interface Noun {
  s: string;
  /** Plural form. Absent for uncountable nouns. */
  p?: string;
  vowelSound?: boolean;
  level: 1 | 2 | 3;
  /**
   * What sort of thing this is. Frames declare which kinds they accept, which
   * is what stops the generator producing "He gave me a garden for my
   * birthday" -- correct English about an event that does not happen.
   */
  kind: NounKind;
}

export type NounKind = 'thing' | 'place' | 'room' | 'person' | 'abstract';

/** Everyday singular countable nouns -- the backbone of article practice. */
export const COUNTABLE: Noun[] = [
  { s: 'car', p: 'cars', level: 1, kind: 'thing' },
  { s: 'house', p: 'houses', level: 1, kind: 'room' },
  { s: 'book', p: 'books', level: 1, kind: 'thing' },
  { s: 'table', p: 'tables', level: 1, kind: 'thing' },
  { s: 'window', p: 'windows', level: 1, kind: 'thing' },
  { s: 'door', p: 'doors', level: 1, kind: 'thing' },
  { s: 'letter', p: 'letters', level: 1, kind: 'thing' },
  { s: 'garden', p: 'gardens', level: 1, kind: 'room' },
  { s: 'chair', p: 'chairs', level: 1, kind: 'thing' },
  { s: 'phone', p: 'phones', level: 1, kind: 'thing' },
  { s: 'ticket', p: 'tickets', level: 1, kind: 'thing' },
  { s: 'kitchen', p: 'kitchens', level: 1, kind: 'room' },
  { s: 'dog', p: 'dogs', level: 1, kind: 'thing' },
  { s: 'shop', p: 'shops', level: 1, kind: 'place' },
  { s: 'bus', p: 'buses', level: 1, kind: 'thing' },
  { s: 'key', p: 'keys', level: 1, kind: 'thing' },
  { s: 'coat', p: 'coats', level: 1, kind: 'thing' },
  { s: 'neighbour', p: 'neighbours', level: 2, kind: 'person' },
  { s: 'pharmacy', p: 'pharmacies', level: 2, kind: 'place' },
  { s: 'passport', p: 'passports', level: 2, kind: 'thing' },
  { s: 'blanket', p: 'blankets', level: 2, kind: 'thing' },
  { s: 'parcel', p: 'parcels', level: 2, kind: 'thing' },
  { s: 'balcony', p: 'balconies', level: 2, kind: 'room' },
  { s: 'receipt', p: 'receipts', level: 2, kind: 'thing' },
  { s: 'wheelchair', p: 'wheelchairs', level: 2, kind: 'thing' },
  { s: 'prescription', p: 'prescriptions', level: 3, kind: 'thing' },
  { s: 'appointment', p: 'appointments', level: 3, kind: 'abstract' },
  { s: 'complaint', p: 'complaints', level: 3, kind: 'abstract' },
  { s: 'discount', p: 'discounts', level: 3, kind: 'abstract' },
  // Vowel-sound nouns
  { s: 'apple', p: 'apples', vowelSound: true, level: 1, kind: 'thing' },
  { s: 'egg', p: 'eggs', vowelSound: true, level: 1, kind: 'thing' },
  { s: 'orange', p: 'oranges', vowelSound: true, level: 1, kind: 'thing' },
  { s: 'umbrella', p: 'umbrellas', vowelSound: true, level: 1, kind: 'thing' },
  { s: 'envelope', p: 'envelopes', vowelSound: true, level: 2, kind: 'thing' },
  { s: 'oven', p: 'ovens', vowelSound: true, level: 2, kind: 'thing' },
  { s: 'invitation', p: 'invitations', vowelSound: true, level: 2, kind: 'thing' },
  { s: 'elevator', p: 'elevators', vowelSound: true, level: 2, kind: 'room' },
  { s: 'ambulance', p: 'ambulances', vowelSound: true, level: 2, kind: 'thing' },
  { s: 'operation', p: 'operations', vowelSound: true, level: 3, kind: 'abstract' },
  { s: 'insurance', p: 'insurances', vowelSound: true, level: 3, kind: 'abstract' },
  // Spelling traps: written vowel, consonant sound (and the reverse)
  { s: 'hour', p: 'hours', vowelSound: true, level: 2, kind: 'abstract' },
  { s: 'honest answer', p: 'honest answers', vowelSound: true, level: 3, kind: 'abstract' },
  { s: 'university', p: 'universities', vowelSound: false, level: 2, kind: 'place' },
  { s: 'uniform', p: 'uniforms', vowelSound: false, level: 2, kind: 'thing' },
  { s: 'European hotel', p: 'European hotels', vowelSound: false, level: 3, kind: 'place' },
  { s: 'useful tool', p: 'useful tools', vowelSound: false, level: 3, kind: 'thing' },
];

/**
 * Uncountable nouns. Nearly all of these are countable in Ukrainian and
 * Russian, which is exactly why "informations" and "many advices" are such
 * persistent errors.
 *
 * Each carries its own carrier sentences. Uncountable nouns are semantically
 * far too varied to share frames -- "How much weather do you need?" is
 * grammatically impeccable and completely mad, and a learner cannot tell
 * which of those two facts they are being tested on.
 */
export interface Uncountable {
  s: string;
  level: 1 | 2 | 3;
  /** Generic use with no article; the gap sits where the article would go. */
  article: string;
  /** Carrier sentences for much / a little, with the answer each one needs. */
  quantity: { text: string; answer: 'much' | 'a little' }[];
}

export const UNCOUNTABLE: Uncountable[] = [
  { s: 'information', level: 1, article: 'The council sent us ␣ information about the bins.',
    quantity: [{ text: 'How ␣ information do you need?', answer: 'much' }] },
  { s: 'advice', level: 1, article: 'She gave me some very good ␣ advice.',
    quantity: [{ text: 'He did not give me ␣ advice at all.', answer: 'much' }] },
  { s: 'money', level: 1, article: 'They never had ␣ money when they were young.',
    quantity: [{ text: 'How ␣ money did it cost?', answer: 'much' },
               { text: 'I have only ␣ money left until Friday.', answer: 'a little' }] },
  { s: 'bread', level: 1, article: 'We need ␣ bread before the shops close.',
    quantity: [{ text: 'There is only ␣ bread left.', answer: 'a little' }] },
  { s: 'water', level: 1, article: 'Please bring ␣ water for the tablets.',
    quantity: [{ text: 'There is only ␣ water in the jug.', answer: 'a little' },
               { text: 'How ␣ water should I drink each day?', answer: 'much' }] },
  { s: 'furniture', level: 2, article: 'They sold ␣ furniture when they moved.',
    quantity: [{ text: 'How ␣ furniture will fit in the flat?', answer: 'much' }] },
  { s: 'luggage', level: 2, article: 'We took ␣ luggage on the coach.',
    quantity: [{ text: 'How ␣ luggage are you taking?', answer: 'much' }] },
  { s: 'news', level: 2, article: 'She had ␣ news about her sister.',
    quantity: [{ text: 'There is not ␣ news this evening.', answer: 'much' }] },
  { s: 'weather', level: 1, article: 'We had ␣ dreadful weather all week.',
    quantity: [{ text: 'We have not had ␣ good weather this month.', answer: 'much' }] },
  { s: 'traffic', level: 2, article: 'There was ␣ heavy traffic on the ring road.',
    quantity: [{ text: 'There is not ␣ traffic on a Sunday.', answer: 'much' }] },
  { s: 'homework', level: 1, article: 'The grandchildren have ␣ homework tonight.',
    quantity: [{ text: 'How ␣ homework do they give you?', answer: 'much' }] },
  { s: 'equipment', level: 3, article: 'The hospital lent us ␣ equipment for the bathroom.',
    quantity: [{ text: 'How ␣ equipment do you need at home?', answer: 'much' }] },
  { s: 'research', level: 3, article: 'They are doing ␣ research into the illness.',
    quantity: [{ text: 'How ␣ research has been done on it?', answer: 'much' }] },
  { s: 'progress', level: 2, article: 'She has made ␣ remarkable progress since the operation.',
    quantity: [{ text: 'He has not made ␣ progress this week.', answer: 'much' }] },
  { s: 'knowledge', level: 3, article: 'He has ␣ good knowledge of the area.',
    quantity: [{ text: 'She does not have ␣ knowledge of computers.', answer: 'much' }] },
  { s: 'experience', level: 3, article: 'She has ␣ experience of looking after children.',
    quantity: [{ text: 'He has not had ␣ experience of hospitals.', answer: 'much' }] },
  { s: 'medicine', level: 2, article: 'The chemist gave us ␣ medicine for the cough.',
    quantity: [{ text: 'There is only ␣ medicine left in the bottle.', answer: 'a little' }] },
  { s: 'electricity', level: 2, article: 'The old cottage had no ␣ electricity at all.',
    quantity: [{ text: 'The heater does not use ␣ electricity.', answer: 'much' }] },
  { s: 'rubbish', level: 2, article: 'They collect ␣ rubbish on Wednesdays.',
    quantity: [{ text: 'There is not ␣ rubbish this week.', answer: 'much' }] },
  { s: 'work', level: 1, article: 'There is still ␣ work to do in the garden.',
    quantity: [{ text: 'I do not have ␣ work to do today.', answer: 'much' },
               { text: 'There is only ␣ work left to finish.', answer: 'a little' }] },
];

/** Irregular plurals -- the pattern is unpredictable and must be memorised. */
export const IRREGULAR_PLURALS: { s: string; p: string; level: 1 | 2 | 3 }[] = [
  { s: 'child', p: 'children', level: 1 },
  { s: 'man', p: 'men', level: 1 },
  { s: 'woman', p: 'women', level: 1 },
  { s: 'foot', p: 'feet', level: 1 },
  { s: 'tooth', p: 'teeth', level: 1 },
  { s: 'person', p: 'people', level: 1 },
  { s: 'mouse', p: 'mice', level: 2 },
  { s: 'goose', p: 'geese', level: 3 },
  { s: 'knife', p: 'knives', level: 2 },
  { s: 'wife', p: 'wives', level: 2 },
  { s: 'leaf', p: 'leaves', level: 2 },
  { s: 'shelf', p: 'shelves', level: 2 },
  { s: 'loaf', p: 'loaves', level: 2 },
  { s: 'life', p: 'lives', level: 2 },
  { s: 'sheep', p: 'sheep', level: 2 },
  { s: 'fish', p: 'fish', level: 2 },
  { s: 'aircraft', p: 'aircraft', level: 3 },
  { s: 'analysis', p: 'analyses', level: 3 },
  { s: 'crisis', p: 'crises', level: 3 },
];

/** Regular plurals, included so plural questions are not always irregular. */
export const REGULAR_PLURALS: { s: string; p: string; level: 1 | 2 | 3 }[] = [
  { s: 'box', p: 'boxes', level: 1 },
  { s: 'watch', p: 'watches', level: 1 },
  { s: 'dish', p: 'dishes', level: 1 },
  { s: 'baby', p: 'babies', level: 1 },
  { s: 'city', p: 'cities', level: 1 },
  { s: 'party', p: 'parties', level: 2 },
  { s: 'bus', p: 'buses', level: 1 },
  { s: 'potato', p: 'potatoes', level: 2 },
  { s: 'tomato', p: 'tomatoes', level: 2 },
  { s: 'photo', p: 'photos', level: 2 },
  { s: 'piano', p: 'pianos', level: 3 },
  { s: 'roof', p: 'roofs', level: 3 },
];

/**
 * The plural a learner would produce by applying the regular rule. Used to
 * name the mistake in explanations ("not «childs»") and as a distractor.
 * Naively appending "s" gives "progresss" and "boxs", which teaches nothing.
 */
export function regularPlural(word: string): string {
  if (/(s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  if (/[^aeiou]o$/i.test(word)) return `${word}es`;
  return `${word}s`;
}
