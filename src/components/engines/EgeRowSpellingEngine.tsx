import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Lightbulb, Send, XCircle } from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import { EgeRowSpellingQuestion, SavedQuestionState } from '../../types/platform';
import { TrainerSidePanel } from './TrainerSidePanel';

interface EgeRowSpellingEngineProps {
  question: EgeRowSpellingQuestion;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<{ letterValues: string[]; answerInput: string }>;
  draftState?: { letterValues: string[]; answerInput: string };
  onDraftChange?: (draft: { letterValues: string[]; answerInput: string }) => void;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: { letterValues: string[]; answerInput: string },
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

const DEFAULT_PROMPT =
  'Укажите варианты ответов, в которых во всех словах одного ряда пропущена одна и та же буква. Запишите номера ответов.';

function normalizeExpectedLetter(raw: string): string {
  const cleaned = raw.trim().toLowerCase();
  if (cleaned === '' || cleaned === '∅' || cleaned === '-') return '-';
  return cleaned;
}

function normalizeUserLetter(raw: string): string {
  const cleaned = raw.trim().toLowerCase();
  if (cleaned === '—' || cleaned === '–' || cleaned === '-') return '-';
  return cleaned;
}

function isWordLetterCorrect(userRaw: string, expectedRaw: string): boolean {
  const expected = normalizeExpectedLetter(expectedRaw);
  const user = normalizeUserLetter(userRaw);
  if (expected === '-') {
    return user === '' || user === '-';
  }
  return user === expected;
}

function parseAnswerRows(raw: string): { isValid: boolean; rows: number[] } {
  const cleaned = raw.replace(/[\s,;]+/g, '');
  if (!cleaned || !/^[1-5]+$/.test(cleaned)) {
    return { isValid: false, rows: [] };
  }
  const digits = cleaned.split('').map(Number);
  const uniqueSorted = Array.from(new Set(digits)).sort((a, b) => a - b);
  return {
    isValid: uniqueSorted.length === digits.length,
    rows: uniqueSorted,
  };
}

export const EgeRowSpellingEngine: React.FC<EgeRowSpellingEngineProps> = ({
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
  const totalSlots = question.rows.reduce((acc, r) => acc + r.words.length, 0);

  const initialLetterValues = (): string[] => {
    if (savedState?.userState?.letterValues) return savedState.userState.letterValues;
    if (draftState?.letterValues) return draftState.letterValues;
    return Array(totalSlots).fill('');
  };

  const initialAnswerInput = (): string => {
    if (savedState?.userState?.answerInput !== undefined) return savedState.userState.answerInput;
    if (draftState?.answerInput !== undefined) return draftState.answerInput;
    return '';
  };

  const [letterValues, setLetterValues] = useState<string[]>(initialLetterValues);
  const [answerInput, setAnswerInput] = useState(initialAnswerInput);
  const [focusedSlot, setFocusedSlot] = useState<number>(0);
  const [submitted, setSubmitted] = useState(() => Boolean(savedState));
  const [isCorrect, setIsCorrect] = useState(() => Boolean(savedState?.isCorrect));
  const [answerNumbersOk, setAnswerNumbersOk] = useState(() => {
    const baseAns = initialAnswerInput();
    if (!baseAns) return false;
    const parsed = parseAnswerRows(baseAns);
    const expectedRowsSorted = [...question.correctRows].sort((a, b) => a - b);
    return (
      parsed.isValid &&
      parsed.rows.length === expectedRowsSorted.length &&
      parsed.rows.every((num, idx) => num === expectedRowsSorted[idx])
    );
  });
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [learnedClicked, setLearnedClicked] = useState(false);
  const [mentorQuote, setMentorQuote] = useState<string | null>(
    () => savedState?.mentorQuote ?? null
  );

  const slotRefs = useRef<Array<HTMLInputElement | null>>([]);
  const answerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const restoredLetters =
      savedState?.userState?.letterValues ??
      draftState?.letterValues ??
      Array(totalSlots).fill('');
    const restoredAns =
      savedState?.userState?.answerInput ??
      draftState?.answerInput ??
      '';
    const parsed = parseAnswerRows(restoredAns);
    const expectedRowsSorted = [...question.correctRows].sort((a, b) => a - b);
    const restoredNumsOk =
      Boolean(savedState) &&
      parsed.isValid &&
      parsed.rows.length === expectedRowsSorted.length &&
      parsed.rows.every((num, idx) => num === expectedRowsSorted[idx]);

    setLetterValues(restoredLetters);
    setAnswerInput(restoredAns);
    setFocusedSlot(0);
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setAnswerNumbersOk(restoredNumsOk);
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
    if (!savedState) {
      const timer = window.setTimeout(() => {
        slotRefs.current[0]?.focus();
      }, 30);
      return () => window.clearTimeout(timer);
    }
  }, [question.id, question.correctRows, totalSlots, savedState, draftState]);

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

