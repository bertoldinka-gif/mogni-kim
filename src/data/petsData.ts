export interface MentorCharacter {
  id: string;
  name: string;
  role: string;
  tagline?: string;
  description?: string;
  price?: number;
  monogram: string;
  avatarUrl: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  cardGradient: string;
  mistakeQuotes: string[];
  comboQuotes: string[];
  chatIntroQuotes: string[];
}

export const DEFAULT_TITLE = 'Новичок ФИПИ';

export const RARE_TITLES = [
  'Амулет Розенталя',
  'Кибер-Двоечник',
  'Взломщик ФИПИ',
  'Гроза Запятых',
] as const;

export const LOOTBOX_COST = 250;
export const MENTOR_HIRE_COST = 1000;

export const MENTORS: MentorCharacter[] = [
  {
    id: 'vader',
    name: 'Дарт Вейдер',
    role: 'Повелитель синтаксиса',
    monogram: 'ДВ',
    avatarUrl: './vader.jpg',
    accentBg: 'bg-rose-500/15',
    accentBorder: 'border-rose-500/40',
    accentText: 'text-rose-400',
    cardGradient: 'bg-gradient-to-br from-rose-950/50 via-slate-900 to-slate-900',
    mistakeQuotes: [
      'Твоё незнание правил оскорбляет Силу. Минус 15 XP.',
      'Тёмная сторона не прощает таких ошибок. Баллы уходят в пустоту.',
      'Ещё один такой промах — и экзаменаторы ФИПИ уничтожат тебя.',
    ],
    comboQuotes: [
      'Впечатляет. Сила грамматики пробуждается в тебе.',
      'Могущество безупречно. Продолжай в том же духе.',
    ],
    chatIntroQuotes: [
      'Слушай внимательно, юный падаван. Вот закон Империи по твоему вопросу:',
      'Сила орфографии не терпит догадок. Запомни этот устав:',
    ],
  },
  {
    id: 'hermione',
    name: 'Гермиона Грейнджер',
    role: 'Отличница Хогвартса',
    monogram: 'ГГ',
    avatarUrl: './hermione.jpg',
    accentBg: 'bg-amber-500/15',
    accentBorder: 'border-amber-500/40',
    accentText: 'text-amber-300',
    cardGradient: 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900',
    mistakeQuotes: [
      'Ну кто так делает?! Я же сто раз говорила читать правило! Минус 15 XP!',
      'Это просто катастрофа, как перепутать заклинания на первом курсе! Баллы списаны.',
      'Ох, ну неужели нельзя было подумать секунду? Минус 15 XP в никуда!',
    ],
    comboQuotes: [
      'Неплохо, очень неплохо! Почти на уровне моих конспектов.',
      'Превосходно! Видишь, как работает зубрежка правил?',
    ],
    chatIntroQuotes: [
      'Я как раз перечитывала учебник Розенталя! Вот точная выжимка по этому правилу:',
      'Ох, это же базовый материал из четвёртого параграфа! Записывай алгоритм:',
    ],
  },
  {
    id: 'marat',
    name: 'Марат',
    role: 'Пацан с района грамотности',
    monogram: 'МР',
    avatarUrl: './marat.jpg',
    accentBg: 'bg-cyan-500/15',
    accentBorder: 'border-cyan-500/40',
    accentText: 'text-cyan-400',
    cardGradient: 'bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-900',
    mistakeQuotes: [
      'Ну ты чего, братан, перед ФИПИ нас позоришь? Минус 15 XP с общака!',
      'Ошибка уровня чушпана, давай собирайся! Баллы сгорели.',
      'Слово пацана даю, это правило проще пареной репы. Верни потерянные XP!',
    ],
    comboQuotes: [
      'Красава! Вот это по-нашему, чисто по красоте раскидал!',
      'Уважуха, идешь без промахов!',
    ],
    chatIntroQuotes: [
      'Слышь, братан, тут всё чётко по понятиям русского языка. Держи расклад:',
      'Не кипишуй, сейчас по-быстрому разберём эту тему без заумных слов:',
    ],
  },
  {
    id: 'squid',
    name: 'Фронтмен',
    role: 'Распорядитель испытаний',
    monogram: 'ФР',
    avatarUrl: './squid.jpg',
    accentBg: 'bg-pink-500/15',
    accentBorder: 'border-pink-500/40',
    accentText: 'text-pink-400',
    cardGradient: 'bg-gradient-to-br from-pink-950/50 via-slate-900 to-slate-900',
    mistakeQuotes: [
      'Игрок, вы допустили ошибку. Штраф: 15 XP. Вы на грани выбывания.',
      'Нарушение правил игры. Ваш призовой фонд уменьшен.',
      'Еще одна подобная оплошность станет для вас фатальной.',
    ],
    comboQuotes: [
      'Игрок продолжает выживание. Точность соответствует требованиям.',
      'Вы успешно прошли очередной этап испытания.',
    ],
    chatIntroQuotes: [
      'Игрок, запрос принят. Передаю официальный регламент испытания:',
      'Внимательно изучите инструкцию. От этого зависит ваш проход в следующий раунд:',
    ],
  },
  {
    id: 'pushkin',
    name: 'Пушкин-Дуэлянт',
    role: 'Хранитель великого слога',
    monogram: 'АП',
    avatarUrl: './pushkin.jpg',
    accentBg: 'bg-violet-500/15',
    accentBorder: 'border-violet-500/40',
    accentText: 'text-violet-300',
    cardGradient: 'bg-gradient-to-br from-violet-950/60 via-slate-900 to-slate-900',
    mistakeQuotes: [
      'Сударь, за такое кощунство над великим языком я вызываю вас на дуэль! Минус 15 XP!',
      'О, муза орфографии рыдает! Вы только что прострелили себе 15 баллов.',
      'Мой дорогой друг, даже Дантес стрелял точнее, чем вы сейчас ответили!',
    ],
    comboQuotes: [
      'Браво, мой друг! Слог чист, как утренний рассвет в Болдино!',
      'Истинный гений! Перо само тянется записать ваш триумф!',
    ],
    chatIntroQuotes: [
      'Мой любезный друг, извольте внять гармонии великого русского слова:',
      'Перо наточено, свечи зажжены! Вот правило чистого слога:',
    ],
  },
  {
    id: 'wednesday',
    name: 'Уэнсдэй Аддамс',
    role: 'Адепт мрачной пунктуации',
    monogram: 'УА',
    avatarUrl: './wednesday.jpg',
    accentBg: 'bg-slate-500/20',
    accentBorder: 'border-slate-500/40',
    accentText: 'text-slate-200',
    cardGradient: 'bg-gradient-to-br from-slate-800/70 via-slate-900 to-slate-900',
    mistakeQuotes: [
      'Твоя ошибка доставляет мне мрачное эстетическое удовольствие. Минус 15 XP.',
      'Я бы похоронила этот ответ на заднем дворе. Баллы мертвы.',
      'Боль от потери XP — единственное, что напоминает нам о жизни.',
    ],
    comboQuotes: [
      'Удивительно. Ты оказался не настолько безнадёжным, как я думала.',
      'Почти достойно аплодисментов. Но я не буду улыбаться.',
    ],
    chatIntroQuotes: [
      'Не жди, что я буду воодушевлённой, но правило ты должен знать безупречно:',
      'Даже в мрачном хаосе грамматики есть холодная логика. Изучи её:',
    ],
  },
  {
    id: 'gosling',
    name: 'Райан Гослинг',
    role: 'Водитель ночного драйва',
    monogram: 'РГ',
    avatarUrl: './gosling.jpg',
    accentBg: 'bg-indigo-500/15',
    accentBorder: 'border-indigo-500/40',
    accentText: 'text-indigo-300',
    cardGradient: 'bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900',
    mistakeQuotes: [
      'Да не умер он в конце теста... Просто потерял 15 XP. Бывает.',
      'Я просто сижу, смотрю на эту ошибку и молчу. Минус баллы.',
      'Не расстраивайся, брат. В другой раз попадём в правило.',
    ],
    comboQuotes: [
      'Ну вот, другое дело. Едем дальше на ночном драйве.',
      'Чисто на стиле. Ни одной лишней запятой.',
    ],
    chatIntroQuotes: [
      'Я просто веду машину, слушаю синтвейв и объясняю тебе правило:',
      'Смотри на дорогу и на это правило — всё проще, чем кажется:',
    ],
  },
  {
    id: 'gandalf',
    name: 'Гэндальф',
    role: 'Маг Белой Орфографии',
    monogram: 'ГБ',
    avatarUrl: './gandalf.jpg',
    accentBg: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/40',
    accentText: 'text-emerald-300',
    cardGradient: 'bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900',
    mistakeQuotes: [
      'Бегите, глупцы! С такой орфографией на экзамен — ТЫ НЕ ПРОЙДЁШЬ! Минус 15 XP!',
      'Тьма невежества поглотила твои баллы. Обратись к свету правил!',
      'Даже посох мой померк от этого ответа. Потеряно 15 XP.',
    ],
    comboQuotes: [
      'Мудрость древних с тобой! Врата вуза открываются перед тобой!',
      'Свет знаний озаряет твой путь!',
    ],
    chatIntroQuotes: [
      'Загляни в древние свитки орфографии, путник. Вот тайное знание:',
      'Пусть свет правил рассеет туман сомнений на твоём пути:',
    ],
  },
  {
    id: 'joker',
    name: 'Джокер',
    role: 'Агент лингвохаоса',
    monogram: 'ДЖ',
    avatarUrl: './joker.jpg',
    accentBg: 'bg-fuchsia-500/15',
    accentBorder: 'border-fuchsia-500/40',
    accentText: 'text-fuchsia-300',
    cardGradient: 'bg-gradient-to-br from-fuchsia-950/50 via-slate-900 to-slate-900',
    mistakeQuotes: [
      'Ха-ха-ха! Почему такой серьёзный? Подумаешь, сгорело 15 XP!',
      'Обожаю этот хаос в твоей голове! Списываем баллы с улыбкой!',
      'Безумие — это повторять ту же ошибку и ждать, что баллы не спишут!',
    ],
    comboQuotes: [
      'Ха-ха! Вот это фокус! Экзаменаторы уже в панике!',
      'Блестящее представление! Продолжай в том же духе!',
    ],
    chatIntroQuotes: [
      'Ха-ха! Хочешь узнать секрет, от которого у ФИПИ дёргается глаз? Смотри сюда:',
      'Давай устроим маленький фокус с грамматикой! Вот главное правило:',
    ],
  },
  {
    id: 'rick',
    name: 'Рик Санчез',
    role: 'Гений мультивселенной орфографии',
    tagline: 'Гений мультивселенной орфографии',
    description:
      'Самый умный учёный во всех измерениях. Объяснит правила русского языка так, будто это квантовая физика, попутно высмеивая бюрократов из ФИПИ.',
    price: 1000,
    monogram: 'РС',
    avatarUrl: './rick.jpg',
    accentBg: 'bg-cyan-500/15',
    accentBorder: 'border-cyan-500/40',
    accentText: 'text-cyan-300',
    cardGradient: 'bg-gradient-to-br from-cyan-950/60 via-slate-900 to-emerald-950/40',
    mistakeQuotes: [
      '*Отрыжка* Поздравляю, Морти... то есть ученик, ты только что провалил тест в этой вселенной! Минус 15 XP.',
      'В бесконечном множестве измерений есть версия тебя, которая знает это правило. Но не здесь. Баллы списаны!',
      'Серьёзно?! Это же элементарная грамматика, а не сборка портальной пушки! Минус 15 XP.',
    ],
    comboQuotes: [
      'Вабба-лабба-даб-даб! Вот это уровень интеллекта, достойный Цитадели Риков!',
      'Неплохо для жителя измерения C-137. Продолжай в том же духе!',
    ],
    chatIntroQuotes: [
      '*Достаёт флягу* Слушай сюда и не перебивай, я не собираюсь повторять законы грамматики этой вселенной дважды:',
    ],
  },
];

export function getMentorById(id: string | null | undefined): MentorCharacter | null {
  if (!id) return null;
  return MENTORS.find((m) => m.id === id) ?? null;
}

export function pickRandomQuote(quotes: string[]): string {
  if (quotes.length === 0) return '';
  return quotes[Math.floor(Math.random() * quotes.length)];
}
