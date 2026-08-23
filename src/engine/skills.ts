import type { Skill } from './types';

/**
 * Every lesson is written to be read aloud comfortably by someone who is not
 * a linguist: short sentences, no grammatical jargon beyond what is named and
 * explained, and an explicit comparison with Ukrainian and Russian wherever
 * the two languages disagree. Naming the interference is the point -- a
 * learner who understands *why* they keep making an error stops making it far
 * sooner than one who is only corrected.
 */
export const SKILLS: Skill[] = [
  {
    id: 'articles',
    title: 'A, An and The',
    category: 'grammar',
    blurb: 'The small words that do not exist in Ukrainian or Russian.',
    lesson: {
      paragraphs: [
        'Ukrainian and Russian have no articles. English uses them constantly, and leaving them out is the single most noticeable sign that someone is a Slavic speaker.',
        'There are only three choices, and one of them is "nothing at all".',
        'Use "a" or "an" the first time you mention one countable thing. Use "the" when the listener already knows which one you mean. Use no article for plurals and uncountable nouns when you are speaking in general.',
        'Whether you write "a" or "an" depends on the sound, not the letter. It is "an hour" because the h is silent, and "a university" because it begins with a "yoo" sound.',
      ],
      examples: [
        { good: 'I bought a car yesterday.', bad: 'I bought car yesterday.', note: 'First mention of one countable thing.' },
        { good: 'I bought a car. The car is red.', note: 'Second mention — now we both know which car.' },
        { good: 'I like dogs.', bad: 'I like the dogs.', note: 'Dogs in general take no article.' },
        { good: 'She gave me good advice.', bad: 'She gave me a good advice.', note: '"Advice" is uncountable.' },
      ],
    },
  },
  {
    id: 'prepositions-time',
    title: 'In, On, At — Time',
    category: 'grammar',
    blurb: 'Which preposition goes with which kind of time.',
    lesson: {
      paragraphs: [
        'Think of these three as boxes of different sizes.',
        '"In" is the big box: months, seasons, years, and parts of the day — in July, in summer, in 1998, in the morning.',
        '"On" is the medium box: single days and dates — on Monday, on my birthday, on the third of May.',
        '"At" is the small box: exact points — at nine o’clock, at midnight, at lunchtime. "At night" is an exception you simply learn.',
        'Some time words take no preposition at all. Never put one before yesterday, today, tomorrow, or after last, next, this and every.',
      ],
      examples: [
        { good: 'The appointment is at nine o’clock.', bad: 'The appointment is in nine o’clock.' },
        { good: 'I saw her on Monday.', bad: 'I saw her in Monday.' },
        { good: 'We moved here in 1998.' },
        { good: 'I saw the doctor yesterday.', bad: 'I saw the doctor at yesterday.' },
      ],
    },
  },
  {
    id: 'prepositions-place',
    title: 'In, On, At — Place',
    category: 'grammar',
    blurb: 'Inside, on a surface, or at a point.',
    lesson: {
      paragraphs: [
        '"In" means inside something: in the kitchen, in the car, in my pocket, in London.',
        '"On" means touching a surface: on the table, on the wall, on the second floor.',
        '"At" marks a point or a purpose: at the bus stop, at home, at work, at the doctor’s.',
        'Transport is the one that catches everybody out. It is "in the car" and "in a taxi", but "on the bus", "on the train" and "on the plane" — because you can stand up and walk about in those.',
      ],
      examples: [
        { good: 'She is waiting at the bus stop.' },
        { good: 'Your glasses are on the table.' },
        { good: 'I left my bag in the car.', bad: 'I left my bag on the car.' },
        { good: 'I am at home this evening.', bad: 'I am in home this evening.' },
      ],
    },
  },
  {
    id: 'past-simple',
    title: 'Past Simple',
    category: 'grammar',
    blurb: 'Regular "-ed" endings, and the irregular verbs that ignore them.',
    lesson: {
      paragraphs: [
        'Most English verbs form the past by adding "-ed": walk becomes walked, call becomes called.',
        'About two hundred common verbs do not follow this rule, and unfortunately they are the ones you need most often: go becomes went, buy becomes bought, see becomes saw.',
        'There is no rule to work these out. They are learned as a set of three forms — go, went, gone — and it is worth learning all three together, because the third one is needed for the present perfect.',
        'The most common mistake is applying the regular rule anyway, and producing words like "goed" or "buyed". If a verb feels irregular, it probably is.',
      ],
      examples: [
        { good: 'I went to the doctor yesterday.', bad: 'I goed to the doctor yesterday.' },
        { good: 'She bought a newspaper.', bad: 'She buyed a newspaper.' },
        { good: 'We walked to the shops.', note: 'Regular verb — just add "-ed".' },
      ],
    },
  },
  {
    id: 'present-perfect',
    title: 'Present Perfect or Past Simple',
    category: 'grammar',
    blurb: 'The tense that has no direct equivalent in Ukrainian or Russian.',
    lesson: {
      paragraphs: [
        'This is the hardest tense for Slavic speakers, because there is nothing quite like it in Ukrainian or Russian. Both languages use aspect — finished or unfinished — where English uses a choice of tense.',
        'Use the past simple when the time is finished and you could name it: yesterday, last week, in 1998, two days ago. If the sentence contains one of those, the past simple is the only possibility.',
        'Use the present perfect — "have" or "has" plus the third verb form — when the time period is still open, or when the past action matters because of its result right now.',
        'A quick test: if you can ask "when exactly?" and give an answer, use the past simple.',
      ],
      examples: [
        { good: 'I have lived here since 1998.', bad: 'I live here since 1998.', note: '"Since" — still true now.' },
        { good: 'We bought this house in 1987.', bad: 'We have bought this house in 1987.', note: 'A named, finished year.' },
        { good: 'She has lost her keys.', note: 'The result matters now — she cannot get in.' },
        { good: 'She lost her keys on Tuesday.', note: 'A finished day, so past simple.' },
      ],
    },
  },
  {
    id: 'countability',
    title: 'Much, Many, A Few, A Little',
    category: 'grammar',
    blurb: 'Nouns you can count, and nouns you cannot.',
    lesson: {
      paragraphs: [
        'English divides nouns into two kinds. Countable nouns can be counted one by one and have a plural: one chair, two chairs. Uncountable nouns cannot, and have no plural at all.',
        'The trouble is that English and Slavic languages disagree about which nouns are which. Information, advice, furniture, luggage, news and money are all uncountable in English, even though they are perfectly countable in Ukrainian and Russian.',
        'So there is no such word as "informations" or "advices", and you cannot say "many money".',
        'Use "many" and "a few" with countable plurals. Use "much" and "a little" with uncountable nouns.',
      ],
      examples: [
        { good: 'How much information do you need?', bad: 'How many informations do you need?' },
        { good: 'She gave me some good advice.', bad: 'She gave me some good advices.' },
        { good: 'There are a few chairs left.', note: 'Countable — "a few".' },
        { good: 'There is a little bread left.', note: 'Uncountable — "a little".' },
      ],
    },
  },
  {
    id: 'question-order',
    title: 'Question Word Order',
    category: 'grammar',
    blurb: 'Why English questions need "do" and "does".',
    lesson: {
      paragraphs: [
        'In Ukrainian and Russian you can turn a statement into a question just by changing your voice. English will not allow this in writing, and it sounds wrong in speech.',
        'English needs a helper verb. For most present-tense questions that helper is "do", or "does" if the subject is he, she or it.',
        'The order is fixed: question word, then do or does, then the subject, then the plain form of the verb. Where do you live? What time does the chemist close?',
        'One warning: the "-s" moves onto "does" and disappears from the main verb. It is "does she work", never "does she works".',
      ],
      examples: [
        { good: 'Where do you live?', bad: 'Where you live?' },
        { good: 'What time does the chemist close?', bad: 'What time the chemist closes?' },
        { good: 'Why does she want to move?', bad: 'Why does she wants to move?' },
      ],
    },
  },
  {
    id: 'phrasal-verbs',
    title: 'Phrasal Verbs',
    category: 'vocabulary',
    blurb: 'Ordinary verbs that change meaning when a small word is added.',
    lesson: {
      paragraphs: [
        'A phrasal verb is a verb plus a small word — up, off, after, out — where the pair means something you could never guess from the two parts.',
        '"Give" means to hand over. "Give up" means to stop doing something permanently. There is no connection between the two, and no equivalent structure in Ukrainian or Russian.',
        'This means they cannot be worked out. Each one is learned as a single vocabulary item, exactly like a new word.',
        'They are extremely common in everyday speech, especially with doctors, shopkeepers and neighbours, so they are worth the effort.',
      ],
      examples: [
        { good: 'He gave up smoking.', note: 'give up = stop permanently' },
        { good: 'Could you look after the cat?', note: 'look after = take care of' },
        { good: 'We had to put off the appointment.', note: 'put off = postpone' },
        { good: 'Please fill in this form.', note: 'fill in = complete' },
      ],
    },
  },
  {
    id: 'confusables',
    title: 'False Friends',
    category: 'vocabulary',
    blurb: 'English words that look familiar but mean something else.',
    lesson: {
      paragraphs: [
        'Some English words look almost exactly like a Ukrainian or Russian word, which makes them feel safe to use. Often they mean something completely different.',
        'A «магазин» is a shop, but an English "magazine" is something you read. «Актуальний» means current, but "actual" means real. «Симпатичний» means attractive, but "sympathetic" means kind about someone’s trouble.',
        'These are worth learning deliberately, because you will never notice the mistake yourself — the word feels correct.',
        'This section also covers pairs that are genuinely difficult for everyone, like borrow and lend, or bring and take, where English marks a direction that Slavic languages leave to context.',
      ],
      examples: [
        { good: 'I bought bread at the shop.', bad: 'I bought bread at the magazine.' },
        { good: 'She was very sympathetic about my illness.', note: 'Kind — not good-looking.' },
        { good: 'Could I borrow your pen?', note: 'It comes to me.' },
        { good: 'Could you lend me your pen?', note: 'It goes from you.' },
      ],
    },
  },
  {
    id: 'vocabulary',
    title: 'Everyday Vocabulary',
    category: 'vocabulary',
    blurb: 'Words for appointments, the home, money, weather and getting about.',
    lesson: {
      paragraphs: [
        'This section covers the words you actually need in an ordinary week: at the chemist, on the telephone to the council, at the bus stop, talking to a neighbour.',
        'Each question either gives you a meaning and asks for the word, gives you the word and asks for its meaning, or gives you a sentence with a gap.',
        'The wrong answers are always words from the same subject, so you cannot get there by guessing the topic. You have to know the word.',
      ],
      examples: [
        { good: 'I have an appointment with the nurse at ten.' },
        { good: 'The chemist is next to the post office.', note: 'A "chemist" is a pharmacy in British English.' },
        { good: 'His pension arrives on the third of the month.' },
      ],
    },
  },
  {
    id: 'plurals',
    title: 'Plurals',
    category: 'grammar',
    blurb: 'Regular endings, and the ones that change completely.',
    lesson: {
      paragraphs: [
        'Most English nouns add "-s". Nouns ending in s, x, ch or sh add "-es": boxes, watches, dishes. Nouns ending in a consonant plus y change to "-ies": baby becomes babies.',
        'A small group changes completely and must be memorised: child becomes children, man becomes men, foot becomes feet, person becomes people.',
        'Words ending in "-f" or "-fe" usually change to "-ves": knife becomes knives, leaf becomes leaves. But roof becomes roofs.',
        'A few nouns do not change at all: one sheep, two sheep; one fish, two fish.',
      ],
      examples: [
        { good: 'two children', bad: 'two childs' },
        { good: 'my feet hurt', bad: 'my foots hurt' },
        { good: 'three boxes' },
        { good: 'two sheep', bad: 'two sheeps' },
      ],
    },
  },
  {
    id: 'comparatives',
    title: 'Comparing Things',
    category: 'grammar',
    blurb: 'Colder, more comfortable, the best.',
    lesson: {
      paragraphs: [
        'Short adjectives add "-er" to compare and "-est" for the highest degree: cold, colder, the coldest.',
        'Longer adjectives use "more" and "the most" instead: comfortable, more comfortable, the most comfortable.',
        'A handful are irregular and must be learned: good, better, the best. Bad, worse, the worst.',
        'The commonest mistake is using both at once. "More colder" and "the most best" are always wrong — choose one method, never both.',
        'Remember that the highest degree almost always takes "the": the coldest day, the most expensive shop.',
      ],
      examples: [
        { good: 'Today is colder than yesterday.', bad: 'Today is more cold than yesterday.' },
        { good: 'This chair is more comfortable.', bad: 'This chair is comfortabler.' },
        { good: 'It was the best day of the holiday.', bad: 'It was the most best day.' },
      ],
    },
  },
  {
    id: 'modals',
    title: 'Must, Should, Can',
    category: 'grammar',
    blurb: 'Obligation, advice, possibility — and one dangerous pair.',
    lesson: {
      paragraphs: [
        'Modal verbs add an attitude to the main verb: how necessary, how likely, how advisable something is.',
        '"Must" states a rule or a strong obligation. "Should" gives advice. "Can" and "could" are about ability. "Might" means something is possible but not certain.',
        'One pair matters more than all the others. "Must not" means forbidden. "Do not have to" means not necessary. They look like opposites of the same idea, but they are completely different — and mixing them up in a hospital or a pharmacy could be serious.',
        '"You must not take this medicine" and "you do not have to take this medicine" are very different instructions.',
        'Modals are also used for conclusions. "She must be at home" does not order her to be there — it means you are confident that she is.',
      ],
      examples: [
        { good: 'You must not smoke here.', note: 'Forbidden.' },
        { good: 'You do not have to pay.', note: 'Not necessary — you may if you wish.' },
        { good: 'You should sit down for a while.', note: 'Advice.' },
        { good: 'She must be at home — her car is outside.', note: 'A confident conclusion.' },
      ],
    },
  },
  {
    id: 'make-do',
    title: 'Make or Do',
    category: 'usage',
    blurb: 'One verb in your language, two in English.',
    lesson: {
      paragraphs: [
        'Ukrainian and Russian manage with one verb where English insists on two, so this has to be learned pair by pair.',
        'As a rough guide, "make" is for creating or producing something: make a cake, make a phone call, make a mistake, make an appointment.',
        '"Do" is for tasks, jobs and activities, often ones that are repeated: do the shopping, do the washing-up, do your homework, do someone a favour.',
        'The guide helps, but it is not reliable — the safest approach is to learn each combination as a fixed phrase, the way you learned "good morning".',
      ],
      examples: [
        { good: 'I need to make a phone call.', bad: 'I need to do a phone call.' },
        { good: 'She is doing the shopping.', bad: 'She is making the shopping.' },
        { good: 'He made a mistake on the form.' },
        { good: 'Could you do me a favour?' },
      ],
    },
  },
  {
    id: 'say-tell',
    title: 'Say, Tell, Speak, Talk',
    category: 'usage',
    blurb: 'Four English verbs for one idea.',
    lesson: {
      paragraphs: [
        'The difference is mostly about what comes next in the sentence.',
        '"Tell" is followed straight away by the person: tell me, tell her, tell the doctor. "Say" is followed by the words, not the person — and if you want to add the person you need "to": she said nothing to me.',
        '"Speak" is used with languages, and about the manner of speaking: he speaks three languages; please do not speak to me like that.',
        '"Talk" is for a conversation between people: I need to talk to you about Sunday.',
        'A few phrases are fixed with "tell" and simply have to be remembered: tell the truth, tell a lie, tell a story, tell a joke.',
      ],
      examples: [
        { good: 'Could you tell me your address?', bad: 'Could you say me your address?' },
        { good: 'She did not say anything.', bad: 'She did not tell anything.' },
        { good: 'He speaks three languages.' },
        { good: 'I need to talk to you.' },
      ],
    },
  },
  {
    id: 'dependent-prepositions',
    title: 'Words That Need a Preposition',
    category: 'usage',
    blurb: 'Depend on, listen to, wait for — pairs with no logic.',
    lesson: {
      paragraphs: [
        'Many English verbs and adjectives demand one particular preposition and refuse all others. It depends on the weather — never "depends from".',
        'There is no rule behind these pairs, and the preposition your own language uses is often a different one, which is exactly why the errors are so persistent.',
        'The practical approach is to learn the two words as one item. Not "depend", but "depend on". Not "interested", but "interested in".',
        'When you meet a new verb, it is worth noticing the preposition that follows it and learning them together from the start.',
      ],
      examples: [
        { good: 'It depends on the weather.', bad: 'It depends from the weather.' },
        { good: 'I listen to the radio.', bad: 'I listen the radio.' },
        { good: 'We waited for the bus.', bad: 'We waited the bus.' },
        { good: 'She is interested in history.', bad: 'She is interested for history.' },
      ],
    },
  },
];

export const SKILL_BY_ID = new Map(SKILLS.map((s) => [s.id, s]));
