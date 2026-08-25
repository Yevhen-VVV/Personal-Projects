import type { Expectation } from '../match';

/**
 * Role-play scenarios.
 *
 * Every one is a situation she will actually be in: a receptionist, a
 * chemist, a neighbour, a voice on the telephone. Nothing set in a classroom
 * or an office, because the point is not to pass an exam -- it is to make the
 * first real conversation less frightening by having had it here first.
 *
 * `expect` is generous on purpose (see engine/match.ts). A turn passes on
 * keywords, not on grammar, because the conversation must never stall on a
 * missing article. Grammar is dealt with once, at the end.
 */

export interface Turn {
  /** What the other person says. */
  partner: string;
  /** Russian translation, shown only if she asks for it. */
  partnerRu: string;
  /** Keyword alternatives that satisfy this turn. */
  expect: Expectation;
  /** A phrase she could say. Shown by the escape hatch and in the review. */
  model: string;
  /** What the model phrase means. */
  modelRu: string;
  /** Russian tip, shown in the end-of-conversation review. */
  note?: string;
}

export interface Scenario {
  id: string;
  /** Russian title, shown on the picker. */
  title: string;
  /** Russian one-line description of the situation. */
  setting: string;
  /** Who she is talking to, in Russian. */
  partnerRole: string;
  level: 1 | 2 | 3;
  /** The other person's opening line is turns[0].partner. */
  turns: Turn[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'gp-reception',
    title: 'Запись к врачу',
    setting: 'Вы пришли в поликлинику, чтобы записаться на приём.',
    partnerRole: 'администратор в регистратуре',
    level: 1,
    turns: [
      {
        partner: 'Good morning. How can I help you?',
        partnerRu: 'Доброе утро. Чем могу помочь?',
        expect: [['appointment'], ['see', 'doctor'], ['book']],
        model: 'Good morning. I would like to make an appointment, please.',
        modelRu: 'Доброе утро. Я хотела бы записаться на приём.',
        note: 'Слово «appointment» — самое главное здесь. С ним вас поймут в любой поликлинике.',
      },
      {
        partner: 'Of course. Is it urgent, or can it wait a few days?',
        partnerRu: 'Конечно. Это срочно или может подождать несколько дней?',
        expect: [['not', 'urgent'], ['wait'], ['urgent']],
        model: 'It is not urgent. I can wait.',
        modelRu: 'Это не срочно. Я могу подождать.',
        note: '«It is not urgent» — простая и очень полезная фраза.',
      },
      {
        partner: 'We have Thursday morning at ten. Would that suit you?',
        partnerRu: 'Есть четверг, десять утра. Вам подойдёт?',
        expect: [['yes'], ['thursday'], ['fine'], ['suits'], ['perfect']],
        model: 'Yes, Thursday at ten is fine, thank you.',
        modelRu: 'Да, четверг в десять подойдёт, спасибо.',
        note: '«That is fine» и «That suits me» — оба варианта звучат естественно.',
      },
      {
        partner: 'Lovely. Can I take your date of birth?',
        partnerRu: 'Прекрасно. Назовите, пожалуйста, дату рождения.',
        expect: [['born'], ['it', 'is'], ['march'], ['may'], ['june'], ['nineteen']],
        model: 'Yes, it is the fifth of May, nineteen fifty-two.',
        modelRu: 'Да, пятое мая тысяча девятьсот пятьдесят второго года.',
        note: 'Британцы называют сначала число, потом месяц: «the fifth of May».',
      },
      {
        partner: 'Thank you. You are all booked in for Thursday. See you then.',
        partnerRu: 'Спасибо. Вы записаны на четверг. До встречи.',
        expect: [['thank'], ['thanks'], ['goodbye'], ['bye']],
        model: 'Thank you very much. Goodbye.',
        modelRu: 'Большое спасибо. До свидания.',
      },
    ],
  },
  {
    id: 'chemist',
    title: 'В аптеке',
    setting: 'Вы пришли в аптеку за лекарством от простуды.',
    partnerRole: 'фармацевт',
    level: 1,
    turns: [
      {
        partner: 'Hello there. What can I get for you?',
        partnerRu: 'Здравствуйте. Что вам подать?',
        expect: [['something', 'cold'], ['cough'], ['sore', 'throat'], ['medicine']],
        model: 'Hello. I need something for a cold, please.',
        modelRu: 'Здравствуйте. Мне нужно что-нибудь от простуды.',
        note: '«Something for a cold» — так говорят чаще, чем «medicine for a cold».',
      },
      {
        partner: 'I see. How long have you had it?',
        partnerRu: 'Понятно. Как давно это у вас?',
        expect: [['three', 'days'], ['few', 'days'], ['week'], ['since']],
        model: 'For about three days.',
        modelRu: 'Уже около трёх дней.',
        note: 'После «how long» отвечают через «for»: for three days, for a week.',
      },
      {
        partner: 'Are you taking any other medicine at the moment?',
        partnerRu: 'Вы сейчас принимаете какие-нибудь другие лекарства?',
        expect: [['blood', 'pressure'], ['yes'], ['no'], ['tablets']],
        model: 'Yes, I take tablets for blood pressure.',
        modelRu: 'Да, я принимаю таблетки от давления.',
        note: 'Важная фраза у врача и в аптеке: «tablets for blood pressure».',
      },
      {
        partner: 'That is fine. Take one of these twice a day, after food.',
        partnerRu: 'Хорошо. Принимайте по одной дважды в день, после еды.',
        expect: [['twice'], ['after', 'food'], ['say', 'again'], ['understand'], ['repeat']],
        model: 'Twice a day, after food. Could you say that again, please?',
        modelRu: 'Дважды в день, после еды. Не могли бы вы повторить?',
        note: 'Повторить услышанное вслух — лучший способ проверить, что вы поняли правильно.',
      },
      {
        partner: 'Of course — one tablet, twice a day, after food. That is four pounds fifty.',
        partnerRu: 'Конечно — одна таблетка дважды в день, после еды. С вас четыре фунта пятьдесят.',
        expect: [['here', 'you', 'are'], ['card'], ['cash'], ['thank']],
        model: 'Here you are. Thank you very much.',
        modelRu: 'Вот, пожалуйста. Большое спасибо.',
        note: '«Here you are» говорят, когда что-то передают: деньги, карту, документ.',
      },
    ],
  },
  {
    id: 'neighbour',
    title: 'Разговор с соседкой',
    setting: 'Вы встретили соседку у подъезда.',
    partnerRole: 'соседка',
    level: 1,
    turns: [
      {
        partner: 'Morning! Lovely day, isn’t it?',
        partnerRu: 'Доброе утро! Прекрасный день, правда?',
        expect: [['yes'], ['lovely'], ['beautiful'], ['it', 'is']],
        model: 'Yes, it is. Much warmer than yesterday.',
        modelRu: 'Да, правда. Гораздо теплее, чем вчера.',
        note: 'На «isn’t it?» проще всего ответить «Yes, it is». Разговор о погоде — обычное начало.',
      },
      {
        partner: 'How have you been keeping?',
        partnerRu: 'Как поживаете?',
        expect: [['very', 'well'], ['fine'], ['not', 'bad'], ['thank']],
        model: 'Very well, thank you. And you?',
        modelRu: 'Очень хорошо, спасибо. А вы?',
        note: 'Ответить и сразу спросить в ответ — «And you?» — самое естественное продолжение.',
      },
      {
        partner: 'Not too bad, thanks. Did your daughter visit at the weekend?',
        partnerRu: 'Неплохо, спасибо. Дочь приезжала на выходных?',
        expect: [['yes'], ['she', 'came'], ['sunday'], ['saturday'], ['no']],
        model: 'Yes, she came on Sunday with the children.',
        modelRu: 'Да, она приезжала в воскресенье с детьми.',
        note: 'Перед днями недели ставится «on»: on Sunday, on Monday.',
      },
      {
        partner: 'How lovely. They grow up so quickly, don’t they?',
        partnerRu: 'Как хорошо. Они так быстро растут, правда?',
        expect: [['yes'], ['they', 'do'], ['quickly'], ['fast']],
        model: 'Yes, they do. The oldest is already at school.',
        modelRu: 'Да, правда. Старший уже ходит в школу.',
        note: 'На «don’t they?» отвечают «Yes, they do» — коротко и правильно.',
      },
      {
        partner: 'Well, I must get on. Lovely to see you.',
        partnerRu: 'Ну, мне пора. Рада была вас видеть.',
        expect: [['you', 'too'], ['lovely'], ['see', 'you'], ['goodbye'], ['bye']],
        model: 'You too. See you soon.',
        modelRu: 'И я вас. До скорого.',
        note: '«You too» — короткий и вежливый ответ на такое прощание.',
      },
    ],
  },
  {
    id: 'shop-return',
    title: 'Вернуть покупку в магазине',
    setting: 'Вы купили чайник, но он не работает. Вы пришли его вернуть.',
    partnerRole: 'продавец',
    level: 2,
    turns: [
      {
        partner: 'Hello. How can I help?',
        partnerRu: 'Здравствуйте. Чем могу помочь?',
        expect: [['return'], ['bought'], ['kettle'], ['not', 'working'], ['does', 'not', 'work']],
        model: 'Hello. I bought this kettle here, but it does not work.',
        modelRu: 'Здравствуйте. Я купила здесь этот чайник, но он не работает.',
        note: 'Сначала скажите, что случилось. Не нужно длинных объяснений.',
      },
      {
        partner: 'Oh dear. Do you have the receipt?',
        partnerRu: 'Ох. У вас есть чек?',
        expect: [['yes'], ['here', 'it', 'is'], ['receipt'], ['no']],
        model: 'Yes, here it is.',
        modelRu: 'Да, вот он.',
        note: '«Receipt» — это чек. Не путайте с «recipe» — рецепт блюда.',
      },
      {
        partner: 'Thank you. Would you like a refund or a replacement?',
        partnerRu: 'Спасибо. Вам вернуть деньги или заменить товар?',
        expect: [['refund'], ['money', 'back'], ['replacement'], ['another', 'one']],
        model: 'A refund, please.',
        modelRu: 'Верните деньги, пожалуйста.',
        note: '«Refund» — возврат денег. «Replacement» — замена на другой такой же.',
      },
      {
        partner: 'No problem. It will go back onto your card in three working days.',
        partnerRu: 'Не проблема. Деньги вернутся на карту в течение трёх рабочих дней.',
        expect: [['thank'], ['three', 'days'], ['card'], ['fine'], ['understand']],
        model: 'Three days. That is fine, thank you.',
        modelRu: 'Три дня. Хорошо, спасибо.',
      },
      {
        partner: 'Sorry for the trouble. Have a good day.',
        partnerRu: 'Извините за неудобство. Хорошего дня.',
        expect: [['you', 'too'], ['thank'], ['goodbye'], ['bye']],
        model: 'Thank you. You too.',
        modelRu: 'Спасибо. И вам.',
      },
    ],
  },
  {
    id: 'phone-council',
    title: 'Звонок в управляющую компанию',
    setting: 'В квартире не работает отопление. Вы звоните, чтобы сообщить об этом.',
    partnerRole: 'сотрудник по телефону',
    level: 2,
    turns: [
      {
        partner: 'Good afternoon, repairs line. What is the problem?',
        partnerRu: 'Добрый день, ремонтная служба. В чём проблема?',
        expect: [['heating'], ['not', 'working'], ['no', 'hot', 'water'], ['boiler']],
        model: 'Good afternoon. My heating is not working.',
        modelRu: 'Добрый день. У меня не работает отопление.',
        note: 'По телефону говорите короткими фразами — так вас лучше поймут.',
      },
      {
        partner: 'I am sorry to hear that. Can I take your address?',
        partnerRu: 'Сочувствую. Назовите ваш адрес.',
        expect: [['flat'], ['road'], ['street'], ['number'], ['it', 'is']],
        model: 'Yes, it is flat four, twelve Green Road.',
        modelRu: 'Да, квартира четыре, Грин Роуд, дом двенадцать.',
        note: 'В британском адресе сначала номер дома, потом улица: «twelve Green Road».',
      },
      {
        partner: 'Thank you. How long has it been off?',
        partnerRu: 'Спасибо. Как давно оно не работает?',
        expect: [['since'], ['two', 'days'], ['yesterday'], ['this', 'morning']],
        model: 'Since yesterday morning.',
        modelRu: 'Со вчерашнего утра.',
        note: '«Since» + момент начала: since yesterday, since Monday.',
      },
      {
        partner: 'We can send an engineer tomorrow between nine and one. Is that all right?',
        partnerRu: 'Мы можем прислать мастера завтра с девяти до часу. Вас устроит?',
        expect: [['yes'], ['all', 'right'], ['fine'], ['thank'], ['will', 'be', 'home']],
        model: 'Yes, that is all right. I will be at home.',
        modelRu: 'Да, устроит. Я буду дома.',
        note: '«I will be at home» — очень полезная фраза при вызове мастера.',
      },
      {
        partner: 'Lovely. Someone will call before they arrive. Goodbye.',
        partnerRu: 'Хорошо. Вам позвонят перед приездом. До свидания.',
        expect: [['thank'], ['goodbye'], ['bye']],
        model: 'Thank you for your help. Goodbye.',
        modelRu: 'Спасибо за помощь. До свидания.',
      },
    ],
  },
  {
    id: 'bus-directions',
    title: 'Спросить дорогу',
    setting: 'Вы на улице и не знаете, как добраться до почты.',
    partnerRole: 'прохожий',
    level: 1,
    turns: [
      {
        partner: 'Sorry, were you looking for something?',
        partnerRu: 'Простите, вы что-то ищете?',
        expect: [['post', 'office'], ['looking', 'for'], ['where'], ['excuse']],
        model: 'Yes, excuse me. Where is the post office?',
        modelRu: 'Да, извините. Где находится почта?',
        note: 'Начинать с «Excuse me» — самый вежливый способ обратиться к незнакомому человеку.',
      },
      {
        partner: 'It is just down this road, past the church, on the left.',
        partnerRu: 'Прямо по этой улице, за церковью, слева.',
        expect: [['past', 'church'], ['left'], ['say', 'again'], ['sorry'], ['slowly']],
        model: 'Sorry, could you say that more slowly, please?',
        modelRu: 'Извините, не могли бы вы сказать помедленнее?',
        note: 'Просить говорить медленнее — совершенно нормально. «Could you say that more slowly?»',
      },
      {
        partner: 'Of course. Down this road. Past the church. Then on your left.',
        partnerRu: 'Конечно. По этой улице. За церковью. Потом слева.',
        expect: [['past', 'church'], ['left'], ['thank'], ['understand']],
        model: 'Past the church, then on the left. Thank you.',
        modelRu: 'За церковью, потом слева. Спасибо.',
        note: 'Повторите услышанное — так вы и проверите себя, и запомните лучше.',
      },
      {
        partner: 'That is right. It is about five minutes on foot.',
        partnerRu: 'Верно. Идти минут пять.',
        expect: [['five', 'minutes'], ['thank'], ['walk'], ['not', 'far']],
        model: 'Five minutes. That is not far. Thank you.',
        modelRu: 'Пять минут. Это недалеко. Спасибо.',
      },
      {
        partner: 'You are welcome. Have a nice day.',
        partnerRu: 'Пожалуйста. Хорошего дня.',
        expect: [['you', 'too'], ['thank'], ['goodbye'], ['bye']],
        model: 'Thank you. You too.',
        modelRu: 'Спасибо. И вам.',
      },
    ],
  },
];
