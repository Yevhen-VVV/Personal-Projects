/**
 * Word pairs that Ukrainian and Russian speakers mix up.
 *
 * Most of these are false friends: a word that looks like a familiar word in
 * the first language but means something else in English. The `trap` field is
 * shown after answering, because naming the interference explicitly is what
 * makes the correction stick.
 */
export interface ConfusableGroup {
  id: string;
  words: { w: string; gloss: string }[];
  trap?: string;
  items: { text: string; answer: string; level: 1 | 2 | 3 }[];
}

export const CONFUSABLES: ConfusableGroup[] = [
  {
    id: 'actually-currently',
    words: [
      { w: 'actually', gloss: 'in fact; contrary to what you might think' },
      { w: 'currently', gloss: 'at the present time; now' },
    ],
    trap: '«актуальний / актуальный» means current, not "actual". English "actually" corrects a wrong impression.',
    items: [
      { text: 'She ␣ works at the pharmacy on the high street.', answer: 'currently', level: 2 },
      { text: 'I thought the film would be long, but it was ␣ quite short.', answer: 'actually', level: 2 },
    ],
  },
  {
    id: 'actual-current',
    words: [
      { w: 'actual', gloss: 'real; exact, as opposed to estimated' },
      { w: 'current', gloss: 'of the present time' },
    ],
    trap: 'For "up to date", English uses current. "Actual" means real or exact.',
    items: [
      { text: 'What is the ␣ price, including delivery?', answer: 'actual', level: 2 },
      { text: 'Please write your ␣ address on the form.', answer: 'current', level: 2 },
    ],
  },
  {
    id: 'shop-magazine',
    words: [
      { w: 'shop', gloss: 'a place where you buy things' },
      { w: 'magazine', gloss: 'a thin publication you read, printed weekly or monthly' },
    ],
    trap: '«магазин» is a shop. An English "magazine" is something you read.',
    items: [
      { text: 'I bought the bread at the ␣ on the corner.', answer: 'shop', level: 1 },
      { text: 'She reads a gardening ␣ every month.', answer: 'magazine', level: 1 },
    ],
  },
  {
    id: 'neat-accurate',
    words: [
      { w: 'neat', gloss: 'tidy; carefully arranged' },
      { w: 'accurate', gloss: 'correct in every detail; free from error' },
    ],
    trap: '«акуратний / аккуратный» usually means neat or careful, not "accurate".',
    items: [
      { text: 'His handwriting is very ␣ and easy to read.', answer: 'neat', level: 2 },
      { text: 'The kitchen clock is not ␣ — it runs five minutes fast.', answer: 'accurate', level: 2 },
    ],
  },
  {
    id: 'attractive-sympathetic',
    words: [
      { w: 'attractive', gloss: 'pleasant to look at; good-looking' },
      { w: 'sympathetic', gloss: 'kind and understanding about someone’s trouble' },
    ],
    trap: '«симпатичний / симпатичный» means attractive. English "sympathetic" is about kindness, not looks.',
    items: [
      { text: 'She was very ␣ when I told her about my illness.', answer: 'sympathetic', level: 2 },
      { text: 'He is a tall, ␣ man of about sixty.', answer: 'attractive', level: 2 },
    ],
  },
  {
    id: 'factory-fabric',
    words: [
      { w: 'factory', gloss: 'a building where goods are manufactured' },
      { w: 'fabric', gloss: 'cloth; material for clothes or curtains' },
    ],
    trap: '«фабрика» is a factory. English "fabric" is cloth.',
    items: [
      { text: 'He worked in a shoe ␣ for thirty years.', answer: 'factory', level: 2 },
      { text: 'This ␣ is too thin for winter curtains.', answer: 'fabric', level: 2 },
    ],
  },
  {
    id: 'receipt-recipe',
    words: [
      { w: 'receipt', gloss: 'the paper proving you paid for something' },
      { w: 'recipe', gloss: 'instructions for cooking a dish' },
    ],
    items: [
      { text: 'Keep the ␣ in case you need to return the kettle.', answer: 'receipt', level: 2 },
      { text: 'This ␣ for apple cake was my mother’s.', answer: 'recipe', level: 2 },
    ],
  },
  {
    id: 'borrow-lend',
    words: [
      { w: 'borrow', gloss: 'take something temporarily — it comes to you' },
      { w: 'lend', gloss: 'give something temporarily — it goes away from you' },
    ],
    trap: 'One verb covers both directions in Ukrainian and Russian. In English the direction decides the word.',
    items: [
      { text: 'Could I ␣ your pen for a moment?', answer: 'borrow', level: 1 },
      { text: 'Could you ␣ me your pen for a moment?', answer: 'lend', level: 1 },
      { text: 'I never ␣ money to friends — it spoils the friendship.', answer: 'lend', level: 2 },
    ],
  },
  {
    id: 'bring-take',
    words: [
      { w: 'bring', gloss: 'carry something towards the speaker' },
      { w: 'take', gloss: 'carry something away from the speaker' },
    ],
    items: [
      { text: 'When you come on Sunday, please ␣ the photographs.', answer: 'bring', level: 2 },
      { text: 'I need to ␣ these letters to the post office.', answer: 'take', level: 2 },
    ],
  },
  {
    id: 'learn-teach',
    words: [
      { w: 'learn', gloss: 'gain knowledge yourself' },
      { w: 'teach', gloss: 'give knowledge to someone else' },
    ],
    trap: '«вчити / учить» covers both. In English you learn something yourself; you teach it to another person.',
    items: [
      { text: 'I want to ␣ how to use a computer.', answer: 'learn', level: 1 },
      { text: 'My daughter is going to ␣ me how to use the tablet.', answer: 'teach', level: 1 },
    ],
  },
  {
    id: 'comfortable-convenient',
    words: [
      { w: 'comfortable', gloss: 'physically pleasant; not causing discomfort' },
      { w: 'convenient', gloss: 'easy to reach or well-timed; not causing trouble' },
    ],
    trap: '«зручний / удобный» covers both. Comfortable is about the body; convenient is about time and effort.',
    items: [
      { text: 'This armchair is much more ␣ than the old one.', answer: 'comfortable', level: 2 },
      { text: 'Would Thursday morning be ␣ for you?', answer: 'convenient', level: 2 },
      { text: 'The flat is very ␣ for the shops and the bus stop.', answer: 'convenient', level: 3 },
    ],
  },
  {
    id: 'watch-see-look',
    words: [
      { w: 'watch', gloss: 'look at something that moves or changes, for a while' },
      { w: 'see', gloss: 'notice with your eyes, or meet by arrangement' },
      { w: 'look at', gloss: 'turn your eyes towards something on purpose' },
    ],
    items: [
      { text: 'I ␣ television every evening after supper.', answer: 'watch', level: 1 },
      { text: 'Did you ␣ the doctor about your knee?', answer: 'see', level: 1 },
      { text: 'Please ␣ this photograph — do you recognise him?', answer: 'look at', level: 1 },
    ],
  },
  {
    id: 'listen-hear',
    words: [
      { w: 'listen to', gloss: 'pay attention to a sound on purpose' },
      { w: 'hear', gloss: 'receive a sound, whether you meant to or not' },
    ],
    items: [
      { text: 'I ␣ the radio while I cook.', answer: 'listen to', level: 1 },
      { text: 'I could not ␣ what she said — the room was too noisy.', answer: 'hear', level: 1 },
    ],
  },
  {
    id: 'sensible-sensitive',
    words: [
      { w: 'sensible', gloss: 'showing good judgement; practical' },
      { w: 'sensitive', gloss: 'easily affected or easily hurt' },
    ],
    items: [
      { text: 'Wear ␣ shoes — the path is uneven.', answer: 'sensible', level: 3 },
      { text: 'My skin is very ␣ to the sun.', answer: 'sensitive', level: 3 },
    ],
  },
  {
    id: 'prescription-subscription',
    words: [
      { w: 'prescription', gloss: 'a doctor’s written order for medicine' },
      { w: 'subscription', gloss: 'a regular payment to receive something' },
    ],
    items: [
      { text: 'The doctor gave me a ␣ for antibiotics.', answer: 'prescription', level: 2 },
      { text: 'I pay a monthly ␣ for the newspaper.', answer: 'subscription', level: 2 },
    ],
  },
  {
    id: 'remember-remind',
    words: [
      { w: 'remember', gloss: 'keep something in your own mind' },
      { w: 'remind', gloss: 'make someone else think of something' },
    ],
    items: [
      { text: 'Please ␣ me to take my tablets at six.', answer: 'remind', level: 2 },
      { text: 'I cannot ␣ where I put my keys.', answer: 'remember', level: 1 },
    ],
  },
  {
    id: 'history-story',
    words: [
      { w: 'history', gloss: 'the record of real past events' },
      { w: 'story', gloss: 'an account of events, often told for pleasure' },
    ],
    items: [
      { text: 'Grandad told us a wonderful ␣ about his childhood.', answer: 'story', level: 1 },
      { text: 'She studied the ␣ of medicine at university.', answer: 'history', level: 2 },
    ],
  },
  {
    id: 'job-work',
    words: [
      { w: 'job', gloss: 'a particular position of employment (countable)' },
      { w: 'work', gloss: 'activity or effort in general (uncountable)' },
    ],
    items: [
      { text: 'He found a new ␣ at the hospital.', answer: 'job', level: 1 },
      { text: 'I have a lot of ␣ to finish before Friday.', answer: 'work', level: 1 },
    ],
  },
  {
    id: 'travel-trip-journey',
    words: [
      { w: 'travel', gloss: 'the verb: to move from place to place' },
      { w: 'trip', gloss: 'a visit somewhere and back, usually short' },
      { w: 'journey', gloss: 'the act of travelling from one place to another' },
    ],
    items: [
      { text: 'We are planning a ␣ to Poland in the spring.', answer: 'trip', level: 2 },
      { text: 'The ␣ from London to Edinburgh takes about five hours.', answer: 'journey', level: 2 },
      { text: 'She loves to ␣ by train rather than by plane.', answer: 'travel', level: 1 },
    ],
  },
  {
    id: 'lose-loose',
    words: [
      { w: 'lose', gloss: 'the verb: to no longer have something' },
      { w: 'loose', gloss: 'the adjective: not tight, not firmly fixed' },
    ],
    items: [
      { text: 'Be careful not to ␣ your gloves on the bus.', answer: 'lose', level: 2 },
      { text: 'This button is ␣ — I should sew it back on.', answer: 'loose', level: 2 },
    ],
  },
  {
    id: 'office-cabinet',
    words: [
      { w: 'office', gloss: 'a room where someone works or sees people' },
      { w: 'cabinet', gloss: 'a cupboard with shelves or drawers' },
    ],
    trap: '«кабінет / кабинет» is an office or a consulting room. An English "cabinet" is a cupboard.',
    items: [
      { text: 'The doctor will see you in her ␣ in a moment.', answer: 'office', level: 2 },
      { text: 'The cups are in the ␣ above the sink.', answer: 'cabinet', level: 2 },
    ],
  },
  {
    id: 'suit-costume',
    words: [
      { w: 'suit', gloss: 'matching jacket and trousers for ordinary wear' },
      { w: 'costume', gloss: 'clothes worn to look like someone else, in a play or at a party' },
    ],
    trap: '«костюм» is usually a suit. An English "costume" is for dressing up.',
    items: [
      { text: 'He wore a dark blue ␣ to the wedding.', answer: 'suit', level: 2 },
      { text: 'She made a pirate ␣ for her grandson.', answer: 'costume', level: 2 },
    ],
  },
  {
    id: 'accident-incident',
    words: [
      { w: 'accident', gloss: 'something harmful that happens by chance' },
      { w: 'incident', gloss: 'an event, often unpleasant, that is treated as notable' },
    ],
    items: [
      { text: 'There was a serious ␣ on the motorway this morning.', answer: 'accident', level: 3 },
      { text: 'The police are investigating the ␣ at the bank.', answer: 'incident', level: 3 },
    ],
  },
];
