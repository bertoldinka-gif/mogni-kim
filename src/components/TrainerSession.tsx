import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { getModulesForGrade } from '../data/curriculum';
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
  const mockStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!session.isMockExam || finished) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - mockStartTimeRef.current) / 1000))
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session.isMockExam, finished]);

  const mockDraftKey = session.isMockExam
    ? `mogni_mock_draft_${(activeUserId ?? 'guest').trim().toLowerCase() || 'guest'}_${session.id}`
    : null;

  const [questions, setQuestions] = useState(() => session.questions);
  const total = questions.length;
  const [questionResults, setQuestionResults] = useState<Array<boolean | null>>(() =>
    Array(session.questions.length).fill(null)
  );
  const [savedStates, setSavedStates] = useState<Record<number, SavedQuestionState>>({});
  const answeredIndicesRef = useRef<Set<number>>(new Set());
  const currentQuestion = questions[currentIndex];
  const xpReward = session.xpPerCorrect ?? 20;

  useEffect(() => {
    setQuestions(session.questions);
  }, [session.questions]);

  const isEge21 = session.id === 'ege-21' && !session.isMockExam && !session.isReviewMode;
  const [ege21SignFilter, setEge21SignFilter] = useState<'mix' | 'comma' | 'dash' | 'colon'>('mix');

  const allEge21Questions = useMemo(() => {
    if (!isEge21) return [];
    const mod = getModulesForGrade('ege').find((m) => m.id === 'ege-21');
    return mod ? mod.questions : session.questions;
  }, [isEge21, session.questions]);

  const ege21Counts = useMemo(() => {
    if (!isEge21) return { mix: 0, comma: 0, dash: 0, colon: 0 };
    const getText = (q: (typeof allEge21Questions)[number]) =>
      `${q.subtopic ?? ''} ${q.prompt ?? ''}`.toLowerCase();
    return {
      mix: allEge21Questions.length,
      comma: allEge21Questions.filter((q) => getText(q).includes('запят')).length,
      dash: allEge21Questions.filter((q) => getText(q).includes('тире')).length,
      colon: allEge21Questions.filter((q) => getText(q).includes('двоеточ')).length,
    };
  }, [isEge21, allEge21Questions]);

  const handleSelectEge21Sign = (sign: 'mix' | 'comma' | 'dash' | 'colon') => {
    setEge21SignFilter(sign);
    const getText = (q: (typeof allEge21Questions)[number]) =>
      `${q.subtopic ?? ''} ${q.prompt ?? ''}`.toLowerCase();
    const filtered =
      sign === 'mix'
        ? allEge21Questions
        : allEge21Questions.filter((q) => {
            const t = getText(q);
            if (sign === 'comma') return t.includes('запят');
            if (sign === 'dash') return t.includes('тире');
            return t.includes('двоеточ');
          });
    const nextList = filtered.length > 0 ? filtered : allEge21Questions;
    const shuffled = [...nextList].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setQuestionResults(Array(shuffled.length).fill(null));
    setSavedStates({});
    answeredIndicesRef.current = new Set();
  };

  useEffect(() => {
    if (!mockDraftKey) return;
    try {
      const raw = localStorage.getItem(mockDraftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft && draft.total === session.questions.length && !draft.finished) {
        if (Array.isArray(draft.questions) && draft.questions.length === session.questions.length) {
          setQuestions(draft.questions);
        }
        setCurrentIndex(draft.currentIndex ?? 0);
        setCorrectCount(draft.correctCount ?? 0);
        setWrongCount(draft.wrongCount ?? 0);
        setComboStreak(draft.comboStreak ?? 0);
        setNetXpDelta(draft.netXpDelta ?? 0);
        if (Array.isArray(draft.questionResults)) setQuestionResults(draft.questionResults);
        if (draft.savedStates) setSavedStates(draft.savedStates);
        if (Array.isArray(draft.answeredIndices)) {
          answeredIndicesRef.current = new Set(draft.answeredIndices);
        }
        const prevElapsed = Number(draft.elapsedSeconds ?? 0);
        setElapsedSeconds(prevElapsed);
        mockStartTimeRef.current = Date.now() - prevElapsed * 1000;
      }
    } catch {
      // ignore
    }
  }, [mockDraftKey, session.questions.length]);

  const handleSaveMockAndExit = () => {
    if (mockDraftKey) {
      try {
        localStorage.setItem(
          mockDraftKey,
          JSON.stringify({
            total,
            questions,
            finished: false,
            currentIndex,
            correctCount,
            wrongCount,
            comboStreak,
            netXpDelta,
            elapsedSeconds,
            questionResults,
            savedStates,
            answeredIndices: Array.from(answeredIndicesRef.current),
          })
        );
      } catch {
        // ignore
      }
    }
    onExit();
  };

  const triggerXpToast = (amount: number, isPenalty: boolean) => {
    const key = Date.now() + Math.random();
    setXpToast({ key, amount, isPenalty });
    if (isPenalty) {
      setShakeKey((k) => k + 1);
    }
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

  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      const finalDuration = Math.max(
        0,
        Math.floor((Date.now() - mockStartTimeRef.current) / 1000)
      );
      if (session.isMockExam) {
        setElapsedSeconds(finalDuration);
      }
      setFinished(true);
      if (mockDraftKey) {
        localStorage.removeItem(mockDraftKey);
      }
      if (!session.isReviewMode) {
        if (session.isMockExam) {
          const examType: 'oge' | 'ege' =
            session.examLabel === 'ОГЭ' || session.id.includes('oge') ? 'oge' : 'ege';
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
    if (mockDraftKey) {
      localStorage.removeItem(mockDraftKey);
    }
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
      <div className={session.isMockExam ? 'max-w-3xl mx-auto' : 'max-w-2xl mx-auto'}>
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                {session.isMockExam
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
              session.isMockExam ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
            }`}
          >
            <div className="p-4 rounded-xl bg-[#080B14]/80 border border-slate-800/80">
              <div className="text-xs text-slate-400">
                {session.isMockExam ? 'Первичный балл' : 'Верных ответов'}
              </div>
              <div className="font-mono-num text-2xl font-bold text-emerald-400 mt-1">
                {correctCount} / {total}
                {session.isMockExam && (
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
            {session.isMockExam && (
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

          {session.isMockExam && (
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
                Ошибки ({wrongCount}) сохранены в разделе «Работа над ошибками». Они останутся там,
                пока вы не нажмёте «Выучил» (+10 XP за искупление).
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
      {isEge21 && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 mr-1">
            Знак препинания:
          </span>
          {(
            [
              { key: 'mix', label: 'Микс', count: ege21Counts.mix },
              { key: 'comma', label: 'Запятая', count: ege21Counts.comma },
              { key: 'dash', label: 'Тире', count: ege21Counts.dash },
              { key: 'colon', label: 'Двоеточие', count: ege21Counts.colon },
            ] as const
          ).map((tab) => {
            const active = ege21SignFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleSelectEge21Sign(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-violet-600/25 border-violet-500 text-violet-200 shadow-sm shadow-violet-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono-num text-[11px] opacity-75">
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>
      )}
      {/* Top Session Bar */}
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

          {session.isMockExam && (
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
          {/* Glowing Combo Streak Badge when >= 2 */}
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

          {/* Live XP Balance Pill with Pure CSS Shake on Penalty & Floating +XP / -XP Badge */}
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
                delta={xpToast.amount}
                className="-top-1 right-0"
              />
            )}
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 transition-all duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Automatic Subtopic Filter Bar (only when 2+ subtopics exist in module) */}
      {!session.isReviewMode &&
        !session.isMockExam &&
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

      {/* Subtle Cycle Auto-Reset Notice */}
      {session.cycleResetNotice && (
        <div className="max-w-5xl mx-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Все задания темы пройдены — запущен новый круг!</span>
        </div>
      )}

      {/* Official Mock Exam КИМ Header & Task Status Pills */}
      {session.isMockExam && (
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
                Решено верно: <strong className="text-emerald-300">{correctCount}</strong> из {total}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1" role="navigation" aria-label="Навигация по заданиям КИМ">
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

      {/* Split-Screen Question & Side Panel */}
      {currentQuestion.type === 'fill_letter' ? (
        <FillLetterEngine
          key={`${currentQuestion.id}-${currentIndex}`}
          question={currentQuestion}
          isReviewMode={session.isReviewMode}
          isLastQuestion={currentIndex + 1 >= total}
          canGoPrev={currentIndex > 0}
          savedState={savedStates[currentIndex] as SavedQuestionState<{ selectedOption: string | null }> | undefined}
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
          savedState={savedStates[currentIndex] as SavedQuestionState<{ values: string[]; digitsInput: string }> | undefined}
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
          savedState={savedStates[currentIndex] as SavedQuestionState<{ selectedIndices: number[] }> | undefined}
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
          savedState={savedStates[currentIndex] as SavedQuestionState<{ selectedMapping: Record<string, number | ''> }> | undefined}
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
          savedState={savedStates[currentIndex] as SavedQuestionState<{ essayText: string; gradingReport: unknown }> | undefined}
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
          savedState={savedStates[currentIndex] as SavedQuestionState<{ values: string[]; digitsInput: string }> | undefined}
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
          savedState={savedStates[currentIndex] as SavedQuestionState<{ letterValues: string[]; answerInput: string }> | undefined}
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
          savedState={savedStates[currentIndex] as SavedQuestionState<{ selectedForms: Record<string, 'solid' | 'separate' | 'hyphen'>; answerInput: string }> | undefined}
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
          savedState={savedStates[currentIndex] as SavedQuestionState<{ slotValues: Record<number, 'н' | 'нн'>; digitsInput: string }> | undefined}
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
          savedState={savedStates[currentIndex] as SavedQuestionState<{ answer: string }> | undefined}
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
          savedState={savedStates[currentIndex] as SavedQuestionState<{ selectedIndices: number[] }> | undefined}
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
