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
  /** Russian: why the correct answer is correct. */
  why: string;
  /**
   * Russian: why each wrong option is wrong, in the same order as `wrong`.
   * The learner is told why the option *they* picked fails, which is a
   * different and more useful thing than being told which one was right.
   */
  wrongWhy: string[];
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
    why: 'Слово «since» задаёт точку отсчёта, а действие продолжается до сих пор — это present perfect.',
    wrongWhy: [
      'Простое прошедшее говорит о законченном периоде, а вы живёте здесь до сих пор.',
      'Настоящее простое не показывает, что действие началось ещё в 1998 году.',
      'Continuous со «since» в этом значении не употребляется — нужен present perfect.',
    ],
    level: 2,
  },
  {
    text: 'She ␣ her keys — she cannot get into the flat.',
    correct: 'has lost',
    wrong: ['lost', 'loses', 'is losing'],
    why: 'Действие было в прошлом, но важен результат сейчас: ключей нет. Это present perfect.',
    wrongWhy: [
      'Простое прошедшее просто сообщает о прошлом, а здесь важно, что она не может войти прямо сейчас.',
      'Настоящее простое описывает привычку, а не один случай.',
      'Continuous означал бы «теряет прямо сейчас», а ключи уже потеряны.',
    ],
    level: 2,
  },
  {
    text: 'We ␣ the Petrenkos for over thirty years.',
    correct: 'have known',
    wrong: ['know', 'knew', 'are knowing'],
    why: '«for» с отрезком времени, который тянется до настоящего момента, требует present perfect.',
    wrongWhy: [
      'Настоящее простое не передаёт, что знакомство длится уже тридцать лет.',
      'Простое прошедшее означало бы, что раньше вы их знали, а теперь нет.',
      'Глагол «know» вообще не употребляется в continuous.',
    ],
    level: 2,
  },
  {
    text: 'He ␣ his tablets already, so do not remind him.',
    correct: 'has taken',
    wrong: ['took', 'takes', 'is taking'],
    why: 'Слово «already» указывает на законченное действие, важное прямо сейчас, — present perfect.',
    wrongWhy: [
      'Простое прошедшее со словом «already» в британском английском не употребляется.',
      'Настоящее простое описывает повторяющееся действие, а не один приём таблеток.',
      'Continuous означал бы «принимает прямо сейчас», а он уже принял.',
    ],
    level: 2,
  },
  {
    text: 'I ␣ to Scotland, but I would love to go one day.',
    correct: 'have never been',
    wrong: ['never was', 'never go', 'am never going'],
    why: '«never» здесь значит «ни разу за всю жизнь до настоящего момента» — это present perfect.',
    wrongWhy: [
      'Так не говорят: с «never» в значении жизненного опыта нужен present perfect.',
      'Настоящее простое описывает привычку, а не опыт всей жизни.',
      'Continuous не может передать жизненный опыт.',
    ],
    level: 3,
  },
  {
    text: 'The post ␣ already — it is on the table.',
    correct: 'has arrived',
    wrong: ['arrived', 'arrives', 'is arriving'],
    why: '«already» вместе с видимым результатом сейчас — это present perfect.',
    wrongWhy: [
      'Простое прошедшее сообщает о прошлом без связи с настоящим, а письмо лежит на столе сейчас.',
      'Настоящее простое говорит о расписании или привычке.',
      'Continuous означал бы, что почту несут прямо в эту минуту.',
    ],
    level: 2,
  },
  {
    text: 'I ␣ my sister three times this week.',
    correct: 'have telephoned',
    wrong: ['telephoned', 'telephone', 'was telephoning'],
    why: '«this week» — период, который ещё не закончился, поэтому нужен present perfect.',
    wrongWhy: [
      'Простое прошедшее подошло бы, если бы неделя уже закончилась.',
      'Настоящее простое описывает привычку, а не три конкретных звонка.',
      'Continuous описывает процесс, а здесь важно количество раз.',
    ],
    level: 3,
  },
  {
    text: 'We ␣ this house in 1987.',
    correct: 'bought',
    wrong: ['have bought', 'buy', 'have been buying'],
    why: '«in 1987» — законченное время, поэтому только past simple.',
    wrongWhy: [
      'Present perfect никогда не употребляется вместе с точной датой в прошлом.',
      'Настоящее время не подходит: речь о 1987 годе.',
      'Этот оборот описывает длительный процесс, а покупка была разовой.',
    ],
    level: 2,
  },
  {
    text: 'She ␣ him at a dance in 1962.',
    correct: 'met',
    wrong: ['has met', 'meets', 'has been meeting'],
    why: 'Точная дата в прошлом всегда требует past simple.',
    wrongWhy: [
      'Present perfect несовместим с указанной датой.',
      'Настоящее простое не подходит: встреча была в 1962 году.',
      'Оборот описывает длящееся действие, а встреча была одна.',
    ],
    level: 2,
  },
  {
    text: 'I ␣ to the doctor yesterday morning.',
    correct: 'went',
    wrong: ['have gone', 'go', 'have been going'],
    why: '«yesterday» — законченное время, значит past simple.',
    wrongWhy: [
      'Present perfect не употребляется со словом «yesterday».',
      'Настоящее время не подходит: визит был вчера.',
      'Оборот описывает повторяющееся действие, а визит был один.',
    ],
    level: 1,
  },
  {
    text: 'They ␣ here for twenty years, but they moved away in 2010.',
    correct: 'lived',
    wrong: ['have lived', 'live', 'have been living'],
    why: 'Хотя есть «for twenty years», период закончился — они уехали. Значит past simple.',
    wrongWhy: [
      'Present perfect означал бы, что они живут здесь до сих пор.',
      'Настоящее время не подходит: они уже уехали.',
      'Этот оборот тоже подразумевает, что они живут здесь сейчас.',
    ],
    level: 3,
  },
  {
    text: 'He ␣ his glasses two days ago.',
    correct: 'broke',
    wrong: ['has broken', 'breaks', 'is breaking'],
    why: 'Слово «ago» всегда означает законченное время — нужен past simple.',
    wrongWhy: [
      'Present perfect не сочетается со словом «ago».',
      'Настоящее простое описывает привычку, а не случай два дня назад.',
      'Continuous означал бы «ломает прямо сейчас».',
    ],
    level: 1,
  },
  {
    text: 'When I ␣ young, we had no telephone in the house.',
    correct: 'was',
    wrong: ['have been', 'am', 'was being'],
    why: 'Законченный период жизни описывается через past simple.',
    wrongWhy: [
      'Present perfect означал бы, что этот период продолжается до сих пор.',
      'Настоящее время не подходит: речь о молодости.',
      '«was being» описывает временное поведение, а не возраст.',
    ],
    level: 1,
  },
  {
    text: 'The parcel ␣ last Tuesday.',
    correct: 'arrived',
    wrong: ['has arrived', 'arrives', 'has been arriving'],
    why: '«last Tuesday» — законченное время, значит past simple.',
    wrongWhy: [
      'Present perfect не употребляется с указанием на конкретный день в прошлом.',
      'Настоящее простое говорит о расписании или привычке.',
      'Оборот описывает повторяющееся действие, а посылка пришла один раз.',
    ],
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
    why: '«must not» значит «нельзя, запрещено».',
    wrongWhy: [
      '«do not have to» значит «не обязательно» — получилось бы, что курить всё-таки можно.',
      '«need not» тоже значит «не обязательно», а не «запрещено».',
      '«might not» значит «возможно, не будет» — это про вероятность, а не про запрет.',
    ],
    level: 2,
  },
  {
    text: 'You ␣ pay — the bus is free for over-sixties.',
    correct: 'do not have to',
    wrong: ['must not', 'cannot', 'should not'],
    why: '«do not have to» значит «не обязательно»: платить можно, но не требуется.',
    wrongWhy: [
      '«must not» значит «запрещено», а платить никто не запрещает.',
      '«cannot» значит «невозможно» — дело не в этом.',
      '«should not» — это совет не платить, а здесь плата просто не нужна.',
    ],
    level: 2,
  },
  {
    text: 'I ␣ read the small print without my glasses.',
    correct: 'cannot',
    wrong: ['must not', 'do not have to', 'may not'],
    why: '«cannot» — про возможность: без очков это просто не получается.',
    wrongWhy: [
      '«must not» значит «запрещено», а читать никто не запрещает.',
      '«do not have to» значит «не обязательно», но речь о способности.',
      '«may not» — про разрешение, а не про способность.',
    ],
    level: 1,
  },
  {
    text: 'You look tired. You ␣ sit down for a while.',
    correct: 'should',
    wrong: ['must not', 'cannot', 'do not have to'],
    why: '«should» — дружеский совет.',
    wrongWhy: [
      '«must not» значит «нельзя», а сесть как раз стоит.',
      '«cannot» значит «не можете» — это про возможность.',
      '«do not have to» значит «не обязательно», а это не совет.',
    ],
    level: 1,
  },
  {
    text: 'She ␣ be at home — her car is outside and the lights are on.',
    correct: 'must',
    wrong: ['cannot', 'need not', 'should not'],
    why: 'Здесь «must» — не приказ, а уверенный вывод: «наверняка она дома».',
    wrongWhy: [
      '«cannot be» — противоположный вывод: «её точно нет дома». Но машина стоит у дома.',
      '«need not» значит «не обязательно» — это не вывод.',
      '«should not» — совет, а не вывод о том, что происходит.',
    ],
    level: 3,
  },
  {
    text: 'He ␣ be at home — I saw him in town ten minutes ago.',
    correct: 'cannot',
    wrong: ['must', 'should', 'need not'],
    why: '«cannot be» — уверенный вывод «его точно нет дома». Это противоположность «must be».',
    wrongWhy: [
      '«must be» означало бы «наверняка он дома», а вы только что видели его в городе.',
      '«should be» — про ожидание, а не про уверенный вывод.',
      '«need not» значит «не обязательно» — здесь не подходит.',
    ],
    level: 3,
  },
  {
    text: 'It ␣ rain this afternoon, so take an umbrella just in case.',
    correct: 'might',
    wrong: ['must', 'cannot', 'should not'],
    why: '«might» значит «возможно, но не наверняка».',
    wrongWhy: [
      '«must» означало бы уверенность, а слова «just in case» говорят как раз о сомнении.',
      '«cannot» означало бы, что дождя точно не будет — тогда и зонт не нужен.',
      '«should not» — совет, к погоде он не применяется.',
    ],
    level: 2,
  },
  {
    text: 'You ␣ worry about the results — everything was normal.',
    correct: 'need not',
    wrong: ['must not', 'cannot', 'should not have'],
    why: '«need not» значит «нет причин, не нужно».',
    wrongWhy: [
      '«must not» прозвучало бы как запрет волноваться, а это не запрет.',
      '«cannot worry» значило бы «не в состоянии волноваться».',
      'Этот оборот — упрёк за прошлое, а результаты уже известны и они хорошие.',
    ],
    level: 3,
  },
  {
    text: 'When I was young, I ␣ walk five miles without stopping.',
    correct: 'could',
    wrong: ['can', 'must', 'should'],
    why: '«could» — прошедшая форма «can»: способность, которая была тогда.',
    wrongWhy: [
      '«can» — про сегодняшнюю способность, а речь о молодости.',
      '«must» — про обязанность, а не про способность.',
      '«should» — совет, а не способность.',
    ],
    level: 2,
  },
  {
    text: 'Visitors ␣ report to reception before going to the wards.',
    correct: 'must',
    wrong: ['need not', 'might', 'could not'],
    why: '«must» выражает правило.',
    wrongWhy: [
      '«need not» значит «не обязательно» — правило говорит обратное.',
      '«might» — про возможность, а не про правило.',
      '«could not» — про отсутствие возможности в прошлом.',
    ],
    level: 2,
  },
];

