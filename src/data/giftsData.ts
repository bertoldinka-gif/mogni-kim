export interface GiftCatalogItem {
  id: string;
  emoji: string;
  name: string;
  cost: number;
  tag: string;
  description: string;
  limited?: boolean;
}

export interface GiftUpgradeRarity {
  id: 'cyberpunk' | 'gold' | 'upside_down' | 'six_seven';
  name: string;
  badgeColor: string;
  cardBg: string;
  borderGlow: string;
  patternSymbol: string;
  bonusPerks: string[];
}

export interface OwnedGiftRecord {
  uid: string;
  giftId: string;
  serialNumber: number;
  purchasedAt: string;
  mentorId: string | null;
  mentorSignature: string;
  upgraded?: {
    rarityId: GiftUpgradeRarity['id'];
    rarityName: string;
    perk: string;
    legend: string;
    upgradedAt: string;
  };
}

export const GIFT_UPGRADE_COST = 500;

export const GIFT_CATALOG: GiftCatalogItem[] = [
  {
    id: 'pushkin-quill',
    emoji: '🖋️',
    name: 'Золотое перо Пушкина',
    cost: 250,
    tag: 'Классика',
    description: 'Заряжено вдохновением Болдинской осени. Помогает не путать Н и НН в причастиях.',
  },
  {
    id: 'tonic-67',
    emoji: '🥤',
    name: 'Тоник «Six-Seven»',
    cost: 670,
    tag: 'Мем-серия',
    description: 'Шипучий эликсир для тех, кто закрыл орфографию без единой ошибки.',
  },
  {
    id: 'rosenthal-scroll',
    emoji: '📜',
    name: 'Свиток Розенталя',
    cost: 500,
    tag: 'Редкий',
    description: 'Древний манускрипт со всеми исключениями из справочника по правописанию и стилистике.',
  },
  {
    id: 'fipi-nuke',
    emoji: '💣',
    name: 'Ядерная кнопка ФИПИ',
    cost: 750,
    tag: 'Лимитированная серия',
    description: 'Мгновенно аннигилирует ловушки составителей в заданиях на пунктуацию и грамматику.',
    limited: true,
  },
  {
    id: 'orthoepy-owl',
    emoji: '🦉',
    name: 'Сова-хранитель ударений',
    cost: 720,
    tag: 'Редкий',
    description: 'Безошибочно ухает на правильный слог в словах «баловАть», «красИвее» и «сверлИт».',
  },
  {
    id: 'hundred-crystal',
    emoji: '💎',
    name: 'Кристалл 100-балльника',
    cost: 1300,
    tag: 'Легендарный',
    description: 'Символ абсолютного мастерства русского языка и гроза любого пробника.',
    limited: true,
  },
];

export const GIFT_UPGRADE_RARITIES: GiftUpgradeRarity[] = [
  {
    id: 'cyberpunk',
    name: 'Киберпанк-2077',
    badgeColor: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200',
    cardBg: 'bg-gradient-to-br from-fuchsia-950/90 via-slate-900 to-cyan-950/90',
    borderGlow: 'border-cyan-400/70 shadow-[0_0_25px_rgba(34,211,238,0.28)]',
    patternSymbol: '⚡',
    bonusPerks: [
      '+100% к нейро-защите от корней с чередованием',
      'Авто-детектор ловушек в причастных оборотах',
      'Иммунитет к коварным вводным словам «однако» и «наконец»',
    ],
  },
  {
    id: 'gold',
    name: 'Императорское Золото',
    badgeColor: 'bg-amber-500/25 border-amber-400/60 text-amber-200',
    cardBg: 'bg-gradient-to-br from-amber-950/90 via-yellow-950/60 to-slate-950',
    borderGlow: 'border-amber-400/80 shadow-[0_0_28px_rgba(245,158,11,0.35)]',
    patternSymbol: '👑',
    bonusPerks: [
      '+100 к благословению экспертов проверяющей комиссии',
      'Золотая аура безошибочных суффиксов -ОВА-/-ЫВА-',
      'Королевский иммунитет к ошибкам в парониме «одеть/надеть»',
    ],
  },
  {
    id: 'upside_down',
    name: 'Изнанка Архива',
    badgeColor: 'bg-rose-500/25 border-rose-500/60 text-rose-200',
    cardBg: 'bg-gradient-to-br from-rose-950/95 via-slate-950 to-purple-950/90',
    borderGlow: 'border-rose-500/75 shadow-[0_0_28px_rgba(244,63,94,0.32)]',
    patternSymbol: '🕯️',
    bonusPerks: [
      'Тёмное зрение: подсвечивает скрытые грамматические основы',
      '+99 к сопротивлению проклятым исключениям «стеклянный, оловянный, деревянный»',
      'Шёпот архива подсказывает стык союзов «что если»',
    ],
  },
  {
    id: 'six_seven',
    name: 'Сикс-Севен (67 Edition)',
    badgeColor: 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200',
    cardBg: 'bg-gradient-to-br from-emerald-950/90 via-indigo-950/80 to-violet-950/90',
    borderGlow: 'border-emerald-400/75 shadow-[0_0_28px_rgba(52,211,153,0.3)]',
    patternSymbol: '67',
    bonusPerks: [
      'Легендарный резонанс «6–7»: +67% к удаче на экзамене',
      'Абсолютная невосприимчивость к ловушкам с НЕ и НИ',
      'Мгновенная интуиция на слитное и раздельное написание наречий',
    ],
  },
];

