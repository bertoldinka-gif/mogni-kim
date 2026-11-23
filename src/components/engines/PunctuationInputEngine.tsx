import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eraser,
  Highlighter,
  Keyboard,
  Lightbulb,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import {
  PunctuationInputQuestion,
  SavedQuestionState,
} from '../../types/platform';
import { TrainerSidePanel } from './TrainerSidePanel';

type MarkerTool =
  | 'none'
  | 'subject'
  | 'predicate'
  | 'clause'
  | 'intro'
  | 'conjunction';

const MARKER_TOOLS: Array<{
  id: MarkerTool;
  label: string;
  shortDesc: string;
  btnActiveClass: string;
  tokenClass: string;
}> = [
  {
    id: 'none',
    label: 'Обычный режим',
    shortDesc: 'Ввод ответа',
    btnActiveClass: 'bg-slate-800 border-slate-500 text-white',
    tokenClass: '',
  },
  {
    id: 'subject',
    label: 'Подлежащее',
    shortDesc: '___',
    btnActiveClass: 'bg-indigo-500/20 border-indigo-400 text-indigo-200',
    tokenClass: 'border-b-2 border-indigo-400 text-indigo-100 pb-[1px]',
  },
  {
    id: 'predicate',
    label: 'Сказуемое',
    shortDesc: '===',
    btnActiveClass: 'bg-emerald-500/20 border-emerald-400 text-emerald-200',
    tokenClass: 'border-b-4 border-double border-emerald-400 text-emerald-100 pb-[1px]',
  },
  {
    id: 'clause',
    label: 'Оборот / Границы',
    shortDesc: '|...|',
    btnActiveClass: 'bg-cyan-500/20 border-cyan-400 text-cyan-200',
    tokenClass: 'bg-cyan-500/20 text-cyan-200 rounded px-1',
  },
  {
    id: 'intro',
    label: 'Вводное / Обращение',
    shortDesc: '(...)',
    btnActiveClass: 'bg-amber-500/20 border-amber-400 text-amber-200',
    tokenClass: 'bg-amber-500/25 text-amber-200 rounded px-1',
  },
  {
    id: 'conjunction',
    label: 'Союз',
    shortDesc: '[и]',
    btnActiveClass: 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200',
    tokenClass: 'bg-fuchsia-500/25 text-fuchsia-200 rounded px-1',
  },
];

const MARKER_STYLE_BY_ID: Record<Exclude<MarkerTool, 'none'>, string> = {
  subject: 'border-b-2 border-indigo-400 text-indigo-100 pb-[1px]',
  predicate: 'border-b-4 border-double border-emerald-400 text-emerald-100 pb-[1px]',
  clause: 'bg-cyan-500/20 text-cyan-200 rounded px-1',
  intro: 'bg-amber-500/25 text-amber-200 rounded px-1',
  conjunction: 'bg-fuchsia-500/25 text-fuchsia-200 rounded px-1',
};

export interface PunctuationSavedState {
  values: string[];
  digitsInput: string;
}

export interface PunctuationDraftState {
  values: string[];
  digitsInput: string;
  wordMarks: Record<string, Exclude<MarkerTool, 'none'>>;
}

interface PunctuationInputEngineProps {
  question: PunctuationInputQuestion;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<PunctuationSavedState>;
  draftState?: PunctuationDraftState;
  onDraftChange?: (draft: PunctuationDraftState) => void;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: PunctuationSavedState,
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

function normalizeMark(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '—' || trimmed === '–') return '-';
  return trimmed;
}

function formatMarkLabel(mark: string): string {
  if (mark === '') return 'без знака';
  if (mark === '-') return '— (тире)';
  if (mark === ',') return ', (запятая)';
  if (mark === ':') return ': (двоеточие)';
  return mark;
}

function normalizeDigitCode(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return Array.from(new Set(digits.split(''))).sort().join('');
}