  const focusSlot = (index: number) => {
    if (index < 0) return;
    if (index >= totalSlots) {
      setFocusedSlot(-1);
      answerInputRef.current?.focus();
      return;
    }
    setFocusedSlot(index);
    slotRefs.current[index]?.focus();
  };

  const pushDraft = (nextLetters: string[], nextAnswer: string) => {
    if (!onDraftChange || submitted) return;
    onDraftChange({ letterValues: nextLetters, answerInput: nextAnswer });
  };

  const handleSlotChange = (
    slotIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (submitted) return;
    const raw = e.target.value;
    if (!raw) {
      setLetterValues((prev) => {
        const copy = [...prev];
        copy[slotIdx] = '';
        pushDraft(copy, answerInput);
        return copy;
      });
      return;
    }

    const lastChar = raw.slice(-1);
    if (/\s/.test(lastChar)) return;

    const normalized = normalizeUserLetter(lastChar);
    if (!/^[а-яёa-z-]$/.test(normalized)) return;

    setLetterValues((prev) => {
      const copy = [...prev];
      copy[slotIdx] = normalized;
      pushDraft(copy, answerInput);
      return copy;
    });

    window.setTimeout(() => focusSlot(slotIdx + 1), 0);
  };

  const handleSlotKeyDown = (
    slotIdx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (submitted) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (answerInput.trim().length > 0) {
        handleSubmit();
      } else {
        focusSlot(totalSlots);
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusSlot(slotIdx - 1);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusSlot(slotIdx + 1);
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      setLetterValues((prev) => {
        const copy = [...prev];
        copy[slotIdx] = '';
        pushDraft(copy, answerInput);
        return copy;
      });
      focusSlot(slotIdx + 1);
      return;
    }

    if (e.key === 'Backspace') {
      if (!letterValues[slotIdx] && slotIdx > 0) {
        e.preventDefault();
        focusSlot(slotIdx - 1);
      } else {
        e.preventDefault();
        setLetterValues((prev) => {
          const copy = [...prev];
          copy[slotIdx] = '';
          pushDraft(copy, answerInput);
          return copy;
        });
      }
    }
  };

