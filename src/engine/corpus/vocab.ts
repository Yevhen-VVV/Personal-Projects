export type Theme =
  | 'health'
  | 'home'
  | 'money'
  | 'travel'
  | 'people'
  | 'daily'
  | 'feelings'
  | 'weather'
  | 'technology';

export interface VocabEntry {
  word: string;
  /** A definition written in plain English, not dictionary register. */
  def: string;
  theme: Theme;
  level: 1 | 2 | 3;
  /** Natural sentence using the word; ␣ marks the word's position. */
  example?: string;
}

/**
 * Vocabulary chosen for the life of an older adult -- appointments, pensions,
 * grandchildren, weather, getting about -- rather than the school and office
 * vocabulary most course books default to.
 *
 * Distractors are drawn from the same theme and level, so a question can never
 * be solved by noticing that three options are about the kitchen and one is
 * about a hospital.
 */
export const VOCAB: VocabEntry[] = [
  // health
  { word: 'appointment', def: 'an arranged time to see a doctor or other professional', theme: 'health', level: 1, example: 'I have an ␣ with the nurse at ten.' },
  { word: 'prescription', def: 'a doctor’s written order for medicine', theme: 'health', level: 2, example: 'The chemist filled my ␣ in ten minutes.' },
  { word: 'symptom', def: 'a sign that you have an illness', theme: 'health', level: 2, example: 'A cough is the first ␣ of a cold.' },
  { word: 'treatment', def: 'the care given to make someone better', theme: 'health', level: 2, example: 'The ␣ lasted six weeks.' },
  { word: 'dizzy', def: 'feeling that everything is spinning around you', theme: 'health', level: 2, example: 'I feel ␣ when I stand up too quickly.' },
  { word: 'sore', def: 'painful when touched or used', theme: 'health', level: 1, example: 'I have a ␣ throat this morning.' },
  { word: 'swollen', def: 'larger than normal because of injury or illness', theme: 'health', level: 3, example: 'Her ankle was badly ␣ after the fall.' },
  { word: 'recover', def: 'become well again after being ill', theme: 'health', level: 2, example: 'It took him a month to ␣ from the operation.' },
  { word: 'painkiller', def: 'medicine that reduces pain', theme: 'health', level: 2, example: 'Take one ␣ every four hours.' },
  { word: 'check-up', def: 'a routine medical examination', theme: 'health', level: 2, example: 'I go for a ␣ once a year.' },
  { word: 'chemist', def: 'a shop that sells medicine (British English)', theme: 'health', level: 1, example: 'The ␣ is next to the post office.' },
  { word: 'GP', def: 'a family doctor who treats general illnesses', theme: 'health', level: 3, example: 'You will need a letter from your ␣.' },

  // home
  { word: 'kettle', def: 'a container used for boiling water', theme: 'home', level: 1, example: 'Put the ␣ on and we will have tea.' },
  { word: 'cupboard', def: 'a piece of furniture with a door and shelves', theme: 'home', level: 1, example: 'The plates are in the ␣.' },
  { word: 'blanket', def: 'a thick cover to keep you warm in bed', theme: 'home', level: 1, example: 'She put an extra ␣ on the bed.' },
  { word: 'curtains', def: 'cloth hung over a window', theme: 'home', level: 1, example: 'Would you draw the ␣, please?' },
  { word: 'tap', def: 'the fitting that controls the flow of water', theme: 'home', level: 1, example: 'The kitchen ␣ is dripping again.' },
  { word: 'hallway', def: 'the passage just inside the front door', theme: 'home', level: 2, example: 'Leave your boots in the ␣.' },
  { word: 'landlord', def: 'the person who owns a property you rent', theme: 'home', level: 2, example: 'I telephoned the ␣ about the boiler.' },
  { word: 'boiler', def: 'the machine that heats water for a house', theme: 'home', level: 2, example: 'The ␣ broke down in the cold weather.' },
  { word: 'draught', def: 'unwanted cold air coming into a room', theme: 'home', level: 3, example: 'There is a ␣ under the door.' },
  { word: 'tidy', def: 'arranged neatly, with everything in place', theme: 'home', level: 1, example: 'She keeps the flat very ␣.' },
  { word: 'leak', def: 'a hole that lets liquid escape', theme: 'home', level: 2, example: 'There is a ␣ in the roof.' },

  // money
  { word: 'pension', def: 'regular money paid to someone who has retired', theme: 'money', level: 1, example: 'His ␣ arrives on the third of the month.' },
  { word: 'bill', def: 'a paper showing how much you must pay', theme: 'money', level: 1, example: 'The electricity ␣ came yesterday.' },
  { word: 'discount', def: 'a reduction in the usual price', theme: 'money', level: 2, example: 'Over sixties get a ␣ on Tuesdays.' },
  { word: 'refund', def: 'money returned to you for goods you took back', theme: 'money', level: 2, example: 'They gave me a full ␣.' },
  { word: 'afford', def: 'to have enough money for something', theme: 'money', level: 2, example: 'We cannot ␣ a new car this year.' },
  { word: 'savings', def: 'money you have kept rather than spent', theme: 'money', level: 2, example: 'They used their ␣ for the repairs.' },
  { word: 'expensive', def: 'costing a lot of money', theme: 'money', level: 1, example: 'That restaurant is too ␣ for us.' },
  { word: 'benefit', def: 'money the government pays to people who need help', theme: 'money', level: 3, example: 'She receives a heating ␣ in winter.' },
  { word: 'instalment', def: 'one of several regular payments for something', theme: 'money', level: 3, example: 'We pay for the sofa in monthly ␣s.' },

  // travel
  { word: 'timetable', def: 'a list of times when buses or trains run', theme: 'travel', level: 1, example: 'Check the ␣ before you leave.' },
  { word: 'platform', def: 'the place beside the track where you wait for a train', theme: 'travel', level: 1, example: 'The train leaves from ␣ four.' },
  { word: 'return ticket', def: 'a ticket to a place and back again', theme: 'travel', level: 2, example: 'A ␣ to York, please.' },
  { word: 'delay', def: 'a period of waiting caused by a problem', theme: 'travel', level: 2, example: 'There was an hour’s ␣ at the airport.' },
  { word: 'luggage', def: 'the bags and cases you travel with', theme: 'travel', level: 1, example: 'We only took hand ␣.' },
  { word: 'pavement', def: 'the path at the side of a road for walking', theme: 'travel', level: 1, example: 'The ␣ was icy this morning.' },
  { word: 'crossing', def: 'a marked place where you can walk over a road', theme: 'travel', level: 2, example: 'Use the ␣ by the church.' },
  { word: 'fare', def: 'the money you pay for a journey', theme: 'travel', level: 2, example: 'The bus ␣ has gone up again.' },

  // people
  { word: 'neighbour', def: 'a person who lives near you', theme: 'people', level: 1, example: 'My ␣ takes in my parcels.' },
  { word: 'relative', def: 'a member of your family', theme: 'people', level: 2, example: 'We have ␣s in Canada.' },
  { word: 'widow', def: 'a woman whose husband has died', theme: 'people', level: 2, example: 'She has been a ␣ for ten years.' },
  { word: 'colleague', def: 'a person you work with', theme: 'people', level: 2, example: 'An old ␣ telephoned last night.' },
  { word: 'acquaintance', def: 'someone you know slightly, not a close friend', theme: 'people', level: 3, example: 'He is an ␣ from the bowls club.' },
  { word: 'generous', def: 'willing to give more than is expected', theme: 'people', level: 2, example: 'She is very ␣ with her time.' },
  { word: 'stubborn', def: 'refusing to change your mind', theme: 'people', level: 3, example: 'My father was a ␣ man.' },
  { word: 'reliable', def: 'able to be trusted to do what is needed', theme: 'people', level: 2, example: 'He is a ␣ neighbour.' },

  // daily
  { word: 'errand', def: 'a short journey to do a small job', theme: 'daily', level: 3, example: 'I have a few ␣s in town.' },
  { word: 'queue', def: 'a line of people waiting for their turn', theme: 'daily', level: 1, example: 'There was a long ␣ at the post office.' },
  { word: 'parcel', def: 'something wrapped up to be sent by post', theme: 'daily', level: 1, example: 'A ␣ arrived for you.' },
  { word: 'appliance', def: 'a machine used in the home, such as a washing machine', theme: 'daily', level: 3, example: 'The shop repairs kitchen ␣s.' },
  { word: 'spare', def: 'kept in reserve, in case it is needed', theme: 'daily', level: 2, example: 'I keep a ␣ key under the pot.' },
  { word: 'rubbish', def: 'things you throw away', theme: 'daily', level: 1, example: 'The ␣ is collected on Wednesdays.' },
  { word: 'schedule', def: 'a plan of when things will happen', theme: 'daily', level: 2, example: 'My week has a busy ␣.' },

  // feelings
  { word: 'lonely', def: 'unhappy because you are alone', theme: 'feelings', level: 1, example: 'The evenings can be ␣ in winter.' },
  { word: 'grateful', def: 'wanting to thank someone for their help', theme: 'feelings', level: 2, example: 'I am very ␣ for your kindness.' },
  { word: 'anxious', def: 'worried about something that may happen', theme: 'feelings', level: 2, example: 'She felt ␣ before the results.' },
  { word: 'relieved', def: 'glad that something unpleasant is over', theme: 'feelings', level: 2, example: 'I was ␣ when the test was normal.' },
  { word: 'content', def: 'quietly happy with what you have', theme: 'feelings', level: 3, example: 'He is ␣ with his small garden.' },
  { word: 'exhausted', def: 'extremely tired', theme: 'feelings', level: 2, example: 'After the journey I was ␣.' },
  { word: 'proud', def: 'pleased about something good you or yours achieved', theme: 'feelings', level: 1, example: 'She is ␣ of her grandchildren.' },

  // weather
  { word: 'drizzle', def: 'very light rain', theme: 'weather', level: 3, example: 'It is only a ␣ — take the small umbrella.' },
  { word: 'frost', def: 'a thin white layer of ice on cold mornings', theme: 'weather', level: 2, example: 'There was ␣ on the car windows.' },
  { word: 'breeze', def: 'a light, pleasant wind', theme: 'weather', level: 2, example: 'There was a cool ␣ off the sea.' },
  { word: 'shower', def: 'a short period of rain', theme: 'weather', level: 1, example: 'We had a heavy ␣ at lunchtime.' },
  { word: 'mild', def: 'not too cold, for the time of year', theme: 'weather', level: 2, example: 'It has been a ␣ winter.' },
  { word: 'slippery', def: 'difficult to walk on without falling', theme: 'weather', level: 2, example: 'The path is ␣ after rain.' },

  // technology
  { word: 'charger', def: 'the cable that puts power back into a device', theme: 'technology', level: 1, example: 'I have left my ␣ at home.' },
  { word: 'password', def: 'the secret word that lets you into an account', theme: 'technology', level: 1, example: 'I have forgotten my ␣ again.' },
  { word: 'screen', def: 'the flat part of a device that shows pictures and words', theme: 'technology', level: 1, example: 'The ␣ is too bright.' },
  { word: 'download', def: 'to copy something from the internet onto your device', theme: 'technology', level: 2, example: 'Could you ␣ the photographs for me?' },
  { word: 'settings', def: 'the part of a device where you change how it works', theme: 'technology', level: 2, example: 'You can make the text bigger in ␣.' },
  { word: 'scam', def: 'a dishonest trick to take your money or details', theme: 'technology', level: 3, example: 'That message was a ␣ — delete it.' },
  { word: 'volume', def: 'how loud a sound is', theme: 'technology', level: 1, example: 'Turn the ␣ up a little.' },
];
