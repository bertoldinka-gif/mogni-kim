import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  AudioLines,
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  BookmarkX,
  CheckCircle2,
  FileEdit,
  Flame,
  Gift,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Type,
  Zap,
} from 'lucide-react';
import {
  GRADE_LABELS,
  getAnalyticsCategoriesForGrade,
  getModulesForGrade,
  getSprintsForGrade,
} from '../data/curriculum';
import { getMentorById } from '../data/petsData';
import {
  BlitzModeId,
  CategoryStatsMap,
  DailyChallengeState,
  MistakeItem,
  SprintId,
  SprintModule,
  UserProfile,
} from '../types/platform';
import { AnimatedXpValue, FloatingXpBadge, useXpDeltaToast } from './AnimatedXpCounter';
import { LogoMark } from './LogoMark';
import { MentorAvatar } from './MentorAvatar';
import { GiftsShelf } from './GiftsShelf';
import { upgradeOwnedGift } from '../utils/storage';

interface DashboardViewProps {
  user: UserProfile;
  mistakes: MistakeItem[];
  dailyChallenge: DailyChallengeState;
  categoryStats: CategoryStatsMap;
  recentLevelUp?: boolean;
  onClaimDailyChallenge: () => void;
  onPracticeWeakSpot: (categoryId: string) => void;
  onStartBlitzDuel: (mode: BlitzModeId) => void;
  onOpenMistakesFolder: () => void;
  onStartMistakeReview: () => void;
  onStartSprint: (sprint: SprintModule) => void;
  onOpenSprints: () => void;
  onOpenCurriculum: () => void;
  onStartMockTest: () => void;
}

interface RankInfo {
  title: string;
  minXp: number;
  nextRankTitle: string | null;
  nextRankXp: number | null;
  progressPct: number;
  remainingXp: number;
}

function getRankInfo(xp: number): RankInfo {
  if (xp < 200) {
    return {
      title: 'Стажёр грамотности',
      minXp: 0,
      nextRankTitle: 'Знаток правил',
      nextRankXp: 200,
      progressPct: Math.min(100, Math.round((xp / 200) * 100)),
      remainingXp: 200 - xp,
    };
  }
  if (xp < 500) {
    return {
      title: 'Знаток правил',
      minXp: 200,
      nextRankTitle: 'Мастер орфографии',
      nextRankXp: 500,
      progressPct: Math.min(100, Math.round(((xp - 200) / 300) * 100)),
      remainingXp: 500 - xp,
    };
  }
  if (xp < 1000) {
    return {
      title: 'Мастер орфографии',
      minXp: 500,
      nextRankTitle: 'Повелитель КИМов',
      nextRankXp: 1000,
      progressPct: Math.min(100, Math.round(((xp - 500) / 500) * 100)),
      remainingXp: 1000 - xp,
    };
  }
  return {
    title: 'Повелитель КИМов',
    minXp: 1000,
    nextRankTitle: null,
    nextRankXp: null,
    progressPct: 100,
    remainingXp: 0,
  };
}

function getCurrentWeekDays(activeDays: string[] = []): {
  label: string;
  iso: string;
  active: boolean;
  isToday: boolean;
}[] {
  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);
  const jsDay = now.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;

  return labels.map((label, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() + mondayOffset + idx);
    const iso = d.toISOString().slice(0, 10);
    return {
      label,
      iso,
      active: activeDays.includes(iso),
      isToday: iso === todayISO,
    };
  });
}

