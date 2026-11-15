import React, { useMemo, useState } from 'react';
import {
  BookmarkCheck,
  Play,
  Search,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { MistakeItem, PlatformQuestion } from '../types/platform';
import {
  getTextClozeAnswersSummary,
  getTextClozePlainPreview,
} from '../data/textClozeData';

interface MistakeFolderViewProps {
  mistakes: MistakeItem[];
  onMarkLearned: (questionId: string) => void;
  onStartReviewSession: (items: MistakeItem[]) => void;
  onNavigateToSprints: () => void;
}

function getQuestionText(q: PlatformQuestion): string {
  if (q.type === 'fill_letter') {
    return q.sentence;
  }
  if (q.type === 'punctuation_input') {
    let slotIdx = 0;
    return q.sentenceTemplate.replace(/\[_\]/g, () => `(${++slotIdx})`);
  }
  if (q.type === 'text_cloze') {
    return getTextClozePlainPreview(q.markupText);
  }
  if (q.type === 'parsing') {
    if (q.mode === 'phonetic') return `Фонетический разбор: «${q.fullWord}»`;
    return `${q.prompt} — ${q.sentence}`;
  }
  if (q.type === 'ege_row_spelling') {
    return q.rows
      .map((r) => `${r.rowNumber}) ${r.words.map((w) => w.template).join(', ')}`)
      .join(' · ');
  }
  if (q.type === 'ege_task14') {
    return q.rows
      .map((r) => `${r.rowNumber}) ${r.words.map((w) => w.cue).join(', ')}`)
      .join(' · ');
  }
  if (q.type === 'ege_task15') {
    return q.sentenceTemplate.replace(/\{(\d+)\}/g, '($1)[н/нн]');
  }
  if (q.type === 'word_input') {
    return q.sentence ? `${q.prompt} «${q.sentence}»` : q.prompt;
  }
  return q.prompt;
}

function getCorrectAnswerDisplay(q: PlatformQuestion): string {
  if (q.type === 'fill_letter') {
    const filled = q.targetWord.replace('..', q.correctAnswer);
    return `${q.correctAnswer} (${filled})`;
  }
  if (q.type === 'punctuation_input') {
    if (q.expectedDigits !== undefined) {
      return q.expectedDigits ? `Цифры (запятые): ${q.expectedDigits}` : 'Запятые не требуются';
    }
    return (q.expectedMarks ?? [])
      .map((m, idx) => `(${idx + 1}) ${m === '' ? 'без знака' : m === '-' ? '—' : m}`)
      .join(' · ');
  }
  if (q.type === 'phraseology_highlight') {
    return `«${q.targetPhrase}» — ${q.phraseMeaning}`;
  }
  if (q.type === 'matching') {
    return q.leftItems
      .map((item) => `${item.key} — ${q.correctMapping[item.key]}`)
      .join(', ');
  }
  if (q.type === 'open_essay') {
    return `Минимум ${q.minWords} слов (см. критерии)`;
  }
  if (q.type === 'text_cloze') {
    const summary = getTextClozeAnswersSummary(q.markupText);
    return q.expectedDigits ? `${summary} | Ответ: ${q.expectedDigits}` : summary;
  }
  if (q.type === 'parsing') {
    if (q.mode === 'phonetic') {
      const lettersSummary = q.letterRows
        .map((r) =>
          r.sounds.length === 0
            ? `${r.letter} — [—]`
            : `${r.letter} — ${r.sounds.map((s) => `[${s.expectedSound}]`).join('')}`
        )
        .join(', ');
      return `${q.expectedSyllableDivision} (${q.expectedSyllableCount} сл., ${q.expectedLetterCount} б., ${q.expectedSoundCount} зв.): ${lettersSummary}`;
    }
    if (q.mode === 'morphological') {
      return `«${q.targetWord}»: ${q.expectedPos}, н. ф. ${q.expectedBaseForm}`;
    }
    return q.expectedCharacteristics.join(', ');
  }
  if (q.type === 'ege_row_spelling') {
    const ans = [...q.correctRows].sort((a, b) => a - b).join('');
    const rowsFilled = q.rows
      .map((r) => {
        const wordsStr = r.words
          .map((w) => {
            const letter = w.expectedLetter.trim().toLowerCase();
            const rep = letter === '' || letter === '-' || letter === '∅' ? '' : letter.toUpperCase();
            return w.template.replace(/\.{2,}|\[_\]/, rep);
          })
          .join(', ');
        return `${r.rowNumber}) ${wordsStr}`;
      })
      .join('; ');
    return `Ряды: ${ans} (${rowsFilled})`;
  }
  if (q.type === 'ege_task14') {
    const ans = [...q.correctRows].sort((a, b) => a - b).join('');
    const wordsSummary = q.rows
      .map((r) => `${r.rowNumber}) ${r.words.map((w) => w.canonicalWord).join(', ')}`)
      .join('; ');
    return `Ряды: ${ans} (${wordsSummary})`;
  }
  if (q.type === 'ege_task15') {
    const ans = [...q.correctSlots].sort((a, b) => a - b).join('');
    const slotsSummary = q.slots
      .map((s) => `(${s.slotNumber}) ${s.expected}${s.canonicalWord ? ` (${s.canonicalWord})` : ''}`)
      .join(', ');
    return `Цифры: ${ans} (${slotsSummary})`;
  }
  if (q.type === 'word_input') {
    return q.displayAnswer || q.acceptedAnswers.join(' / ');
  }
  if (Array.isArray(q.correctAnswer)) {
    return q.correctAnswer
      .map((idx) => q.options[idx])
      .filter(Boolean)
      .map((opt) => opt.replace(/^\s*\d+[\)\.]\s*/, ''))
      .join('; ');
  }
  return (q.options[q.correctAnswer] ?? '').replace(/^\s*\d+[\)\.]\s*/, '');
}

