import React, { useState } from 'react';
import {
  ArrowRight,
  AudioLines,
  BookMarked,
  BookOpen,
  FileEdit,
  Sparkles,
  Timer,
  Trophy,
  Type,
  Zap,
} from 'lucide-react';
import { GRADE_LABELS, getSprintsForGrade } from '../data/curriculum';
import { MentorCharacter } from '../data/petsData';
import { BlitzModeId, GradeLevel, SprintId, SprintModule } from '../types/platform';
import { LogoMark } from './LogoMark';
import { MentorAvatar } from './MentorAvatar';

interface SprintsViewProps {
  grade: GradeLevel;
  activeMentor: MentorCharacter | null;
  duelsWon?: number;
  onStartSprint: (sprint: SprintModule) => void;
  onStartBlitzDuel: (mode: BlitzModeId) => void;
}

const BLITZ_MODE_OPTIONS: Array<{ id: BlitzModeId; label: string }> = [
  { id: 'orthoepy', label: 'Ударения' },
  { id: 'paronyms', label: 'Паронимы' },
  { id: 'vocabulary', label: 'Словарные слова' },
  { id: 'mix', label: 'Микс на скорость' },
];

const SPRINT_STYLES: Record<
  SprintId,
  {
    cardGradient: string;
    hoverBorder: string;
    badge: string;
    bar: string;
    watermarkColor: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  orthoepy: {
    cardGradient: 'bg-gradient-to-br from-violet-950/60 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-violet-500/60 hover:shadow-violet-950/40',
    badge: 'bg-violet-500/15 text-violet-400',
    bar: 'bg-violet-500',
    watermarkColor: 'text-violet-400',
    Icon: AudioLines,
  },
  paronyms: {
    cardGradient: 'bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-cyan-500/60 hover:shadow-cyan-950/40',
    badge: 'bg-cyan-500/15 text-cyan-400',
    bar: 'bg-cyan-500',
    watermarkColor: 'text-cyan-400',
    Icon: Type,
  },
  phraseology: {
    cardGradient: 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-amber-500/60 hover:shadow-amber-950/40',
    badge: 'bg-amber-500/15 text-amber-400',
    bar: 'bg-amber-500',
    watermarkColor: 'text-amber-400',
    Icon: BookMarked,
  },
  expressive_means: {
    cardGradient: 'bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-emerald-500/60 hover:shadow-emerald-950/40',
    badge: 'bg-emerald-500/15 text-emerald-400',
    bar: 'bg-emerald-500',
    watermarkColor: 'text-emerald-400',
    Icon: Sparkles,
  },
  dictation: {
    cardGradient: 'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-indigo-500/60 hover:shadow-indigo-950/40',
    badge: 'bg-indigo-500/15 text-indigo-400',
    bar: 'bg-indigo-500',
    watermarkColor: 'text-indigo-400',
    Icon: FileEdit,
  },
  vocabulary: {
    cardGradient: 'bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-teal-500/60 hover:shadow-teal-950/40',
    badge: 'bg-teal-500/15 text-teal-400',
    bar: 'bg-teal-500',
    watermarkColor: 'text-teal-400',
    Icon: BookOpen,
  },
};

export const SprintsView: React.FC<SprintsViewProps> = ({
  grade,
  activeMentor,
  duelsWon = 0,
  onStartSprint,
  onStartBlitzDuel,
}) => {
  const sprints = getSprintsForGrade(grade);
  const [selectedBlitzMode, setSelectedBlitzMode] = useState<BlitzModeId>('mix');

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-slate-800/80">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">
          Спринты и блиц-дуэль
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Быстрые серии до 10 вопросов и 60-секундная дуэль против наставника ({GRADE_LABELS[grade]}).
        </p>
      </div>

      {/* Mentor Blitz Duel Banner */}
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
                  <span>Блиц 60 сек</span>
                </span>
                {duelsWon > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-[11px] font-mono-num font-semibold text-emerald-300">
                    <Trophy className="w-3 h-3" />
                    <span>Побед: {duelsWon}</span>
                  </span>
                )}
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white leading-tight">
                ⚡ Могни наставника!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Обыграй <strong className="text-white">{activeMentor ? activeMentor.name : 'Штаб ФИПИ'}</strong> за 60 секунд: серия даёт множитель ×2/×3, ошибка сжигает 3 секунды, победа приносит{' '}
                <span className="font-mono-num font-semibold text-amber-300">+150 XP</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Режим блиц-дуэли">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sprints.map((sprint) => {
          const style = SPRINT_STYLES[sprint.id];
          const IconComponent = style.Icon;

          return (
            <button
              key={sprint.id}
              type="button"
              onClick={() => onStartSprint(sprint)}
              className={`relative overflow-hidden p-6 rounded-xl ${style.cardGradient} backdrop-blur-md border border-slate-800/80 ${style.hoverBorder} hover:-translate-y-0.5 hover:shadow-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group`}
            >
              {/* Faint decorative watermark icon */}
              <IconComponent
                className={`w-20 h-20 opacity-10 -bottom-3 -right-3 absolute pointer-events-none ${style.watermarkColor}`}
              />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.badge}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-300">Спринт</span>
                  </div>
                  <span className="font-mono-num">
                    до {sprint.sessionSize} вопросов
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="font-display text-lg font-semibold text-white group-hover:text-white transition-colors">
                    {sprint.title}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed pr-6">
                    {sprint.subtitle}
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-2 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                <span>Начать серию</span>
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Slim 2px bottom progress bar */}
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-slate-800/90">
                <div
                  className={`h-full w-1/4 opacity-50 group-hover:w-3/4 group-hover:opacity-90 transition-all duration-300 ${style.bar}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
