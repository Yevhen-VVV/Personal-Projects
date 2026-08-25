/**
 * Listening passages for the four-pass ladder.
 *
 * Each is roughly thirty seconds at ordinary speaking speed -- about eighty
 * words. They are played at natural rate on purpose. A learner who only ever
 * hears slowed-down English is fine until the first real receptionist speaks,
 * and then understands nothing; the ladder exists so that ordinary speed stops
 * being frightening.
 *
 * The four passes go: gist without text, detail without text, following along
 * with the text, then once more without it. The last pass is the point of the
 * whole exercise -- the same audio that was a blur on the first pass is
 * comfortable by the fourth, and she can hear that happen.
 */

export interface Comprehension {
  /** Question in Russian -- this checks understanding, not English production. */
  q: string;
  /** Options in Russian, for the same reason. */
  options: string[];
  answer: number;
}

export interface Gap {
  /** Line from the transcript with ␣ marking the missing word. */
  sentence: string;
  answer: string;
  options: string[];
}

export interface Passage {
  id: string;
  /** Russian title. */
  title: string;
  /** Russian description of the situation. */
  setting: string;
  level: 1 | 2 | 3;
  /** English, about eighty words. */
  text: string;
  /** Russian translation, revealed at the end. */
  ru: string;
  gist: Comprehension;
  details: Comprehension[];
  gaps: Gap[];
}