function formatTimes(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} раз`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} раза`;
  return `${count} раз`;
}

export const MistakeFolderView: React.FC<MistakeFolderViewProps> = ({
  mistakes,
  onMarkLearned,
  onStartReviewSession,
  onNavigateToSprints,
}) => {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const sources = useMemo(() => {
    return Array.from(new Set(mistakes.map((m) => m.sourceTitle)));
  }, [mistakes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mistakes.filter((item) => {
      if (sourceFilter !== 'all' && item.sourceTitle !== sourceFilter) return false;
      if (!q) return true;
      const text = getQuestionText(item.question).toLowerCase();
      const rule = item.question.ruleTitle.toLowerCase();
      const source = item.sourceTitle.toLowerCase();
      return text.includes(q) || rule.includes(q) || source.includes(q);
    });
  }, [mistakes, search, sourceFilter]);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Работа над ошибками
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ошибки сохраняются автоматически. Вопрос удаляется только после нажатия кнопки «Выучил».
          </p>
        </div>

        <button
          type="button"
          disabled={mistakes.length === 0}
          onClick={() => onStartReviewSession(filtered.length > 0 ? filtered : mistakes)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Play className="w-4 h-4" />
          <span>Запустить тренировку по ошибкам</span>
        </button>
      </div>

      {mistakes.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="font-display text-lg font-semibold text-white">
              Список ошибок пуст
            </h2>
            <p className="text-sm text-slate-400">
              Все неверно решённые задания из спринтов и экзаменационных модулей будут
              автоматически попадать сюда для закрепления.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToSprints}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <span>Перейти к спринтам</span>
          </button>
        </div>
      ) : (
        <>
          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по вопросу или правилу..."
                className="w-full bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSourceFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  sourceFilter === 'all'
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-sm'
                    : 'bg-slate-900/70 border border-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Все ({mistakes.length})
              </button>
              {sources.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceFilter(src)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    sourceFilter === src
                      ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-sm'
                      : 'bg-slate-900/70 border border-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          {/* Mistake Cards Grid */}
          {filtered.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 text-center space-y-3">
              <p className="text-sm text-slate-400">По вашему фильтру ничего не найдено.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSourceFilter('all');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить фильтры</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.questionId}
                  className="p-5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 hover:border-violet-500/40 transition-all duration-200 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                      <div className="truncate">
                        <span className="text-slate-300 font-medium">{item.sourceTitle}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono-num">Ошибок: {item.failCount}</span>
                      </div>
                      <span
                        className={`font-mono-num whitespace-nowrap shrink-0 font-medium ${
                          item.correctStreak > 0 ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        Решено верно: {formatTimes(item.correctStreak)}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-semibold text-white leading-snug">
                      {getQuestionText(item.question)}
                    </h3>

                    <div className="text-xs sm:text-sm text-slate-300">
                      <span className="text-slate-400">Правильный ответ: </span>
                      <span className="font-semibold text-emerald-400">
                        {getCorrectAnswerDisplay(item.question)}
                      </span>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 space-y-1">
                      <div className="text-xs font-semibold text-violet-300">
                        {item.question.ruleTitle}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.question.ruleExplanation}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onMarkLearned(item.questionId)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/15 hover:bg-emerald-600 border border-emerald-500/40 hover:border-emerald-500 text-xs font-semibold text-emerald-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <BookmarkCheck className="w-4 h-4" />
                      <span>Выучил</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