const DAILY_MENTOR_MOTIVATION: Record<string, string> = {
  vader: 'Покажи дисциплину разума — выполни дневную норму и забери заслуженные баллы.',
  hermione: 'Я уже составила план на сегодня. Сделай этот вызов — и +100 XP у тебя в кармане!',
  marat: 'Держи слово пацана: закрывай сегодняшний вызов без суеты, сотка XP на дороге не валяется.',
  squid: 'Новое испытание активировано. Докажите свою точность и получите +100 XP.',
  pushkin: 'К перу, мой друг! Преодолейте сегодняшнее испытание и прославьте свой слог!',
  wednesday: 'Мрачный день идеален для того, чтобы уничтожить пару ошибок и забрать награду.',
  gosling: 'Просто садишься, решаешь вызов дня и забираешь +100 XP. Ничего лишнего.',
  gandalf: 'Пройди сегодняшнее испытание, путник, и свет знаний принесёт тебе +100 XP!',
  joker: 'Ха-ха! Сможешь выполнить мой вызов дня и не растерять очки? Ставка — 100 XP!',
  rick: 'Морти... то есть ученик, хватит прокрастинировать! Быстро закрыл вызов дня — и +100 XP в карман.',
};

const BLITZ_MODE_OPTIONS: Array<{ id: BlitzModeId; label: string }> = [
  { id: 'orthoepy', label: 'Ударения' },
  { id: 'paronyms', label: 'Паронимы' },
  { id: 'vocabulary', label: 'Словарные слова' },
  { id: 'mix', label: 'Микс на скорость' },
];

