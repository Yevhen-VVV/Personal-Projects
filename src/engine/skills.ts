import type { Skill } from './types';

/**
 * Lessons are written in Russian, and the example sentences in English.
 *
 * Explaining an English rule in English asks the learner to solve a second
 * puzzle before they can start on the first one. The whole value of the
 * explanation is that it lands immediately, so it is in the language they
 * think in -- and the comparison with Russian is made explicitly wherever the
 * two languages disagree, because a learner who understands *why* they keep
 * making an error stops making it far sooner than one who is only corrected.
 */
export const SKILLS: Skill[] = [
  {
    id: 'articles',
    title: 'Артикли: a, an, the',
    category: 'grammar',
    blurb: 'Маленькие слова, которых нет в русском языке.',
    lesson: {
      paragraphs: [
        'В русском языке артиклей нет, а в английском они встречаются в каждом предложении. Пропуск артикля — самая заметная примета того, что говорит носитель славянского языка.',
        'Вариантов всего три, и один из них — «не ставить ничего».',
        '«a» или «an» ставятся при первом упоминании одного исчисляемого предмета. «the» — когда собеседнику уже понятно, о каком именно предмете речь. Без артикля обходятся множественное число и неисчисляемые существительные, когда говорят о них вообще.',
        'Выбор между «a» и «an» зависит от звука, а не от буквы. Говорят «an hour», потому что «h» не читается, и «a university», потому что слово начинается со звука «ю».',
      ],
      examples: [
        { good: 'I bought a car yesterday.', bad: 'I bought car yesterday.', note: 'Первое упоминание одного исчисляемого предмета.' },
        { good: 'I bought a car. The car is red.', note: 'Второе упоминание — теперь обоим понятно, о какой машине речь.' },
        { good: 'I like dogs.', bad: 'I like the dogs.', note: 'О собаках вообще — артикль не нужен.' },
        { good: 'She gave me good advice.', bad: 'She gave me a good advice.', note: '«advice» — неисчисляемое.' },
      ],
    },
  },
  {
    id: 'prepositions-time',
    title: 'In, On, At — время',
    category: 'grammar',
    blurb: 'Какой предлог с каким временем.',
    lesson: {
      paragraphs: [
        'Представьте себе три коробки разного размера.',
        '«in» — самая большая: месяцы, времена года, годы и части дня. In July, in summer, in 1998, in the morning.',
        '«on» — средняя: отдельные дни и даты. On Monday, on my birthday, on the third of May.',
        '«at» — самая маленькая: точные моменты. At nine o’clock, at midnight, at lunchtime. Сочетание «at night» просто запоминается.',
        'С некоторыми словами предлог не нужен вовсе. Его никогда не ставят перед yesterday, today, tomorrow и после last, next, this и every.',
      ],
      examples: [
        { good: 'The appointment is at nine o’clock.', bad: 'The appointment is in nine o’clock.' },
        { good: 'I saw her on Monday.', bad: 'I saw her in Monday.' },
        { good: 'We moved here in 1998.' },
        { good: 'I saw the doctor yesterday.', bad: 'I saw the doctor at yesterday.', note: 'Перед «yesterday» предлога нет.' },
      ],
    },
  },
  {
    id: 'prepositions-place',
    title: 'In, On, At — место',
    category: 'grammar',
    blurb: 'Внутри, на поверхности или в точке.',
    lesson: {
      paragraphs: [
        '«in» значит «внутри»: in the kitchen, in the car, in my pocket, in London.',
        '«on» значит «на поверхности»: on the table, on the wall, on the second floor.',
        '«at» обозначает точку или цель: at the bus stop, at home, at work, at the doctor’s.',
        'Больше всего путаницы с транспортом. Говорят «in the car» и «in a taxi», но «on the bus», «on the train» и «on the plane» — потому что там можно встать и пройтись.',
      ],
      examples: [
        { good: 'She is waiting at the bus stop.' },
        { good: 'Your glasses are on the table.' },
        { good: 'I left my bag in the car.', bad: 'I left my bag on the car.' },
        { good: 'I am at home this evening.', bad: 'I am in home this evening.', note: '«at home» — устойчивое сочетание.' },
      ],
    },
  },
  {
    id: 'past-simple',
    title: 'Past Simple — прошедшее время',
    category: 'grammar',
    blurb: 'Окончание «-ed» и глаголы, которые его не берут.',
    lesson: {
      paragraphs: [
        'Большинство английских глаголов образуют прошедшее время окончанием «-ed»: walk становится walked, call — called.',
        'Около двухсот самых частых глаголов этому правилу не подчиняются, и это, к сожалению, именно те глаголы, которые нужны чаще всего: go — went, buy — bought, see — saw.',
        'Вывести их по правилу нельзя. Их учат тройками — go, went, gone — и запоминать стоит сразу все три формы: третья понадобится для present perfect.',
        'Самая частая ошибка — всё-таки применить общее правило и получить «goed» или «buyed». Если глагол кажется неправильным, скорее всего, так и есть.',
      ],
      examples: [
        { good: 'I went to the doctor yesterday.', bad: 'I goed to the doctor yesterday.' },
        { good: 'She bought a newspaper.', bad: 'She buyed a newspaper.' },
        { good: 'We walked to the shops.', note: 'Правильный глагол — просто «-ed».' },
      ],
    },
  },
  {
    id: 'present-perfect',
    title: 'Present Perfect или Past Simple',
    category: 'grammar',
    blurb: 'Время, которому нет прямого соответствия в русском.',
    lesson: {
      paragraphs: [
        'Это самое трудное время для говорящих по-русски, потому что похожего в русском языке просто нет. Русский обходится видом — совершенным и несовершенным, — а английский выбирает между двумя временами.',
        'Past simple нужен, когда время закончилось и его можно назвать: yesterday, last week, in 1998, two days ago. Если в предложении есть такое указание, past simple — единственный возможный вариант.',
        'Present perfect — «have» или «has» плюс третья форма глагола — нужен, когда период ещё не закончился или когда прошлое действие важно своим результатом прямо сейчас.',
        'Простая проверка: если можно спросить «когда именно?» и назвать время — берите past simple.',
      ],
      examples: [
        { good: 'I have lived here since 1998.', bad: 'I live here since 1998.', note: '«since» — и сейчас это так.' },
        { good: 'We bought this house in 1987.', bad: 'We have bought this house in 1987.', note: 'Названный, законченный год.' },
        { good: 'She has lost her keys.', note: 'Важен результат сейчас — она не может войти.' },
        { good: 'She lost her keys on Tuesday.', note: 'Названный день в прошлом — past simple.' },
      ],
    },
  },
  {
    id: 'countability',
    title: 'Much, Many, A Few, A Little',
    category: 'grammar',
    blurb: 'Что можно посчитать, а что нельзя.',
    lesson: {
      paragraphs: [
        'Английские существительные делятся на два вида. Исчисляемые можно посчитать поштучно, и у них есть множественное число: one chair, two chairs. У неисчисляемых множественного числа нет вовсе.',
        'Сложность в том, что английский и русский расходятся в том, какое слово к какому виду относится. Information, advice, furniture, luggage, news и money в английском неисчисляемые, хотя по-русски прекрасно считаются.',
        'Поэтому слов «informations» и «advices» не существует, и нельзя сказать «many money».',
        'С исчисляемыми во множественном числе употребляются «many» и «a few». С неисчисляемыми — «much» и «a little».',
      ],
      examples: [
        { good: 'How much information do you need?', bad: 'How many informations do you need?' },
        { good: 'She gave me some good advice.', bad: 'She gave me some good advices.' },
        { good: 'There are a few chairs left.', note: 'Исчисляемое — «a few».' },
        { good: 'There is a little bread left.', note: 'Неисчисляемое — «a little».' },
      ],
    },
  },
  {
    id: 'question-order',
    title: 'Порядок слов в вопросе',
    category: 'grammar',
    blurb: 'Зачем в английском вопросе нужны «do» и «does».',
    lesson: {
      paragraphs: [
        'По-русски утверждение превращается в вопрос одной интонацией. В английском так нельзя: на письме это ошибка, а в речи звучит неправильно.',
        'Английскому вопросу нужен вспомогательный глагол. В настоящем времени это «do», а для he, she, it — «does».',
        'Порядок строгий: вопросительное слово, затем do или does, затем подлежащее, затем глагол в начальной форме. Where do you live? What time does the chemist close?',
        'Важно: окончание «-s» переходит на «does» и на основном глаголе больше не появляется. Правильно «does she work», а не «does she works».',
      ],
      examples: [
        { good: 'Where do you live?', bad: 'Where you live?' },
        { good: 'What time does the chemist close?', bad: 'What time the chemist closes?' },
        { good: 'Why does she want to move?', bad: 'Why does she wants to move?', note: '«-s» уже есть в «does».' },
      ],
    },
  },
  {
    id: 'phrasal-verbs',
    title: 'Фразовые глаголы',
    category: 'vocabulary',
    blurb: 'Обычные глаголы, которые меняют смысл от маленького слова.',
    lesson: {
      paragraphs: [
        'Фразовый глагол — это глагол плюс короткое слово: up, off, after, out. Вместе они значат то, о чём по частям догадаться невозможно.',
        '«give» значит «дать». «give up» значит «бросить, перестать делать навсегда». Связи между этими значениями нет, и похожей конструкции в русском языке тоже нет.',
        'Поэтому вывести их логически нельзя. Каждый такой глагол запоминают целиком, как отдельное новое слово.',
        'В обычной разговорной речи они встречаются постоянно — у врача, в магазине, в разговоре с соседями, — так что усилия окупаются.',
      ],
      examples: [
        { good: 'He gave up smoking.', note: 'give up — бросить навсегда' },
        { good: 'Could you look after the cat?', note: 'look after — присмотреть, позаботиться' },
        { good: 'We had to put off the appointment.', note: 'put off — отложить' },
        { good: 'Please fill in this form.', note: 'fill in — заполнить' },
      ],
    },
  },
  {
    id: 'confusables',
    title: 'Ложные друзья переводчика',
    category: 'vocabulary',
    blurb: 'Английские слова, которые выглядят знакомо, а значат другое.',
    lesson: {
      paragraphs: [
        'Некоторые английские слова почти совпадают с русскими по звучанию, и потому кажутся безопасными. Часто они значат совсем другое.',
        '«Магазин» по-английски — shop, а «magazine» — это журнал. «Актуальный» — current, а «actual» значит «настоящий». «Симпатичный» — attractive, а «sympathetic» значит «сочувствующий».',
        'Такие пары стоит учить отдельно и сознательно: сами вы ошибку не заметите — слово кажется правильным.',
        'Сюда же входят пары, трудные для всех: borrow и lend, bring и take. В английском направление действия задаёт сам глагол, а в русском его подсказывает контекст.',
      ],
      examples: [
        { good: 'I bought bread at the shop.', bad: 'I bought bread at the magazine.' },
        { good: 'She was very sympathetic about my illness.', note: 'Сочувствующая — а не «симпатичная».' },
        { good: 'Could I borrow your pen?', note: 'Вещь идёт ко мне.' },
        { good: 'Could you lend me your pen?', note: 'Вещь уходит от вас.' },
      ],
    },
  },
  {
    id: 'vocabulary',
    title: 'Повседневные слова',
    category: 'vocabulary',
    blurb: 'Слова про приём у врача, дом, деньги, погоду и дорогу.',
    lesson: {
      paragraphs: [
        'Здесь собраны слова, которые нужны в обычную неделю: в аптеке, по телефону, на остановке, в разговоре с соседом.',
        'Вопросы бывают трёх видов: по значению найти слово, по слову назвать значение или вставить слово в предложение.',
        'Неверные варианты всегда берутся из той же темы, поэтому угадать по теме не получится — слово нужно знать.',
      ],
      examples: [
        { good: 'I have an appointment with the nurse at ten.' },
        { good: 'The chemist is next to the post office.', note: '«chemist» — это аптека в британском варианте.' },
        { good: 'His pension arrives on the third of the month.' },
      ],
    },
  },
  {
    id: 'plurals',
    title: 'Множественное число',
    category: 'grammar',
    blurb: 'Общее правило и слова, которые меняются целиком.',
    lesson: {
      paragraphs: [
        'Большинство существительных получают «-s». Слова на s, x, ch и sh получают «-es»: boxes, watches, dishes. Слова на согласную с «y» меняют её на «-ies»: baby — babies.',
        'Небольшая группа меняется полностью, и её нужно запомнить: child — children, man — men, foot — feet, person — people.',
        'Слова на «-f» и «-fe» обычно дают «-ves»: knife — knives, leaf — leaves. Но roof — roofs.',
        'Несколько слов не меняются совсем: one sheep, two sheep; one fish, two fish.',
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
    title: 'Степени сравнения',
    category: 'grammar',
    blurb: 'Colder, more comfortable, the best.',
    lesson: {
      paragraphs: [
        'Короткие прилагательные получают «-er» для сравнения и «-est» для высшей степени: cold, colder, the coldest.',
        'Длинные прилагательные вместо этого берут «more» и «the most»: comfortable, more comfortable, the most comfortable.',
        'Несколько слов — исключения, их учат наизусть: good, better, the best. Bad, worse, the worst.',
        'Самая частая ошибка — использовать оба способа сразу. «More colder» и «the most best» всегда неверны: способ выбирают один.',
        'И помните, что высшая степень почти всегда идёт с «the»: the coldest day, the most expensive shop.',
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
    blurb: 'Обязанность, совет, возможность — и одна опасная пара.',
    lesson: {
      paragraphs: [
        'Модальные глаголы добавляют к действию отношение: насколько оно обязательно, вероятно или желательно.',
        '«must» — правило или строгая обязанность. «should» — совет. «can» и «could» — про умение и возможность. «might» — возможно, но не наверняка.',
        'Одна пара важнее всех остальных. «Must not» значит «запрещено». «Do not have to» значит «не обязательно». Они выглядят как противоположности одного и того же, но это совершенно разные вещи — и перепутать их в больнице или аптеке по-настоящему опасно.',
        '«You must not take this medicine» и «you do not have to take this medicine» — это два очень разных указания.',
        'Модальные глаголы используются и для выводов. «She must be at home» — это не приказ ей быть дома, а уверенность, что она там.',
      ],
      examples: [
        { good: 'You must not smoke here.', note: 'Запрещено.' },
        { good: 'You do not have to pay.', note: 'Не обязательно — можно и заплатить.' },
        { good: 'You should sit down for a while.', note: 'Совет.' },
        { good: 'She must be at home — her car is outside.', note: 'Уверенный вывод.' },
      ],
    },
  },
  {
    id: 'make-do',
    title: 'Make или Do',
    category: 'usage',
    blurb: 'Один русский глагол — два английских.',
    lesson: {
      paragraphs: [
        'По-русски «делать» одно, а в английском их два, поэтому такие сочетания учат парами.',
        'Как ориентир: «make» — про создание чего-то нового: make a cake, make a phone call, make a mistake, make an appointment.',
        '«do» — про дела, работу и занятия, часто повторяющиеся: do the shopping, do the washing-up, do your homework, do somebody a favour.',
        'Ориентир помогает, но не всегда: надёжнее запоминать каждое сочетание целиком, как выражение «good morning».',
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
    blurb: 'Четыре английских глагола для одного русского.',
    lesson: {
      paragraphs: [
        'Разница в основном в том, что идёт дальше в предложении.',
        'После «tell» человек ставится сразу: tell me, tell her, tell the doctor. После «say» идут слова, а не человек, и чтобы добавить человека, нужен предлог «to»: she said nothing to me.',
        '«speak» употребляется с языками и когда речь о манере говорить: he speaks three languages; please do not speak to me like that.',
        '«talk» — про беседу между людьми: I need to talk to you about Sunday.',
        'Несколько сочетаний закреплены за «tell», и их просто запоминают: tell the truth, tell a lie, tell a story, tell a joke.',
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
    title: 'Слова, требующие предлога',
    category: 'usage',
    blurb: 'Depend on, listen to, wait for — пары без логики.',
    lesson: {
      paragraphs: [
        'Многие английские глаголы и прилагательные требуют одного определённого предлога и не терпят никакого другого. It depends on the weather — и никогда «depends from».',
        'Логики в этих парах нет, а в русском языке предлог часто оказывается другим — именно поэтому такие ошибки держатся так долго.',
        'Практичнее всего учить два слова как одно целое. Не «depend», а «depend on». Не «interested», а «interested in».',
        'Встретив новый глагол, стоит сразу заметить, какой предлог идёт следом, и запомнить их вместе.',
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