  const handleAnswerInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (submitted) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (answerInput.trim().length > 0) {
        handleSubmit();
      }
      return;
    }

    if (e.key === 'ArrowLeft' && (e.currentTarget.selectionStart ?? 0) === 0) {
      e.preventDefault();
      focusSlot(totalSlots - 1);
    }
  };

  const handleSubmit = () => {
    if (submitted || answerInput.trim().length === 0) return;

    const parsed = parseAnswerRows(answerInput);
    const expectedRowsSorted = [...question.correctRows].sort((a, b) => a - b);
    const numbersCorrect =
      parsed.isValid &&
      parsed.rows.length === expectedRowsSorted.length &&
      parsed.rows.every((num, idx) => num === expectedRowsSorted[idx]);

    let flatIdx = 0;
    let allLettersCorrect = true;
    for (const row of question.rows) {
      for (const word of row.words) {
        const userVal = letterValues[flatIdx] ?? '';
        if (!isWordLetterCorrect(userVal, word.expectedLetter)) {
          allLettersCorrect = false;
        }
        flatIdx++;
      }
    }

    const overallCorrect = numbersCorrect && allLettersCorrect;

    let quote: string | null = null;
    if (activeMentor) {
      if (!overallCorrect) {
        quote = pickRandomQuote(activeMentor.mistakeQuotes);
      } else if (comboStreak + 1 >= 2) {
        quote = pickRandomQuote(activeMentor.comboQuotes);
      }
      setMentorQuote(quote);
    }

    setAnswerNumbersOk(numbersCorrect);
    setIsCorrect(overallCorrect);
    setSubmitted(true);
    onAnswered(overallCorrect, { letterValues, answerInput }, quote);
  };

  const expectedAnswerString = [...question.correctRows]
    .sort((a, b) => a - b)
    .join('');

  let runningSlotIndex = 0;

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start max-w-6xl mx-auto">
      {/* Left Column: 5-Row Interactive FIPI Workspace */}
      <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'ЕГЭ · Орфография'} · Формат ФИПИ (5 рядов × {question.rows[0]?.words.length ?? 3} слова)
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
            {question.prompt || DEFAULT_PROMPT}
          </h3>
        </div>

        {/* 5 Numbered Rows */}
        <div className="space-y-2.5">
          {question.rows.map((row) => {
            const isMatchingRow = question.correctRows.includes(row.rowNumber);
            const rowFirstLetter = normalizeExpectedLetter(
              row.words[0]?.expectedLetter ?? ''
            );

            return (
              <div
                key={row.rowNumber}
                className={`p-3 sm:p-3.5 rounded-xl border transition-colors ${
                  submitted && isMatchingRow
                    ? 'bg-emerald-950/25 border-emerald-500/45'
                    : 'bg-[#080B14]/85 border-slate-800/90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="font-mono-num text-sm font-bold text-violet-300 w-5 shrink-0 select-none">
                      {row.rowNumber}.
                    </span>

                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-2 text-sm sm:text-base text-slate-100">
                      {row.words.map((word, wIdx) => {
                        const currentSlotIdx = runningSlotIndex++;
                        const parts = word.template.split(/\.{2,}|\[_\]/);
                        const before = parts[0] ?? word.template;
                        const after = parts.slice(1).join('..');
                        const hasGap = parts.length >= 2;

                        const userVal = letterValues[currentSlotIdx] ?? '';
                        const expected = normalizeExpectedLetter(
                          word.expectedLetter
                        );
                        const wordOk = isWordLetterCorrect(
                          userVal,
                          word.expectedLetter
                        );

                        let inputStyle =
                          focusedSlot === currentSlotIdx
                            ? 'bg-violet-500/20 border-violet-400 text-white ring-2 ring-violet-500/30'
                            : 'bg-slate-900 border-slate-700 text-slate-100 hover:border-violet-500/60';

                        if (submitted) {
                          inputStyle = wordOk
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-rose-500/20 border-rose-500 text-rose-300';
                        }

                        return (
                          <span
                            key={`${row.rowNumber}-${wIdx}`}
                            className="inline-flex items-baseline whitespace-nowrap"
                          >
                            {hasGap ? (
                              <>
                                <span>{before}</span>
                                <input
                                  ref={(el) => {
                                    slotRefs.current[currentSlotIdx] = el;
                                  }}
                                  type="text"
                                  inputMode="text"
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  disabled={submitted}
                                  aria-label={`Ряд ${row.rowNumber}, слово ${wIdx + 1}`}
                                  value={userVal}
                                  placeholder="_"
                                  onFocus={(e) => {
                                    setFocusedSlot(currentSlotIdx);
                                    e.currentTarget.select();
                                  }}
                                  onChange={(e) =>
                                    handleSlotChange(currentSlotIdx, e)
                                  }
                                  onKeyDown={(e) =>
                                    handleSlotKeyDown(currentSlotIdx, e)
                                  }
                                  className={`w-7 h-7 sm:w-8 sm:h-8 mx-0.5 rounded-md border text-center font-mono-num text-sm sm:text-base font-bold lowercase placeholder:text-slate-600 focus:outline-none transition-all ${inputStyle}`}
                                />
                                <span>{after}</span>
                              </>
                            ) : (
                              <span>{word.template}</span>
                            )}

                            {submitted && !wordOk && (
                              <span
                                title={`Правильная буква: ${
                                  expected === '-' ? 'не требуется' : expected
                                }`}
                                className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-mono-num font-bold text-emerald-300"
                              >
                                → {expected === '-' ? '∅' : expected}
                              </span>
                            )}

                            {wIdx < row.words.length - 1 && (
                              <span className="text-slate-500 ml-0.5">,</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {submitted && isMatchingRow && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-[11px] font-semibold text-emerald-300 whitespace-nowrap shrink-0 self-start sm:self-center">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        везде «{rowFirstLetter === '-' ? '∅' : rowFirstLetter}»
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Answer Row + Submit */}
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor={`row-answer-${question.id}`}
              className="text-sm font-semibold text-slate-200 whitespace-nowrap"
            >
              Ответ:
            </label>
            <input
              ref={answerInputRef}
              id={`row-answer-${question.id}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              disabled={submitted}
              value={answerInput}
              placeholder="Напр.: 12"
              onFocus={() => setFocusedSlot(-1)}
              onChange={(e) => {
                const next = e.target.value;
                setAnswerInput(next);
                pushDraft(letterValues, next);
              }}
              onKeyDown={handleAnswerInputKeyDown}
              className={`w-32 px-3.5 py-2 rounded-lg border font-mono-num text-base font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500 focus:outline-none transition-all ${
                submitted
                  ? answerNumbersOk
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-[#080B14]/90 border-slate-700 text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30'
              }`}
            />

            {!submitted ? (
              <span className="text-xs text-slate-400">
                Номера рядов в любом порядке (или «-», если буква не нужна)
              </span>
            ) : answerNumbersOk ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Номера рядов верны</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-300">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>
                  Верные ряды:{' '}
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
              disabled={answerInput.trim().length === 0}
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Проверить</span>
            </button>
          )}
        </div>

        {submitted && !isCorrect && answerNumbersOk && (
          <div className="flex items-center gap-2 text-xs text-rose-300">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>
              Номера рядов указаны верно, но в отдельных словах допущены ошибки
              (выделены красным).
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