/** say / tell / speak / talk. One verb covers most of these in Slavic languages. */
export const SAY_TELL: AuthoredItem[] = [
  {
    text: 'Could you ␣ me your address, please?',
    correct: 'tell',
    wrong: ['say', 'speak', 'talk'],
    why: 'После «tell» человек ставится сразу: tell me, tell her, tell the doctor.',
    wrongWhy: [
      'После «say» человек напрямую не ставится — понадобилось бы «say to me».',
      '«speak» употребляется с названиями языков и о манере речи.',
      '«talk» — про беседу: talk to somebody about something.',
    ],
    level: 1,
  },
  {
    text: 'She did not ␣ anything about the letter.',
    correct: 'say',
    wrong: ['tell', 'speak', 'talk'],
    why: 'После «say» идут слова, а не человек.',
    wrongWhy: [
      '«tell» требует после себя человека: tell me, tell her.',
      '«speak» не сочетается с прямым дополнением «anything».',
      '«talk» тоже не берёт прямое дополнение.',
    ],
    level: 1,
  },
  {
    text: 'He ␣ three languages fluently.',
    correct: 'speaks',
    wrong: ['says', 'tells', 'talks'],
    why: 'Только «speak» употребляется с названиями языков.',
    wrongWhy: [
      '«say» — про произнесённые слова, а не про владение языком.',
      '«tell» требует после себя человека.',
      '«talk» — про беседу, а не про владение языком.',
    ],
    level: 1,
  },
  {
    text: 'I need to ␣ to you about Sunday.',
    correct: 'talk',
    wrong: ['say', 'tell', 'speak about'],
    why: 'Обычная схема для разговора — «talk to somebody about something».',
    wrongWhy: [
      '«say» не сочетается с «to you about».',
      '«tell» ставится без «to»: tell you about Sunday.',
      'Получилось бы «speak about to you about Sunday» — предлог задваивается.',
    ],
    level: 2,
  },
  {
    text: '␣ me the truth — were you frightened?',
    correct: 'Tell',
    wrong: ['Say', 'Speak', 'Talk'],
    why: 'Сочетания «tell the truth», «tell a lie», «tell a story» и «tell a joke» устойчивые.',
    wrongWhy: [
      'После «say» человек напрямую не ставится.',
      '«speak» с «the truth» не сочетается.',
      '«talk» не берёт прямое дополнение.',
    ],
    level: 2,
  },
  {
    text: 'What did the doctor ␣ about your knee?',
    correct: 'say',
    wrong: ['tell', 'speak', 'talk'],
    why: 'После глагола нет человека, значит нужен «say».',
    wrongWhy: [
      '«tell» требует человека: tell you about your knee.',
      '«speak» в таком вопросе не употребляется.',
      'С «talk» вопрос звучал бы иначе: «What did the doctor talk about?»',
    ],
    level: 2,
  },
  {
    text: 'He ␣ us a long story about the war.',
    correct: 'told',
    wrong: ['said', 'spoke', 'talked'],
    why: 'Схема «tell somebody something»: человек идёт сразу после глагола.',
    wrongWhy: [
      '«say» не ставит человека сразу после себя.',
      '«speak» не берёт два дополнения подряд.',
      '«talk» не берёт прямое дополнение вроде «a story».',
    ],
    level: 2,
  },
  {
    text: 'Please do not ␣ to me in that tone.',
    correct: 'speak',
    wrong: ['say', 'tell', 'talk about'],
    why: '«speak to somebody» употребляется, когда речь о манере говорить.',
    wrongWhy: [
      '«say» не сочетается с «to me in that tone».',
      '«tell» ставится без «to».',
      'Получилось бы «talk about to me» — лишний предлог.',
    ],
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
