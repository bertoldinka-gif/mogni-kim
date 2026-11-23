import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Lightbulb, Send, XCircle } from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import {
  EgeTask14Question,
  EgeTask14SpellingForm,
  EgeTask14Word,
  SavedQuestionState,
} from '../../types/platform';
import { TrainerSidePanel } from './TrainerSidePanel';

interface EgeTask14EngineProps {
  question: EgeTask14Question;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<{
    selectedForms: Record<string, EgeTask14SpellingForm>;
    answerInput: string;
  }>;
  draftState?: {
    selectedForms: Record<string, EgeTask14SpellingForm>;
    answerInput: string;
  };
  onDraftChange?: (draft: {
    selectedForms: Record<string, EgeTask14SpellingForm>;
    answerInput: string;
  }) => void;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: {
      selectedForms: Record<string, EgeTask14SpellingForm>;
      answerInput: string;
    },
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

const FORM_OPTIONS: Array<{
  value: EgeTask14SpellingForm;
  label: string;
}> = [
  { value: 'solid', label: 'слитно' },
  { value: 'separate', label: 'раздельно' },
  { value: 'hyphen', label: 'через дефис' },
];

const FORM_LABEL_BY_ID: Record<EgeTask14SpellingForm, string> = {
  solid: 'слитно',
  separate: 'раздельно',
  hyphen: 'через дефис',
};

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

export const EgeTask14Engine: React.FC<EgeTask14EngineProps> = ({
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
  const initialSelectedForms = (): Record<string, EgeTask14SpellingForm> => {
    if (savedState?.userState?.selectedForms) return savedState.userState.selectedForms;
    if (draftState?.selectedForms) return draftState.selectedForms;
    return {};
  };

  const initialAnswerInput = (): string => {
    if (savedState?.userState?.answerInput !== undefined) return savedState.userState.answerInput;
    if (draftState?.answerInput !== undefined) return draftState.answerInput;
    return '';
  };

  const [selectedForms, setSelectedForms] = useState<
    Record<string, EgeTask14SpellingForm>
  >(initialSelectedForms);
  const [answerInput, setAnswerInput] = useState(initialAnswerInput);
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

  const answerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const restoredForms =
      savedState?.userState?.selectedForms ??
      draftState?.selectedForms ??
      {};
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

    setSelectedForms(restoredForms);
    setAnswerInput(restoredAns);
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setAnswerNumbersOk(restoredNumsOk);
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
  }, [question.id, question.correctRows, savedState, draftState]);

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
    nextForms: Record<string, EgeTask14SpellingForm>,
    nextAnswer: string
  ) => {
    if (!onDraftChange || submitted) return;
    onDraftChange({ selectedForms: nextForms, answerInput: nextAnswer });
  };

  const handleSelectWordForm = (
    rowNumber: number,
    wordIdx: number,
    form: EgeTask14SpellingForm
  ) => {
    if (submitted) return;
    const key = `${rowNumber}-${wordIdx}`;
    setSelectedForms((prev) => {
      const next = { ...prev, [key]: form };
      pushDraft(next, answerInput);
      return next;
    });
  };

  const handleSubmit = () => {
    if (submitted || answerInput.trim().length === 0) return;

    const parsed = parseAnswerRows(answerInput);
    const expectedRowsSorted = [...question.correctRows].sort((a, b) => a - b);
    const numbersOk =
      parsed.isValid &&
      parsed.rows.length === expectedRowsSorted.length &&
      parsed.rows.every((num, idx) => num === expectedRowsSorted[idx]);

    let allWordsOk = true;
    for (const row of question.rows) {
      row.words.forEach((word, wIdx) => {
        const key = `${row.rowNumber}-${wIdx}`;
        if (selectedForms[key] !== word.expectedForm) {
          allWordsOk = false;
        }
      });
    }

    const overallOk = numbersOk && allWordsOk;

    let quote: string | null = null;
    if (activeMentor) {
      if (!overallOk) {
        quote = pickRandomQuote(activeMentor.mistakeQuotes);
      } else if (comboStreak + 1 >= 2) {
        quote = pickRandomQuote(activeMentor.comboQuotes);
      }
      setMentorQuote(quote);
    }

    setAnswerNumbersOk(numbersOk);
    setIsCorrect(overallOk);
    setSubmitted(true);
    onAnswered(overallOk, { selectedForms, answerInput }, quote);
  };

  const renderInlineWord = (
    rowNumber: number,
    wordIdx: number,
    word: EgeTask14Word
  ) => {
    const key = `${rowNumber}-${wordIdx}`;
    const chosen = selectedForms[key];
    const wordOk = chosen === word.expectedForm;

    let boxClass = 'bg-slate-900/95 border-slate-700/90';
    if (submitted) {
      boxClass = wordOk
        ? 'bg-emerald-500/15 border-emerald-500/70'
        : 'bg-rose-500/15 border-rose-500/70';
    } else if (chosen) {
      boxClass = 'bg-indigo-950/50 border-violet-500/60';
    }

    return (
      <span
        key={key}
        className={`inline-flex flex-wrap items-center gap-1.5 mx-1 px-2 py-0.5 rounded-lg border align-baseline transition-colors ${boxClass}`}
      >
        <span className="font-semibold text-white text-xs sm:text-sm tracking-wide">
          {submitted && wordOk ? word.canonicalWord.toUpperCase() : word.cue}
        </span>

        <span
          role="group"
          aria-label={`Выбор написания для ${word.cue}`}
          className="inline-flex items-center rounded-md bg-[#080B14]/90 border border-slate-800 p-0.5 gap-0.5"
        >
          {FORM_OPTIONS.map((opt) => {
            const isSelected = chosen === opt.value;
            const isExpected = word.expectedForm === opt.value;

            let btnClass =
              'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80';
            if (!submitted && isSelected) {
              btnClass = 'bg-violet-600 text-white shadow-sm';
            } else if (submitted) {
              if (isExpected) {
                btnClass = 'bg-emerald-500/30 text-emerald-200 font-semibold';
              } else if (isSelected && !isExpected) {
                btnClass = 'bg-rose-500/30 text-rose-200 line-through';
              } else {
                btnClass = 'text-slate-600';
              }
            }

            return (
              <button
                key={opt.value}
                type="button"
                disabled={submitted}
                onClick={() =>
                  handleSelectWordForm(rowNumber, wordIdx, opt.value)
                }
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                  submitted ? 'cursor-default' : 'cursor-pointer'
                } ${btnClass}`}
              >
                {opt.label}
              </button>
            );
          })}
        </span>

        {submitted && !wordOk && (
          <span className="text-[11px] font-semibold text-emerald-300 whitespace-nowrap">
            → {word.canonicalWord}
          </span>
        )}
      </span>
    );
  };

  const renderRowSentence = (
    rowNumber: number,
    template: string,
    words: EgeTask14Word[]
  ) => {
    const segments = template.split(/(\{[01]\})/g);
    return segments.map((seg, idx) => {
      if (seg === '{0}' && words[0]) {
        return renderInlineWord(rowNumber, 0, words[0]);
      }
      if (seg === '{1}' && words[1]) {
        return renderInlineWord(rowNumber, 1, words[1]);
      }
      return <React.Fragment key={`txt-${rowNumber}-${idx}`}>{seg}</React.Fragment>;
    });
  };

  const expectedAnswerString = [...question.correctRows]
    .sort((a, b) => a - b)
    .join('');

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start max-w-6xl mx-auto">
      {/* Left Column: 5 Rows × 2 Words Inline Spelling Choices */}
      <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'ЕГЭ · Задание 14'} · Формат ФИПИ (5 рядов × 2 слова)
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

        {/* 5 Numbered Rows */}
        <div className="space-y-2.5">
          {question.rows.map((row) => {
            const isMatchingRow = question.correctRows.includes(row.rowNumber);
            return (
              <div
                key={row.rowNumber}
                className={`p-3 sm:p-3.5 rounded-xl border transition-colors ${
                  submitted && isMatchingRow
                    ? 'bg-emerald-950/25 border-emerald-500/45'
                    : 'bg-[#080B14]/85 border-slate-800/90'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="font-mono-num text-sm font-bold text-violet-300 w-5 shrink-0 select-none mt-0.5">
                    {row.rowNumber}.
                  </span>

                  <div className="flex-1 min-w-0 text-sm sm:text-[15px] text-slate-200 leading-relaxed">
                    {renderRowSentence(row.rowNumber, row.sentenceTemplate, row.words)}
                  </div>

                  {submitted && isMatchingRow && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-[11px] font-semibold text-emerald-300 whitespace-nowrap shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>оба {FORM_LABEL_BY_ID[question.targetForm]}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Numeric Answer Row + Submit */}
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor={`ege14-answer-${question.id}`}
              className="text-sm font-semibold text-slate-200 whitespace-nowrap"
            >
              Ответ (номера рядов):
            </label>
            <input
              ref={answerInputRef}
              id={`ege14-answer-${question.id}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              disabled={submitted}
              value={answerInput}
              placeholder="Напр.: 14"
              onChange={(e) => {
                const next = e.target.value;
                setAnswerInput(next);
                pushDraft(selectedForms, next);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (submitted) onNext();
                  else if (answerInput.trim().length > 0) handleSubmit();
                }
              }}
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
                Отметьте тип написания у каждого слова и запишите номера рядов
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
              Номера рядов указаны верно, но в разборе отдельных слов допущены ошибки
              (подсвечены красным).
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