export const PunctuationInputEngine: React.FC<PunctuationInputEngineProps> = ({
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
  const isDigitMode = question.expectedDigits !== undefined;
  const segments = isDigitMode ? [] : question.sentenceTemplate.split('[_]');
  const slotCount = isDigitMode ? 0 : Math.max(0, segments.length - 1);
  const expectedMarks = question.expectedMarks ?? [];

  const initialValues = (): string[] => {
    if (savedState?.userState?.values) return savedState.userState.values;
    if (draftState?.values) return draftState.values;
    return Array(slotCount).fill('');
  };

  const initialDigitsInput = (): string => {
    if (savedState?.userState?.digitsInput !== undefined) return savedState.userState.digitsInput;
    if (draftState?.digitsInput !== undefined) return draftState.digitsInput;
    return '';
  };

  const initialWordMarks = (): Record<string, Exclude<MarkerTool, 'none'>> => {
    if (draftState?.wordMarks) return draftState.wordMarks;
    return {};
  };

  const [values, setValues] = useState<string[]>(initialValues);
  const [digitsInput, setDigitsInput] = useState<string>(initialDigitsInput);
  const [focusedSlot, setFocusedSlot] = useState<number>(0);
  const [activeTool, setActiveTool] = useState<MarkerTool>('none');
  const [wordMarks, setWordMarks] = useState<Record<string, Exclude<MarkerTool, 'none'>>>(
    initialWordMarks
  );
  const [submitted, setSubmitted] = useState(() => Boolean(savedState));
  const [isCorrect, setIsCorrect] = useState(() => Boolean(savedState?.isCorrect));
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [learnedClicked, setLearnedClicked] = useState(false);
  const [mentorQuote, setMentorQuote] = useState<string | null>(
    () => savedState?.mentorQuote ?? null
  );

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digitsInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const restoredValues =
      savedState?.userState?.values ??
      draftState?.values ??
      Array(slotCount).fill('');
    const restoredDigits =
      savedState?.userState?.digitsInput ??
      draftState?.digitsInput ??
      '';
    const restoredMarks = draftState?.wordMarks ?? {};

    setValues(restoredValues);
    setDigitsInput(restoredDigits);
    setWordMarks(restoredMarks);
    setFocusedSlot(0);
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
    if (!savedState) {
      setTimeout(() => {
        if (isDigitMode) {
          digitsInputRef.current?.focus();
        } else {
          inputRefs.current[0]?.focus();
        }
      }, 30);
    }
  }, [question.id, slotCount, isDigitMode, savedState, draftState]);

  const pushDraft = (
    nextValues: string[],
    nextDigits: string,
    nextMarks: Record<string, Exclude<MarkerTool, 'none'>>
  ) => {
    if (!onDraftChange || submitted) return;
    onDraftChange({
      values: nextValues,
      digitsInput: nextDigits,
      wordMarks: nextMarks,
    });
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

  const toggleWordMark = (tokenKey: string) => {
    if (activeTool === 'none') return;
    setWordMarks((prev) => {
      const next = { ...prev };
      if (next[tokenKey] === activeTool) {
        delete next[tokenKey];
      } else {
        next[tokenKey] = activeTool;
      }
      pushDraft(values, digitsInput, next);
      return next;
    });
  };

  const toggleDigitClick = (digit: string) => {
    if (submitted) return;
    const validNums = Array.from(question.sentenceTemplate.matchAll(/\((\d+)\)/g), (m) => m[1]);
    const raw = digitsInput.replace(/\D/g, '');
    const selected: string[] = [];
    let i = 0;
    while (i < raw.length) {
      if (i + 1 < raw.length && validNums.includes(raw.slice(i, i + 2))) {
        selected.push(raw.slice(i, i + 2));
        i += 2;
      } else {
        if (validNums.includes(raw[i])) selected.push(raw[i]);
        i += 1;
      }
    }
    const next = selected.includes(digit)
      ? selected.filter((d) => d !== digit)
      : [...selected, digit].sort((a, b) => Number(a) - Number(b));
    const nextDigits = Array.from(new Set(next)).join('');
    setDigitsInput(nextDigits);
    pushDraft(values, nextDigits, wordMarks);
  };

  const focusSlot = (index: number) => {
    if (index < 0 || index >= slotCount) return;
    setFocusedSlot(index);
    inputRefs.current[index]?.focus();
  };

  const setSlotValue = (index: number, rawChar: string, advance = true) => {
    if (submitted) return;
    const normalized = normalizeMark(rawChar);
    const allowed = ['', ',', ':', '-'];
    const nextChar = allowed.includes(normalized) ? normalized : '';

    setValues((prev) => {
      const copy = [...prev];
      copy[index] = nextChar;
      pushDraft(copy, digitsInput, wordMarks);
      return copy;
    });

    if (advance && index + 1 < slotCount) {
      setTimeout(() => focusSlot(index + 1), 0);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
      focusSlot(index - 1);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusSlot(index + 1);
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      setSlotValue(index, '', true);
      return;
    }

    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        e.preventDefault();
        focusSlot(index - 1);
      } else {
        e.preventDefault();
        setSlotValue(index, '', false);
      }
      return;
    }

    if (e.key === ',' || e.key === ':' || e.key === '-' || e.key === '—' || e.key === '–') {
      e.preventDefault();
      setSlotValue(index, e.key, true);
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (submitted) return;
    const raw = e.target.value;
    if (!raw) {
      setSlotValue(index, '', false);
      return;
    }
    const lastChar = raw.slice(-1);
    const normalized = normalizeMark(lastChar);
    if (normalized === ',' || normalized === ':' || normalized === '-') {
      setSlotValue(index, normalized, true);
    }
  };

  const handleSubmit = () => {
    if (submitted) return;

    let allCorrect = false;
    if (isDigitMode) {
      const normalizedUser = normalizeDigitCode(digitsInput);
      const normalizedExpected = normalizeDigitCode(question.expectedDigits ?? '');
      if (!normalizedUser && normalizedExpected !== '') return;
      allCorrect = normalizedUser === normalizedExpected;
    } else {
      allCorrect =
        expectedMarks.length === slotCount &&
        expectedMarks.every((exp, i) => normalizeMark(values[i] ?? '') === normalizeMark(exp));
    }

    let quote: string | null = null;
    if (activeMentor) {
      if (!allCorrect) {
        quote = pickRandomQuote(activeMentor.mistakeQuotes);
      } else if (comboStreak + 1 >= 2) {
        quote = pickRandomQuote(activeMentor.comboQuotes);
      }
      setMentorQuote(quote);
    }

    setSubmitted(true);
    setIsCorrect(allCorrect);
    onAnswered(allCorrect, { values, digitsInput }, quote);
  };

  const correctHighlight = isDigitMode
    ? question.expectedDigits || 'Запятые не требуются'
    : expectedMarks
        .map((mark, idx) => `(${idx + 1}) ${formatMarkLabel(normalizeMark(mark))}`)
        .join(' · ');

  const renderMarkableTokens = (text: string, prefix: string) => {
    const tokens = text.split(/(\s+)/);
    return tokens.map((tok, tokIdx) => {
      if (!tok) return null;
      if (/^\s+$/.test(tok)) {
        return <React.Fragment key={`${prefix}-sp-${tokIdx}`}>{tok}</React.Fragment>;
      }
      const tokenKey = `${prefix}-${tokIdx}`;
      const appliedMark = wordMarks[tokenKey];
      const markClass = appliedMark ? MARKER_STYLE_BY_ID[appliedMark] : '';

      if (activeTool === 'none') {
        return (
          <span
            key={tokenKey}
            className={`inline transition-colors ${markClass}`}
          >
            {tok}
          </span>
        );
      }

      return (
        <span
          key={tokenKey}
          role="button"
          tabIndex={0}
          onClick={() => toggleWordMark(tokenKey)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleWordMark(tokenKey);
            }
          }}
          className={`inline cursor-pointer select-none transition-all hover:bg-slate-800/75 rounded-sm ${markClass}`}
        >
          {tok}
        </span>
      );
    });
  };

  const renderDigitSentence = () => {
    const validNums = Array.from(question.sentenceTemplate.matchAll(/\((\d+)\)/g), (m) => m[1]);
    const parseSet = (str: string) => {
      const clean = str.replace(/\D/g, '');
      const res = new Set<string>();
      let i = 0;
      while (i < clean.length) {
        if (i + 1 < clean.length && validNums.includes(clean.slice(i, i + 2))) {
          res.add(clean.slice(i, i + 2));
          i += 2;
        } else {
          res.add(clean[i]);
          i += 1;
        }
      }
      return res;
    };
    const expectedSet = parseSet(question.expectedDigits ?? '');
    const userSet = parseSet(digitsInput);
    const parts = question.sentenceTemplate.split(/(\(\d+\))/g);

    return parts.map((part, pIdx) => {
      const match = part.match(/^\((\d+)\)$/);
      if (match) {
        const digit = match[1];
        const expectedComma = expectedSet.has(digit);
        const userSelected = userSet.has(digit);

        let badgeClass =
          'bg-violet-500/20 border-violet-400/50 text-violet-200 hover:bg-violet-500/35 hover:border-violet-300';
        let label = part;

        if (submitted) {
          if (expectedComma && userSelected) {
            badgeClass = 'bg-emerald-500/25 border-emerald-400 text-emerald-200';
            label = `(${digit},)`;
          } else if (!expectedComma && !userSelected) {
            badgeClass = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300';
            label = part;
          } else if (expectedComma && !userSelected) {
            badgeClass = 'bg-rose-500/25 border-rose-400 text-rose-200';
            label = `(${digit} + ,)`;
          } else {
            badgeClass = 'bg-rose-500/25 border-rose-400 text-rose-200 line-through';
            label = part;
          }
        } else if (userSelected) {
          badgeClass =
            'bg-indigo-500/35 border-indigo-300 text-white shadow-sm shadow-indigo-500/30 ring-1 ring-indigo-400/50';
          label = `(${digit},)`;
        }

        if (!submitted) {
          return (
            <button
              key={`num-${pIdx}`}
              type="button"
              onClick={() => toggleDigitClick(digit)}
              aria-pressed={userSelected}
              className={`inline-flex items-center mx-0.5 px-1.5 py-0.5 rounded-md border font-mono-num text-xs sm:text-sm font-bold align-baseline transition-all cursor-pointer select-none active:scale-95 ${badgeClass}`}
            >
              {label}
            </button>
          );
        }

        return (
          <span
            key={`num-${pIdx}`}
            className={`inline-flex items-center mx-0.5 px-1.5 py-0.5 rounded-md border font-mono-num text-xs sm:text-sm font-bold align-baseline transition-colors ${badgeClass}`}
          >
            {label}
          </span>
        );
      }

      return <React.Fragment key={`seg-${pIdx}`}>{renderMarkableTokens(part, `d-${pIdx}`)}</React.Fragment>;
    });
  };

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start max-w-6xl mx-auto">
      {/* Left Column: Interactive Sentence */}
      <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'Пунктуация'} ·{' '}
              {isDigitMode ? 'Укажите цифры ответа (формат ФИПИ)' : 'Введите знаки с клавиатуры'}
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

        {/* Interactive "Маркер / Черновик" Scratchpad Toolbar */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#080B14]/75 border border-slate-800/85 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Highlighter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Маркер / Черновик (не влияет на оценку):</span>
            </span>

            {Object.keys(wordMarks).length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setWordMarks({});
                  pushDraft(values, digitsInput, {});
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 hover:border-rose-500/50 text-[11px] text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сбросить пометки</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {MARKER_TOOLS.map((tool) => {
              const isSelected = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTool(tool.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? tool.btnActiveClass
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{tool.label}</span>
                  {tool.id !== 'none' && (
                    <span className="font-mono-num text-[10px] opacity-80">
                      {tool.shortDesc}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Sentence Workspace */}
        <div className="p-4 sm:p-6 rounded-xl bg-[#080B14]/85 border border-slate-800/90 leading-loose text-base sm:text-lg text-slate-100">
          {isDigitMode
            ? renderDigitSentence()
            : segments.map((seg, idx) => {
                const hasSlot = idx < slotCount;
                const userVal = normalizeMark(values[idx] ?? '');
                const expectedVal = normalizeMark(expectedMarks[idx] ?? '');
                const slotOk = userVal === expectedVal;

                let slotClass =
                  focusedSlot === idx
                    ? 'bg-violet-500/20 border-violet-400 text-white ring-2 ring-violet-500/30'
                    : 'bg-slate-900 border-slate-700 text-slate-100 hover:border-violet-500/60';

                if (submitted) {
                  slotClass = slotOk
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500 text-rose-300';
                }

                return (
                  <React.Fragment key={idx}>
                    <span>{renderMarkableTokens(seg, `${idx}`)}</span>
                    {hasSlot && (
                      <span className="inline-flex items-center align-baseline mx-1 gap-1">
                        <span className="relative inline-flex items-center">
                          <input
                            ref={(el) => {
                              inputRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode="text"
                            maxLength={1}
                            disabled={submitted}
                            aria-label={`Позиция ${idx + 1}`}
                            value={userVal === '-' ? '—' : userVal}
                            placeholder="_"
                            onFocus={() => setFocusedSlot(idx)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            onChange={(e) => handleChange(idx, e)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-center font-mono-num text-base font-bold placeholder:text-slate-600 focus:outline-none transition-all ${slotClass}`}
                          />
                          <span className="ml-0.5 text-[10px] font-mono-num text-slate-500 select-none">
                            {idx + 1}
                          </span>
                        </span>

                        {submitted && !slotOk && (
                          <span
                            title={`Ожидалось: ${formatMarkLabel(expectedVal)}`}
                            className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono-num font-bold text-emerald-300"
                          >
                            → {expectedVal === '' ? '∅' : expectedVal === '-' ? '—' : expectedVal}
                          </span>
                        )}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
        </div>

        {/* Bottom Controls */}
        {isDigitMode ? (
          <div className="space-y-2.5 pt-1">
            <label
              htmlFor={`punct-digits-${question.id}`}
              className="block text-sm font-semibold text-slate-200"
            >
              Ответ (цифры, на месте которых должны стоять запятые):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Keyboard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id={`punct-digits-${question.id}`}
                  ref={digitsInputRef}
                  type="text"
                  inputMode="numeric"
                  disabled={submitted}
                  value={digitsInput}
                  onChange={(e) => {
                    if (submitted) return;
                    const v = e.target.value;
                    setDigitsInput(v);
                    pushDraft(values, v, wordMarks);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (submitted) onNext();
                      else handleSubmit();
                    }
                  }}
                  placeholder="Например: 124 (порядок и пробелы не важны)"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-base sm:text-lg font-mono-num font-bold tracking-widest placeholder:text-slate-600 placeholder:text-xs sm:placeholder:text-sm placeholder:font-sans placeholder:tracking-normal placeholder:font-normal focus:outline-none transition-all ${
                    submitted
                      ? isCorrect
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200'
                        : 'bg-rose-500/15 border-rose-500 text-rose-200'
                      : 'bg-[#080B14]/90 border-slate-700 text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30'
                  }`}
                />
              </div>

              {!submitted && (
                <button
                  type="button"
                  disabled={!digitsInput.replace(/\D/g, '')}
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Проверить</span>
                </button>
              )}
            </div>

            {submitted && (
              <div className="flex items-center gap-2 text-xs pt-0.5">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300 font-medium">
                      Верно! Все запятые определены точно.
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-rose-300 font-medium">
                      Верные цифры:{' '}
                      <strong className="font-mono-num text-emerald-300">
                        {question.expectedDigits || '—'}
                      </strong>{' '}
                      (проверьте подсвеченные позиции в предложении).
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        ) : !submitted ? (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1">
                Слот №{focusedSlot + 1}:
              </span>
              {[
                { val: ',', label: ', Запятая' },
                { val: ':', label: ': Двоеточие' },
                { val: '-', label: '— Тире' },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => setSlotValue(focusedSlot, btn.val, true)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#080B14]/80 border border-slate-700 hover:border-violet-500/60 text-xs font-mono-num font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  {btn.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSlotValue(focusedSlot, '', true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-slate-600 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Пропуск</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer whitespace-nowrap ml-auto"
            >
              <Send className="w-4 h-4" />
              <span>Проверить</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-medium">
                  Все знаки препинания расставлены верно.
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-rose-300 font-medium">
                  Проверьте выделенные красным позиции — справа от них указан верный знак (∅ — знак не нужен).
                </span>
              </>
            )}
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
        correctAnswerHighlight={correctHighlight}
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
