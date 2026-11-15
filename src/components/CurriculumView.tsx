import React from 'react';
import {
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  ListChecks,
  PenTool,
  Puzzle,
  Sparkles,
  SpellCheck,
  Type,
} from 'lucide-react';
import {
  EGE_TABS,
  GRADE_LABELS,
  getModulesForGrade,
} from '../data/curriculum';
import {
  DifficultyLevel,
  EgeCategoryTab,
  GradeLevel,
  TaskModule,
} from '../types/platform';

interface CurriculumViewProps {
  grade: GradeLevel;
  completedModuleIds: string[];
  difficulty: DifficultyLevel;
  activeEgeTab: EgeCategoryTab;
  onEgeTabChange: (tab: EgeCategoryTab) => void;
  onDifficultyChange: (d: DifficultyLevel) => void;
  onStartModule: (module: TaskModule) => void;
}

const CARD_THEMES = [
  {
    gradient: 'bg-gradient-to-br from-violet-950/60 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-violet-500/60 hover:shadow-violet-950/40',
    badge: 'bg-violet-500/15 text-violet-400',
    bar: 'bg-violet-500',
    watermark: 'text-violet-400',
  },
  {
    gradient: 'bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-cyan-500/60 hover:shadow-cyan-950/40',
    badge: 'bg-cyan-500/15 text-cyan-400',
    bar: 'bg-cyan-500',
    watermark: 'text-cyan-400',
  },
  {
    gradient: 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-amber-500/60 hover:shadow-amber-950/40',
    badge: 'bg-amber-500/15 text-amber-400',
    bar: 'bg-amber-500',
    watermark: 'text-amber-400',
  },
  {
    gradient: 'bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-emerald-500/60 hover:shadow-emerald-950/40',
    badge: 'bg-emerald-500/15 text-emerald-400',
    bar: 'bg-emerald-500',
    watermark: 'text-emerald-400',
  },
  {
    gradient: 'bg-gradient-to-br from-rose-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-rose-500/60 hover:shadow-rose-950/40',
    badge: 'bg-rose-500/15 text-rose-400',
    bar: 'bg-rose-500',
    watermark: 'text-rose-400',
  },
  {
    gradient: 'bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900',
    hoverBorder: 'hover:border-indigo-500/60 hover:shadow-indigo-950/40',
    badge: 'bg-indigo-500/15 text-indigo-400',
    bar: 'bg-indigo-500',
    watermark: 'text-indigo-400',
  },
];

function getModuleIcon(mod: TaskModule) {
  const id = mod.id.toLowerCase();
  if (mod.egeTab === 'spelling' || id.includes('orth') || id === 'oge-6' || id === 'oge-7') {
    return SpellCheck;
  }
  if (mod.egeTab === 'punctuation' || id.includes('punct') || id === 'oge-4' || id === 'oge-5') {
    return PenTool;
  }
  if (id.includes('phon') || id === 'ege-4') return AudioLines;
  if (id.includes('morph') || id === 'ege-7' || id === 'oge-8') return Puzzle;
  if (id.includes('synt') || id === 'oge-2-3' || id === 'oge-9' || id === 'ege-8') return ListChecks;
  if (id.includes('lex') || id === 'ege-2' || id === 'ege-3' || id === 'ege-5' || id === 'ege-6') return Type;
  if (id.includes('essay') || id.includes('summary')) return BookOpenCheck;
  if (id === 'ege-22') return Sparkles;
  return FileText;
}

