import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Bookmark,
  CheckCircle2,
  Clock,
  Flame,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MentorCharacter } from '../data/petsData';
import {
  AttemptGradeLevel,
  MockExamRecord,
  PlatformQuestion,
  SavedEssayRecord,
  SavedQuestionState,
} from '../types/platform';
import { formatDurationRu, formatStopwatch } from '../utils/timeFormat';
import { AnimatedXpValue, FloatingXpBadge } from './AnimatedXpCounter';
import { QuizEngine } from './engines/QuizEngine';
import { FillLetterEngine } from './engines/FillLetterEngine';
import { PunctuationInputEngine } from './engines/PunctuationInputEngine';
import { PhraseologyHighlightEngine } from './engines/PhraseologyHighlightEngine';
import { MatchingEngine } from './engines/MatchingEngine';
import { OpenEssayEngine } from './engines/OpenEssayEngine';
import { TextClozeEngine } from './engines/TextClozeEngine';
import { ParsingEngine } from './engines/ParsingEngine';
import { EgeRowSpellingEngine } from './engines/EgeRowSpellingEngine';
import { EgeTask14Engine } from './engines/EgeTask14Engine';
import { EgeTask15Engine } from './engines/EgeTask15Engine';
import { WordInputEngine } from './engines/WordInputEngine';
import {
  MockExamDraft,
  MockExamDraftSavedState,
  clearDraft,
  draftStorageKey,
  loadDraft,
  saveDraft,
} from '../utils/mockExamDraft';

export interface ActiveSessionConfig {
  id: string;
  title: string;
  subtitle?: string;
  questions: PlatformQuestion[];
  isReviewMode?: boolean;
  isMockExam?: boolean;
  examLabel?: 'ОГЭ' | 'ЕГЭ';
  xpPerCorrect?: number;
  cycleResetNotice?: boolean;
  availableSubtopics?: string[];
  selectedSubtopic?: string | null;
  gradeLevelOverride?: AttemptGradeLevel;
  essayArchiveId?: string | null;
  /** Признак: сессия собрана строго по questionIds черновика. */
  restoredFromDraft?: boolean;
  /** id, которые были в черновике, но отсутствуют в базе. */
  missingDraftQuestionIds?: string[];
}

interface TrainerSessionProps {
  session: ActiveSessionConfig;
  userXp: number;
  activeUserId?: string;
  activeMentor: MentorCharacter | null;
  onExit: () => void;
  onRestartFresh?: () => void;
  onSelectSubtopic?: (subtopic: string | null) => void;
  onSaveEssay?: (
    entry: Omit<SavedEssayRecord, 'id' | 'timestamp'> & { id?: string }
  ) => SavedEssayRecord | void;
  onQuestionAnswered: (
    question: PlatformQuestion,
    isCorrect: boolean,
    xpGain: number,
    isReviewMode: boolean,
    sourceId: string,
    sourceTitle: string,
    gradeLevelOverride?: AttemptGradeLevel,
    userState?: unknown
  ) => number;
  onDeductHintXp?: () => boolean;
  onMarkLearned: (questionId: string, fromReviewSession: boolean) => void;
  onSessionCompleted: (
    moduleId: string,
    mockExamResult?: Omit<MockExamRecord, 'id' | 'timestamp'>
  ) => void;
}

