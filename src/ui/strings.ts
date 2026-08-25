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

  /** Microphone self-check, for diagnosing a phone we cannot hold. */
  mic: {
    tile: 'Проверка микрофона',
    tileHint: 'Если микрофон не слышит вас',
    title: 'Проверка микрофона',
    hint: 'Нажмите «Говорить», скажите несколько слов по-английски и нажмите «Готово». Ниже появится то, что услышало приложение.',
    start: '🎤 Говорить',
    stop: '■ Готово',
    result: 'Что услышало приложение',
    nothing: 'Пока ничего',
    log: 'Что происходило',
    supported: 'Распознавание речи',
    secure: 'Защищённое соединение',
    framed: 'Открыто внутри другого окна',
    yes: 'да',
    no: 'нет',
    good: 'Микрофон работает. Слова распознаются.',
    silent: 'Приложение не расслышало ни слова. Проверьте, что микрофон разрешён, и говорите чуть громче.',
  },

  /** Speaking practice: role-play conversations. */
  talk: {
    tile: 'Разговор',
    tileHint: 'Поговорите вслух — как в жизни',
    pickTitle: 'Выберите ситуацию',
    pickHint: 'Вас никто не торопит. Говорите столько, сколько нужно.',
    youTalkTo: (role: string) => `Вы говорите с: ${role}`,
    begin: 'Начать разговор',
    listening: 'Слушаю вас…',
    tapToSpeak: '🎤 Нажмите и говорите',
    tapToStop: '■ Я закончила',
    thinking: 'Секунду…',
    showRu: 'Что это значит?',
    hideRu: 'Скрыть перевод',
    replay: '🔊 Ещё раз',
    help: 'Не знаю, что сказать',
    helpTitle: 'Можно сказать так:',
    helpRepeat: '🔊 Послушать и повторить',
    helpContinue: 'Продолжить',
    turnOf: (n: number, total: number) => `Реплика ${n} из ${total}`,
    youSaid: 'Вы сказали:',
    nothingHeard: 'Я ничего не расслышала. Попробуйте ещё раз — микрофон вас ждёт.',
    noMic: 'Микрофон недоступен в этом браузере. Откройте приложение в Safari на телефоне.',
    noPermission: 'Нужен доступ к микрофону. Разрешите его, когда браузер спросит, и попробуйте снова.',
    embedded:
        'Эта страница открыта внутри другого окна, поэтому микрофон здесь не работает — ' +
        'и настройки браузера тут не помогут. Откройте приложение по своему адресу:',
    appUrl: 'yevhen-vvv.github.io/Personal-Projects',
    quit: '← Закончить',

    reviewTitle: 'Разговор окончен',
    reviewLead: 'Вы говорили — это самое главное. Теперь спокойно посмотрим, что можно сказать точнее.',
    reviewGood: (n: number, total: number) => `Удачных реплик: ${n} из ${total}`,
    reviewYouSaid: 'Вы сказали',
    reviewBetter: 'Можно так',
    reviewSilent: '(вы промолчали)',
    reviewUsedHelp: 'вы попросили подсказку',
    againSame: 'Повторить этот разговор',
    pickAnother: 'Другая ситуация',
  },

  /** Listening practice: the four-pass ladder. */
  listen: {
    tile: 'Аудирование',
    tileHint: 'Понимать речь на обычной скорости',
    pickTitle: 'Выберите запись',
    pickHint: 'Каждую запись слушаем четыре раза — с каждым разом понятнее.',
    passOf: (n: number) => `Проход ${n} из 4`,
    passNames: {
      1: 'Просто послушайте',
      2: 'Послушайте ещё раз',
      3: 'Теперь с текстом',
      4: 'И снова без текста',
    },
    passHints: {
      1: 'Не пытайтесь понять каждое слово. Просто уловите, о чём речь.',
      2: 'Теперь слушайте внимательнее — важны детали.',
      3: 'Текст перед глазами. Слушайте и следите глазами.',
      4: 'Последний раз, без текста. Заметьте, насколько стало понятнее.',
    },
    play: '🔊 Слушать',
    playing: '♪ Звучит…',
    replay: '🔊 Ещё раз',
    ready: 'Готово, дальше',
    showTranscript: 'Показать текст',
    transcript: 'Текст записи',
    translation: 'Перевод',
    finishTitle: 'Запись пройдена',
    finishLead: 'Вы прослушали её четыре раза. Именно так речь и становится понятной.',
    finishAgain: 'Послушать ещё раз',
    finishAnother: 'Другая запись',
  },

  /** Survival phrases and the shadowing drill. */
  phrases: {
    tile: 'Нужные фразы',
    tileHint: 'Выучить и проговорить вслух',
    pickTitle: 'Фразы на каждый день',
    pickHint: 'Слушайте фразу и повторяйте вслух. Это лучший способ заговорить.',
    dailyDrill: 'Сегодняшняя тренировка',
    dailyHint: '8 фраз, около трёх минут',
    listenFirst: '🔊 Послушать',
    yourTurn: 'Теперь повторите',
    repeat: '🎤 Повторить',
    stopRepeat: '■ Готово',
    again: 'Ещё раз',
    next: 'Дальше',
    excellent: 'Отлично! Очень похоже.',
    good: 'Хорошо. Уже близко.',
    tryAgain: 'Пока не совсем. Послушайте ещё раз и повторите.',
    heard: 'Я услышала:',
    whenToUse: 'Когда говорить',
    drillDone: 'Тренировка окончена',
    drillLead: 'Эти фразы вернутся завтра — так они и запоминаются.',
    drillAgain: 'Повторить тренировку',
  },
} as const;