function getEngineLabel(mod: TaskModule): string {
  switch (mod.engineType) {
    case 'fill_letter':
      return 'Вставка буквы';
    case 'ege_row_spelling':
      return '5 рядов (ФИПИ)';
    case 'ege_task14':
      return '5 рядов (слитно/разд./дефис)';
    case 'ege_task15':
      return 'Слоты Н / НН в тексте';
    case 'punctuation_input':
      return 'Ввод знаков';
    case 'matching':
      return 'Сопоставление';
    case 'phraseology_highlight':
      return 'Поиск в тексте';
    case 'text_cloze':
      return 'Текст с пропусками';
    case 'parsing':
      return 'Языковой разбор';
    case 'word_input':
      return 'Ввод ответа';
    case 'mixed':
      return 'Тест и ввод слова';
    case 'multiple_choice':
      return 'Выбор вариантов';
    case 'open_essay':
      return mod.id.includes('summary') ? 'Аудио + изложение' : 'Сочинение + ИИ-промпт';
    default:
      return 'Тест с разбором';
  }
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  grade,
  completedModuleIds,
  difficulty,
  activeEgeTab,
  onEgeTabChange,
  onDifficultyChange,
  onStartModule,
}) => {

  const allModules = getModulesForGrade(grade);
  const isOgeOrEge = grade === 'oge' || grade === 'ege';
  const isEge = grade === 'ege';

  const visibleModules = isEge
    ? allModules.filter((m) => m.egeTab === activeEgeTab)
    : allModules;

  return (
    <div className="space-y-6">
      {/* Header + Difficulty Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            {GRADE_LABELS[grade]}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isOgeOrEge
              ? 'Выберите задание для тренировки (сессия до 10 случайных вопросов).'
              : 'Основные разделы курса русского языка — выберите тему для практики.'}
          </p>
        </div>

        {isOgeOrEge && (
          <div
            role="group"
            aria-label="Уровень сложности"
            className="flex items-center gap-1 p-1 bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-lg w-fit shrink-0"
          >
            <button
              type="button"
              onClick={() => onDifficultyChange('base')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                difficulty === 'base'
                  ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              База
            </button>
            <button
              type="button"
              onClick={() => onDifficultyChange('hard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                difficulty === 'hard'
                  ? 'bg-gradient-to-r from-rose-600 to-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Хард
            </button>
          </div>
        )}
      </div>

      {/* EGE 4 Horizontal Category Tabs */}
      {isEge && (
        <div
          role="tablist"
          aria-label="Разделы ЕГЭ"
          className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl"
        >
          {EGE_TABS.map((tab) => {
            const active = activeEgeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => onEgeTabChange(tab.id)}
                className={`flex-1 min-w-[160px] px-4 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="text-xs sm:text-sm font-semibold whitespace-nowrap truncate">
                  {tab.label}
                </div>
                <div
                  className={`text-[11px] whitespace-nowrap truncate mt-0.5 ${
                    active ? 'text-indigo-100' : 'text-slate-500'
                  }`}
                >
                  {tab.rangeLabel}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Compact Color-Coded Gradient Workspace Grid with Watermarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleModules.map((mod, idx) => {
          const isCompleted = completedModuleIds.includes(mod.id);
          const theme = CARD_THEMES[idx % CARD_THEMES.length];
          const IconComponent = getModuleIcon(mod);

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onStartModule(mod)}
              className={`relative overflow-hidden p-5 rounded-xl ${theme.gradient} backdrop-blur-md border border-slate-800/80 ${theme.hoverBorder} hover:-translate-y-0.5 hover:shadow-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group`}
            >
              {/* Faint decorative watermark icon */}
              <IconComponent
                className={`w-20 h-20 opacity-10 -bottom-3 -right-3 absolute pointer-events-none ${theme.watermark}`}
              />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${theme.badge}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-400 truncate">
                      {mod.taskNumber ? mod.taskNumber : 'Раздел курса'}
                    </span>
                  </div>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium whitespace-nowrap shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Пройдено</span>
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="font-display text-base font-semibold text-white leading-snug pr-4">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 pr-6">
                    {mod.subtitle}
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{getEngineLabel(mod)}</span>
                <span className="font-mono-num text-slate-300">
                  {`${Math.min(10, mod.questions.length)} вопр.`}
                </span>
              </div>

              {/* Slim 2px bottom progress bar */}
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-slate-800/90">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCompleted
                      ? 'w-full bg-emerald-400'
                      : `w-1/4 opacity-50 group-hover:w-2/3 group-hover:opacity-90 ${theme.bar}`
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
