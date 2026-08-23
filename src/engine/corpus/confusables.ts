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
      { w: 'actually', gloss: 'на самом деле; вопреки тому, что можно подумать' },
      { w: 'currently', gloss: 'в настоящее время, сейчас' },
    ],
    trap: '«Актуальный» по-английски — current, а не actual. Английское «actually» поправляет неверное впечатление: «на самом деле».',
    items: [
      { text: 'She ␣ works at the pharmacy on the high street.', answer: 'currently', level: 2 },
      { text: 'I thought the film would be long, but it was ␣ quite short.', answer: 'actually', level: 2 },
    ],
  },
  {
    id: 'actual-current',
    words: [
      { w: 'actual', gloss: 'настоящий, точный, в противоположность приблизительному' },
      { w: 'current', gloss: 'нынешний, текущий' },
    ],
    trap: 'В значении «нынешний, действующий» англичане говорят current. «Actual» значит «настоящий, точный».',
    items: [
      { text: 'What is the ␣ price, including delivery?', answer: 'actual', level: 2 },
      { text: 'Please write your ␣ address on the form.', answer: 'current', level: 2 },
    ],
  },
  {
    id: 'shop-magazine',
    words: [
      { w: 'shop', gloss: 'магазин, место, где покупают' },
      { w: 'magazine', gloss: 'журнал, который читают' },
    ],
    trap: 'Английское «magazine» — это журнал, а не магазин.',
    items: [
      { text: 'I bought the bread at the ␣ on the corner.', answer: 'shop', level: 1 },
      { text: 'She reads a gardening ␣ every month.', answer: 'magazine', level: 1 },
    ],
  },
  {
    id: 'neat-accurate',
    words: [
      { w: 'neat', gloss: 'аккуратный, опрятный' },
      { w: 'accurate', gloss: 'точный, без ошибок' },
    ],
    trap: 'Русское «аккуратный» — это neat или careful. «Accurate» значит «точный, без ошибок».',
    items: [
      { text: 'His handwriting is very ␣ and easy to read.', answer: 'neat', level: 2 },
      { text: 'The kitchen clock is not ␣ — it runs five minutes fast.', answer: 'accurate', level: 2 },
    ],
  },
  {
    id: 'attractive-sympathetic',
    words: [
      { w: 'attractive', gloss: 'приятный внешне, симпатичный' },
      { w: 'sympathetic', gloss: 'сочувствующий, с пониманием к чужой беде' },
    ],
    trap: '«Симпатичный» по-английски — attractive. Английское «sympathetic» — про сочувствие, а не про внешность.',
    items: [
      { text: 'She was very ␣ when I told her about my illness.', answer: 'sympathetic', level: 2 },
      { text: 'He is a tall, ␣ man of about sixty.', answer: 'attractive', level: 2 },
    ],
  },
  {
    id: 'factory-fabric',
    words: [
      { w: 'factory', gloss: 'фабрика, завод' },
      { w: 'fabric', gloss: 'ткань, материя' },
    ],
    trap: 'Английское «fabric» — это ткань, а не фабрика.',
    items: [
      { text: 'He worked in a shoe ␣ for thirty years.', answer: 'factory', level: 2 },
      { text: 'This ␣ is too thin for winter curtains.', answer: 'fabric', level: 2 },
    ],
  },
  {
    id: 'receipt-recipe',
    words: [
      { w: 'receipt', gloss: 'чек, подтверждающий оплату' },
      { w: 'recipe', gloss: 'рецепт блюда' },
    ],
    items: [
      { text: 'Keep the ␣ in case you need to return the kettle.', answer: 'receipt', level: 2 },
      { text: 'This ␣ for apple cake was my mother’s.', answer: 'recipe', level: 2 },
    ],
  },
  {
    id: 'borrow-lend',
    words: [
      { w: 'borrow', gloss: 'взять на время, вещь идёт к вам' },
      { w: 'lend', gloss: 'дать на время, вещь уходит от вас' },
    ],
    trap: 'По-русски одно слово «одолжить» работает в обе стороны. В английском направление определяет глагол.',
    items: [
      { text: 'Could I ␣ your pen for a moment?', answer: 'borrow', level: 1 },
      { text: 'Could you ␣ me your pen for a moment?', answer: 'lend', level: 1 },
      { text: 'I never ␣ money to friends — it spoils the friendship.', answer: 'lend', level: 2 },
    ],
  },
  {
    id: 'bring-take',
    words: [
      { w: 'bring', gloss: 'принести сюда, к говорящему' },
      { w: 'take', gloss: 'отнести отсюда, от говорящего' },
    ],
    items: [
      { text: 'When you come on Sunday, please ␣ the photographs.', answer: 'bring', level: 2 },
      { text: 'I need to ␣ these letters to the post office.', answer: 'take', level: 2 },
    ],
  },
  {
    id: 'learn-teach',
    words: [
      { w: 'learn', gloss: 'учиться самому, усваивать знания' },
      { w: 'teach', gloss: 'учить кого-то другого, преподавать' },
    ],
    trap: 'Русское «учить» покрывает оба значения. В английском learn — учиться самому, teach — учить другого.',
    items: [
      { text: 'I want to ␣ how to use a computer.', answer: 'learn', level: 1 },
      { text: 'My daughter is going to ␣ me how to use the tablet.', answer: 'teach', level: 1 },
    ],
  },
  {
    id: 'comfortable-convenient',
    words: [
      { w: 'comfortable', gloss: 'удобный для тела: мягкий, не доставляющий неудобства' },
      { w: 'convenient', gloss: 'удобный по времени или расположению, необременительный' },
    ],
    trap: 'Русское «удобный» покрывает оба значения. Comfortable — про телесное удобство, convenient — про время и усилия.',
    items: [
      { text: 'This armchair is much more ␣ than the old one.', answer: 'comfortable', level: 2 },
      { text: 'Would Thursday morning be ␣ for you?', answer: 'convenient', level: 2 },
      { text: 'The flat is very ␣ for the shops and the bus stop.', answer: 'convenient', level: 3 },
    ],
  },
  {
    id: 'watch-see-look',
    words: [
      { w: 'watch', gloss: 'смотреть какое-то время на то, что движется или меняется' },
      { w: 'see', gloss: 'увидеть; а также встретиться по договорённости' },
      { w: 'look at', gloss: 'намеренно перевести взгляд на что-то' },
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
      { w: 'listen to', gloss: 'слушать намеренно, вслушиваться' },
      { w: 'hear', gloss: 'слышать вне зависимости от вашего намерения' },
    ],
    items: [
      { text: 'I ␣ the radio while I cook.', answer: 'listen to', level: 1 },
      { text: 'I could not ␣ what she said — the room was too noisy.', answer: 'hear', level: 1 },
    ],
  },
  {
    id: 'sensible-sensitive',
    words: [
      { w: 'sensible', gloss: 'благоразумный, практичный' },
      { w: 'sensitive', gloss: 'чувствительный, легко ранимый' },
    ],
    items: [
      { text: 'Wear ␣ shoes — the path is uneven.', answer: 'sensible', level: 3 },
      { text: 'My skin is very ␣ to the sun.', answer: 'sensitive', level: 3 },
    ],
  },
  {
    id: 'prescription-subscription',
    words: [
      { w: 'prescription', gloss: 'рецепт от врача на лекарство' },
      { w: 'subscription', gloss: 'подписка, регулярная оплата' },
    ],
    items: [
      { text: 'The doctor gave me a ␣ for antibiotics.', answer: 'prescription', level: 2 },
      { text: 'I pay a monthly ␣ for the newspaper.', answer: 'subscription', level: 2 },
    ],
  },
  {
    id: 'remember-remind',
    words: [
      { w: 'remember', gloss: 'помнить самому' },
      { w: 'remind', gloss: 'напомнить кому-то другому' },
    ],
    items: [
      { text: 'Please ␣ me to take my tablets at six.', answer: 'remind', level: 2 },
      { text: 'I cannot ␣ where I put my keys.', answer: 'remember', level: 1 },
    ],
  },
  {
    id: 'history-story',
    words: [
      { w: 'history', gloss: 'история как наука о прошлом' },
      { w: 'story', gloss: 'рассказ, история для интереса' },
    ],
    items: [
      { text: 'Grandad told us a wonderful ␣ about his childhood.', answer: 'story', level: 1 },
      { text: 'She studied the ␣ of medicine at university.', answer: 'history', level: 2 },
    ],
  },
  {
    id: 'job-work',
    words: [
      { w: 'job', gloss: 'должность, место работы (исчисляемое)' },
      { w: 'work', gloss: 'работа как занятие вообще (неисчисляемое)' },
    ],
    items: [
      { text: 'He found a new ␣ at the hospital.', answer: 'job', level: 1 },
      { text: 'I have a lot of ␣ to finish before Friday.', answer: 'work', level: 1 },
    ],
  },
  {
    id: 'travel-trip-journey',
    words: [
      { w: 'travel', gloss: 'глагол: путешествовать, ездить' },
      { w: 'trip', gloss: 'поездка туда и обратно, обычно недолгая' },
      { w: 'journey', gloss: 'дорога, путь из одного места в другое' },
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
      { w: 'lose', gloss: 'глагол: потерять' },
      { w: 'loose', gloss: 'прилагательное: свободный, плохо закреплённый' },
    ],
    items: [
      { text: 'Be careful not to ␣ your gloves on the bus.', answer: 'lose', level: 2 },
      { text: 'This button is ␣ — I should sew it back on.', answer: 'loose', level: 2 },
    ],
  },
  {
    id: 'office-cabinet',
    words: [
      { w: 'office', gloss: 'кабинет, рабочая комната или приёмная' },
      { w: 'cabinet', gloss: 'шкафчик с полками или ящиками' },
    ],
    trap: 'Русский «кабинет» по-английски — office. Английское «cabinet» — это шкафчик.',
    items: [
      { text: 'The doctor will see you in her ␣ in a moment.', answer: 'office', level: 2 },
      { text: 'The cups are in the ␣ above the sink.', answer: 'cabinet', level: 2 },
    ],
  },
  {
    id: 'suit-costume',
    words: [
      { w: 'suit', gloss: 'костюм: пиджак и брюки для обычной жизни' },
      { w: 'costume', gloss: 'наряд для роли или маскарада' },
    ],
    trap: 'Костюм по-английски — suit. Английское «costume» — это наряд для роли или маскарада.',
    items: [
      { text: 'He wore a dark blue ␣ to the wedding.', answer: 'suit', level: 2 },
      { text: 'She made a pirate ␣ for her grandson.', answer: 'costume', level: 2 },
    ],
  },
  {
    id: 'accident-incident',
    words: [
      { w: 'accident', gloss: 'несчастный случай, авария' },
      { w: 'incident', gloss: 'происшествие, инцидент' },
    ],
    items: [
      { text: 'There was a serious ␣ on the motorway this morning.', answer: 'accident', level: 3 },
      { text: 'The police are investigating the ␣ at the bank.', answer: 'incident', level: 3 },
    ],
  },
];
