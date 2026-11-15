import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
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
import { TrainerSidePanel } from './TrainerSidePanel';

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

  const timerRef = useRef<number | null>(null);

  const stopAllAudio = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    stopAllAudio();
    const restored =
      savedState?.userState?.essayText ??
      getEssayDraft(resolvedUserId, question.id);
    setEssayText(restored);
    setDraftSaved(Boolean(restored.trim()));
    setArchiveRecordId(initialArchiveId);
    setSavedToast(false);
    setShowSourceText(!question.hasAudio);
    setCopied(false);
    setCurrentTime(0);
    setDuration(95);
    setSubmitted(Boolean(savedState));
    setIsGrading(false);
    setGradingReport(
      (savedState?.userState?.gradingReport as AiGradingReport | null) ?? null
    );
    setGradingError(null);
    setShowHint(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
    return () => {
      stopAllAudio();
    };
  }, [question.id, question.hasAudio, savedState, resolvedUserId, initialArchiveId]);

  const wordCount = useMemo(() => countEssayWords(essayText), [essayText]);

  const meetsMinWords = wordCount >= question.minWords;

  // Debounced auto-save draft to localStorage while editing
  useEffect(() => {
    if (submitted) return;
    const handle = window.setTimeout(() => {
      if (essayText.trim().length > 0) {
        saveEssayDraft(resolvedUserId, question.id, essayText);
        setDraftSaved(true);
      } else {
        clearEssayDraft(resolvedUserId, question.id);
        setDraftSaved(false);
      }
    }, 250);
    return () => window.clearTimeout(handle);
  }, [essayText, submitted, resolvedUserId, question.id]);

  const togglePlay = () => {
    if (isPlaying) {
      stopAllAudio();
      return;
    }

    setIsPlaying(true);
    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      question.sourceText
    ) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.sourceText);
      utterance.lang = 'ru-RU';
      utterance.rate = playbackRate;
      utterance.onend = () => {
        stopAllAudio();
        setCurrentTime(duration);
      };
      window.speechSynthesis.speak(utterance);
    }

    timerRef.current = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.5 * playbackRate;
        if (next >= duration) {
          stopAllAudio();
          return duration;
        }
        return next;
      });
    }, 500);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(e.target.value);
    setCurrentTime(nextTime);
  };

  const handleCopyAiPrompt = async () => {
    const promptText = buildExternalAiPrompt({
      examType: KIND_TO_AI_EXAM[question.essayKind],
      promptText: question.prompt,
      sourceText: question.sourceText,
      studentText: essayText,
    });

    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = promptText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveSnapshot = (reportOverride?: AiGradingReport | null) => {
    const trimmed = essayText.trim();
    if (!trimmed || !onSaveEssay) return;
    const saved = onSaveEssay({
      id: archiveRecordId ?? undefined,
      questionId: question.id,
      examType: KIND_TO_AI_EXAM[question.essayKind],
      promptTitle: question.prompt,
      sourceText: question.sourceText,
      studentText: trimmed,
      wordCount: countEssayWords(trimmed),
      gradingReport:
        reportOverride !== undefined
          ? reportOverride ?? undefined
          : gradingReport ?? undefined,
    });
    if (saved && saved.id) {
      setArchiveRecordId(saved.id);
    }
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2500);
  };

  const handleClearDraft = () => {
    if (submitted) return;
    setEssayText('');
    clearEssayDraft(resolvedUserId, question.id);
    setDraftSaved(false);
    setArchiveRecordId(null);
  };

  const handleCompleteWork = async () => {
    if (submitted || isGrading) return;
    setIsGrading(true);
    setGradingError(null);

    try {
      const trimmed = essayText.trim();
      const report = await evaluateEssayWithAI({
        examType: KIND_TO_AI_EXAM[question.essayKind],
        promptText: question.prompt,
        sourceText: question.sourceText,
        studentText: trimmed,
      });
      setGradingReport(report);
      let quote: string | null = null;
      if (activeMentor) {
        quote = pickRandomQuote(
          comboStreak + 1 >= 2
            ? activeMentor.comboQuotes
            : activeMentor.comboQuotes.length > 0
            ? activeMentor.comboQuotes
            : activeMentor.mistakeQuotes
        );
        setMentorQuote(quote);
      }
      if (trimmed) {
        saveEssayDraft(resolvedUserId, question.id, trimmed);
        setDraftSaved(true);
        if (onSaveEssay) {
          const saved = onSaveEssay({
            id: archiveRecordId ?? undefined,
            questionId: question.id,
            examType: KIND_TO_AI_EXAM[question.essayKind],
            promptTitle: question.prompt,
            sourceText: question.sourceText,
            studentText: trimmed,
            wordCount: countEssayWords(trimmed),
            gradingReport: report,
          });
          if (saved && saved.id) {
            setArchiveRecordId(saved.id);
          }
        }
      }
      setSubmitted(true);
      onAnswered(true, { essayText: trimmed, gradingReport: report }, quote);
    } catch (err) {
      setGradingError(
        err instanceof Error
          ? err.message
          : 'Не удалось выполнить проверку. Попробуйте ещё раз.'
      );
    } finally {
      setIsGrading(false);
    }
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start max-w-6xl mx-auto">
      {/* Left Column: Audio Player + Essay Workspace + Attachments + AI Prompt Export */}
      <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {KIND_LABELS[question.essayKind]}
            </span>
            {question.hint && !submitted && (
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="lg:hidden inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Скрыть подсказку' : 'Подсказка'}</span>
              </button>
            )}
          </div>

          <h3 className="w-full [text-wrap:wrap] font-display text-base sm:text-lg font-semibold text-white leading-snug">
            {question.prompt}
          </h3>
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
              <div className="px-3.5 pb-3.5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 max-h-44 overflow-y-auto whitespace-pre-line">
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
                    <span>Скопировать промпт для проверки в GigaChat / Алисе</span>
                  </>
                )}
              </button>

              {onSaveEssay && (
                <button
                  type="button"
                  disabled={!essayText.trim()}
                  onClick={() => handleSaveSnapshot()}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap ${
                    savedToast
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#080B14]/90 border-slate-700 hover:border-cyan-500/60 text-slate-200 hover:text-white'
                  }`}
                >
                  {savedToast ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Сохранено!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Сохранить работу</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {!submitted ? (
              <button
                type="button"
                disabled={isGrading}
                onClick={handleCompleteWork}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-75 disabled:cursor-wait text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer whitespace-nowrap"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Проверяем работу по критериям ФИПИ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Проверить по критериям</span>
                  </>
                )}
              </button>
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Работа проверена</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Бесплатная проверка: скопируйте готовый запрос с критериями и вставьте в чат Алисы или GigaChat.
          </p>

          {gradingError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{gradingError}</span>
            </div>
          )}
        </div>

        {/* Grading Report Card (displayed below editor after AI / demo evaluation) */}
        {gradingReport && (
          <div className="p-4 sm:p-5 rounded-xl bg-[#080B14]/90 border border-violet-500/35 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="space-y-0.5">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-violet-300">
                  Отчёт по критериям ФИПИ
                </div>
                <div className="text-sm sm:text-base font-display font-semibold text-white">
                  {gradingReport.verdictLabel}
                </div>
              </div>

              {gradingReport.isPassFail ? (
                <div
                  className={`px-4 py-2 rounded-xl border text-center ${
                    gradingReport.overallPassed
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider opacity-85">
                    Результат допуска
                  </div>
                  <div className="font-display text-base sm:text-lg font-bold tracking-wide">
                    {gradingReport.overallPassed ? 'ИТОГ: ЗАЧЁТ' : 'ИТОГ: НЕЗАЧЁТ'}
                  </div>
                </div>
              ) : (
                <div className="px-3.5 py-2 rounded-xl bg-violet-500/15 border border-violet-500/40 text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    Итоговый балл
                  </div>
                  <div className="font-mono-num text-xl font-bold text-white">
                    {gradingReport.totalScore}{' '}
                    <span className="text-sm font-normal text-slate-400">
                      / {gradingReport.maxTotalScore}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {gradingReport.rubricNote && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-200 leading-relaxed">
                {gradingReport.rubricNote}
              </div>
            )}

            {/* Mandatory Requirements for Final Essay */}
            {gradingReport.requirements && gradingReport.requirements.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {gradingReport.requirements.map((req) => (
                  <div
                    key={req.code}
                    className={`p-3 rounded-xl border space-y-1 ${
                      req.passed
                        ? 'bg-emerald-500/10 border-emerald-500/35'
                        : 'bg-rose-500/10 border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        {req.title}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                          req.passed
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {req.statusLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {req.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Criteria Breakdown Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {gradingReport.criteria.map((crit) => {
                const isPassFail = Boolean(gradingReport.isPassFail);
                const passed = isPassFail
                  ? Boolean(crit.passed)
                  : crit.score === crit.maxScore;
                const zeroScore = isPassFail ? !passed : crit.score === 0;

                return (
                  <div
                    key={crit.code}
                    className={`p-3 rounded-xl border space-y-1 ${
                      passed
                        ? 'bg-emerald-500/10 border-emerald-500/35'
                        : zeroScore
                        ? 'bg-rose-500/10 border-rose-500/35'
                        : 'bg-slate-900/75 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        <span className="font-mono-num text-violet-300 mr-1.5">
                          {crit.code}
                        </span>
                        {crit.title}
                      </span>
                      {isPassFail ? (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                            passed
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {crit.statusLabel ?? (passed ? 'Зачёт' : 'Незачёт')}
                        </span>
                      ) : (
                        <span
                          className={`font-mono-num text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                            passed
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : zeroScore
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/15 text-amber-300'
                          }`}
                        >
                          {crit.score}/{crit.maxScore}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {crit.comment}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                <div className="font-semibold text-emerald-300">
                  Сильные стороны
                </div>
                <ul className="space-y-1 text-slate-300 list-disc pl-4 leading-relaxed">
                  {gradingReport.strengths.map((item, i) => (
                    <li key={`str-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <div className="font-semibold text-amber-300">
                  Советы по грамматике и речи
                </div>
                <ul className="space-y-1 text-slate-300 list-disc pl-4 leading-relaxed">
                  {gradingReport.improvements.slice(0, 2).map((item, i) => (
                    <li key={`imp-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Active AI Mentor Commentary inside Grading Report */}
            {activeMentor && mentorQuote && (
              <div
                className={`p-3.5 rounded-xl bg-slate-900/80 border ${activeMentor.accentBorder} flex items-start gap-3.5`}
              >
                <MentorAvatar
                  mentor={activeMentor}
                  size="md"
                  ringTone="violet"
                  className="mt-0.5"
                />
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                    <span>{activeMentor.name}</span>
                    <MessageSquareQuote className={`w-3 h-3 ${activeMentor.accentText}`} />
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    «{mentorQuote}»
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column (Desktop) / Stacked + Fixed Bottom Bar (Mobile) */}
      <TrainerSidePanel
        submitted={submitted}
        isCorrect={true}
        ruleTitle={question.ruleTitle}
        ruleExplanation={`${question.ruleExplanation} Критерии: ${question.criteriaText}`}
        hint={question.hint}
        showHint={showHint}
        onToggleHint={() => setShowHint((v) => !v)}
        isReviewMode={isReviewMode}
        isLastQuestion={isLastQuestion}
        canGoPrev={canGoPrev}
        learnedClicked={learnedClicked}
        activeMentor={activeMentor}
        mentorQuote={mentorQuote}
        onMarkLearned={
          onMarkLearned
            ? () => {
                setLearnedClicked(true);
                onMarkLearned(question.id);
              }
            : undefined
        }
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  );
};