export const TrainerSession: React.FC<TrainerSessionProps> = ({
  session,
  userXp,
  activeUserId,
  activeMentor,
  onExit,
  onRestartFresh,
  onSelectSubtopic,
  onSaveEssay,
  onQuestionAnswered,
  onDeductHintXp,
  onMarkLearned,
  onSessionCompleted,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [netXpDelta, setNetXpDelta] = useState(0);
  const [xpToast, setXpToast] = useState<{
    key: number;
    amount: number;
    isPenalty: boolean;
  } | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [finished, setFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [draftRestoreWarning, setDraftRestoreWarning] = useState<string | null>(
    null
  );

  const mockStartTimeRef = useRef<number>(Date.now());
  const restoredOnceRef = useRef(false);

  const [draftStates, setDraftStates] = useState<Record<number, unknown>>({});
  const [questionResults, setQuestionResults] = useState<Array<boolean | null>>(
    () => Array(session.questions.length).fill(null)
  );
  const [savedStates, setSavedStates] = useState<
    Record<number, SavedQuestionState>
  >({});
  const answeredIndicesRef = useRef<Set<number>>(new Set());

  const questions = session.questions;
  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const xpReward = session.xpPerCorrect ?? 20;
  const isMock = Boolean(session.isMockExam);

  // Единый источник ключа черновика — только через draftStorageKey.
  const mockDraftKey = isMock
    ? draftStorageKey(activeUserId, session.id)
    : null;

  // --- Таймер для пробника ---
  useEffect(() => {
    if (!isMock || finished) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - mockStartTimeRef.current) / 1000))
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isMock, finished]);

  // --- Восстановление черновика при монтировании ---
  useEffect(() => {
    if (!isMock || restoredOnceRef.current) return;
    restoredOnceRef.current = true;

    const draft = loadDraft(activeUserId, session.id);
    if (!draft) return;

    const currentIds = questions.map((q) => q.id);
    const savedIds = draft.questionIds;

    const sameLength = currentIds.length === savedIds.length;
    let exactMatch = sameLength;
    if (sameLength) {
      for (let i = 0; i < savedIds.length; i++) {
        if (currentIds[i] !== savedIds[i]) {
          exactMatch = false;
          break;
        }
      }
    }

    if (exactMatch) {
      applyDraftByQuestionId(draft, questions);
      return;
    }

    const currentIdSet = new Set(currentIds);
    const matchedCount = savedIds.filter((id) => currentIdSet.has(id)).length;

    if (matchedCount === 0) {
      clearDraft(activeUserId, session.id);
      setDraftRestoreWarning(
        'Сохранённый черновик относится к другому варианту. Запущен новый чистый вариант.'
      );
      return;
    }

    applyDraftByQuestionId(draft, questions);
    if (matchedCount < savedIds.length) {
      setDraftRestoreWarning(
        `В черновике было ${savedIds.length} вопросов, найдено ${matchedCount}. Остальные пропущены.`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMock, activeUserId, session.id]);

  /**
   * Переносит данные черновика на индексы текущей сессии строго по questionId.
   * currentIndex восстанавливается по id сохранённого текущего вопроса.
   */
  function applyDraftByQuestionId(
    draft: MockExamDraft,
    targetQuestions: PlatformQuestion[]
  ) {
    const idToIndex: Record<string, number> = {};
    targetQuestions.forEach((q, i) => {
      idToIndex[q.id] = i;
    });

    const nextResults: Array<boolean | null> = Array(
      targetQuestions.length
    ).fill(null);
    const nextSavedStates: Record<number, SavedQuestionState> = {};
    const nextDraftStates: Record<number, unknown> = {};
    const nextAnswered = new Set<number>();

    for (const [qid, val] of Object.entries(
      draft.resultsByQuestionId || {}
    )) {
      const idx = idToIndex[qid];
      if (idx === undefined) continue;
      nextResults[idx] = val === true ? true : val === false ? false : null;
    }

    for (const [qid, state] of Object.entries(
      draft.savedStatesByQuestionId || {}
    )) {
      const idx = idToIndex[qid];
      if (idx === undefined) continue;
      nextSavedStates[idx] = {
        isCorrect: Boolean(state?.isCorrect),
        userState:
          (state as MockExamDraftSavedState | undefined)?.userState ?? null,
        mentorQuote:
          (state as MockExamDraftSavedState | undefined)?.mentorQuote ?? null,
      };
    }

    for (const [qid, val] of Object.entries(
      draft.draftStatesByQuestionId || {}
    )) {
      const idx = idToIndex[qid];
      if (idx === undefined) continue;
      nextDraftStates[idx] = val;
    }

    for (const qid of draft.answeredQuestionIds || []) {
      const idx = idToIndex[qid];
      if (idx === undefined) continue;
      nextAnswered.add(idx);
    }

    const restoredCorrect = nextResults.filter((v) => v === true).length;
    const restoredWrong = nextResults.filter((v) => v === false).length;

    let restoredIndex = 0;
    const savedCurrentId = draft.questionIds[draft.currentIndex];
    if (savedCurrentId && idToIndex[savedCurrentId] !== undefined) {
      restoredIndex = idToIndex[savedCurrentId];
    } else if (draft.currentIndex < targetQuestions.length) {
      restoredIndex = draft.currentIndex;
    }

    setCurrentIndex(restoredIndex);
    setCorrectCount(restoredCorrect);
    setWrongCount(restoredWrong);
    setComboStreak(draft.comboStreak ?? 0);
    setNetXpDelta(draft.netXpDelta ?? 0);
    setQuestionResults(nextResults);
    setSavedStates(nextSavedStates);
    setDraftStates(nextDraftStates);
    answeredIndicesRef.current = nextAnswered;

    const prevElapsed = Number(draft.elapsedSeconds ?? 0);
    setElapsedSeconds(prevElapsed);
    mockStartTimeRef.current = Date.now() - prevElapsed * 1000;
  }

  // --- «Сохранить и выйти»: только saveDraft + onExit, без clearDraft ---
  const handleSaveMockAndExit = () => {
    if (!mockDraftKey) {
      onExit();
      return;
    }

    const resultsByQuestionId: Record<string, boolean | null> = {};
    const savedStatesByQuestionId: Record<string, MockExamDraftSavedState> = {};
    const draftStatesByQuestionId: Record<string, unknown> = {};
    const answeredQuestionIds: string[] = [];

    questions.forEach((q, idx) => {
      if (questionResults[idx] !== null && questionResults[idx] !== undefined) {
        resultsByQuestionId[q.id] = questionResults[idx];
      }
      if (savedStates[idx]) {
        savedStatesByQuestionId[q.id] = {
          isCorrect: savedStates[idx].isCorrect,
          userState: savedStates[idx].userState ?? null,
          mentorQuote: savedStates[idx].mentorQuote ?? null,
        };
      }
      if (draftStates[idx] !== undefined) {
        draftStatesByQuestionId[q.id] = draftStates[idx];
      }
      if (answeredIndicesRef.current.has(idx)) {
        answeredQuestionIds.push(q.id);
      }
    });

    const draft: MockExamDraft = {
      version: 2,
      questionIds: questions.map((q) => q.id),
      total,
      finished: false,
      currentIndex,
      correctCount,
      wrongCount,
      comboStreak,
      netXpDelta,
      elapsedSeconds,
      resultsByQuestionId,
      savedStatesByQuestionId,
      draftStatesByQuestionId,
      answeredQuestionIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDraft(activeUserId, session.id, draft);
    onExit();
  };

  const triggerXpToast = (amount: number, isPenalty: boolean) => {
    const key = Date.now() + Math.random();
    setXpToast({ key, amount, isPenalty });
    if (isPenalty) setShakeKey((k) => k + 1);
    setTimeout(() => {
      setXpToast((prev) => (prev?.key === key ? null : prev));
    }, 1000);
  };

  const handleAnswered = (
    isCorrect: boolean,
    userState?: unknown,
    mentorQuote?: string | null
  ) => {
    setSavedStates((prev) => ({
      ...prev,
      [currentIndex]: {
        isCorrect,
        userState: userState ?? null,
        mentorQuote: mentorQuote ?? null,
      },
    }));

    if (
      answeredIndicesRef.current.has(currentIndex) ||
      questionResults[currentIndex] !== null
    ) {
      return;
    }
    answeredIndicesRef.current.add(currentIndex);

    const isReview = Boolean(session.isReviewMode);
    setQuestionResults((prev) => {
      const next = [...prev];
      next[currentIndex] = isCorrect;
      return next;
    });
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setComboStreak((s) => s + 1);
    } else {
      setWrongCount((w) => w + 1);
      setComboStreak(0);
    }

    const actualDelta = onQuestionAnswered(
      currentQuestion,
      isCorrect,
      xpReward,
      isReview,
      session.id,
      session.title,
      session.gradeLevelOverride,
      userState
    );
    setNetXpDelta((prev) => prev + actualDelta);

    if (isCorrect) {
      triggerXpToast(xpReward, false);
    } else {
      const displayPenalty = isReview ? -20 : -15;
      triggerXpToast(displayPenalty, true);
    }
  };

  const handleDraftChange = (draft: unknown) => {
    setDraftStates((prev) => ({ ...prev, [currentIndex]: draft }));
  };

  const handleReviewMarkLearned = (questionId: string) => {
    onMarkLearned(questionId, Boolean(session.isReviewMode));
    if (session.isReviewMode) {
      setNetXpDelta((prev) => prev + 10);
      triggerXpToast(10, false);
    }
  };

  const handleSpendHintXp = (): boolean => {
    if (userXp < 5) return false;
    const spent = onDeductHintXp ? onDeductHintXp() : true;
    if (!spent) return false;
    setNetXpDelta((prev) => prev - 5);
    triggerXpToast(-5, true);
    return true;
  };

  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      const finalDuration = Math.max(
        0,
        Math.floor((Date.now() - mockStartTimeRef.current) / 1000)
      );
      if (isMock) setElapsedSeconds(finalDuration);
      setFinished(true);

      // Штатное завершение: здесь и только здесь чистим черновик.
      if (mockDraftKey) clearDraft(activeUserId, session.id);

      if (!session.isReviewMode) {
        if (isMock) {
          const examType: 'oge' | 'ege' =
            session.examLabel === 'ОГЭ' || session.id.includes('oge')
              ? 'oge'
              : 'ege';
          const taskResults = questions.map((q, idx) => {
            const taskNumber = q.kimTaskNumber ?? idx + 1;
            return {
              taskNumber,
              taskTitle: q.topicTag || `Задание №${taskNumber}`,
              isCorrect: questionResults[idx] === true,
            };
          });
          onSessionCompleted(session.id, {
            examType,
            score: taskResults.filter((t) => t.isCorrect).length,
            maxScore: questions.length,
            durationSeconds: finalDuration,
            taskResults,
          });
        } else {
          onSessionCompleted(session.id);
        }
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRestart = () => {
    // «Пройти ещё раз» — явный сброс, чистим черновик.
    if (mockDraftKey) clearDraft(activeUserId, session.id);
    if (onRestartFresh && !session.isReviewMode) {
      onRestartFresh();
      return;
    }
    mockStartTimeRef.current = Date.now();
    setElapsedSeconds(0);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setComboStreak(0);
    setNetXpDelta(0);
    setXpToast(null);
    setQuestionResults(Array(total).fill(null));
    setSavedStates({});
    setDraftStates({});
    answeredIndicesRef.current.clear();
    setFinished(false);
  };

  if (total === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 text-center space-y-4">
        <p className="text-slate-300 text-sm">
          В этой подборке пока нет доступных вопросов.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
        >
          Вернуться
        </button>
      </div>
    );
  }

  if (finished) {
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className={isMock ? 'max-w-3xl mx-auto' : 'max-w-2xl mx-auto'}>
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                {isMock
                  ? `Экзаменационная ведомость (${session.examLabel ?? 'КИМ'})`
                  : session.isReviewMode
                  ? 'Повторение завершено'
                  : 'Тренировка завершена'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{session.title}</p>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 gap-3 ${
              isMock ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
            }`}
          >
            <div className="p-4 rounded-xl bg-[#080B14]/80 border border-slate-800/80">
              <div className="text-xs text-slate-400">
                {isMock ? 'Первичный балл' : 'Верных ответов'}
              </div>
              <div className="font-mono-num text-2xl font-bold text-emerald-400 mt-1">
                {correctCount} / {total}
                {isMock && (
                  <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                    первичных баллов
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#080B14]/80 border border-slate-800/80">
              <div className="text-xs text-slate-400">Точность</div>
              <div className="font-mono-num text-2xl font-bold text-white mt-1">
                {accuracy}%
              </div>
            </div>
            {isMock && (
              <div className="p-4 rounded-xl bg-[#080B14]/80 border border-slate-800/80">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Время выполнения</span>
                </div>
                <div className="font-mono-num text-xl font-bold text-cyan-300 mt-1">
                  {formatDurationRu(elapsedSeconds)}
                </div>
              </div>
            )}
            <div className="p-4 rounded-xl bg-[#080B14]/80 border border-slate-800/80">
              <div className="text-xs text-slate-400">Итог XP</div>
              <div
                className={`font-mono-num text-2xl font-bold mt-1 ${
                  netXpDelta >= 0 ? 'text-violet-400' : 'text-rose-400'
                }`}
              >
                {netXpDelta >= 0 ? `+${netXpDelta}` : netXpDelta}
              </div>
            </div>
          </div>

          {isMock && (
            <div className="p-4 rounded-xl bg-[#080B14]/80 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  Результаты по заданиям КИМ
                </span>
                <span className="font-mono-num">
                  Верно: {correctCount} · Ошибок: {wrongCount}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {questions.map((q, idx) => {
                  const res = questionResults[idx];
                  const taskNum = q.kimTaskNumber ?? idx + 1;
                  return (
                    <div
                      key={`sheet-${q.id}-${idx}`}
                      className={`min-w-[44px] px-2 py-1.5 rounded-lg border text-center font-mono-num text-xs font-semibold ${
                        res === true
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                          : res === false
                          ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      №{taskNum}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {wrongCount > 0 && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Ошибки ({wrongCount}) сохранены в разделе «Работа над ошибками». Они останутся
                там, пока вы не нажмёте «Выучил» (+10 XP за искупление).
              </span>
            </div>
          )}

          {wrongCount === 0 && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Отличный результат! Все задания выполнены без единой ошибки.</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            {!session.isReviewMode && (
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#080B14]/90 border border-slate-700 hover:border-violet-500/50 text-sm font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Пройти ещё раз</span>
              </button>
            )}
            <button
              type="button"
              onClick={onExit}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer whitespace-nowrap"
            >
              Вернуться в меню
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-3.5 lg:space-y-4 pb-24 lg:pb-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Завершить</span>
          </button>

          {isMock && (
            <button
              type="button"
              onClick={handleSaveMockAndExit}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-semibold text-emerald-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Сохранить</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 min-w-0">
          {comboStreak >= 2 && (
            <div
              key={comboStreak}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-semibold shadow-md shadow-amber-500/15 whitespace-nowrap shrink-0 transition-transform duration-200"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono-num">Серия ×{comboStreak}</span>
            </div>
          )}

          <span className="hidden sm:inline truncate font-medium text-slate-300">
            {session.title}
          </span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span className="font-mono-num text-slate-200 whitespace-nowrap">
            Вопрос {currentIndex + 1} из {total}
          </span>
          <span aria-hidden="true">·</span>

          <div className="relative inline-flex items-center shrink-0">
            <div
              key={shakeKey}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border font-mono-num font-semibold whitespace-nowrap transition-colors duration-200 ${
                shakeKey > 0 ? 'animate-xp-shake' : ''
              } ${
                xpToast?.isPenalty
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                  : 'bg-violet-500/10 border-violet-500/30 text-violet-300'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>
                <AnimatedXpValue value={userXp} durationMs={600} suffix=" XP" />
              </span>
            </div>

            {xpToast && (
              <FloatingXpBadge
                toastKey={xpToast.key}
                amount={xpToast.amount}
                className="-top-1 right-0"
              />
            )}
          </div>
        </div>
      </div>

      <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 transition-all duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {!session.isReviewMode &&
        !isMock &&
        onSelectSubtopic &&
        session.availableSubtopics &&
        session.availableSubtopics.length >= 2 && (
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1"
            role="group"
            aria-label="Фильтр по подтемам"
          >
            <button
              type="button"
              onClick={() => onSelectSubtopic(null)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                !session.selectedSubtopic
                  ? 'bg-violet-600/25 border-violet-400 text-white shadow-sm shadow-violet-500/20'
                  : 'bg-slate-900/75 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              Все темы (микс)
            </button>
            {session.availableSubtopics.map((sub) => {
              const isSelected = session.selectedSubtopic === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onSelectSubtopic(sub)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-violet-600/25 border-violet-400 text-white shadow-sm shadow-violet-500/20'
                      : 'bg-slate-900/75 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}

      {session.cycleResetNotice && (
        <div className="max-w-5xl mx-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Все задания темы пройдены — запущен новый круг!</span>
        </div>
      )}

      {isMock && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/75 border border-slate-800/85 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-violet-500/20 border border-violet-500/40 font-mono-num font-bold text-violet-200">
                КИМ {session.examLabel ?? ''}
              </span>
              <span className="font-display font-semibold text-white text-sm">
                Задание №{currentQuestion.kimTaskNumber ?? currentIndex + 1}
              </span>
              {currentQuestion.passageGroupId && (
                <span className="hidden sm:inline text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                  Единый текст блока
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 font-mono-num font-semibold text-cyan-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{formatStopwatch(elapsedSeconds)}</span>
              </span>
              <span className="font-mono-num text-slate-400">
                Решено верно:{' '}
                <strong className="text-emerald-300">{correctCount}</strong> из {total}
              </span>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center gap-1"
            role="navigation"
            aria-label="Навигация по заданиям КИМ"
          >
            {questions.map((q, idx) => {
              const res = questionResults[idx];
              const isCurrent = idx === currentIndex;
              const taskNum = q.kimTaskNumber ?? idx + 1;

              let pillClass =
                'bg-[#080B14]/80 border-slate-800 text-slate-400 hover:border-violet-500/60 hover:text-white';
              if (res === true) {
                pillClass =
                  'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 hover:border-emerald-400';
              } else if (res === false) {
                pillClass =
                  'bg-rose-500/15 border-rose-500/50 text-rose-300 hover:border-rose-400';
              }
              if (isCurrent) {
                pillClass =
                  res === null
                    ? 'bg-violet-600/35 border-violet-400 text-white ring-2 ring-violet-400/50'
                    : `${pillClass} ring-2 ring-violet-400`;
              }

              return (
                <button
                  key={`pill-${q.id}-${idx}`}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Перейти к заданию №${taskNum}`}
                  className={`min-w-[30px] px-1.5 py-0.5 rounded-md border text-center font-mono-num text-[11px] font-semibold transition-all cursor-pointer ${pillClass}`}
                >
                  {taskNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {draftRestoreWarning && (
        <div className="max-w-5xl mx-auto flex items-start gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>{draftRestoreWarning}</span>
          <button
            type="button"
            onClick={() => setDraftRestoreWarning(null)}
            className="ml-auto text-amber-300 hover:text-white font-semibold cursor-pointer"
            aria-label="Скрыть предупреждение"
          >
            ×
          </button>
        </div>
      )}

      {currentQuestion.type === 'fill_letter' ? (
        <FillLetterEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{ selectedOption: string | null }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'punctuation_input' ? (
        <PunctuationInputEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{ values: string[]; digitsInput: string }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'phraseology_highlight' ? (
        <PhraseologyHighlightEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{ selectedIndices: number[] }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'matching' ? (
        <MatchingEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{
                  selectedMapping: Record<string, number | ''>;
                }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'open_essay' ? (
        <OpenEssayEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          activeUserId={activeUserId}
          initialArchiveId={session.essayArchiveId ?? null}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{
                  essayText: string;
                  gradingReport: unknown;
                }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          onSaveEssay={onSaveEssay}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'text_cloze' ? (
        <TextClozeEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{ values: string[]; digitsInput: string }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'parsing' ? (
        <ParsingEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={savedStates[currentIndex]}
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'ege_row_spelling' ? (
        <EgeRowSpellingEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{
                  letterValues: string[];
                  answerInput: string;
                }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'ege_task14' ? (
        <EgeTask14Engine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{
                  selectedForms: Record<
                    string,
                    'solid' | 'separate' | 'hyphen'
                  >;
                  answerInput: string;
                }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'ege_task15' ? (
        <EgeTask15Engine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{
                  slotValues: Record<number, 'н' | 'нн'>;
                  digitsInput: string;
                }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'word_input' ? (
        <WordInputEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{ answer: string }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : currentQuestion.type === 'single_choice' ||
        currentQuestion.type === 'multiple_choice' ? (
        <QuizEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          sessionId={session.id}
          sessionTitle={session.title}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={
            savedStates[currentIndex] as
              | SavedQuestionState<{ selectedIndices: number[] }>
              | undefined
          }
          draftState={draftStates[currentIndex]}
          onDraftChange={handleDraftChange}
          comboStreak={comboStreak}
          activeMentor={activeMentor}
          userXp={userXp}
          onRequestHint={handleSpendHintXp}
          onAnswered={handleAnswered}
          onPrev={handlePrev}
          onNext={handleNext}
          onMarkLearned={handleReviewMarkLearned}
        />
      ) : null}
    </div>
  );
};
