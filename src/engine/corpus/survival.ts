/**
 * Survival phrases, for shadowing aloud.
 *
 * These are chosen for one purpose: to keep a real conversation from
 * collapsing. The largest group is not greetings but the phrases for when she
 * has not understood -- "could you say that more slowly", "what does that
 * mean". A learner who can say those stays in the conversation and keeps
 * learning; one who cannot goes quiet and avoids the next one.
 *
 * They are drilled by shadowing -- hear it, say it aloud immediately -- which
 * is the fastest way to turn a phrase you recognise into one you can produce.
 */

export type PhraseGroup =
  | 'not-understood'
  | 'doctor'
  | 'shop'
  | 'phone'
  | 'street'
  | 'polite';

export interface Phrase {
  en: string;
  ru: string;
  /** When to use it, in Russian. */
  when: string;
  group: PhraseGroup;
  level: 1 | 2 | 3;
}

export const GROUP_TITLES: Record<PhraseGroup, string> = {
  'not-understood': 'Когда вы не поняли',
  doctor: 'У врача и в аптеке',
  shop: 'В магазине',
  phone: 'По телефону',
  street: 'На улице',
  polite: 'Вежливые фразы',
};

export const PHRASES: Phrase[] = [
  // The most important group in the whole app.
  { en: 'Sorry, could you say that again?', ru: 'Извините, не могли бы вы повторить?', when: 'Не расслышали или не поняли.', group: 'not-understood', level: 1 },
  { en: 'Could you speak more slowly, please?', ru: 'Не могли бы вы говорить помедленнее?', when: 'Говорят слишком быстро.', group: 'not-understood', level: 1 },
  { en: 'I did not catch that.', ru: 'Я не уловила.', when: 'Слышали, но не разобрали.', group: 'not-understood', level: 2 },
  { en: 'What does that mean?', ru: 'Что это значит?', when: 'Не знаете слово.', group: 'not-understood', level: 1 },
  { en: 'How do you spell that?', ru: 'Как это пишется?', when: 'Нужно записать имя или адрес.', group: 'not-understood', level: 2 },
  { en: 'Could you write it down for me?', ru: 'Не могли бы вы это записать?', when: 'Важную информацию лучше иметь на бумаге.', group: 'not-understood', level: 2 },
  { en: 'My English is not very good yet.', ru: 'Я пока не очень хорошо говорю по-английски.', when: 'Честно предупредить — люди станут говорить проще.', group: 'not-understood', level: 1 },
  { en: 'Just a moment, please.', ru: 'Одну минуту, пожалуйста.', when: 'Нужно время подумать или найти что-то.', group: 'not-understood', level: 1 },
  { en: 'Do you mean the one on the left?', ru: 'Вы имеете в виду тот, что слева?', when: 'Уточнить, правильно ли поняли.', group: 'not-understood', level: 3 },

  { en: 'I would like to make an appointment.', ru: 'Я хотела бы записаться на приём.', when: 'В регистратуре или по телефону.', group: 'doctor', level: 1 },
  { en: 'I have a sore throat.', ru: 'У меня болит горло.', when: 'Описать, что беспокоит.', group: 'doctor', level: 1 },
  { en: 'It hurts here.', ru: 'Болит вот здесь.', when: 'Показать рукой и сказать.', group: 'doctor', level: 1 },
  { en: 'I take tablets for blood pressure.', ru: 'Я принимаю таблетки от давления.', when: 'Врач спрашивает о лекарствах.', group: 'doctor', level: 2 },
  { en: 'I am allergic to penicillin.', ru: 'У меня аллергия на пенициллин.', when: 'Важно сказать до назначения лекарства.', group: 'doctor', level: 2 },
  { en: 'How often should I take it?', ru: 'Как часто это принимать?', when: 'Уточнить у врача или фармацевта.', group: 'doctor', level: 1 },
  { en: 'Do I take it before or after food?', ru: 'Принимать до еды или после?', when: 'Очень частый вопрос в аптеке.', group: 'doctor', level: 2 },
  { en: 'I need something for a cold.', ru: 'Мне нужно что-нибудь от простуды.', when: 'В аптеке без рецепта.', group: 'doctor', level: 1 },
  { en: 'Could I have a repeat prescription?', ru: 'Можно повторить рецепт?', when: 'Лекарство заканчивается.', group: 'doctor', level: 3 },

  { en: 'How much is this?', ru: 'Сколько это стоит?', when: 'Нет ценника.', group: 'shop', level: 1 },
  { en: 'Do you have this in a larger size?', ru: 'У вас есть размер побольше?', when: 'В магазине одежды или обуви.', group: 'shop', level: 2 },
  { en: 'I am just looking, thank you.', ru: 'Я просто смотрю, спасибо.', when: 'Продавец предлагает помощь.', group: 'shop', level: 1 },
  { en: 'Can I pay by card?', ru: 'Можно оплатить картой?', when: 'На кассе.', group: 'shop', level: 1 },
  { en: 'Could I have a bag, please?', ru: 'Можно пакет, пожалуйста?', when: 'На кассе.', group: 'shop', level: 1 },
  { en: 'I would like to return this.', ru: 'Я хотела бы это вернуть.', when: 'Товар не подошёл или сломан.', group: 'shop', level: 2 },
  { en: 'Here is the receipt.', ru: 'Вот чек.', when: 'При возврате или обмене.', group: 'shop', level: 1 },
  { en: 'Is there a discount for pensioners?', ru: 'Есть скидка для пенсионеров?', when: 'Во многих местах — есть.', group: 'shop', level: 3 },

  { en: 'Hello, this is Olga speaking.', ru: 'Здравствуйте, это говорит Ольга.', when: 'Так представляются по телефону.', group: 'phone', level: 1 },
  { en: 'Could I speak to the doctor, please?', ru: 'Можно поговорить с врачом?', when: 'Просите соединить.', group: 'phone', level: 1 },
  { en: 'I am calling about my appointment.', ru: 'Я звоню по поводу приёма.', when: 'Сразу назвать причину звонка.', group: 'phone', level: 2 },
  { en: 'Could you repeat that, please? The line is bad.', ru: 'Повторите, пожалуйста, плохая связь.', when: 'Плохо слышно.', group: 'phone', level: 2 },
  { en: 'Could you call me back later?', ru: 'Не могли бы вы перезвонить позже?', when: 'Сейчас неудобно говорить.', group: 'phone', level: 2 },
  { en: 'I will be at home all morning.', ru: 'Я буду дома всё утро.', when: 'Договориться о приходе мастера.', group: 'phone', level: 2 },

  { en: 'Excuse me, where is the post office?', ru: 'Извините, где находится почта?', when: 'Спросить дорогу.', group: 'street', level: 1 },
  { en: 'Is it far from here?', ru: 'Это далеко отсюда?', when: 'Понять, идти пешком или ехать.', group: 'street', level: 1 },
  { en: 'Which bus goes to the hospital?', ru: 'Какой автобус идёт до больницы?', when: 'На остановке.', group: 'street', level: 1 },
  { en: 'Does this bus stop at the market?', ru: 'Этот автобус останавливается у рынка?', when: 'Уточнить у водителя.', group: 'street', level: 2 },
  { en: 'Could you show me on the map?', ru: 'Не могли бы вы показать на карте?', when: 'Объяснение на словах не помогло.', group: 'street', level: 2 },
  { en: 'I think I am lost.', ru: 'Кажется, я заблудилась.', when: 'Попросить помощи у прохожего.', group: 'street', level: 1 },

  { en: 'Good morning. How are you?', ru: 'Доброе утро. Как вы?', when: 'Обычное приветствие до полудня.', group: 'polite', level: 1 },
  { en: 'Very well, thank you. And you?', ru: 'Очень хорошо, спасибо. А вы?', when: 'Ответ на «How are you?» — и вопрос в ответ.', group: 'polite', level: 1 },
  { en: 'Thank you very much for your help.', ru: 'Большое спасибо за помощь.', when: 'Вам помогли.', group: 'polite', level: 1 },
  { en: 'That is very kind of you.', ru: 'Это очень любезно с вашей стороны.', when: 'Тёплый ответ на услугу.', group: 'polite', level: 2 },
  { en: 'I am sorry to bother you.', ru: 'Извините за беспокойство.', when: 'Прежде чем обратиться с просьбой.', group: 'polite', level: 2 },
  { en: 'No, thank you. I am fine.', ru: 'Нет, спасибо. У меня всё хорошо.', when: 'Вежливо отказаться.', group: 'polite', level: 1 },
  { en: 'Have a nice day.', ru: 'Хорошего дня.', when: 'Прощание с продавцом или соседом.', group: 'polite', level: 1 },
  { en: 'See you on Sunday.', ru: 'Увидимся в воскресенье.', when: 'Договорились о встрече.', group: 'polite', level: 1 },
];

/** How many phrases one daily drill contains -- about three minutes of work. */
export const DAILY_COUNT = 8;
