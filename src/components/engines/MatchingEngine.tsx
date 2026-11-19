import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Lightbulb,
  MessageSquareQuote,
  Send,
  XCircle,
} from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import { MatchingQuestion, SavedQuestionState } from '../../types/platform';
import { MentorAvatar } from '../MentorAvatar';

const PAIR_STYLES = [
  {
    card: 'bg-violet-500/15 border-violet-400/70',
    badge: 'bg-violet-500/30 border-violet-400 text-violet-100',
    pill: 'bg-violet-500/25 border-violet-400/60 text-violet-100',
  },
  {
    card: 'bg-sky-500/15 border-sky-400/70',
    badge: 'bg-sky-500/30 border-sky-400 text-sky-100',
    pill: 'bg-sky-500/25 border-sky-400/60 text-sky-100',
  },
  {
    card: 'bg-emerald-500/15 border-emerald-400/70',
    badge: 'bg-emerald-500/30 border-emerald-400 text-emerald-100',
    pill: 'bg-emerald-500/25 border-emerald-400/60 text-emerald-100',
  },
  {
    card: 'bg-amber-500/15 border-amber-400/70',
    badge: 'bg-amber-500/30 border-amber-400 text-amber-100',
    pill: 'bg-amber-500/25 border-amber-400/60 text-amber-100',
  },
  {
    card: 'bg-fuchsia-500/15 border-fuchsia-400/70',
    badge: 'bg-fuchsia-500/30 border-fuchsia-400 text-fuchsia-100',
    pill: 'bg-fuchsia-500/25 border-fuchsia-400/60 text-fuchsia-100',
  },
];
function renderFormattedItemText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|<u>[^<]+<\/u>)/g);
  if (parts.length === 1) return text;

  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong
          key={`b-${idx}`}
          className="font-bold text-white bg-violet-500/20 border border-violet-400/40 px-1 py-0.5 rounded mx-0.5"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('<u>') && part.endsWith('</u>') && part.length > 7) {
      return (
        <u
          key={`u-${idx}`}
          className="underline decoration-amber-400 decoration-2 underline-offset-4 font-bold text-amber-200"
        >
          {part.slice(3, -4)}
        </u>
      );
    }
    return <React.Fragment key={`t-${idx}`}>{part}</React.Fragment>;
  });
}
interface MatchingEngineProps {
  question: MatchingQuestion;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<{ selectedMapping: Record<string, number | ''> }>;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: { selectedMapping: Record<string, number | ''> },
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

export const MatchingEngine: React.FC<MatchingEngineProps> = ({
  question,
  isReviewMode = false,
  isLastQuestion = false,
  canGoPrev = false,
  savedState,
  comboStreak = 0,
  activeMentor = null,
  userXp = 999,
  onRequestHint,
  onAnswered,
  onPrev,
  onNext,
  onMarkLearned,
}) => {
  const [selectedMapping, setSelectedMapping] = useState<Record<string, number | ''>>(() => {
    if (savedState?.userState?.selectedMapping) {
      return savedState.userState.selectedMapping;
    }
    const initial: Record<string, number | ''> = {};
    for (const item of question.leftItems) {
      initial[item.key] = '';
    }
    return initial;
  });
  const [submitted, setSubmitted] = useState(() => Boolean(savedState));
  const [isCorrect, setIsCorrect] = useState(() => Boolean(savedState?.isCorrect));
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [learnedClicked, setLearnedClicked] = useState(false);
  const [mentorQuote, setMentorQuote] = useState<string | null>(
    () => savedState?.mentorQuote ?? null
  );
  const [activeLeftKey, setActiveLeftKey] = useState<string | null>(null);
  const [activeRightNum, setActiveRightNum] = useState<number | null>(null);

  useEffect(() => {
    if (savedState?.userState?.selectedMapping) {
      setSelectedMapping(savedState.userState.selectedMapping);
    } else {
      const initial: Record<string, number | ''> = {};
      for (const item of question.leftItems) {
        initial[item.key] = '';
      }
      setSelectedMapping(initial);
    }
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
        setActiveLeftKey(null);
    setActiveRightNum(null);
  }, [question.id, question.leftItems, savedState]);

  const canAffordHint = userXp >= 5;

  const handleToggleHint = () => {
    if (showHint) {
      setShowHint(false);
      return;
    }
    if (hintUnlocked) {
      setShowHint(true);
      return;
    }
    if (!canAffordHint) return;
    if (onRequestHint && !onRequestHint()) return;
    setHintUnlocked(true);
    setShowHint(true);
  };

  const allSelected = question.leftItems.every(
    (item) => typeof selectedMapping[item.key] === 'number'
  );

    const clearPairByLeft = (leftKey: string) => {
    if (submitted) return;
    setSelectedMapping((prev) => ({ ...prev, [leftKey]: '' }));
    if (activeLeftKey === leftKey) setActiveLeftKey(null);
  };

  const handleLeftCardClick = (leftKey: string) => {
    if (submitted) return;
    if (activeRightNum !== null) {
      setSelectedMapping((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (next[k] === activeRightNum) next[k] = '';
        }
        next[leftKey] = activeRightNum;
        return next;
      });
      setActiveRightNum(null);
      setActiveLeftKey(null);
      return;
    }
    setActiveLeftKey((prev) => (prev === leftKey ? null : leftKey));
  };

