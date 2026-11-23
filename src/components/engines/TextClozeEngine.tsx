import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  Eraser,
  Lightbulb,
  MessageSquareQuote,
  Send,
  XCircle,
} from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import { ClozeSlot, parseTextClozeMarkup } from '../../data/textClozeData';
import { SavedQuestionState, TextClozeQuestion } from '../../types/platform';
import { MentorAvatar } from '../MentorAvatar';

interface TextClozeEngineProps {
  question: TextClozeQuestion;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<{ values: string[]; digitsInput: string }>;
  draftState?: { values: string[]; digitsInput: string };
  onDraftChange?: (draft: { values: string[]; digitsInput: string }) => void;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: { values: string[]; digitsInput: string },
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

function normalizePunct(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '—' || trimmed === '–') return '-';
  return trimmed;
}

function isSlotCorrect(slot: ClozeSlot, rawValue: string): boolean {
  if (slot.kind === 'letter') {
    return rawValue.trim().toLowerCase() === slot.expected.toLowerCase();
  }
  if (slot.kind === 'punct') {
    return normalizePunct(rawValue) === normalizePunct(slot.expected);
  }
  return rawValue === slot.expected;
}

function formatExpectedBadge(slot: ClozeSlot): string {
  if (slot.expected === '') return '∅';
  if (slot.kind === 'punct' && slot.expected === '-') return '—';
  return slot.expected;
}

function normalizeDigitCode(raw: string): string {
  return raw.replace(/\D/g, '').split('').sort().join('');
}

