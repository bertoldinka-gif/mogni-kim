export type ThemeId =
  | 'default'
  | 'emerald'
  | 'parchment'
  | 'crimson'
  | 'cyberpunk'
  | 'light_parchment'
  | 'light_nord';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  cost: number;
  isLight?: boolean;
  bgMain: string;
  bgCard: string;
  accentPrimary: string;
  accentSecondary: string;
  accentGlow: string;
  previewSwatches: [string, string, string, string];
  badgeClass: string;
}

export const DEFAULT_THEME_ID: ThemeId = 'default';

export const UI_THEMES: ThemeDefinition[] = [
  {
    id: 'default',
    name: 'Ночной графит',
    description:
      'Классический глубокий сланец с фиолетово-синими акцентами и мягким контрастом.',
    cost: 0,
    bgMain: '#080B14',
    bgCard: '#111827',
    accentPrimary: '#8B5CF6',
    accentSecondary: '#3B82F6',
    accentGlow: 'rgba(139, 92, 246, 0.12)',
    previewSwatches: ['#080B14', '#111827', '#8B5CF6', '#3B82F6'],
    badgeClass: 'bg-violet-500/15 border-violet-500/40 text-violet-300',
  },
  {
    id: 'emerald',
    name: 'Изумрудная матрица',
    description:
      'Глубокий хвойно-обсидиановый фон с холодными изумрудными и бирюзовыми искрами.',
    cost: 350,
    bgMain: '#06110E',
    bgCard: '#0C1D18',
    accentPrimary: '#10B981',
    accentSecondary: '#14B8A6',
    accentGlow: 'rgba(16, 185, 129, 0.15)',
    previewSwatches: ['#06110E', '#0C1D18', '#10B981', '#14B8A6'],
    badgeClass: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
  },
  {
    id: 'parchment',
    name: 'Книжный пергамент',
    description:
      'Тёплый оттенок тёмного эспрессо и сепии с янтарными, золотыми и кремовыми тонами.',
    cost: 450,
    bgMain: '#14100D',
    bgCard: '#1F1915',
    accentPrimary: '#F59E0B',
    accentSecondary: '#D97706',
    accentGlow: 'rgba(245, 158, 11, 0.15)',
    previewSwatches: ['#14100D', '#1F1915', '#F59E0B', '#FDE68A'],
    badgeClass: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
  },
  {
    id: 'crimson',
    name: 'Багровый закат',
    description:
      'Насыщенный сливово-бордовый тон с рубиновыми и тёплыми закатными градиентами.',
    cost: 550,
    bgMain: '#130910',
    bgCard: '#1E1019',
    accentPrimary: '#F43F5E',
    accentSecondary: '#FB923C',
    accentGlow: 'rgba(244, 63, 94, 0.15)',
    previewSwatches: ['#130910', '#1E1019', '#F43F5E', '#FB923C'],
    badgeClass: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
  },
  {
    id: 'cyberpunk',
    name: 'Неоновый киберпанк',
    description:
      'Полночный индиго с неоновым цианом и фуксией для максимального драйва на ЕГЭ.',
    cost: 700,
    bgMain: '#090718',
    bgCard: '#120E29',
    accentPrimary: '#06B6D4',
    accentSecondary: '#D946EF',
    accentGlow: 'rgba(217, 70, 239, 0.17)',
    previewSwatches: ['#090718', '#120E29', '#06B6D4', '#D946EF'],
    badgeClass: 'bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-300',
  },
  {
    id: 'light_parchment',
    name: 'Утренний пергамент',
    description:
      'Светлая бумажная палитра с тёплым кремовым фоном, белыми карточками и контрастными чернилами для комфортного чтения днём.',
    cost: 400,
    isLight: true,
    bgMain: '#F6F3EC',
    bgCard: '#FFFFFF',
    accentPrimary: '#4F46E5',
    accentSecondary: '#D97706',
    accentGlow: 'rgba(79, 70, 229, 0.08)',
    previewSwatches: ['#F6F3EC', '#FFFFFF', '#4F46E5', '#D97706'],
    badgeClass: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700',
  },
  {
    id: 'light_nord',
    name: 'Скандинавский день',
    description:
      'Чистая светло-серая скандинавская тема с прохладными сланец-контрастами, фиолетовыми и изумрудными акцентами.',
    cost: 500,
    isLight: true,
    bgMain: '#F1F5F9',
    bgCard: '#FFFFFF',
    accentPrimary: '#7C3AED',
    accentSecondary: '#059669',
    accentGlow: 'rgba(124, 58, 237, 0.08)',
    previewSwatches: ['#F1F5F9', '#FFFFFF', '#7C3AED', '#059669'],
    badgeClass: 'bg-violet-500/15 border-violet-500/40 text-violet-700',
  },
];

export function getThemeById(id?: string | null): ThemeDefinition {
  return UI_THEMES.find((t) => t.id === id) ?? UI_THEMES[0];
}