const SPRINT_CARD_THEMES: Record<
  SprintId,
  {
    gradient: string;
    hoverBorder: string;
    bar: string;
    watermark: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  vocabulary: {
    gradient: 'bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-teal-500/60',
    bar: 'bg-teal-500',
    watermark: 'text-teal-400',
    Icon: BookOpen,
  },
  orthoepy: {
    gradient: 'bg-gradient-to-br from-violet-950/60 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-violet-500/60',
    bar: 'bg-violet-500',
    watermark: 'text-violet-400',
    Icon: AudioLines,
  },
  paronyms: {
    gradient: 'bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-cyan-500/60',
    bar: 'bg-cyan-500',
    watermark: 'text-cyan-400',
    Icon: Type,
  },
  phraseology: {
    gradient: 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-amber-500/60',
    bar: 'bg-amber-500',
    watermark: 'text-amber-400',
    Icon: BookMarked,
  },
  expressive_means: {
    gradient: 'bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-emerald-500/60',
    bar: 'bg-emerald-500',
    watermark: 'text-emerald-400',
    Icon: Sparkles,
  },
  dictation: {
    gradient: 'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-indigo-500/60',
    bar: 'bg-indigo-500',
    watermark: 'text-indigo-400',
    Icon: FileEdit,
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  mistakes,
  dailyChallenge,
  categoryStats,
  recentLevelUp = false,
  onClaimDailyChallenge,
  onPracticeWeakSpot,
  onStartBlitzDuel,
  onOpenMistakesFolder,
  onStartMistakeReview,
  onStartSprint,
  onOpenSprints,
  onOpenCurriculum,
  onStartMockTest,
}) => {
  const accuracy =
    user.totalAnswered > 0
      ? Math.round((user.totalCorrect / user.totalAnswered) * 100)
      : 0;

  const gradeModules = getModulesForGrade(user.grade);
  const sprints = getSprintsForGrade(user.grade);
  const isExamGrade = user.grade === 'oge' || user.grade === 'ege';

  const rank = getRankInfo(user.xp);
  const xpToast = useXpDeltaToast(user.xp);

  const prevRankMinXpRef = useRef<number>(rank.minXp);
  const [localLevelUp, setLocalLevelUp] = useState(false);
  const [selectedBlitzMode, setSelectedBlitzMode] = useState<BlitzModeId>('mix');

  useEffect(() => {
    if (rank.minXp > prevRankMinXpRef.current) {
      setLocalLevelUp(true);
      prevRankMinXpRef.current = rank.minXp;
      const timer = window.setTimeout(() => setLocalLevelUp(false), 2400);
      return () => window.clearTimeout(timer);
    }
    prevRankMinXpRef.current = rank.minXp;
  }, [rank.minXp]);

  const isLevelUpCelebrating = Boolean(localLevelUp || recentLevelUp);

  const activeDaysList = user.activeDays ?? (user.lastActiveDate ? [user.lastActiveDate] : []);
  const weekDays = getCurrentWeekDays(activeDaysList);

  const activeMentor = getMentorById(user.activeMentorId);
  const mentorMotivation = activeMentor
    ? DAILY_MENTOR_MOTIVATION[activeMentor.id] ||
      'Выполни сегодняшнюю задачу без поблажек и забери +100 XP!'
    : 'Выполните ежедневное задание по стандартам ФИПИ и получите +100 XP к балансу.';

  const challengeCompleted = dailyChallenge.progress >= dailyChallenge.target;
  const challengePct = Math.min(
    100,
    Math.round((dailyChallenge.progress / Math.max(1, dailyChallenge.target)) * 100)
  );

  // Dynamically build literacy categories from the student's active grade
  const gradeCategories = getAnalyticsCategoriesForGrade(user.grade);
  const computedCategories = gradeCategories.map((cat) => {
    const stat = categoryStats[cat.id] ?? { correct: 0, total: 0 };
    const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
    return {
      id: cat.id,
      label: cat.label,
      correct: stat.correct,
      total: stat.total,
      pct,
    };
  });

  const practicedCategories = computedCategories.filter((c) => c.pct !== null);
  const weakSpotCategory =
    practicedCategories.length > 0
      ? practicedCategories.reduce((lowest, curr) => {
          if ((curr.pct ?? 100) < (lowest.pct ?? 100)) return curr;
          if (curr.pct === lowest.pct && curr.total - curr.correct > lowest.total - lowest.correct) {
            return curr;
          }
          return lowest;
        })
      : computedCategories[0];

  const handleDailyChallengeCta = () => {
    if (dailyChallenge.kind === 'sprint_10') {
      onOpenSprints();
    } else if (dailyChallenge.kind === 'mistakes_3') {
      if (mistakes.length > 0) {
        onStartMistakeReview();
      } else {
        onOpenMistakesFolder();
      }
    } else {
      onOpenCurriculum();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Привет, {user.nickname}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Активная программа:{' '}
            <span className="text-slate-200 font-medium">{GRADE_LABELS[user.grade]}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isExamGrade && (
            <button
              type="button"
              onClick={onStartMockTest}
              className="px-4 py-2 rounded-lg bg-slate-900/70 backdrop-blur-md border border-slate-700/80 hover:border-violet-500/50 text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-all cursor-pointer whitespace-nowrap"
            >
              Комплексный тест
            </button>
          )}
          <button
            type="button"
            onClick={onOpenCurriculum}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-xs sm:text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Открыть темы</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rank & Level Banner + 7-Day Activity Tracker */}
      <div
        className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-violet-950/60 via-slate-900/90 to-amber-950/30 backdrop-blur-md border transition-all duration-700 ${
          isLevelUpCelebrating
            ? 'border-amber-400/60 shadow-[0_0_28px_rgba(245,158,11,0.22)]'
            : 'border-slate-800/80'
        }`}
      >
        <Award className="w-28 h-28 opacity-10 -bottom-5 -right-5 absolute pointer-events-none text-amber-400" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left: Rank & Glowing Progress Bar */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isLevelUpCelebrating
                      ? 'bg-amber-400/25 border-amber-400/70 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.55)] scale-105'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Текущий ранг</span>
                    {isLevelUpCelebrating && (
                      <span className="pointer-events-none inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-[10px] font-semibold text-amber-200 animate-pulse">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                        Новый уровень!
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white leading-tight">
                    {rank.title}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <div className="relative inline-block font-mono-num text-base sm:text-lg font-bold text-amber-300">
                  <AnimatedXpValue value={user.xp} durationMs={600} suffix=" XP" />
                  {xpToast && (
                    <FloatingXpBadge
                      toastKey={xpToast.key}
                      delta={xpToast.delta}
                      className="-top-3 -right-1"
                    />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono-num">
                  {rank.nextRankTitle
                    ? `Осталось ${rank.remainingXp} XP до «${rank.nextRankTitle}»`
                    : 'Максимальный ранг достигнут'}
                </div>
              </div>
            </div>

            {/* Glowing Amber-to-Violet Progress Bar */}
            <div
              className={`h-2.5 w-full bg-[#080B14]/90 border rounded-full overflow-hidden transition-colors duration-500 ${
                isLevelUpCelebrating ? 'border-amber-400/60' : 'border-slate-800/80'
              }`}
            >
              <div
                className={`relative overflow-hidden h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-violet-500 shadow-[0_0_14px_rgba(245,158,11,0.55)] transition-[width,box-shadow,filter] duration-700 ease-out ${
                  isLevelUpCelebrating ? 'animate-level-up-glow brightness-115' : ''
                }`}
                style={{ width: `${Math.max(4, rank.progressPct)}%` }}
              >
                {isLevelUpCelebrating && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-level-shimmer"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right: 7-Day Activity Tracker */}
          <div className="lg:col-span-5 lg:border-l lg:border-slate-800/80 lg:pl-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Активность за неделю</span>
              <span className="font-mono-num text-amber-400 font-semibold">
                Серия: {user.streak} дн.
              </span>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((day) => (
                <div
                  key={day.iso}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${
                    day.active
                      ? 'bg-amber-500/15 border-amber-500/40 shadow-sm shadow-amber-950/40'
                      : day.isToday
                      ? 'bg-[#080B14]/80 border-violet-500/40'
                      : 'bg-[#080B14]/60 border-slate-800/70'
                  }`}
                >
                  <Flame
                    className={`w-4 h-4 ${
                      day.active
                        ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.65)]'
                        : 'text-slate-600'
                    }`}
                  />
                  <span
                    className={`mt-1 text-[11px] font-medium ${
                      day.active
                        ? 'text-amber-200'
                        : day.isToday
                        ? 'text-violet-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
 {/* Collectible Gifts Shelf (Telegram-style) */}
      <GiftsShelf
        user={user}
        onUpgradeGift={(uid) => {
          const res = upgradeOwnedGift(user, uid);
          if (res.error) return { ok: false, error: res.error };
          window.dispatchEvent(new Event('storage'));
          return { ok: true };
        }}
      />
      {/* 4-column KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Общая точность</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono-num text-2xl font-bold text-white mt-2">
            {accuracy}%
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono-num">
            {user.totalCorrect} из {user.totalAnswered} ответов
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Завершено тем</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono-num text-2xl font-bold text-white mt-2">
            {user.completedModuleIds.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono-num">
            Доступно модулей: {gradeModules.length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Опыт (XP)</span>
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono-num text-2xl font-bold text-white mt-2">
            <AnimatedXpValue value={user.xp} durationMs={600} />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Начисляется за каждую сессию
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Дневной стрик</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono-num text-2xl font-bold text-white mt-2">
            {user.streak} дн.
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Регулярная практика
          </div>
        </div>
      </div>

      {/* High-Energy Blitz Duel Banner ("⚡ Могни наставника!") */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-violet-950/75 via-indigo-950/60 to-amber-950/45 backdrop-blur-md border border-violet-500/35 shadow-xl shadow-indigo-950/25">
        <Zap className="w-28 h-28 opacity-10 -bottom-5 -right-5 absolute pointer-events-none text-amber-400" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            {activeMentor ? (
              <MentorAvatar mentor={activeMentor} size="md" ringTone="violet" />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#080B14] ring-2 ring-violet-500/50 shadow-lg flex items-center justify-center shrink-0">
                <LogoMark size={32} />
              </div>
            )}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-[11px] font-semibold text-amber-200">
                  <Timer className="w-3 h-3 text-amber-300" />
                  <span>Блиц-дуэль 60 сек</span>
                </span>
                {(user.duelsWon ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-[11px] font-mono-num font-semibold text-emerald-300">
                    <Trophy className="w-3 h-3" />
                    <span>Побед: {user.duelsWon}</span>
                  </span>
                )}
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white leading-tight">
                ⚡ Могни наставника!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Соревнуйся на скорость против{' '}
                <strong className="text-white">
                  {activeMentor ? activeMentor.name : 'Штаба ФИПИ'}
                </strong>
                : комбо до ×3, −3 сек за промах, награда за победу{' '}
                <span className="font-mono-num font-semibold text-amber-300">+150 XP</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Режим блиц-дуэли"
            >
              {BLITZ_MODE_OPTIONS.map((opt) => {
                const isSelected = selectedBlitzMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedBlitzMode(opt.id)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-violet-600/30 border-violet-400 text-white shadow-sm shadow-violet-500/20'
                        : 'bg-[#080B14]/70 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onStartBlitzDuel(selectedBlitzMode)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-amber-950/40 transition-all cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              <span>Начать блиц</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Mentor Challenge + Literacy Weak-Spot Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 1. Daily Mentor Challenge ("Вызов дня от наставника") */}
        <div className="lg:col-span-6 relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-950/35 via-slate-900/90 to-violet-950/40 backdrop-blur-md border border-amber-500/25 flex flex-col justify-between gap-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {activeMentor ? (
                  <MentorAvatar mentor={activeMentor} size="md" ringTone="amber" />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#080B14] ring-2 ring-violet-500/50 shadow-lg flex items-center justify-center shrink-0">
                    <LogoMark size={32} />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-amber-300/90">
                    Вызов дня от наставника
                  </div>
                  <div className="font-display text-sm sm:text-base font-bold text-white truncate">
                    {activeMentor ? activeMentor.name : 'Штаб ФИПИ'}
                  </div>
                </div>
              </div>

              <span className="font-mono-num text-xs font-bold text-amber-300 whitespace-nowrap shrink-0">
                +{dailyChallenge.rewardXp} XP
              </span>
            </div>

            <p className="text-xs text-slate-300 italic leading-relaxed">
              «{mentorMotivation}»
            </p>

            <div className="p-3.5 rounded-xl bg-[#080B14]/80 border border-slate-800/80 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <h3 className="font-display text-sm font-semibold text-white">
                    {dailyChallenge.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {dailyChallenge.description}
                  </p>
                </div>
                <span className="font-mono-num text-xs font-semibold text-slate-200 whitespace-nowrap shrink-0">
                  {dailyChallenge.progress} / {dailyChallenge.target}
                </span>
              </div>

              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    challengeCompleted
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                      : 'bg-gradient-to-r from-amber-400 to-violet-500'
                  }`}
                  style={{ width: `${challengePct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono-num">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span>Обновляется ежедневно</span>
            </span>

            {dailyChallenge.claimed ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-xs font-semibold text-emerald-300 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4" />
                <span>Награда получена</span>
              </span>
            ) : challengeCompleted ? (
              <button
                type="button"
                onClick={onClaimDailyChallenge}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-amber-950/40 transition-all cursor-pointer whitespace-nowrap"
              >
                <Gift className="w-4 h-4" />
                <span>Забрать награду (+100 XP)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDailyChallengeCta}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-amber-500/50 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Выполнить</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Literacy Weak-Spot Analytics ("Аналитика грамотности") */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    Аналитика грамотности
                  </h2>
                  <p className="text-xs text-slate-400">
                    Точность по {computedCategories.length}{' '}
                    {computedCategories.length === 1 ? 'разделу' : 'разделам'} программы
                  </p>
                </div>
              </div>

              {weakSpotCategory && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 whitespace-nowrap">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Зона роста: {weakSpotCategory.label}</span>
                </span>
              )}
            </div>

            {/* Dynamic Grade-Specific Horizontal Progress Bars */}
            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {computedCategories.map((cat) => {
                const isWeakSpot = weakSpotCategory?.id === cat.id;
                const pct = cat.pct ?? 0;

                let barColor = 'bg-slate-700';
                let textColor = 'text-slate-400';

                if (cat.total > 0) {
                  if (pct >= 80) {
                    barColor = 'bg-emerald-500';
                    textColor = 'text-emerald-400';
                  } else if (pct >= 50) {
                    barColor = 'bg-amber-500';
                    textColor = 'text-amber-400';
                  } else {
                    barColor = 'bg-rose-500';
                    textColor = 'text-rose-400';
                  }
                }

                return (
                  <div
                    key={cat.id}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isWeakSpot
                        ? 'bg-amber-500/5 border-amber-500/35'
                        : 'bg-[#080B14]/60 border-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-slate-200 truncate">
                          {cat.label}
                        </span>
                        {isWeakSpot && (
                          <span className="text-[11px] font-semibold text-amber-300 whitespace-nowrap">
                            · Зона роста
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono-num shrink-0">
                        <span className="text-[11px] text-slate-500">
                          {cat.total > 0 ? `${cat.correct}/${cat.total}` : '0/0'}
                        </span>
                        <span className={`font-semibold ${textColor}`}>
                          {cat.total > 0 ? `${pct}%` : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{
                          width: cat.total > 0 ? `${Math.max(4, pct)}%` : '0%',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {weakSpotCategory && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs text-slate-400 truncate">
                Фокус: <strong className="text-slate-200">{weakSpotCategory.label}</strong>
              </span>
              <button
                type="button"
                onClick={() => onPracticeWeakSpot(weakSpotCategory.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Тренировать зону роста</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Mistake Folder Widget + Quick Sprints Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Mistake Folder Widget */}
        <div className="lg:col-span-5 relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-900/90 backdrop-blur-md border border-slate-800/80 flex flex-col justify-between gap-5">
          <BookmarkX className="w-20 h-20 opacity-10 -bottom-3 -right-3 absolute pointer-events-none text-rose-400" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                  <BookmarkX className="w-4 h-4" />
                </div>
                <span>Работа над ошибками</span>
              </div>
              <span className="font-mono-num text-xs font-semibold text-slate-400">
                Неусвоенных: {mistakes.length}
              </span>
            </div>

            <div className="font-mono-num text-4xl font-bold text-white">
              {mistakes.length}
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {mistakes.length > 0
                ? 'У вас есть задания, требующие повторного разбора. Вопросы останутся в папке, пока вы сами не подтвердите «Выучил».'
                : 'Ошибок пока нет. Все неверные ответы из тестов автоматически сохраняются здесь.'}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5 pt-2">
            {mistakes.length > 0 && (
              <button
                type="button"
                onClick={onStartMistakeReview}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm font-medium text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4" />
                <span>Тренировать ошибки</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenMistakesFolder}
              className="px-4 py-2.5 rounded-lg bg-[#080B14]/80 border border-slate-700/80 hover:border-violet-500/50 text-xs sm:text-sm font-medium text-slate-200 transition-all cursor-pointer whitespace-nowrap"
            >
              Открыть папку
            </button>
          </div>
        </div>

        {/* Quick Sprints */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 flex flex-col justify-start gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Быстрые спринты
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Серии до 10 вопросов для ежедневной разминки
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sprints.map((sprint) => {
              const theme = SPRINT_CARD_THEMES[sprint.id];
              const IconComponent = theme.Icon;
              return (
                <button
                  key={sprint.id}
                  type="button"
                  onClick={() => onStartSprint(sprint)}
                  className={`relative overflow-hidden p-4 rounded-xl ${theme.gradient} border border-slate-800/80 ${theme.hoverBorder} hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group`}
                >
                  <IconComponent
                    className={`w-16 h-16 opacity-10 -bottom-2 -right-2 absolute pointer-events-none ${theme.watermark}`}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <span className="font-display text-sm font-semibold text-white">
                      {sprint.title}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                  </div>
                  <p className="relative z-10 text-xs text-slate-400 line-clamp-2 pb-1 pr-6">
                    {sprint.subtitle}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-slate-800/80">
                    <div
                      className={`h-full w-1/4 opacity-50 group-hover:w-2/3 group-hover:opacity-90 transition-all duration-300 ${theme.bar}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