export const PASSAGES: Passage[] = [
  {
    id: 'surgery-answerphone',
    title: 'Автоответчик поликлиники',
    setting: 'Вы позвонили в поликлинику и слушаете автоответчик.',
    level: 1,
    text:
      'Thank you for calling Brookfield Surgery. Our opening hours are Monday to Friday, ' +
      'eight in the morning until six thirty in the evening. We are closed at the weekend. ' +
      'If you need to book an appointment, please press one. For test results, please press two, ' +
      'and call after eleven o’clock, when the lines are quieter. If this is an emergency, ' +
      'please hang up and dial nine nine nine. Thank you for your patience.',
    ru:
      'Спасибо, что позвонили в поликлинику Брукфилд. Мы работаем с понедельника по пятницу, ' +
      'с восьми утра до половины седьмого вечера. В выходные закрыто. Чтобы записаться на приём, ' +
      'нажмите один. Для результатов анализов нажмите два и звоните после одиннадцати, когда меньше звонков. ' +
      'Если это экстренный случай, положите трубку и наберите девять девять девять. Спасибо за терпение.',
    gist: {
      q: 'Что это за запись?',
      options: [
        'Автоответчик поликлиники с часами работы',
        'Реклама аптеки',
        'Прогноз погоды',
        'Объявление на вокзале',
      ],
      answer: 0,
    },
    details: [
      {
        q: 'Когда поликлиника закрыта?',
        options: ['В выходные', 'По понедельникам', 'После обеда', 'Она работает всегда'],
        answer: 0,
      },
      {
        q: 'Какую кнопку нажать, чтобы записаться на приём?',
        options: ['Один', 'Два', 'Три', 'Девять'],
        answer: 0,
      },
      {
        q: 'Во сколько лучше звонить за результатами анализов?',
        options: ['После одиннадцати', 'До восьми', 'В выходные', 'В любое время'],
        answer: 0,
      },
    ],
    gaps: [
      {
        sentence: 'We are closed at the ␣.',
        answer: 'weekend',
        options: ['weekend', 'morning', 'evening', 'weekday'],
      },
      {
        sentence: 'If you need to book an ␣, please press one.',
        answer: 'appointment',
        options: ['appointment', 'operation', 'invitation', 'apartment'],
      },
      {
        sentence: 'Please hang up and ␣ nine nine nine.',
        answer: 'dial',
        options: ['dial', 'call', 'ring', 'press'],
      },
    ],
  },
  {
    id: 'weather-forecast',
    title: 'Прогноз погоды',
    setting: 'Вы слушаете прогноз погоды по радио.',
    level: 1,
    text:
      'And now the weather for the week ahead. Tomorrow will be cold and grey, with showers ' +
      'in the afternoon, so do take an umbrella if you are going out. There may be frost early ' +
      'on Wednesday morning, so please take care on the pavements. From Thursday it turns much ' +
      'milder, with some sunshine by the weekend. Temperatures will reach fourteen degrees on ' +
      'Saturday. A good weekend for the garden, then.',
    ru:
      'А теперь погода на неделю вперёд. Завтра будет холодно и пасмурно, днём дожди, ' +
      'так что возьмите зонт, если соберётесь выходить. Рано утром в среду возможны заморозки, ' +
      'будьте осторожны на тротуарах. С четверга станет намного мягче, к выходным появится солнце. ' +
      'В субботу температура поднимется до четырнадцати градусов. Хорошие выходные для сада.',
    gist: {
      q: 'О чём эта запись?',
      options: [
        'Прогноз погоды на неделю',
        'Новости о дорожном движении',
        'Объявление в магазине',
        'Совет врача',
      ],
      answer: 0,
    },
    details: [
      {
        q: 'Что советуют взять завтра?',
        options: ['Зонт', 'Тёплые перчатки', 'Солнечные очки', 'Ничего'],
        answer: 0,
      },
      {
        q: 'В какой день возможны заморозки?',
        options: ['В среду утром', 'В субботу', 'В четверг вечером', 'В понедельник'],
        answer: 0,
      },
      {
        q: 'Какая температура ожидается в субботу?',
        options: ['Четырнадцать градусов', 'Четыре градуса', 'Сорок градусов', 'Ноль градусов'],
        answer: 0,
      },
    ],
    gaps: [
      {
        sentence: 'Tomorrow will be cold and grey, with ␣ in the afternoon.',
        answer: 'showers',
        options: ['showers', 'sunshine', 'snow', 'wind'],
      },
      {
        sentence: 'There may be ␣ early on Wednesday morning.',
        answer: 'frost',
        options: ['frost', 'fog', 'rain', 'thunder'],
      },
      {
        sentence: 'From Thursday it turns much ␣.',
        answer: 'milder',
        options: ['milder', 'colder', 'wetter', 'windier'],
      },
    ],
  },
  {
    id: 'pharmacy-instructions',
    title: 'Как принимать лекарство',
    setting: 'Фармацевт объясняет, как принимать новое лекарство.',
    level: 2,
    text:
      'Right, so these are your new tablets. Take one in the morning and one in the evening, ' +
      'always after food, never on an empty stomach. Try to take them at about the same time each day. ' +
      'If you forget one, do not take two together — just carry on as normal the next day. ' +
      'They may make you feel a little sleepy at first, so do not drive until you know how they affect you. ' +
      'Come back and see us in two weeks.',
    ru:
      'Итак, вот ваши новые таблетки. Принимайте по одной утром и одной вечером, всегда после еды, ' +
      'никогда на пустой желудок. Старайтесь принимать примерно в одно и то же время каждый день. ' +
      'Если пропустили — не принимайте две сразу, просто продолжайте как обычно на следующий день. ' +
      'Сначала они могут вызывать лёгкую сонливость, поэтому не садитесь за руль, пока не поймёте, как они на вас действуют. ' +
      'Приходите к нам через две недели.',
    gist: {
      q: 'О чём говорит фармацевт?',
      options: [
        'Как принимать новые таблетки',
        'Как записаться к врачу',
        'Сколько стоит лекарство',
        'Где находится аптека',
      ],
      answer: 0,
    },
    details: [
      {
        q: 'Когда принимать таблетки?',
        options: ['Утром и вечером, после еды', 'Только утром, до еды', 'Три раза в день', 'Когда захочется'],
        answer: 0,
      },
      {
        q: 'Что делать, если пропустили приём?',
        options: [
          'Не принимать две сразу, продолжать как обычно',
          'Принять две таблетки сразу',
          'Прекратить приём',
          'Позвонить врачу немедленно',
        ],
        answer: 0,
      },
      {
        q: 'Почему не стоит садиться за руль?',
        options: ['Может клонить в сон', 'Болят глаза', 'Кружится голова от еды', 'Так требует закон'],
        answer: 0,
      },
    ],
    gaps: [
      {
        sentence: 'Always after food, never on an ␣ stomach.',
        answer: 'empty',
        options: ['empty', 'upset', 'early', 'open'],
      },
      {
        sentence: 'If you ␣ one, do not take two together.',
        answer: 'forget',
        options: ['forget', 'remember', 'lose', 'drop'],
      },
      {
        sentence: 'They may make you feel a little ␣ at first.',
        answer: 'sleepy',
        options: ['sleepy', 'hungry', 'thirsty', 'angry'],
      },
    ],
  },
  {
    id: 'voicemail-daughter',
    title: 'Сообщение от дочери',
    setting: 'Дочь оставила вам голосовое сообщение.',
    level: 1,
    text:
      'Hi Mum, it’s me. Sorry I missed you. Listen, I can’t come on Saturday after all — ' +
      'the little one has come down with a cold and I don’t want to bring it round to you. ' +
      'But I could come on Sunday instead, if that suits you. I’ll bring the shopping with me, ' +
      'so don’t go carrying those heavy bags up the stairs again. Give me a ring when you get this. ' +
      'Love you. Bye.',
    ru:
      'Привет, мам, это я. Извини, что не застала. Слушай, я всё-таки не смогу приехать в субботу — ' +
      'малыш простудился, и я не хочу принести это тебе. Но могу приехать в воскресенье, если тебе удобно. ' +
      'Я привезу продукты, так что не таскай больше тяжёлые сумки вверх по лестнице. ' +
      'Перезвони, когда прослушаешь. Люблю тебя. Пока.',
    gist: {
      q: 'Кто и зачем звонил?',
      options: [
        'Дочь — перенести визит на другой день',
        'Врач — напомнить о приёме',
        'Магазин — сообщить о доставке',
        'Соседка — попросить о помощи',
      ],
      answer: 0,
    },
    details: [
      {
        q: 'Почему она не приедет в субботу?',
        options: ['Ребёнок простудился', 'Она на работе', 'Плохая погода', 'Сломалась машина'],
        answer: 0,
      },
      {
        q: 'Что она предлагает?',
        options: ['Приехать в воскресенье', 'Приехать через месяц', 'Совсем не приезжать', 'Встретиться в городе'],
        answer: 0,
      },
      {
        q: 'Что она привезёт с собой?',
        options: ['Продукты', 'Лекарства', 'Документы', 'Ничего'],
        answer: 0,
      },
    ],
    gaps: [
      {
        sentence: 'The little one has come down with a ␣.',
        answer: 'cold',
        options: ['cold', 'cough', 'fever', 'headache'],
      },
      {
        sentence: 'I could come on Sunday ␣, if that suits you.',
        answer: 'instead',
        options: ['instead', 'again', 'already', 'perhaps'],
      },
      {
        sentence: 'Give me a ␣ when you get this.',
        answer: 'ring',
        options: ['ring', 'call', 'letter', 'message'],
      },
    ],
  },
  {
    id: 'bus-announcement',
    title: 'Объявление в автобусе',
    setting: 'Вы едете в автобусе и слышите объявление водителя.',
    level: 2,
    text:
      'Ladies and gentlemen, thank you for travelling with us this morning. Please note that ' +
      'due to roadworks on the high street, this bus will not stop at the library today. ' +
      'The next stop will be the hospital, and after that we go straight on to the market square. ' +
      'If you need the library, please get off at the hospital and it is a short walk from there. ' +
      'Sorry for any inconvenience.',
    ru:
      'Дамы и господа, спасибо, что едете с нами сегодня утром. Обратите внимание: из-за дорожных работ ' +
      'на главной улице этот автобус сегодня не останавливается у библиотеки. Следующая остановка — больница, ' +
      'а затем мы едем сразу до рыночной площади. Если вам нужна библиотека, выходите у больницы, ' +
      'оттуда идти недалеко. Извините за неудобства.',
    gist: {
      q: 'О чём объявление?',
      options: [
        'Автобус сегодня не останавливается у библиотеки',
        'Автобус сломался',
        'Проезд подорожал',
        'Автобус едет в другой город',
      ],
      answer: 0,
    },
    details: [
      {
        q: 'Почему изменился маршрут?',
        options: ['Дорожные работы', 'Авария', 'Праздник', 'Плохая погода'],
        answer: 0,
      },
      {
        q: 'Какая следующая остановка?',
        options: ['Больница', 'Библиотека', 'Рыночная площадь', 'Вокзал'],
        answer: 0,
      },
      {
        q: 'Что делать, если нужна библиотека?',
        options: ['Выйти у больницы и пройти пешком', 'Ехать до конца', 'Пересесть на другой автобус', 'Выйти сейчас же'],
        answer: 0,
      },
    ],
    gaps: [
      {
        sentence: 'Due to ␣ on the high street, this bus will not stop at the library.',
        answer: 'roadworks',
        options: ['roadworks', 'bad weather', 'an accident', 'a festival'],
      },
      {
        sentence: 'The next ␣ will be the hospital.',
        answer: 'stop',
        options: ['stop', 'street', 'station', 'turn'],
      },
      {
        sentence: 'It is a short ␣ from there.',
        answer: 'walk',
        options: ['walk', 'ride', 'drive', 'journey'],
      },
    ],
  },
];

/** Rough spoken length, for showing "about 30 seconds" honestly. */
export function spokenSeconds(text: string): number {
  const words = text.trim().split(/\s+/).length;
  // ~155 words per minute is ordinary British speaking pace.
  return Math.round((words / 155) * 60);
}