const MENTOR_SIGNATURES: Record<string, string> = {
  vader: 'Да пребудет с тобой сила безупречной орфографии.',
  hermione: 'Ты заслужил эту награду упорным трудом. Так держать!',
  marat: 'Слово пацана: с таким трофеем любой КИМ по плечу.',
  squid: 'Игрок, ваша точность впечатляет. Примите этот артефакт.',
  pushkin: 'Храни сей дар как талисман вдохновения и ясного слога!',
  wednesday: 'Неплохо. Даже в этом мрачном мире есть место грамотности.',
  gosling: 'Просто забрал лучший трофей. Без лишних слов.',
  gandalf: 'Пусть этот артефакт освещает твой путь сквозь дебри пунктуации!',
  joker: 'Ха-ха! Отличная игрушка для победы над составителями тестов!',
  rick: 'Не потеряй эту штуку в другом измерении, гений грамматики.',
};

export function getMentorSignatureForGift(mentorId: string | null | undefined, mentorName?: string): string {
  if (!mentorId) {
    return 'Выдано Хранителем тренажёра за упорство и тягу к знаниям.';
  }
  const quote = MENTOR_SIGNATURES[mentorId] ?? 'Заслуженный трофей на пути к 100 баллам!';
  return mentorName ? `${mentorName}: «${quote}»` : `«${quote}»`;
}

export function generateGiftLegend(
  gift: GiftCatalogItem,
  rarity: GiftUpgradeRarity,
  serialNumber: number,
  mentorName?: string
): { perk: string; legend: string } {
  const perk =
    rarity.bonusPerks[Math.floor(Math.random() * rarity.bonusPerks.length)];
  const witness = mentorName || 'Дитмар Эльяшевич Розенталь';

  const templates = [
    `Экземпляр #${serialNumber} прошёл через горнило «${rarity.name}». По преданию, этим артефактом (${gift.name}) сам ${witness} отбивался от коварных исключений в 1974 году. Свойство: ${perk}.`,
    `Перекован в редчайшем стиле «${rarity.name}» под номером #${serialNumber}. Говорят, ${witness} лично запечатал в предмет «${gift.name}» тайный код безошибочного диктанта. Свойство: ${perk}.`,
    `Коллекционный реликт #${serialNumber} («${rarity.name}»). Легенда гласит, что владелец этого предмета не дрогнет даже перед самым сложным вариантом ФИПИ, а ${witness} одобрительно кивнёт с портрета. Свойство: ${perk}.`,
  ];

  const legend = templates[Math.floor(Math.random() * templates.length)];
  return { perk, legend };
}

function getStorageKey(userId: string): string {
  return `mogni_user_gifts_${userId}`;
}

export function loadUserGifts(userId: string): OwnedGiftRecord[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserGifts(userId: string, gifts: OwnedGiftRecord[]): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(gifts));
  } catch {
    // ignore quota errors
  }
}