export const TextClozeEngine: React.FC<TextClozeEngineProps> = ({
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
  const parsed = useMemo(
    () => parseTextClozeMarkup(question.markupText),
    [question.markupText]
  );
  const { paragraphs, slots } = parsed;
  const hasDigitAnswerMode = Boolean(question.expectedDigits?.trim());

  const initialValues = (): string[] => {
    const fromSaved = savedState?.userState?.values;
    if (fromSaved && fromSaved.length === slots.length) return fromSaved;
    const fromDraft = draftState?.values;
    if (fromDraft && fromDraft.length === slots.length) return fromDraft;
    return Array(slots.length).fill('');
  };

  const initialDigitsInput = (): string => {
    if (savedState?.userState?.digitsInput !== undefined) return savedState.userState.digitsInput;
    if (draftState?.digitsInput !== undefined) return draftState.digitsInput;
    return '';
  };

  const [values, setValues] = useState<string[]>(initialValues);
  const [digitsInput, setDigitsInput] = useState(initialDigitsInput);
  const [focusedSlot, setFocusedSlot] = useState<number>(0);
  const [openChoiceIdx, setOpenChoiceIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(() => Boolean(savedState));
  const [isCorrect, setIsCorrect] = useState(() => Boolean(savedState?.isCorrect));
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [learnedClicked, setLearnedClicked] = useState(false);
  const [mentorQuote, setMentorQuote] = useState<string | null>(
    () => savedState?.mentorQuote ?? null
  );

  const slotRefs = useRef<Array<HTMLElement | null>>([]);
  const digitInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const restoredValues = (() => {
      const fromSaved = savedState?.userState?.values;
      if (fromSaved && fromSaved.length === slots.length) return fromSaved;
      const fromDraft = draftState?.values;
      if (fromDraft && fromDraft.length === slots.length) return fromDraft;
      return Array(slots.length).fill('');
    })();
    const restoredDigits =
      savedState?.userState?.digitsInput ??
      draftState?.digitsInput ??
      '';

    setValues(restoredValues);
    setDigitsInput(restoredDigits);
    setFocusedSlot(0);
    setOpenChoiceIdx(null);
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
    if (!savedState) {
      setTimeout(() => {
        slotRefs.current[0]?.focus();
      }, 30);
    }
  }, [question.id, slots.length, savedState, draftState]);

  const pushDraft = (nextValues: string[], nextDigits: string) => {
    if (!onDraftChange || submitted) return;
    onDraftChange({ values: nextValues, digitsInput: nextDigits });
  };

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

  useEffect(() => {
    if (openChoiceIdx === null) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenChoiceIdx(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenChoiceIdx(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openChoiceIdx]);

  const focusSlot = (index: number) => {
    if (index < 0 || index >= slots.length) return;
    setFocusedSlot(index);
    slotRefs.current[index]?.focus();
  };

  const setSlotValue = (index: number, nextValue: string, advance = true) => {
    if (submitted) return;
    setValues((prev) => {
      const copy = [...prev];
      copy[index] = nextValue;
      pushDraft(copy, digitsInput);
      return copy;
    });
    if (advance) {
      if (index + 1 < slots.length) {
        setTimeout(() => {
          setOpenChoiceIdx(null);
          focusSlot(index + 1);
        }, 0);
      } else if (hasDigitAnswerMode) {
        setTimeout(() => {
          setOpenChoiceIdx(null);
          digitInputRef.current?.focus();
        }, 0);
      }
    }
  };

  const handleInputKeyDown = (
    slot: ClozeSlot,
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
      handleSubmit();
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusSlot(slot.index - 1);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusSlot(slot.index + 1);
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      setSlotValue(slot.index, '', true);
      return;
    }

    if (e.key === 'Backspace') {
      if (!values[slot.index] && slot.index > 0) {
        e.preventDefault();
        focusSlot(slot.index - 1);
      } else {
        e.preventDefault();
        setSlotValue(slot.index, '', false);
      }
      return;
    }

    if (slot.kind === 'punct') {
      if (
        e.key === ',' ||
        e.key === ':' ||
        e.key === '-' ||
        e.key === '—' ||
        e.key === '–'
      ) {
        e.preventDefault();
        setSlotValue(slot.index, normalizePunct(e.key), true);
      }
    }
  };

  const handleInputChange = (
    slot: ClozeSlot,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (submitted) return;
    const raw = e.target.value;
    if (!raw) {
      setSlotValue(slot.index, '', false);
      return;
    }

    const lastChar = raw.slice(-1);

    if (slot.kind === 'punct') {
      const norm = normalizePunct(lastChar);
      if (norm === ',' || norm === ':' || norm === '-') {
        setSlotValue(slot.index, norm, true);
      }
      return;
    }

    if (/^[а-яёa-z]$/i.test(lastChar)) {
      setSlotValue(slot.index, lastChar.toLowerCase(), true);
    }
  };

  const handleChoiceSelect = (slotIndex: number, option: string) => {
    if (submitted) return;
    setOpenChoiceIdx(null);
    setSlotValue(slotIndex, option, true);
  };

  const digitsOk = !hasDigitAnswerMode || (
    normalizeDigitCode(digitsInput) === normalizeDigitCode(question.expectedDigits ?? '')
  );

  const handleSubmit = () => {
    if (submitted) return;
    setOpenChoiceIdx(null);

    const slotsOk = slots.every((slot) => isSlotCorrect(slot, values[slot.index] ?? ''));
    const allOk = slotsOk && digitsOk;

    let quote: string | null = null;
    if (activeMentor) {
      if (!allOk) {
        quote = pickRandomQuote(activeMentor.mistakeQuotes);
      } else if (comboStreak + 1 >= 2) {
        quote = pickRandomQuote(activeMentor.comboQuotes);
      }
      setMentorQuote(quote);
    }

    setSubmitted(true);
    setIsCorrect(allOk);
    onAnswered(allOk, { values, digitsInput }, quote);
  };

  const wrongCount = submitted
    ? slots.filter((s) => !isSlotCorrect(s, values[s.index] ?? '')).length
    : 0;

  const wrongSlotsSummary = submitted
    ? slots
        .filter((s) => !isSlotCorrect(s, values[s.index] ?? ''))
        .map((s) => `${s.displayNumber ?? s.index + 1}) ${formatExpectedBadge(s)}`)
        .join(' · ')
    : '';

  const correctHighlight = submitted
    ? [
        wrongSlotsSummary,
        hasDigitAnswerMode && !digitsOk ? `Ответ: ${question.expectedDigits}` : '',
      ]
        .filter(Boolean)
        .join(' | ')
    : '';

  const activeSlot = slots[focusedSlot];

  const renderSlot = (slot: ClozeSlot, reactKey?: string) => {
    const val = values[slot.index] ?? '';
    const ok = isSlotCorrect(slot, val);

    if (slot.kind === 'choice') {
      const isOpen = openChoiceIdx === slot.index;
      const hasValue = val.length > 0;

      let pillClass =
        'bg-violet-500/15 border-violet-500/50 text-violet-200 hover:border-violet-400 hover:bg-violet-500/25';

      if (!submitted && hasValue) {
        pillClass =
          'bg-indigo-500/25 border-indigo-400 text-white font-semibold shadow-sm';
      } else if (submitted) {
        pillClass = ok
          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold'
          : 'bg-rose-500/20 border-rose-500 text-rose-200 font-semibold';
      }

      return (
        <span
          key={reactKey ?? `slot-${slot.index}`}
          className="relative inline-flex items-center mx-0.5"
        >
          <button
            ref={(el) => {
              slotRefs.current[slot.index] = el;
            }}
            type="button"
            disabled={submitted}
            onFocus={() => setFocusedSlot(slot.index)}
            onClick={() => {
              if (submitted) return;
              setFocusedSlot(slot.index);
              setOpenChoiceIdx((prev) => (prev === slot.index ? null : slot.index));
            }}
            onKeyDown={(e) => {
              if (submitted) return;
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setOpenChoiceIdx(null);
                focusSlot(slot.index - 1);
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setOpenChoiceIdx(null);
                focusSlot(slot.index + 1);
              }
            }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-sm sm:text-[15px] leading-snug transition-all ${
              submitted ? 'cursor-default' : 'cursor-pointer'
            } ${pillClass}`}
          >
            <span>{hasValue ? val : slot.placeholder}</span>
            {!submitted && (
              <ChevronDown
                className={`w-3 h-3 opacity-75 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {!submitted && isOpen && slot.options && (
            <span
              role="listbox"
              aria-label="Варианты написания"
              className="absolute bottom-full left-0 mb-2 z-30 p-1.5 rounded-xl bg-[#0B0F1D]/95 backdrop-blur-md border border-violet-500/50 shadow-2xl shadow-black/70 flex flex-wrap sm:flex-nowrap items-center gap-1 w-max max-w-[min(88vw,34rem)]"
            >
              {slot.options.map((opt) => {
                const chosen = val === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChoiceSelect(slot.index, opt)}
                    className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      chosen
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-900/90 text-slate-200 hover:bg-violet-500/25 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </span>
          )}

          {submitted && !ok && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-xs font-semibold text-emerald-300 whitespace-nowrap">
              → {slot.expected}
            </span>
          )}
        </span>
      );
    }

    const isPunct = slot.kind === 'punct';
    const isFocused = focusedSlot === slot.index;
    const displayVal = isPunct && val === '-' ? '—' : val;

    let inputClass = isFocused
      ? 'bg-violet-500/20 border-violet-400 text-white ring-2 ring-violet-500/30'
      : isPunct
      ? 'bg-slate-900/90 border-slate-700 text-slate-100 hover:border-violet-500/60'
      : 'bg-slate-900 border-slate-600/90 text-white hover:border-violet-500/60';

    if (submitted) {
      inputClass = ok
        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
        : 'bg-rose-500/20 border-rose-500 text-rose-300';
    }

    return (
      <span
        key={reactKey ?? `slot-${slot.index}`}
        className="inline-flex items-center mx-0.5"
      >
        {slot.displayNumber !== undefined && (
          <span className="text-xs sm:text-sm font-mono-num font-bold text-violet-300 mr-0.5 select-none">
            ({slot.displayNumber})
          </span>
        )}
        <input
          ref={(el) => {
            slotRefs.current[slot.index] = el;
          }}
          type="text"
          inputMode="text"
          maxLength={1}
          disabled={submitted}
          aria-label={
            isPunct
              ? `Знак препинания ${slot.displayNumber ?? slot.index + 1}`
              : `Пропущенная буква ${slot.displayNumber ?? slot.index + 1}`
          }
          value={displayVal}
          placeholder={isPunct ? '·' : '_'}
          onFocus={() => {
            setFocusedSlot(slot.index);
            setOpenChoiceIdx(null);
          }}
          onKeyDown={(e) => handleInputKeyDown(slot, e)}
          onChange={(e) => handleInputChange(slot, e)}
          className={`${
            isPunct ? 'w-7 h-7' : 'w-6 h-7'
          } rounded-md border text-center font-mono-num text-sm sm:text-base font-bold placeholder:text-slate-600 focus:outline-none transition-all ${inputClass}`}
        />

        {submitted && !ok && (
          <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono-num font-bold text-emerald-300 whitespace-nowrap">
            → {formatExpectedBadge(slot)}
          </span>
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto w-full space-y-4">
      <div className="p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'Комплексный диктант'} · Пропусков:{' '}
              <span className="font-mono-num text-slate-300">{slots.length}</span>
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

        <div className="p-4 sm:p-6 rounded-xl bg-[#080B14]/85 border border-slate-800/90 space-y-4 text-base sm:text-lg text-slate-100">
          {paragraphs.map((paraItems, pIdx) => (
            <div
              key={`para-${pIdx}`}
              className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-3.5"
            >
              {paraItems.map((item, iIdx) => {
                if (item.type === 'space') {
                  return null;
                }

                if (item.type === 'punct') {
                  return renderSlot(item.slot, `p-slot-${iIdx}-${item.slot.index}`);
                }

                return (
                  <span
                    key={`w-${iIdx}`}
                    className="inline-flex items-center whitespace-nowrap"
                  >
                    {item.segments.map((seg, sIdx) =>
                      seg.type === 'text' ? (
                        <span key={`txt-${sIdx}`}>{seg.text}</span>
                      ) : (
                        renderSlot(seg.slot, `w-slot-${sIdx}-${seg.slot.index}`)
                      )
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        {hasDigitAnswerMode && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#080B14]/75 border border-slate-800/85 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label
                htmlFor={`digits-input-${question.id}`}
                className="text-sm font-semibold text-white block"
              >
                Ответ (цифры):
              </label>
              <p className="text-xs text-slate-400">
                Выпишите подходящие номера пропусков без пробелов (порядок цифр не важен)
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                id={`digits-input-${question.id}`}
                ref={digitInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={submitted}
                value={digitsInput}
                onChange={(e) => {
                  if (submitted) return;
                  const v = e.target.value.replace(/\D/g, '');
                  setDigitsInput(v);
                  pushDraft(values, v);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (submitted) onNext();
                    else handleSubmit();
                  }
                }}
                placeholder="Например: 1479"
                className={`w-40 sm:w-44 px-3 py-2 rounded-lg border font-mono-num text-base font-bold tracking-widest text-center placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-normal focus:outline-none transition-all ${
                  submitted
                    ? digitsOk
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30'
                }`}
              />

              {submitted && !digitsOk && (
                <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-xs sm:text-sm font-mono-num font-bold text-emerald-300 whitespace-nowrap">
                  → {question.expectedDigits}
                </span>
              )}
            </div>
          </div>
        )}

        {!submitted ? (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {hasDigitAnswerMode ? (
                <span className="text-xs text-slate-400">
                  Впишите пропущенные буквы в слоты (1)–({slots.length}) и укажите цифры ответа ниже
                </span>
              ) : activeSlot?.kind === 'punct' ? (
                <>
                  <span className="text-xs text-slate-400 mr-1">Знак:</span>
                  {[
                    { val: ',', label: ',' },
                    { val: ':', label: ':' },
                    { val: '-', label: '—' },
                  ].map((b) => (
                    <button
                      key={b.val}
                      type="button"
                      onClick={() => setSlotValue(activeSlot.index, b.val, true)}
                      className="px-2.5 py-1 rounded-lg bg-[#080B14]/80 border border-slate-700 hover:border-violet-500/60 text-xs font-mono-num font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                    >
                      {b.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSlotValue(activeSlot.index, '', true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-slate-600 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Без знака</span>
                  </button>
                </>
              ) : activeSlot?.kind === 'letter' ? (
                <button
                  type="button"
                  onClick={() => setSlotValue(activeSlot.index, '', true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Без буквы (пропуск)</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400">
                  Нажмите на выделенное слово, чтобы выбрать написание
                </span>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-2 ml-auto">
              {onPrev && (
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={onPrev}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs sm:text-sm font-medium text-slate-300 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Назад</span>
                </button>
              )}
              {!isLastQuestion && (
                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Вперёд</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>Проверить</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs pt-1">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-medium">
                  Безупречно! Все {slots.length} позиций{hasDigitAnswerMode ? ' и цифровой ответ' : ''} выполнены верно.
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-rose-300 font-medium">
                  {wrongCount > 0 && (
                    <>
                      Ошибок в пропусках: <span className="font-mono-num">{wrongCount}</span>.{' '}
                    </>
                  )}
                  {hasDigitAnswerMode && !digitsOk && (
                    <>
                      Цифровой ответ неверен (верно: <span className="font-mono-num text-emerald-300">{question.expectedDigits}</span>).{' '}
                    </>
                  )}
                  {wrongCount > 0 && 'Верные буквы показаны зелёным рядом со слотами.'}
                </span>
              </>
            )}
          </div>
        )}
      </div>

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

                {!isCorrect && correctHighlight && (
                  <span className="text-xs sm:text-sm text-slate-300">
                    Ошибки в позициях:{' '}
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
              onClick={handleSubmit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap cursor-pointer"
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
