/**
 * Russian interface text.
 *
 * The split is deliberate and runs through the whole app: everything the
 * learner is *tested on* stays in English -- the sentences, the answer options,
 * the vocabulary -- while everything that *explains* is in Russian. Explaining
 * an English rule in English is a second puzzle on top of the first one, and
 * the point of the explanation is that it lands immediately.
 *
 * Keeping every string here means the interface can be checked over by a
 * native speaker in one file, and a second language becomes a copy of it.
 */
export const UI = {
  appTitle: 'Английский язык',
  introNew: 'Короткие уроки и упражнения в вашем темпе. Время нигде не ограничено.',
  introBack: 'С возвращением. Достаточно нескольких вопросов в день.',

  startPractice: 'Начать сегодняшнее занятие',
  practiceHint: '12 вопросов, подобранных для вас. Примерно пять минут.',
  chooseTopic: 'Выбрать тему',
  myProgress: 'Мои успехи',

  answered: 'Отвечено вопросов',
  daysInRow: 'Дней подряд',
  overallProgress: 'Общий прогресс',
  correctShare: 'Правильных ответов',
  topicsLearned: 'Тем усвоено',

  difficultyTitle: 'Насколько сложными делать вопросы?',
  levels: {
    1: { label: 'Начальный', hint: 'Простые предложения и повседневные слова' },
    2: { label: 'Средний', hint: 'Более длинные предложения и больше тем' },
    3: { label: 'Уверенный', hint: 'Сложная лексика и тонкие различия' },
  },

  readingTitle: 'Чтобы читать было удобнее',
  textSize: 'Размер текста',
  sizes: { normal: 'Обычный', large: 'Крупный', largest: 'Самый крупный' },
  darkOn: '🌙 Тёмный фон',
  darkOff: '☀️ Светлый фон',
  speakOn: '🔊 Читать вслух: включено',
  speakOff: '🔇 Читать вслух: выключено',

  back: '← Назад',
  stop: '← Закончить',
  questionOf: (n: number, total: number) => `Вопрос ${n} из ${total}`,
  answersLabel: 'Варианты ответа',
  hearIt: '🔊 Послушать',

  correctHeading: 'Верно.',
  wrongHeading: (answer: string) => `Правильный ответ — «${answer}».`,
  whyYoursWrong: (choice: string) => `Почему «${choice}» не подходит:`,
  whyThisRight: 'Почему это правильно:',
  nextQuestion: 'Следующий вопрос',
  seeResults: 'Посмотреть результат',

  topicsTitle: 'Выберите тему',
  topicsHint: 'В каждой теме сначала короткое объяснение, затем вопросы.',
  categories: { grammar: 'Грамматика', vocabulary: 'Лексика', usage: 'Употребление' },
  statusStrong: 'Усвоено',
  statusDue: 'Пора повторить',
  statusLearning: 'Изучается',

  examples: 'Примеры',
  startTopicPractice: 'Начать упражнения',

  resultsTitle: 'Хорошая работа',
  scoreOf: (right: number, total: number) => `${right} из ${total}`,
  allCorrect: 'Все ответы верны. Очень хорошее занятие.',
  someWrong: 'Вопросы, где вы ошиблись, вернутся позже — будет ещё одна попытка.',
  worthReview: 'Стоит повторить',
  missedCount: (n: number) => `ошибок: ${n}`,
  yourMistakes: 'Ваши ошибки',
  youChose: (choice: string) => `Вы выбрали «${choice}».`,
  practiseAgain: 'Позаниматься ещё',
  finish: 'Завершить',

  progressTitle: 'Мои успехи',
  overall: 'В целом',
  overallHint: 'Этот показатель растёт, когда вы верно отвечаете по теме несколько раз в разные дни.',
  needsWork: 'Требует внимания',
  comingSoon: 'Скоро повторим',
  everyTopic: 'Все темы',
  dueMark: '· пора повторить',
  resetButton: 'Начать всё сначала',
  resetConfirm: 'Все ваши успехи будут стёрты, и обучение начнётся заново. Вы уверены?',

  /** Instruction lines shown above each question. */
  prompts: {
    article: 'Выберите правильный артикль.',
    preposition: 'Выберите правильный предлог.',
    pastSimple: (verb: string) => `Поставьте глагол «${verb}» в past simple.`,
    verbForm: 'Выберите правильную форму глагола.',
    modal: 'Выберите правильный модальный глагол.',
    quantity: 'Выберите правильное слово для количества.',
    plural: (word: string) => `Как будет множественное число от «${word}»?`,
    comparative: (adj: string) => `Образуйте сравнительную степень от «${adj}».`,
    superlative: (adj: string) => `Образуйте превосходную степень от «${adj}».`,
    question: 'Какой вопрос построен правильно?',
    phrasalFit: 'Выберите подходящий фразовый глагол.',
    phrasalMeaning: (verb: string) => `Что означает «${verb}» в этом предложении?`,
    word: 'Выберите правильное слово.',
    vocabCloze: 'Выберите слово, подходящее по смыслу.',
    vocabMeaning: (word: string) => `Что означает слово «${word}»?`,
    vocabWord: 'Какое слово соответствует этому значению?',
    makeDo: 'Выберите «make» или «do».',
    sayTell: 'Выберите правильный глагол.',
    dependentPrep: 'Выберите предлог, который требуется после этого слова.',
  },

  /** Labels for the "no word is needed" option. */
  noArticle: '— артикль не нужен',
  noPreposition: '— предлог не нужен',
} as const;
