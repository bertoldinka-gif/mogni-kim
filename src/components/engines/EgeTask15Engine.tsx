import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Lightbulb, Send, XCircle } from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import {
  EgeTask15Question,
  EgeTask15Slot,
  SavedQuestionState,
} from '../../types/platform';
import { TrainerSidePanel } from './TrainerSidePanel';

interface EgeTask15EngineProps {
  question: EgeTask15Question;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<{
    slotValues: Record<number, 'н' | 'нн'>;
    digitsInput: string;
  }>;
  draftState?: {
    slotValues: Record<number, 'н' | 'нн'>;
    digitsInput: string;
  };
  onDraftChange?: (draft: {
    slotValues: Record<number, 'н' | 'нн'>;
    digitsInput: string;
  }) => void;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: {
      slotValues: Record<number, 'н' | 'нн'>;
      digitsInput: string;
    },
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

function parseAnswerDigits(raw: string): { isValid: boolean; digits: number[] } {
  const cleaned = raw.replace(/[\s,;]+/g, '');
  if (!cleaned || !/^[1-9]+$/.test(cleaned)) {
    return { isValid: false, digits: [] };
  }
  const digits = cleaned.split('').map(Number);
  const uniqueSorted = Array.from(new Set(digits)).sort((a, b) => a - b);
  return {
    isValid: uniqueSorted.length === digits.length,
    digits: uniqueSorted,
  };
}

export const EgeTask15Engine: React.FC<EgeTask15EngineProps> = ({
  question,
  isReviewMode = false,
  isLastQuestion = false,
  canGoPrev = false,
  savedState,
  draftState,
  onDraftChange,
  comboStreak = 0,
  activeMentor = null,
  userXp = 999,
  onRequestHint,
  onAnswered,
  onPrev,
  onNext,
  onMarkLearned,
}) => {
  const initialSlotValues = (): Record<number, 'н' | 'нн'> => {
    if (savedState?.userState?.slotValues) return savedState.userState.slotValues;
    if (draftState?.slotValues) return draftState.slotValues;
    return {};
  };

  const initialDigitsInput = (): string => {
    if (savedState?.userState?.digitsInput !== undefined) return savedState.userState.digitsInput;
    if (draftState?.digitsInput !== undefined) return draftState.digitsInput;
    return '';
  };

  const [slotValues, setSlotValues] = useState<Record<number, 'н' | 'нн'>>(
    initialSlotValues
  );
  const [digitsInput, setDigitsInput] = useState(initialDigitsInput);
  const [submitted, setSubmitted] = useState(() => Boolean(savedState));
  const [isCorrect, setIsCorrect] = useState(() => Boolean(savedState?.isCorrect));
  const [digitsOk, setDigitsOk] = useState(() => {
    const baseAns = initialDigitsInput();
    if (!baseAns) return false;
    const parsed = parseAnswerDigits(baseAns);
    const expectedSorted = [...question.correctSlots].sort((a, b) => a - b);
    return (
      parsed.isValid &&
      parsed.digits.length === expectedSorted.length &&
      parsed.digits.every((num, idx) => num === expectedSorted[idx])
    );
  });
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [learnedClicked, setLearnedClicked] = useState(false);
  const [mentorQuote, setMentorQuote] = useState<string | null>(
    () => savedState?.mentorQuote ?? null
  );

  const digitsInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const restoredSlots =
      savedState?.userState?.slotValues ??
      draftState?.slotValues ??
      {};
    const restoredDigits =
      savedState?.userState?.digitsInput ??
      draftState?.digitsInput ??
      '';
    const parsed = parseAnswerDigits(restoredDigits);
    const expectedSorted = [...question.correctSlots].sort((a, b) => a - b);
    const restoredDigitsOk =
      Boolean(savedState) &&
      parsed.isValid &&
      parsed.digits.length === expectedSorted.length &&
      parsed.digits.every((num, idx) => num === expectedSorted[idx]);

    setSlotValues(restoredSlots);
    setDigitsInput(restoredDigits);
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setDigitsOk(restoredDigitsOk);
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
  }, [question.id, question.correctSlots, savedState, draftState]);

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

  const pushDraft = (
    nextSlots: Record<number, 'н' | 'нн'>,
    nextDigits: string
  ) => {
    if (!onDraftChange || submitted) return;
    onDraftChange({ slotValues: nextSlots, digitsInput: nextDigits });
  };

  const handleSelectSlot = (slotNumber: number, val: 'н' | 'нн') => {
    if (submitted) return;
    setSlotValues((prev) => {
      const next = { ...prev, [slotNumber]: val };
      pushDraft(next, digitsInput);
      return next;
    });
  };

  const handleSubmit = () => {
    if (submitted || digitsInput.trim().length === 0) return;

    const parsed = parseAnswerDigits(digitsInput);
    const expectedSorted = [...question.correctSlots].sort((a, b) => a - b);
    const numbersCorrect =
      parsed.isValid &&
      parsed.digits.length === expectedSorted.length &&
      parsed.digits.every((num, idx) => num === expectedSorted[idx]);

    const allSlotsCorrect = question.slots.every(
      (slot) => slotValues[slot.slotNumber] === slot.expected
    );

    const overallCorrect = numbersCorrect && allSlotsCorrect;

    let quote: string | null = null;
    if (activeMentor) {
      if (!overallCorrect) {
        quote = pickRandomQuote(activeMentor.mistakeQuotes);
      } else if (comboStreak + 1 >= 2) {
        quote = pickRandomQuote(activeMentor.comboQuotes);
      }
      setMentorQuote(quote);
    }

    setDigitsOk(numbersCorrect);
    setIsCorrect(overallCorrect);
    setSubmitted(true);
    onAnswered(overallCorrect, { slotValues, digitsInput }, quote);
  };

  const slotMap = new Map<number, EgeTask15Slot>(
    question.slots.map((s) => [s.slotNumber, s])
  );

  const renderSlotToken = (slot: EgeTask15Slot, key: string) => {
    const chosen = slotValues[slot.slotNumber];
    const slotCorrect = chosen === slot.expected;

    let wrapClass = 'bg-slate-900 border-slate-700';
    if (submitted) {
      wrapClass = slotCorrect
        ? 'bg-emerald-500/20 border-emerald-500'
        : 'bg-rose-500/20 border-rose-500';
    } else if (chosen) {
      wrapClass = 'bg-indigo-950/70 border-violet-500/70';
    }

    return (
      <span key={key} className="inline-flex items-center mx-0.5 align-baseline">
        <span className="text-xs sm:text-sm font-mono-num font-bold text-violet-300 mr-0.5 select-none">
          ({slot.slotNumber})
        </span>

        <span
          role="group"
          aria-label={`Позиция ${slot.slotNumber}: выберите Н или НН`}
          className={`inline-flex items-center rounded-md border overflow-hidden transition-colors ${wrapClass}`}
        >
          {(['н', 'нн'] as const).map((opt) => {
            const isSelected = chosen === opt;
            const isExpected = slot.expected === opt;

            let btnClass = 'text-slate-400 hover:text-white hover:bg-slate-800/80';
            if (!submitted && isSelected) {
              btnClass = 'bg-violet-600 text-white font-bold';
            } else if (submitted) {
              if (isExpected) {
                btnClass = 'bg-emerald-500/30 text-emerald-200 font-bold';
              } else if (isSelected && !isExpected) {
                btnClass = 'bg-rose-500/30 text-rose-200 line-through';
              } else {
                btnClass = 'text-slate-600';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={submitted}
                onClick={() => handleSelectSlot(slot.slotNumber, opt)}
                className={`px-1.5 py-0.5 text-xs sm:text-sm font-mono-num transition-colors ${
                  submitted ? 'cursor-default' : 'cursor-pointer'
                } ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </span>

        {submitted && !slotCorrect && (
          <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-mono-num font-bold text-emerald-300">
            → {slot.expected}
          </span>
        )}
      </span>
    );
  };

  const renderSentenceWithSlots = () => {
    const words = question.sentenceTemplate.split(/\s+/);
    return words.map((word, wIdx) => {
      const segments = word.split(/(\{\d+\})/g);
      return (
        <span key={`w-${wIdx}`} className="inline-flex items-baseline whitespace-nowrap">
          {segments.map((seg, sIdx) => {
            const m = seg.match(/^\{(\d+)\}$/);
            if (m) {
              const slotNum = Number(m[1]);
              const slot = slotMap.get(slotNum);
              if (slot) {
                return renderSlotToken(slot, `slot-${wIdx}-${sIdx}-${slotNum}`);
              }
            }
            return <span key={`seg-${wIdx}-${sIdx}`}>{seg}</span>;
          })}
        </span>
      );
    });
  };

  const expectedAnswerString = [...question.correctSlots]
    .sort((a, b) => a - b)
    .join('');

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start max-w-6xl mx-auto">
      {/* Left Column: Single Sentence with Numbered (1)..(6) [н|нн] Slots */}
      <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'ЕГЭ · Задание 15'} · Позиций:{' '}
              <span className="font-mono-num text-slate-300">
                {question.slots.length}
              </span>
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
                className="lg:hidden inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
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
        </div>

        {/* Single Sentence Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#080B14]/85 border border-slate-800/90 flex flex-wrap items-baseline gap-x-2 gap-y-2.5 text-base sm:text-lg text-slate-100 leading-relaxed">
          {renderSentenceWithSlots()}
        </div>

        {/* Final Digit Answer Row + Submit */}
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor={`ege15-digits-${question.id}`}
              className="text-sm font-semibold text-slate-200 whitespace-nowrap"
            >
              Ответ (цифры):
            </label>
            <input
              ref={digitsInputRef}
              id={`ege15-digits-${question.id}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              disabled={submitted}
              value={digitsInput}
              placeholder="Напр.: 124"
              onChange={(e) => {
                const next = e.target.value;
                setDigitsInput(next);
                pushDraft(slotValues, next);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (submitted) onNext();
                  else if (digitsInput.trim().length > 0) handleSubmit();
                }
              }}
              className={`w-36 px-3.5 py-2 rounded-lg border font-mono-num text-base font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500 focus:outline-none transition-all ${
                submitted
                  ? digitsOk
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-[#080B14]/90 border-slate-700 text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30'
              }`}
            />

            {!submitted ? (
              <span className="text-xs text-slate-400">
                Выберите <strong className="text-slate-300">н</strong> /{' '}
                <strong className="text-slate-300">нн</strong> в каждом слоте и запишите цифры
              </span>
            ) : digitsOk ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Цифры верны</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-300">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>
                  Верные цифры:{' '}
                  <strong className="font-mono-num text-emerald-300">
                    {expectedAnswerString}
                  </strong>
                </span>
              </span>
            )}
          </div>

          {!submitted && (
            <button
              type="button"
              disabled={digitsInput.trim().length === 0}
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Проверить</span>
            </button>
          )}
        </div>

        {submitted && !isCorrect && digitsOk && (
          <div className="flex items-center gap-2 text-xs text-rose-300">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>
              Цифры ответа указаны верно, но в отдельных слотах выбрана неверная форма Н/НН.
            </span>
          </div>
        )}
      </div>

      {/* Right Column (Desktop) / Stacked + Fixed Bottom Bar (Mobile) */}
      <TrainerSidePanel
        submitted={submitted}
        isCorrect={isCorrect}
        ruleTitle={question.ruleTitle}
        ruleExplanation={question.ruleExplanation}
        hint={question.hint}
        showHint={showHint}
        hintUnlocked={hintUnlocked}
        canAffordHint={canAffordHint}
        onToggleHint={handleToggleHint}
        correctAnswerHighlight={expectedAnswerString}
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
