import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Play,
  Target,
  TrendingUp,
} from 'lucide-react';
import { GradeLevel, MockExamRecord } from '../types/platform';
import { formatDurationRu } from '../utils/timeFormat';

interface MockExamJournalProps {
  records: MockExamRecord[];
  grade: GradeLevel;
  onPracticeKimTask: (examType: 'oge' | 'ege', taskNumber: number) => void;
  onStartMockTest: () => void;
}

type ExamFilter = 'all' | 'ege' | 'oge';

function formatMockDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

export const MockExamJournal: React.FC<MockExamJournalProps> = ({
  records,
  grade,
  onPracticeKimTask,
  onStartMockTest,
}) => {
  const [examFilter, setExamFilter] = useState<ExamFilter>('all');

  const filteredRecords = useMemo(() => {
    if (examFilter === 'all') return records;
    return records.filter((r) => r.examType === examFilter);
  }, [records, examFilter]);

  const summary = useMemo(() => {
    if (records.length === 0) {
      return {
        total: 0,
        bestLabel: '—',
        bestSub: 'Пока нет пробников',
        avgLabel: '—',
        avgSub: 'Пройдите первый тест',
      };
    }

    let bestRecord = records[0];
    let bestRatio = bestRecord.maxScore > 0 ? bestRecord.score / bestRecord.maxScore : 0;

    let ratioSum = 0;
    let scoreSum = 0;
    let maxSum = 0;

    for (const r of records) {
      const ratio = r.maxScore > 0 ? r.score / r.maxScore : 0;
      ratioSum += ratio;
      scoreSum += r.score;
      maxSum += r.maxScore;
      if (ratio > bestRatio || (ratio === bestRatio && r.score > bestRecord.score)) {
        bestRatio = ratio;
        bestRecord = r;
      }
    }

    const bestPct = Math.round(bestRatio * 100);
    const avgPct = Math.round((ratioSum / records.length) * 100);
    const avgScore = (scoreSum / records.length).toFixed(1).replace(/\.0$/, '');
    const avgMax = Math.round(maxSum / records.length);

    return {
      total: records.length,
      bestLabel: `${bestRecord.score} / ${bestRecord.maxScore}`,
      bestSub: `${bestPct}% · ${bestRecord.examType === 'ege' ? 'ЕГЭ' : 'ОГЭ'}`,
      avgLabel: `${avgScore} / ${avgMax}`,
      avgSub: `Средняя точность ${avgPct}%`,
    };
  }, [records]);

  const weakTasks = useMemo(() => {
    const map = new Map<
      string,
      {
        examType: 'oge' | 'ege';
        taskNumber: number;
        taskTitle: string;
        correct: number;
        total: number;
      }
    >();

    for (const rec of records) {
      if (examFilter !== 'all' && rec.examType !== examFilter) continue;
      for (const task of rec.taskResults) {
        const key = `${rec.examType}-${task.taskNumber}`;
        const existing = map.get(key) ?? {
          examType: rec.examType,
          taskNumber: task.taskNumber,
          taskTitle: task.taskTitle,
          correct: 0,
          total: 0,
        };
        existing.total += 1;
        if (task.isCorrect) existing.correct += 1;
        map.set(key, existing);
      }
    }

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        accuracy: Math.round((item.correct / Math.max(1, item.total)) * 100),
      }))
      .filter((item) => item.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total || a.taskNumber - b.taskNumber);
  }, [records, examFilter]);

  const canLaunchMockDirectly = grade === 'oge' || grade === 'ege';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>Журнал пробников</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Прогресс по завершённым комплексным тестам ОГЭ и ЕГЭ и радар повторяющихся ошибок по номерам КИМ.
          </p>
        </div>

        {canLaunchMockDirectly && (
          <button
            type="button"
            onClick={onStartMockTest}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-4 h-4" />
            <span>Пройти пробник</span>
          </button>
        )}
      </div>

      {/* Top Progress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
            <span>Всего пробников</span>
            <ClipboardCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-white mt-2">
            {summary.total}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Завершённых вариантов КИМ
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
            <span>Лучший результат</span>
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-emerald-400 mt-2">
            {summary.bestLabel}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono-num">
            {summary.bestSub}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
            <span>Средний балл</span>
            <TrendingUp className="w-4 h-4 text-violet-400 shrink-0" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-violet-300 mt-2">
            {summary.avgLabel}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono-num">
            {summary.avgSub}
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="font-display text-lg font-semibold text-white">
              Пробников пока нет
            </h2>
            <p className="text-sm text-slate-400">
              Завершите «Комплексный тест» в режиме ОГЭ или ЕГЭ — здесь появится карта всех заданий, динамика баллов и список проблемных номеров КИМ.
            </p>
          </div>
          {canLaunchMockDirectly && (
            <button
              type="button"
              onClick={onStartMockTest}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Запустить комплексный тест</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Recurring Weak КИМ Numbers Radar */}
          <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    Какие задания нужно подтянуть
                  </h2>
                  <p className="text-xs text-slate-400">
                    Номера КИМ с точностью ниже 70% по всем пробникам — нажмите, чтобы отработать тему
                  </p>
                </div>
              </div>

              {/* Exam Filter */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080B14]/80 border border-slate-800/80">
                {(['all', 'ege', 'oge'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setExamFilter(tab)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      examFilter === tab
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'all' ? 'Все' : tab === 'ege' ? 'ЕГЭ' : 'ОГЭ'}
                  </button>
                ))}
              </div>
            </div>

            {weakTasks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weakTasks.map((wt) => {
                  const isCritical = wt.accuracy < 50;
                  return (
                    <button
                      key={`${wt.examType}-${wt.taskNumber}`}
                      type="button"
                      onClick={() => onPracticeKimTask(wt.examType, wt.taskNumber)}
                      title={`${wt.taskTitle} (${wt.correct} из ${wt.total})`}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isCritical
                          ? 'bg-rose-500/15 border-rose-500/45 text-rose-200 hover:bg-rose-500/25'
                          : 'bg-amber-500/15 border-amber-500/45 text-amber-200 hover:bg-amber-500/25'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isCritical ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      />
                      <span className="font-mono-num">
                        {wt.examType === 'ege' ? 'ЕГЭ' : 'ОГЭ'} №{wt.taskNumber} ({wt.accuracy}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Отличная стабильность: по всем выполненным заданиям КИМ точность держится на уровне 70% и выше!
                </span>
              </div>
            )}
          </div>

          {/* Attempt-by-Attempt Scoreboard History */}
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-white">
              Хронология пробников ({filteredRecords.length})
            </h2>

            {filteredRecords.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-center text-sm text-slate-400">
                Нет завершённых пробников выбранного формата.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => {
                  const pct =
                    record.maxScore > 0
                      ? Math.round((record.score / record.maxScore) * 100)
                      : 0;
                  const examLabel = record.examType === 'ege' ? 'ЕГЭ' : 'ОГЭ';

                  return (
                    <div
                      key={record.id}
                      className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-md border text-xs font-mono-num font-bold ${
                              record.examType === 'ege'
                                ? 'bg-violet-500/15 border-violet-500/40 text-violet-200'
                                : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                            }`}
                          >
                            {examLabel}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono-num">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatMockDate(record.timestamp)}</span>
                          </span>
                          {typeof record.durationSeconds === 'number' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-xs text-cyan-300 font-mono-num">
                              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{formatDurationRu(record.durationSeconds)}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 font-mono-num">
                          <span className="text-sm sm:text-base font-bold text-white">
                            {record.score} / {record.maxScore} баллов
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              pct >= 80
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : pct >= 50
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-rose-500/15 text-rose-300'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>

                      {/* Color-Coded Task-Number Grid */}
                      <div className="flex flex-wrap gap-1.5">
                        {record.taskResults.map((task, idx) => (
                          <button
                            key={`${record.id}-task-${task.taskNumber}-${idx}`}
                            type="button"
                            onClick={() =>
                              onPracticeKimTask(record.examType, task.taskNumber)
                            }
                            title={`${task.taskTitle} — нажмите для тренировки`}
                            className={`min-w-[44px] px-2 py-1.5 rounded-lg border text-center font-mono-num text-xs font-semibold transition-transform hover:scale-105 cursor-pointer ${
                              task.isCorrect
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/25'
                                : 'bg-rose-500/15 border-rose-500/50 text-rose-300 hover:bg-rose-500/25'
                            }`}
                          >
                            №{task.taskNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
