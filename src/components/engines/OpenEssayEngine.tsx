import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Headphones,
  Lightbulb,
  Loader2,
  MessageSquareQuote,
  Pause,
  Play,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import {
  AiExamType,
  AiGradingReport,
  buildExternalAiPrompt,
  countEssayWords,
  evaluateEssayWithAI,
} from '../../services/aiGrader';
import {
  OpenEssayKind,
  OpenEssayQuestion,
  SavedEssayRecord,
  SavedQuestionState,
} from '../../types/platform';
import {
  clearEssayDraft,
  getEssayDraft,
  saveEssayDraft,
} from '../../utils/storage';
import { MentorAvatar } from '../MentorAvatar';
import {
  FinalEssayTopic,
  generateFinalEssaySet,
} from '../../data/ege/finalEssayBank';
import { GOLDEN_READING_BOOKS } from '../../data/ege/goldenReadingBank';

interface OpenEssayEngineProps {
  question: OpenEssayQuestion;
  activeUserId?: string;
  initialArchiveId?: string | null;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<{ essayText: string; gradingReport: unknown }>;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  onSaveEssay?: (
    entry: Omit<SavedEssayRecord, 'id' | 'timestamp'> & { id?: string }
  ) => SavedEssayRecord | void;
  onAnswered: (
    isCorrect: boolean,
    userState?: { essayText: string; gradingReport: unknown },
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

const KIND_LABELS: Record<OpenEssayKind, string> = {
  oge_summary: 'ОГЭ · Сжатое изложение (Задание 1)',
  oge_essay: 'ОГЭ · Сочинение-рассуждение (Задание 13)',
  ege_essay: 'ЕГЭ · Сочинение (Задание 27)',
  final_essay: 'Итоговое сочинение (Допуск)',
};

const KIND_TO_AI_EXAM: Record<OpenEssayKind, AiExamType> = {
  oge_summary: 'OGE_SUMMARY',
  oge_essay: 'OGE_ESSAY',
  ege_essay: 'EGE_ESSAY',
  final_essay: 'FINAL_ESSAY',
};

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const OpenEssayEngine: React.FC<OpenEssayEngineProps> = ({
  question,
  activeUserId = 'guest',
  initialArchiveId = null,
  isReviewMode = false,
  isLastQuestion = false,
  canGoPrev = false,
  savedState,
  comboStreak = 0,
  activeMentor = null,
  onSaveEssay,
  onAnswered,
  onPrev,
  onNext,
  onMarkLearned,
}) => {
  const resolvedUserId = activeUserId.trim() || 'guest';

  const [essayText, setEssayText] = useState(
    () =>
      savedState?.userState?.essayText ??
      getEssayDraft(resolvedUserId, question.id)
  );
  const [showSourceText, setShowSourceText] = useState(!question.hasAudio);
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [draftSaved, setDraftSaved] = useState(() =>
    Boolean(
      (
        savedState?.userState?.essayText ??
        getEssayDraft(resolvedUserId, question.id)
      ).trim()
    )
  );
  const [archiveRecordId, setArchiveRecordId] = useState<string | null>(
    initialArchiveId
  );

  // Built-in synthesized narration player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.25>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(95);

  const [submitted, setSubmitted] = useState(() => Boolean(savedState));
  const [isGrading, setIsGrading] = useState(false);
  const [gradingReport, setGradingReport] = useState<AiGradingReport | null>(
    () => (savedState?.userState?.gradingReport as AiGradingReport | null) ?? null
  );
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [learnedClicked, setLearnedClicked] = useState(false);
  const [mentorQuote, setMentorQuote] = useState<string | null>(
    () => savedState?.mentorQuote ?? null
  );

  // ==== FINAL ESSAY STATES ====
  const isFinalEssay = question.essayKind === 'final_essay';
  const [topicSet, setTopicSet] = useState<FinalEssayTopic[]>(() =>
    isFinalEssay ? generateFinalEssaySet() : []
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    () => topicSet.at(0)?.id ?? null
  );
  const [oralRevealed, setOralRevealed] = useState(false);

  const activeTopic = useMemo<FinalEssayTopic | null>(() => {
    if (!isFinalEssay || topicSet.length === 0) return null;
    return topicSet.find((t) => t.id === selectedTopicId) ?? topicSet[0];
  }, [isFinalEssay, topicSet, selectedTopicId]);

  const effectivePrompt = useMemo(() => {
    if (isFinalEssay && activeTopic) return activeTopic.title;
    return question.prompt;
  }, [isFinalEssay, activeTopic, question.prompt]);

  const effectiveHint = useMemo(() => {
    if (isFinalEssay && activeTopic) return activeTopic.thesisHint;
    return question.hint ?? '';
  }, [isFinalEssay, activeTopic, question.hint]);

  // ==== GOLDEN READING STATES ====
  const isGoldenReading = question.essayKind === 'golden_reading';
  const [selectedBookId, setSelectedBookId] = useState<string>(
    () => GOLDEN_READING_BOOKS.at(0)?.id ?? 'gr-1'
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [completedDays, setCompletedDays] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('golden_reading_days') || '0');
    } catch {
      return 0;
    }
  });
  const [bookStatuses, setBookStatuses] = useState<Record<string, 'reading' | 'done'>>(() => {
    try {
      return JSON.parse(localStorage.getItem('golden_reading_statuses') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!isGoldenReading || !timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isGoldenReading, timerRunning]);

  // ==== DERIVED VALUES ====
  const wordCount = useMemo(
    () => countEssayWords(essayText),
    [essayText]
  );
  const meetsMinWords = wordCount >= (question.minWords ?? 0);
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  // ==== HANDLERS ====
  const togglePlay = () => setIsPlaying((v) => !v);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const handleClearDraft = () => {
    setEssayText('');
    setDraftSaved(false);
    clearEssayDraft(resolvedUserId, question.id);
  };

  const handleCopyAiPrompt = async () => {
    try {
      const prompt = buildExternalAiPrompt(
        KIND_TO_AI_EXAM[question.essayKind],
        question.sourceText ?? '',
        essayText,
        question.minWords ?? 0
      );
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSaveSnapshot = () => {
    if (!onSaveEssay || !essayText.trim()) return;
    const record = onSaveEssay({
      id: archiveRecordId ?? undefined,
      questionId: question.id,
      essayKind: question.essayKind,
      prompt: effectivePrompt,
      essayText,
      wordCount,
      gradingReport: gradingReport ?? undefined,
    });
    if (record && 'id' in record) {
      setArchiveRecordId(record.id);
    }
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2000);
  };

  const handleCompleteWork = async () => {
    if (isGrading) return;
    setIsGrading(true);
    setGradingError(null);
    try {
      saveEssayDraft(resolvedUserId, question.id, essayText);
      setDraftSaved(true);
      const report = await evaluateEssayWithAI(
        KIND_TO_AI_EXAM[question.essayKind],
        effectivePrompt,
        essayText,
        question.minWords ?? 0
      );
      setGradingReport(report);
      setSubmitted(true);
      const quote = activeMentor ? pickRandomQuote(activeMentor) : null;
      setMentorQuote(quote);
      onAnswered(true, { essayText, gradingReport: report }, quote);
    } catch (err) {
      setGradingError(
        err instanceof Error ? err.message : 'Не удалось проверить работу.'
      );
    } finally {
      setIsGrading(false);
    }
  };

  // Draft autosave
  useEffect(() => {
    if (submitted) return;
    const id = window.setTimeout(() => {
      if (essayText.trim()) {
        saveEssayDraft(resolvedUserId, question.id, essayText);
        setDraftSaved(true);
      }
    }, 800);
    return () => window.clearTimeout(id);
  }, [essayText, resolvedUserId, question.id, submitted]);

  // ==== GOLDEN READING BRANCH ====
  if (isGoldenReading) {
    const activeBook =
      GOLDEN_READING_BOOKS.find((b) => b.id === selectedBookId) ?? GOLDEN_READING_BOOKS.at(0)!;
    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');
    const doneCount = Object.values(bookStatuses).filter((s) => s === 'done').length;
    const currentStatus = bookStatuses[activeBook.id] ?? 'reading';

    const handleLogSession = () => {
      const nextDays = completedDays + 1;
      setCompletedDays(nextDays);
      try {
        localStorage.setItem('golden_reading_days', String(nextDays));
      } catch {
        // ignore
      }
      setTimerRunning(false);
      setSecondsLeft(15 * 60);
      onAnswered(true, { text: `Марафон чтения: ${activeBook.author} «${activeBook.title}»` }, null);
    };

    const toggleBookDone = (bookId: string) => {
      const nextStatus = bookStatuses[bookId] === 'done' ? 'reading' : 'done';
      const updated = { ...bookStatuses, [bookId]: nextStatus };
      setBookStatuses(updated);
      try {
        localStorage.setItem('golden_reading_statuses', JSON.stringify(updated));
      } catch {
        // ignore
      }
    };

    return (
      <div className="space-y-4">
        {/* Верхняя панель таймера марафона 15 минут */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#0F1424] to-violet-950/30 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <span>Марафон · 15 минут чтения в день</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Прочитано: {doneCount} / {GOLDEN_READING_BOOKS.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-200 border border-violet-500/30">
                Сеансов: {completedDays}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Золотой минимум ФИПИ для Итогового сочинения
            </h3>
            <p className="text-xs text-slate-300">
              Выберите короткий рассказ, запустите таймер на 15 минут и разберите готовый аргумент к экзамену.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-[#080B14] border border-amber-400/40 font-mono-num text-xl font-bold text-amber-300 tracking-wider">
              {mins}:{secs}
            </div>
            <button
              type="button"
              onClick={() => setTimerRunning((r) => !r)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {timerRunning ? 'Пауза' : 'Старт 15:00'}
            </button>
            <button
              type="button"
              onClick={() => setSecondsLeft((s) => s + 5 * 60)}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              +5 мин
            </button>
            <button
              type="button"
              onClick={handleLogSession}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-xs sm:text-sm font-semibold text-emerald-200 transition-colors cursor-pointer"
            >
              Засчитать 15 мин сегодня
            </button>
          </div>
        </div>

        {/* Сетка 18 произведений */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {GOLDEN_READING_BOOKS.map((book) => {
            const isSelected = book.id === activeBook.id;
            const isDone = bookStatuses[book.id] === 'done';
            return (
              <button
                key={book.id}
                type="button"
                onClick={() => setSelectedBookId(book.id)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 text-white'
                    : isDone
                    ? 'bg-emerald-950/25 border-emerald-500/30 text-slate-300 hover:border-emerald-400/60'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                  <span className="text-amber-300">
                    Разделы {book.sections.join(', ')} · {book.readTimeLabel}
                  </span>
                  {isDone && <span className="text-emerald-300">✓ Прочитано</span>}
                </div>
                <div className="text-xs sm:text-sm font-semibold leading-snug">
                  {book.author} «{book.title}»
                </div>
              </button>
            );
          })}
        </div>

        {/* Карточка выбранного произведения */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1424] border border-slate-800 space-y-3.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-amber-300">{activeBook.genre}</div>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {activeBook.author} — «{activeBook.title}»
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={activeBook.readUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                Читать полный текст (в новой вкладке) ↗
              </a>
              <button
                type="button"
                onClick={() => toggleBookDone(activeBook.id)}
                className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  currentStatus === 'done'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-400/50'
                }`}
              >
                {currentStatus === 'done' ? '✓ Дочитано до конца' : 'Отметить как прочитанное'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {activeBook.themes.map((theme, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs text-slate-200"
              >
                {theme}
              </span>
            ))}
          </div>

          <div className="space-y-2 text-sm text-slate-200 leading-relaxed">
            <p>
              <strong className="text-white">Краткий сюжет и ключевые детали:</strong>{' '}
              {activeBook.summary}
            </p>
            <blockquote className="p-3 rounded-xl bg-slate-900/90 border-l-4 border-amber-400 text-xs sm:text-sm italic text-amber-100">
              {activeBook.keyQuote}
            </blockquote>
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs sm:text-sm text-emerald-100">
              <strong className="text-emerald-300">Готовый каркас аргумента для сочинения:</strong>{' '}
              {activeBook.argumentTemplate}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-4">
      {/* Full-Width Single-Column Essay & Summary Workspace */}
      <div className="p-4 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {KIND_LABELS[question.essayKind]}
            </span>
            {question.hint && !submitted && (
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/80 hover:border-violet-500/50 text-xs font-medium text-violet-300 hover:text-violet-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Скрыть подсказку' : 'Подсказка'}</span>
              </button>
            )}
          </div>

          <h3 className="w-full [text-wrap:wrap] font-display text-base sm:text-lg font-semibold text-white leading-snug">
            {effectivePrompt}
          </h3>
          {isFinalEssay && topicSet.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#080B14]/85 border border-violet-500/30 space-y-3 mt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-violet-300">
                  Экзаменационный комплект: выберите 1 из 6 тем (по 2 из каждого раздела)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const fresh = generateFinalEssaySet();
                    setTopicSet(fresh);
                    setSelectedTopicId(fresh.at(0)?.id ?? null);
                    setOralRevealed(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-violet-400 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-violet-400" />
                  <span>Новый комплект (6 тем)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {topicSet.map((topic, idx) => {
                  const code =
                    topic.section === 1
                      ? `№ 10${(idx % 2) + 1}`
                      : topic.section === 2
                      ? `№ 20${(idx % 2) + 1}`
                      : `№ 30${(idx % 2) + 1}`;
                  const isSelected = activeTopic?.id === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setOralRevealed(false);
                      }}
                      className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-400 text-white shadow-sm'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-300 mb-0.5">
                        {code} · Раздел {topic.section}
                      </div>
                      <div className="text-xs sm:text-sm font-medium leading-snug">
                        {topic.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeTopic && (
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">
                    Можно написать текст ниже или разобрать тему устно без набора текста:
                  </span>
                  <button
                    type="button"
                    onClick={() => setOralRevealed((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 text-xs font-medium text-emerald-300 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {oralRevealed
                        ? 'Скрыть устный разбор'
                        : 'Продумал устно · Показать 2 примера'}
                    </span>
                  </button>
                </div>
              )}

              {oralRevealed && activeTopic && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-xs sm:text-sm">
                  <div className="font-semibold text-emerald-300">
                    Ориентир для устного ответа и 2 литературных аргумента:
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    <strong className="text-white">Тезис:</strong> {activeTopic.thesisHint}
                  </p>
                  <ul className="space-y-1 text-slate-300 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong className="text-emerald-200">Пример 1:</strong> {activeTopic.books.at(0)}
                    </li>
                    <li>
                      <strong className="text-emerald-200">Пример 2:</strong> {activeTopic.books.at(1)}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
          {showHint && question.hint && !submitted && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-200 leading-relaxed flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{effectiveHint}</span>
            </div>
          )}
        </div>

        {/* Built-in Dark Audio Player for OGE Изложение */}
        {question.hasAudio && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#080B14]/90 border border-slate-800/90 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {question.audioTitle || 'Аудиотекст для изложения'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Встроенная озвучка текста для прослушивания
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPlaybackRate((r) => (r === 1 ? 1.25 : 1))}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-violet-500/60 text-xs font-mono-num font-semibold text-violet-300 transition-colors cursor-pointer"
                >
                  {playbackRate}x
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0 cursor-pointer transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <div className="flex-1 flex items-center gap-2.5">
                <span className="text-[11px] font-mono-num text-slate-400 w-10 text-right shrink-0">
                  {formatTime(currentTime)}
                </span>
                <div className="relative flex-1 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.5}
                    value={currentTime}
                    onChange={handleSeek}
                    aria-label="Позиция воспроизведения"
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-800 accent-violet-500"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 ${progressPct}%, #1e293b ${progressPct}%)`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono-num text-slate-400 w-10 shrink-0">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Source Text Card (collapsible for audio summary, open for reading essays) */}
        {question.sourceText && (
          <div className="rounded-xl bg-[#080B14]/70 border border-slate-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSourceText((v) => !v)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-violet-400" />
                <span>
                  {question.hasAudio ? 'Текст аудиозаписи (для самопроверки)' : 'Исходный текст'}
                </span>
              </span>
              <span className="text-violet-400">{showSourceText ? 'Свернуть' : 'Показать'}</span>
            </button>
            {showSourceText && (
              <div className="px-3.5 pb-3.5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 max-h-72 overflow-y-auto whitespace-pre-line">
                {question.sourceText}
              </div>
            )}
          </div>
        )}

        {/* Essay Writing Workspace */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label htmlFor={`essay-${question.id}`} className="font-medium text-slate-300">
              Текст вашей работы
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {draftSaved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-slate-900/90 border-slate-700/80 text-[11px] text-slate-400">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Черновик сохранён</span>
                </span>
              )}
              {!submitted && essayText.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-800 hover:border-rose-500/40 bg-slate-900/80 text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Очистить поле</span>
                </button>
              )}
              <span
                className={`font-mono-num font-semibold px-2 py-0.5 rounded border ${
                  meetsMinWords
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                {wordCount} / {question.minWords} слов мин.
              </span>
            </div>
          </div>

          <textarea
            id={`essay-${question.id}`}
            rows={8}
            disabled={submitted}
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder="Напишите текст изложения или сочинения здесь..."
            className="w-full rounded-xl bg-[#080B14]/90 border border-slate-800 focus:border-violet-500 focus:outline-none p-3.5 text-sm text-slate-100 placeholder:text-slate-600 leading-relaxed resize-y disabled:opacity-85"
          />
        </div>

        {/* Action Row: Copy Prompt for GigaChat / Alice + Save Snapshot + Finish Practice */}
        <div className="space-y-2.5 pt-1">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAiPrompt}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-[#080B14]/90 border-violet-500/40 hover:border-violet-400 text-violet-200 hover:text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Скопировать промпт
