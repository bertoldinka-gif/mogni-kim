import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Filter,
  History,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react';
import { AttemptGradeLevel, AttemptRecord } from '../types/platform';
import {
  formatCorrectAnswer,
  formatQuestionBodyForHistory,
} from '../utils/attemptFormatting';

interface AttemptHistoryProps {
  attempts: AttemptRecord[];
  onReopenAttempt: (record: AttemptRecord) => void;
  onNavigateToCurriculum: () => void;
}

type StatusFilter = 'all' | 'correct' | 'wrong';
type SectionFilter = 'all' | 'ege' | 'oge' | 'grades_2_8';

const GRADE_BADGE_LABELS: Record<AttemptGradeLevel, string> = {
  grade2_4: '2–4 кл.',
  grade5_6: '5–6 кл.',
  grade7_8: '7–8 кл.',
  oge: 'ОГЭ',
  ege: 'ЕГЭ',
};

function formatAttemptTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

export const AttemptHistory: React.FC<AttemptHistoryProps> = ({
  attempts,
  onReopenAttempt,
  onNavigateToCurriculum,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const stats = useMemo(() => {
    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    const wrong = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, wrong, accuracy };
  }, [attempts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return attempts.filter((item) => {
      if (statusFilter === 'correct' && !item.isCorrect) return false;
      if (statusFilter === 'wrong' && item.isCorrect) return false;

      if (sectionFilter === 'ege' && item.gradeLevel !== 'ege') return false;
      if (sectionFilter === 'oge' && item.gradeLevel !== 'oge') return false;
      if (
        sectionFilter === 'grades_2_8' &&
        item.gradeLevel !== 'grade2_4' &&
        item.gradeLevel !== 'grade5_6' &&
        item.gradeLevel !== 'grade7_8'
      ) {
        return false;
      }

      if (!q) return true;
      return (
        item.moduleTitle.toLowerCase().includes(q) ||
        item.previewText.toLowerCase().includes(q) ||
        (item.userAnswer ?? '').toLowerCase().includes(q) ||
        (item.correctAnswer ?? '').toLowerCase().includes(q)
      );
    });
  }, [attempts, statusFilter, sectionFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400 shrink-0" />
            <span>История решений</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Журнал выполненных заданий из всех тренажёров (хранятся последние 300 попыток). Нажмите на карточку, чтобы сверить ответ и правило, или откройте задание заново.
          </p>
        </div>
      </div>

      {/* Top Stats Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
            <span>Всего решено</span>
            <History className="w-4 h-4 text-indigo-400 shrink-0" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-white mt-1.5">
            {stats.total}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
            <span>Верно</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-emerald-400 mt-1.5">
            {stats.correct}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
            <span>Ошибок</span>
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-rose-400 mt-1.5">
            {stats.wrong}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
            <span>Точность (%)</span>
            <BarChart3 className="w-4 h-4 text-violet-400 shrink-0" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-violet-300 mt-1.5">
            {stats.accuracy}%
          </div>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="font-display text-lg font-semibold text-white">
              История решений пока пуста
            </h2>
            <p className="text-sm text-slate-400">
              Решайте задания в спринтах, темах КИМ или комплексных тестах — каждый ваш ответ появится здесь со статистикой и кнопкой повторного запуска.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToCurriculum}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Перейти к заданиям</span>
          </button>
        </div>
      ) : (
        <>
          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-sm'
                    : 'bg-slate-900/70 border border-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Все ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('correct')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'correct'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900/70 border border-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Верно ({stats.correct})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('wrong')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'wrong'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-900/70 border border-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                С ошибками ({stats.wrong})
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по тексту или заданию..."
                  className="w-full bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="relative flex items-center">
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <select
                  aria-label="Фильтр по разделу"
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value as SectionFilter)}
                  className="w-full sm:w-auto bg-slate-900/70 backdrop-blur-md border border-slate-800/80 hover:border-violet-500/50 rounded-lg pl-8 pr-4 py-2 text-xs sm:text-sm font-medium text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer transition-colors"
                >
                  <option value="all">Все разделы</option>
                  <option value="ege">ЕГЭ</option>
                  <option value="oge">ОГЭ</option>
                  <option value="grades_2_8">2–8 классы</option>
                </select>
              </div>
            </div>
          </div>

          {/* Attempt List */}
          {filtered.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 text-center space-y-3">
              <p className="text-sm text-slate-400">
                По выбранным фильтрам попыток не найдено.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSectionFilter('all');
                  setSearch('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить фильтры</span>
              </button>
            </div>
          ) : (
            <div className="max-h-[720px] overflow-y-auto pr-1 space-y-3">
              {filtered.map((record) => {
                const isExpanded = Boolean(expandedIds[record.id]);
                const body = isExpanded
                  ? formatQuestionBodyForHistory(record.questionSnapshot)
                  : null;
                const resolvedCorrectAnswer =
                  record.correctAnswer || formatCorrectAnswer(record.questionSnapshot);

                return (
                  <div
                    key={record.id}
                    className="p-4 sm:p-5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 hover:border-violet-500/40 transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => toggleExpand(record.id)}
                        className="text-left space-y-2 min-w-0 flex-1 cursor-pointer group"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {record.isCorrect ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Верно</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/40 text-rose-300 font-semibold">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Ошибка</span>
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/70 text-[11px] font-medium text-slate-300">
                            {GRADE_BADGE_LABELS[record.gradeLevel] ?? 'КИМ'}
                          </span>

                          <span className="font-medium text-violet-300 truncate group-hover:text-violet-200 transition-colors">
                            {record.moduleTitle}
                          </span>

                          {record.timestamp && (
                            <span className="inline-flex items-center gap-1 text-slate-400 font-mono-num">
                              <Clock className="w-3 h-3" />
                              <span>{formatAttemptTimestamp(record.timestamp)}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-200 leading-relaxed line-clamp-2">
                          {record.previewText}
                        </p>
                      </button>

                      <div className="shrink-0 flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(record.id)}
                          aria-expanded={isExpanded}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                            isExpanded
                              ? 'bg-violet-500/20 border-violet-500/50 text-violet-200'
                              : 'bg-[#080B14]/85 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Скрыть ответ' : 'Посмотреть ответ'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onReopenAttempt(record)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#080B14]/85 hover:bg-violet-600 border border-slate-700 hover:border-violet-500 text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Решить ещё раз</span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Answer Review Drawer */}
                    {isExpanded && body && (
                      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3.5">
                        {/* Question Formulation & Context */}
                        <div className="p-3.5 rounded-xl bg-[#080B14]/85 border border-slate-800/80 space-y-2.5">
                          <div className="text-xs font-semibold text-slate-400">
                            Текст задания
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-white leading-relaxed whitespace-pre-line">
                            {body.prompt}
                          </p>
                          {body.passageText && (
                            <div className="p-3 rounded-lg bg-slate-900/75 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
                              {body.passageText}
                            </div>
                          )}
                          {body.bodyText && (
                            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                              {body.bodyText}
                            </div>
                          )}
                          {body.optionsList && body.optionsList.length > 0 && (
                            <ul className="space-y-1.5 pt-1">
                              {body.optionsList.map((opt, optIdx) => (
                                <li
                                  key={`${record.id}-opt-${optIdx}`}
                                  className="text-xs sm:text-sm text-slate-300 leading-relaxed"
                                >
                                  {opt}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Submitted vs Correct Answer Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div
                            className={`p-3.5 rounded-xl border ${
                              record.isCorrect
                                ? 'bg-emerald-500/10 border-emerald-500/35'
                                : 'bg-rose-500/10 border-rose-500/35'
                            }`}
                          >
                            <div
                              className={`text-xs font-semibold flex items-center gap-1.5 ${
                                record.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                              }`}
                            >
                              {record.isCorrect ? (
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span>Ваш ответ:</span>
                            </div>
                            <div
                              className={`mt-1.5 text-sm font-semibold leading-relaxed break-words ${
                                record.isCorrect ? 'text-emerald-200' : 'text-rose-200'
                              }`}
                            >
                              {record.userAnswer
                                ? record.userAnswer
                                : 'Запись сохранена до включения журнала ответов'}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/35">
                            <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Правильный ответ:</span>
                            </div>
                            <div className="mt-1.5 text-sm font-semibold text-emerald-200 leading-relaxed break-words">
                              {resolvedCorrectAnswer}
                            </div>
                          </div>
                        </div>

                        {/* Rule Explanation */}
                        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/25 space-y-1">
                          <div className="text-xs font-semibold text-indigo-300">
                            Пояснение / Правило: {record.questionSnapshot.ruleTitle}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {record.questionSnapshot.ruleExplanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