  const handleRightCardClick = (rightNum: number) => {
    if (submitted) return;
    if (activeLeftKey !== null) {
      setSelectedMapping((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (next[k] === rightNum) next[k] = '';
        }
        next[activeLeftKey] = rightNum;
        return next;
      });
      setActiveLeftKey(null);
      setActiveRightNum(null);
      return;
    }
    const existingLeftKey = Object.keys(selectedMapping).find(
      (k) => selectedMapping[k] === rightNum
    );
    if (existingLeftKey) {
      clearPairByLeft(existingLeftKey);
      return;
    }
    setActiveRightNum((prev) => (prev === rightNum ? null : rightNum));
  };

  const handleSubmit = () => {
    if (submitted || !allSelected) return;

    const exactMatch = question.leftItems.every(
      (item) => selectedMapping[item.key] === question.correctMapping[item.key]
    );

    let quote: string | null = null;
    if (activeMentor) {
      if (!exactMatch) {
        quote = pickRandomQuote(activeMentor.mistakeQuotes);
      } else if (comboStreak + 1 >= 2) {
        quote = pickRandomQuote(activeMentor.comboQuotes);
      }
      setMentorQuote(quote);
    }

    setSubmitted(true);
    setIsCorrect(exactMatch);
    onAnswered(exactMatch, { selectedMapping }, quote);
  };

  const correctHighlight = question.leftItems
    .map((item) => `${item.key} — ${question.correctMapping[item.key]}`)
    .join(', ');

  const isTask22Mode =
    question.kimTaskNumber === 22 || question.id.startsWith('ege-22');
  const leftTitle =
    question.leftColumnTitle ||
    (isTask22Mode ? 'Фрагменты текста (А–Д)' : 'Правила / Ошибки');
  const rightTitle =
    question.rightColumnTitle ||
    (isTask22Mode ? 'Средства выразительности (1–9)' : 'Предложения');
  const optionPrefix =
    question.selectOptionPrefix ||
    (isTask22Mode ? 'Средство' : 'Предложение');

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4">
      {/* Full-Width Matching Workspace Card */}
      <div className="p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        {/* Header Row with Top-Right Hint Toggle */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'Сопоставление'} ·{' '}
              {isTask22Mode
                ? 'Подберите средства выразительности (1–9)'
                : 'Выберите номера предложений'}
            </span>

            {question.hint && !submitted && (
              <button
                type="button"
                disabled={!hintUnlocked && !canAffordHint}
                title={
                  !hintUnlocked && !canAffordHint
                    ? 'Недостаточно XP для подсказки (нужно 5 XP)'
                    : undefined
                }
                onClick={handleToggleHint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs font-medium text-violet-300 hover:text-violet-200 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>
                  {showHint
                    ? 'Скрыть подсказку'
                    : hintUnlocked
                    ? 'Подсказка'
                    : 'Подсказка (-5 XP)'}
                </span>
              </button>
            )}
          </div>

          <h3 className="w-full [text-wrap:wrap] font-display text-base sm:text-lg font-semibold text-white leading-snug">
            {question.prompt}
          </h3>

          {showHint && !submitted && question.hint && (
            <div className="p-3 lg:p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs lg:text-sm text-violet-200 leading-relaxed">
              <span className="font-semibold text-violet-300">Подсказка: </span>
              {question.hint}
            </div>
          )}
        </div>

                {/* Full-Width Two-Column Interactive Pair Matching Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
          {/* Left Column: Lettered Items (А–Д) */}
          <div className={`${isTask22Mode ? 'md:col-span-7' : 'md:col-span-5'} space-y-2.5`}>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-slate-400">
                {leftTitle}
              </span>
              {!submitted && (
                <span className="text-[11px] text-slate-500">
                  Нажмите на карточку слева, затем справа
                </span>
              )}
            </div>

            {question.leftItems.map((item, leftIdx) => {
              const selectedVal = selectedMapping[item.key];
              const expectedVal = question.correctMapping[item.key];
              const rowOk = selectedVal === expectedVal;
              const isSelectedCard = activeLeftKey === item.key;
              const pairColor = PAIR_STYLES[leftIdx % PAIR_STYLES.length];
              const matchedRight =
                typeof selectedVal === 'number'
                  ? question.rightItems.find((r) => r.number === selectedVal)
                  : undefined;

              let rowClass =
                'bg-[#080B14]/80 border-slate-800/90 hover:border-slate-700';

              if (submitted) {
                rowClass = rowOk
                  ? 'bg-emerald-500/15 border-emerald-500/60'
                  : 'bg-rose-500/15 border-rose-500/60';
              } else if (isSelectedCard) {
                rowClass = `${pairColor.card} ring-2 ring-white/40 shadow-md`;
              } else if (matchedRight) {
                rowClass = pairColor.card;
              }

              return (
                <div
                  key={item.key}
                  role="button"
                  tabIndex={submitted ? -1 : 0}
                  onClick={() => handleLeftCardClick(item.key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLeftCardClick(item.key);
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all space-y-2 ${
                    submitted ? 'cursor-default' : 'cursor-pointer'
                  } ${rowClass}`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-md border text-xs font-mono-num font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          matchedRight || isSelectedCard
                            ? pairColor.badge
                            : 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                        }`}
                      >
                        {item.key}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-200 leading-snug">
                        {renderFormattedItemText(item.text)}
                      </span>
                    </div>

                    {submitted &&
                      (rowOk ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-mono-num font-bold text-emerald-300 whitespace-nowrap shrink-0 mt-0.5">
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>→ {expectedVal}</span>
                        </span>
                      ))}
                  </div>

                  {/* Selected Pair Pill or Prompt */}
                  <div className="pl-8 flex items-center justify-between gap-2">
                    {matchedRight ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                          submitted
                            ? rowOk
                              ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
                              : 'bg-rose-500/20 border-rose-400/60 text-rose-200'
                            : pairColor.pill
                        }`}
                      >
                        <strong className="font-mono-num">{matchedRight.number}</strong>
                        <span className="truncate max-w-[260px] sm:max-w-[340px]">
                          · {isTask22Mode ? matchedRight.text : `${optionPrefix} ${matchedRight.number}`}
                        </span>
                        {!submitted && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearPairByLeft(item.key);
                            }}
                            title="Убрать пару"
                            className="ml-1 text-xs opacity-75 hover:opacity-100 cursor-pointer"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] font-medium ${
                          isSelectedCard ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {isSelectedCard
                          ? 'Выберите пару в правом столбце →'
                          : 'Нажмите, чтобы выбрать пару'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Numbered Items (1–9) */}
          <div className={`${isTask22Mode ? 'md:col-span-5' : 'md:col-span-7'} space-y-2.5`}>
            <div className="text-xs font-medium text-slate-400 px-1">
              {rightTitle}
            </div>
            <div className="space-y-2">
              {question.rightItems.map((item) => {
                const pairedLeftIdx = question.leftItems.findIndex(
                  (l) => selectedMapping[l.key] === item.number
                );
                const pairedLeftItem =
                  pairedLeftIdx >= 0 ? question.leftItems[pairedLeftIdx] : undefined;
                const pairColor =
                  pairedLeftIdx >= 0
                    ? PAIR_STYLES[pairedLeftIdx % PAIR_STYLES.length]
                    : null;
                const isSelectedRight = activeRightNum === item.number;
                const isExpected = Object.values(question.correctMapping).includes(
                  item.number
                );

                let sentClass =
                  'bg-[#080B14]/70 border-slate-800/80 text-slate-200 hover:border-slate-700';

                if (submitted) {
                  if (isExpected) {
                    sentClass =
                      'bg-emerald-500/10 border-emerald-500/40 text-emerald-100';
                  } else if (pairedLeftItem) {
                    sentClass = 'bg-rose-500/10 border-rose-500/40 text-rose-200';
                  } else {
                    sentClass = 'bg-[#080B14]/40 border-slate-800/50 text-slate-500';
                  }
                } else if (isSelectedRight) {
                  sentClass =
                    'bg-violet-500/20 border-violet-400 text-white ring-2 ring-violet-400/40';
                } else if (pairColor) {
                  sentClass = `${pairColor.card} text-white`;
                }

                return (
                  <div
                    key={item.number}
                    role="button"
                    tabIndex={submitted ? -1 : 0}
                    onClick={() => handleRightCardClick(item.number)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRightCardClick(item.number);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed flex items-start justify-between gap-3 transition-all ${
                      submitted ? 'cursor-default' : 'cursor-pointer'
                    } ${sentClass}`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full border text-xs font-mono-num font-semibold flex items-center justify-center shrink-0 mt-0.5 ${
                          pairColor
                            ? pairColor.badge
                            : isSelectedRight
                            ? 'bg-violet-500/30 border-violet-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {item.number}
                      </span>
                      <span>{item.text}</span>
                    </div>

                    {pairedLeftItem && pairColor && (
                      <span
                        className={`px-2 py-0.5 rounded-md border font-mono-num text-xs font-bold shrink-0 mt-0.5 ${pairColor.badge}`}
                      >
                        ← {pairedLeftItem.key}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Pre-Submit Navigation & Submit Row */}
        {!submitted && (
          <div className="hidden lg:flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              {onPrev && (
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={onPrev}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs sm:text-sm font-medium text-slate-300 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Назад</span>
                </button>
              )}
              {!isLastQuestion && (
                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Вперёд</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={!allSelected}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span>Проверить</span>
            </button>
          </div>
        )}
      </div>

      {/* Full-Width Horizontal Feedback Banner (once submitted) */}
      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 sm:p-6 rounded-2xl backdrop-blur-md border space-y-4 ${
            isCorrect
              ? 'bg-[#0B1917]/90 border-emerald-500/40'
              : 'bg-[#1C0E14]/90 border-rose-500/40'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Status, Mentor Bubble, Correct Highlight & Explanation */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Верно!</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/40 text-xs font-semibold text-rose-300">
                    <XCircle className="w-4 h-4" />
                    <span>Ошибка · {isReviewMode ? '-20 XP' : '-15 XP'}</span>
                  </span>
                )}

                {!isCorrect && (
                  <span className="text-xs sm:text-sm text-slate-300">
                    Правильный ответ:{' '}
                    <strong className="font-mono-num text-emerald-300">
                      {correctHighlight}
                    </strong>
                  </span>
                )}
              </div>

              {activeMentor && mentorQuote && (
                <div
                  className={`p-3.5 rounded-xl bg-[#080B14]/85 border ${activeMentor.accentBorder} flex items-start gap-3.5`}
                >
                  <MentorAvatar
                    mentor={activeMentor}
                    size="md"
                    ringTone={isCorrect ? 'amber' : 'violet'}
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

              <div className="space-y-1">
                <h4 className="font-display text-sm sm:text-base font-semibold text-white">
                  {question.ruleTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {question.ruleExplanation}
                </p>
              </div>
            </div>

            {/* Right: Desktop Action Buttons alongside explanation */}
            <div className="hidden lg:flex flex-col gap-2.5 shrink-0 min-w-[230px]">
              {isReviewMode && isCorrect && onMarkLearned && (
                <button
                  type="button"
                  disabled={learnedClicked}
                  onClick={() => {
                    setLearnedClicked(true);
                    onMarkLearned(question.id);
                  }}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    learnedClicked
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/30'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>
                    {learnedClicked
                      ? 'Удалено (+10 XP)'
                      : 'Выучил (убрать) · +10 XP'}
                  </span>
                </button>
              )}

              <div className="flex items-center gap-2">
                {onPrev && (
                  <button
                    type="button"
                    disabled={!canGoPrev}
                    onClick={onPrev}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#080B14]/85 border border-slate-700 hover:border-violet-500/50 text-slate-200 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onNext}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>{isLastQuestion ? 'Завершить' : 'Вперёд'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Action Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#080B14]/95 backdrop-blur-md border-t border-slate-800 px-4 py-3">
        {!submitted ? (
          <div className="flex items-center gap-2">
            {onPrev && (
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={onPrev}
                aria-label="Назад"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-medium whitespace-nowrap cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
            )}

            <button
              type="button"
              disabled={!allSelected}
              onClick={handleSubmit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Проверить</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            {onPrev && (
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={onPrev}
                aria-label="Назад"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-medium whitespace-nowrap cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
            )}

            {isReviewMode && isCorrect && onMarkLearned && (
              <button
                type="button"
                disabled={learnedClicked}
                onClick={() => {
                  setLearnedClicked(true);
                  onMarkLearned(question.id);
                }}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  learnedClicked
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{learnedClicked ? '+10 XP' : 'Выучил (+10 XP)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap cursor-pointer"
            >
              <span>{isLastQuestion ? 'Завершить' : 'Вперёд'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
