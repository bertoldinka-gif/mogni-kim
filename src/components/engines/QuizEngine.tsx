import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Highlighter,
  Lightbulb,
  MessageSquareQuote,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import { QuizQuestion, SavedQuestionState } from '../../types/platform';
import { MentorAvatar } from '../MentorAvatar';
import { TrainerSidePanel } from './TrainerSidePanel';

function stripLeadingOptionNumber(text: string): string {
  return text.replace(/^\s*\d+[\)\.]\s*/, '');
}

function renderOptionWithTargetHighlights(text: string): React.ReactNode {
  const cleaned = stripLeadingOptionNumber(text);
  const parts = cleaned.split(/(\([а-яёА-ЯЁ/]+\)[а-яёА-ЯЁ]*)/g);
  if (parts.length === 1) return cleaned;
  return parts.map((part, idx) => {
    if (part.startsWith('(') && part.includes(')')) {
      return (
        <span
          key={idx}
          className="inline-block mx-0.5 px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/45 text-violet-200 font-semibold"
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

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
}> = [
  {
    id: 'none',
    label: 'Обычный режим',
    shortDesc: 'Выбор ответа',
    btnActiveClass: 'bg-slate-800 border-slate-500 text-white',
  },
  {
    id: 'subject',
    label: 'Подлежащее',
    shortDesc: '___',
    btnActiveClass: 'bg-indigo-500/20 border-indigo-400 text-indigo-200',
  },
  {
    id: 'predicate',
    label: 'Сказуемое',
    shortDesc: '===',
    btnActiveClass: 'bg-emerald-500/20 border-emerald-400 text-emerald-200',
  },
  {
    id: 'clause',
    label: 'Оборот / Границы',
    shortDesc: '|...|',
    btnActiveClass: 'bg-cyan-500/20 border-cyan-400 text-cyan-200',
  },
  {
    id: 'intro',
    label: 'Вводное / Обращение',
    shortDesc: '(...)',
    btnActiveClass: 'bg-amber-500/20 border-amber-400 text-amber-200',
  },
  {
    id: 'conjunction',
    label: 'Союз',
    shortDesc: '[и]',
    btnActiveClass: 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200',
  },
];

const MARKER_STYLE_BY_ID: Record<Exclude<MarkerTool, 'none'>, string> = {
  subject: 'border-b-2 border-indigo-400 text-indigo-100 pb-[1px]',
  predicate: 'border-b-4 border-double border-emerald-400 text-emerald-100 pb-[1px]',
  clause: 'bg-cyan-500/20 text-cyan-200 rounded px-1',
  intro: 'bg-amber-500/25 text-amber-200 rounded px-1',
  conjunction: 'bg-fuchsia-500/25 text-fuchsia-200 rounded px-1',
};

interface QuizEngineProps {
  question: QuizQuestion;
  sessionId?: string;
  sessionTitle?: string;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<{ selectedIndices: number[] }>;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: { selectedIndices: number[] },
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  question,
  sessionId = '',
  sessionTitle = '',
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
  const isMultiple = question.type === 'multiple_choice';
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    () => savedState?.userState?.selectedIndices ?? []
  );
  const [submitted, setSubmitted] = useState(() => Boolean(savedState));
  const [isCorrect, setIsCorrect] = useState(() => Boolean(savedState?.isCorrect));
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [learnedClicked, setLearnedClicked] = useState(false);
  const [mentorQuote, setMentorQuote] = useState<string | null>(
    () => savedState?.mentorQuote ?? null
  );
  const [activeTool, setActiveTool] = useState<MarkerTool>('none');
  const [wordMarks, setWordMarks] = useState<Record<string, Exclude<MarkerTool, 'none'>>>({});

  useEffect(() => {
    setSelectedIndices(savedState?.userState?.selectedIndices ?? []);
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
    setActiveTool('none');
    setWordMarks({});
  }, [question.id, savedState]);

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

  const hintLabel = showHint
    ? 'Скрыть подсказку'
    : hintUnlocked
    ? 'Подсказка'
    : 'Подсказка (-5 XP)';

  const toggleWordMark = (key: string) => {
    if (activeTool === 'none') return;
    setWordMarks((prev) => {
      const next = { ...prev };
      if (next[key] === activeTool) {
        delete next[key];
      } else {
        next[key] = activeTool;
      }
      return next;
    });
  };

  const renderMarkableText = (text: string, keyPrefix: string, stopCardClick = false) => {
    const segments = text.split(/(\*\*[^*]+\*\*)/g);
    let globalTokIdx = 0;

    return segments.map((seg, sIdx) => {
      const isTargetBold = seg.startsWith('**') && seg.endsWith('**') && seg.length > 4;
      const content = isTargetBold ? seg.slice(2, -2) : seg;
      const tokens = content.split(/(\s+)/);

      return tokens.map((tok, tIdx) => {
        if (/^\s+$/.test(tok) || !tok) {
          return (
            <React.Fragment key={`${keyPrefix}-sp-${sIdx}-${tIdx}`}>
              {tok}
            </React.Fragment>
          );
        }
        const tokNum = globalTokIdx++;
        const markKey = `${keyPrefix}-${tokNum}`;
        const mark = wordMarks[markKey];
        const markClass = mark ? MARKER_STYLE_BY_ID[mark] : '';
        const targetBadgeClass = isTargetBold
          ? 'inline-block mx-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold px-1.5 py-0.5 rounded-md shadow-sm'
          : '';

        if (activeTool === 'none') {
          if (!markClass && !targetBadgeClass) {
            return (
              <React.Fragment key={markKey}>{tok}</React.Fragment>
            );
          }
          return (
            <span key={markKey} className={markClass || targetBadgeClass}>
              {tok}
            </span>
          );
        }

        return (
          <span
            key={markKey}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              if (stopCardClick) {
                e.stopPropagation();
              }
              toggleWordMark(markKey);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (stopCardClick) {
                  e.stopPropagation();
                }
                toggleWordMark(markKey);
              }
            }}
            className={`inline cursor-pointer rounded px-0.5 transition-colors hover:bg-violet-500/20 ${
              markClass || targetBadgeClass
            }`}
          >
            {tok}
          </span>
        );
      });
    });
  };

  const renderFormattedPassage = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    if (parts.length === 1) return text;
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong
            key={`bold-${idx}`}
            className="inline-block mx-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold px-1.5 py-0.5 rounded-md shadow-sm"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={`txt-${idx}`}>{part}</React.Fragment>;
    });
  };

  const checkAnswer = (indicesToCheck: number[]) => {
    if (submitted) return;
    let correct = false;
    if (Array.isArray(question.correctAnswer)) {
      const expected = [...question.correctAnswer].sort((a, b) => a - b);
      const actual = [...indicesToCheck].sort((a, b) => a - b);
      correct =
        expected.length === actual.length &&
        expected.every((val, i) => val === actual[i]);
    } else {
      correct = indicesToCheck.length === 1 && indicesToCheck[0] === question.correctAnswer;
    }

    let quote: string | null = null;
    if (activeMentor) {
      if (!correct) {
        quote = pickRandomQuote(activeMentor.mistakeQuotes);
      } else if (comboStreak + 1 >= 2) {
        quote = pickRandomQuote(activeMentor.comboQuotes);
      }
      setMentorQuote(quote);
    }

    setSubmitted(true);
    setIsCorrect(correct);
    onAnswered(correct, { selectedIndices: indicesToCheck }, quote);
  };

  const handleOptionClick = (idx: number) => {
    if (submitted) return;
    if (!isMultiple) {
      const next = [idx];
      setSelectedIndices(next);
      checkAnswer(next);
      return;
    }
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]
    );
  };

  const isOptionCorrect = (idx: number): boolean => {
    return Array.isArray(question.correctAnswer)
      ? question.correctAnswer.includes(idx)
      : question.correctAnswer === idx;
  };

  const correctHighlight = Array.isArray(question.correctAnswer)
    ? question.correctAnswer
        .map((idx) => question.options[idx])
        .filter(Boolean)
        .map(stripLeadingOptionNumber)
        .join('; ')
    : stripLeadingOptionNumber(question.options[question.correctAnswer] ?? '');

  const hasOptionQuotes = Boolean(
    question.optionQuotes?.some((q) => q && q.trim().length > 0)
  );

  const useTwoColumns =
    !hasOptionQuotes &&
    question.options.length >= 2 &&
    question.options.every((opt) => stripLeadingOptionNumber(opt).length <= 36);

  // Detect text-based comprehension tasks (Работа с текстом, ОГЭ 10–13, ЕГЭ 23–26, or passage/contextText)
  // while keeping short grammar/lexicon items (e.g., Задание 4 Орфоэпия, Задание 5 Паронимы) in 2-column split-screen.
  const combinedLabel = `${sessionTitle} ${question.topicTag || ''}`.toLowerCase();
  const isTextAnalysisModule =
    sessionId === 'g-text-work' ||
    sessionId === 'oge-10-12' ||
    sessionId === 'ege-2' ||
    sessionId === 'ege-3' ||
    sessionId === 'ege-16' ||
    sessionId === 'ege-21' ||
    sessionId === 'ege-23' ||
    sessionId === 'ege-24' ||
    sessionId === 'ege-25' ||
    sessionId === 'ege-26' ||
    sessionId === 'ege-23-26' ||
    question.kimTaskNumber === 16 ||
    /работа с текстом|анализ текста|задани[ея]\s*(10|11|12|16|21|23|24|25|26)\b/.test(
      combinedLabel
    ) ||
    (combinedLabel.includes('егэ') &&
      /задание\s*(2|3)\b/.test(combinedLabel));

  const isShortGrammarOrLexicon =
    /орфоэп|пароним/.test(combinedLabel) ||
    (combinedLabel.includes('егэ') && /задание\s*(4|5)\b/.test(combinedLabel));

  const passageText =
    question.passage?.trim() ||
    question.contextText?.trim() ||
    '';

  const isFullWidthTextMode =
    isTextAnalysisModule ||
    Boolean(question.passage?.trim()) ||
    (Boolean(question.contextText?.trim()) && !isShortGrammarOrLexicon);

  const showScratchpad =
    hasOptionQuotes ||
    Boolean(question.enableScratchpad) ||
    sessionId === 'ege-16' ||
    sessionId === 'ege-21' ||
    (combinedLabel.includes('егэ') &&
      (question.kimTaskNumber === 16 ||
        question.kimTaskNumber === 21 ||
        /задание\s*(16|21)\b/.test(combinedLabel)));

  const renderScratchpadToolbar = () => {
    if (!showScratchpad) return null;
    const hasMarks = Object.keys(wordMarks).length > 0;
    return (
      <div className="p-2.5 sm:p-3 rounded-xl bg-[#080B14]/75 border border-slate-800/80 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1">
          <Highlighter className="w-3.5 h-3.5 text-violet-400" />
          <span>Маркер / Черновик:</span>
        </span>
        {MARKER_TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveTool(tool.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? tool.btnActiveClass
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{tool.label}</span>
              <span className="font-mono-num text-[10px] opacity-75">{tool.shortDesc}</span>
            </button>
          );
        })}
        {hasMarks && (
          <button
            type="button"
            onClick={() => setWordMarks({})}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сбросить</span>
          </button>
        )}
      </div>
    );
  };

  const renderOptionsGrid = () => (
    <div
      className={
        useTwoColumns
          ? 'grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3'
          : 'grid grid-cols-1 gap-2.5 lg:gap-3'
      }
    >
      {question.options.map((option, idx) => {
        const isSelected = selectedIndices.includes(idx);
        const optionIsRight = isOptionCorrect(idx);
        const quotedSentence = question.optionQuotes?.[idx]?.trim();

        let cardClass =
          'bg-[#080B14]/70 border-slate-800/90 text-slate-200 hover:border-violet-500/50 hover:bg-slate-900/90';

        if (!submitted && isSelected) {
          cardClass =
            'bg-violet-600/20 border-violet-500 text-white shadow-sm shadow-violet-950/40';
        } else if (submitted) {
          if (optionIsRight) {
            cardClass = 'bg-emerald-500/15 border-emerald-500/70 text-emerald-100';
          } else if (isSelected && !optionIsRight) {
            cardClass = 'bg-rose-500/15 border-rose-500/70 text-rose-200';
          } else {
            cardClass = 'bg-[#080B14]/40 border-slate-800/60 text-slate-500';
          }
        }

        if (hasOptionQuotes) {
          return (
            <div
              key={idx}
              role="button"
              tabIndex={submitted ? -1 : 0}
              aria-pressed={isSelected}
              onClick={() => {
                if (!submitted) handleOptionClick(idx);
              }}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget || submitted) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOptionClick(idx);
                }
              }}
              className={`w-full flex flex-col gap-2.5 p-3 sm:p-3.5 rounded-xl border text-left text-sm transition-all duration-150 ${
                submitted ? 'cursor-default' : 'cursor-pointer'
              } ${cardClass}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 shrink-0 flex items-center justify-center text-xs font-mono-num font-semibold border ${
                      isMultiple ? 'rounded-md' : 'rounded-full'
                    } ${
                      submitted && optionIsRight
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : submitted && isSelected && !optionIsRight
                        ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                        : isSelected
                        ? 'border-violet-400 bg-violet-500/20 text-violet-200'
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-medium leading-snug text-sm sm:text-[15px]">
                    {stripLeadingOptionNumber(option)}
                  </span>
                </div>

                {submitted && optionIsRight && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                {submitted && isSelected && !optionIsRight && (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>

              {quotedSentence && (
                <div
                  onClick={(e) => {
                    if (activeTool !== 'none') {
                      e.stopPropagation();
                    }
                  }}
                  className={`rounded-lg bg-[#080B14]/85 border border-slate-800/80 px-3 py-2 text-xs sm:text-sm text-slate-300 leading-relaxed ${
                    activeTool !== 'none' ? 'ring-1 ring-violet-500/30 cursor-text' : ''
                  }`}
                >
                  {renderMarkableText(quotedSentence, `q-${idx}`, true)}
                </div>
              )}
            </div>
          );
        }

        if (showScratchpad && !hasOptionQuotes) {
          const cleaned = stripLeadingOptionNumber(option);
          const useTargetParen =
            activeTool === 'none' &&
            Object.keys(wordMarks).length === 0 &&
            cleaned.includes('(') &&
            !cleaned.includes('**');
          return (
            <div
              key={idx}
              role="button"
              tabIndex={submitted ? -1 : 0}
              aria-pressed={isSelected}
              onClick={() => {
                if (!submitted) handleOptionClick(idx);
              }}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget || submitted) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOptionClick(idx);
                }
              }}
              className={`w-full flex items-center justify-between gap-2.5 lg:gap-3 py-3 px-3.5 lg:px-4 lg:py-3.5 rounded-xl border text-left text-sm sm:text-[15px] transition-all duration-150 ${
                submitted ? 'cursor-default' : 'cursor-pointer'
              } ${cardClass}`}
            >
              <div className="flex items-start gap-2.5 lg:gap-3 min-w-0">
                <span
                  className={`w-6 h-6 mt-0.5 shrink-0 flex items-center justify-center text-xs font-mono-num font-semibold border ${
                    isMultiple ? 'rounded-md' : 'rounded-full'
                  } ${
                    submitted && optionIsRight
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : submitted && isSelected && !optionIsRight
                      ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                      : isSelected
                      ? 'border-violet-400 bg-violet-500/20 text-violet-200'
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </span>
                <span
                  onClick={(e) => {
                    if (activeTool !== 'none') {
                      e.stopPropagation();
                    }
                  }}
                  className={`leading-relaxed ${
                    activeTool !== 'none' ? 'cursor-text' : ''
                  }`}
                >
                  {useTargetParen
                    ? renderOptionWithTargetHighlights(option)
                    : renderMarkableText(cleaned, `opt-${idx}`, true)}
                </span>
              </div>

              {submitted && optionIsRight && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {submitted && isSelected && !optionIsRight && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </div>
          );
        }

        return (
          <button
            key={idx}
            type="button"
            disabled={submitted}
            onClick={() => handleOptionClick(idx)}
            className={`w-full flex items-center justify-between gap-2.5 lg:gap-3 py-2.5 px-3 lg:px-4 lg:py-3 rounded-xl border text-left text-sm transition-all duration-150 ${
              submitted ? 'cursor-default' : 'cursor-pointer'
            } ${cardClass}`}
          >
            <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
              <span
                className={`w-6 h-6 shrink-0 flex items-center justify-center text-xs font-mono-num font-semibold border ${
                  isMultiple ? 'rounded-md' : 'rounded-full'
                } ${
                  submitted && optionIsRight
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : submitted && isSelected && !optionIsRight
                    ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                    : isSelected
                    ? 'border-violet-400 bg-violet-500/20 text-violet-200'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                {idx + 1}
              </span>
              <span className="leading-snug">{renderOptionWithTargetHighlights(option)}</span>
            </div>

            {submitted && optionIsRight && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {submitted && isSelected && !optionIsRight && (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );

  if (isFullWidthTextMode) {
    return (
      <div className="max-w-5xl mx-auto w-full space-y-4">
        {/* Full-Width Single-Column Question Card */}
        <div className="p-4 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
          {/* Header with Top-Right Hint Toggle */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'Работа с текстом'} ·{' '}
              {isMultiple ? 'Несколько вариантов' : 'Один вариант'}
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/80 hover:border-violet-500/50 text-xs font-medium text-violet-300 hover:text-violet-200 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{hintLabel}</span>
              </button>
            )}
          </div>

          {/* Collapsible Hint Inline */}
          {showHint && question.hint && !submitted && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-200 leading-relaxed flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{question.hint}</span>
            </div>
          )}

          {/* Spacious Reading Passage Container (supports bold targets & optional marker scratchpad) */}
          {passageText && (
            <div
              className={`p-4 sm:p-5 rounded-xl bg-[#080B14]/85 border border-slate-800/90 text-sm sm:text-[15px] text-slate-200 leading-relaxed whitespace-pre-line ${
                showScratchpad && activeTool !== 'none'
                  ? 'ring-1 ring-violet-500/30 cursor-text'
                  : ''
              }`}
            >
              {showScratchpad
                ? renderMarkableText(passageText, 'passage', false)
                : renderFormattedPassage(passageText)}
            </div>
          )}

          {/* Question Prompt */}
          <h3 className="w-full [text-wrap:wrap] font-display text-base sm:text-lg font-semibold text-white leading-snug">
            {question.prompt}
          </h3>

          {/* Syntactic Scratchpad Marker Toolbar */}
          {renderScratchpadToolbar()}

          {/* Options Grid */}
          {renderOptionsGrid()}

          {/* Desktop Pre-Submit Navigation & Multiple-choice Submit Row */}
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

              {isMultiple && (
                <button
                  type="button"
                  disabled={selectedIndices.length === 0}
                  onClick={() => checkAnswer(selectedIndices)}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Проверить ответ
                </button>
              )}
            </div>
          )}
        </div>

        {/* Full-Width Horizontal Feedback + Mentor Banner */}
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

                  {!isCorrect && correctHighlight && (
                    <span className="text-xs sm:text-sm text-slate-300">
                      Правильный ответ:{' '}
                      <strong className="text-emerald-300">{correctHighlight}</strong>
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

              {isMultiple ? (
                <button
                  type="button"
                  disabled={selectedIndices.length === 0}
                  onClick={() => checkAnswer(selectedIndices)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>Проверить ответ</span>
                </button>
              ) : (
                !isLastQuestion && (
                  <button
                    type="button"
                    onClick={onNext}
                    className="ml-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium whitespace-nowrap cursor-pointer"
                  >
                    <span>Вперёд</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )
              )}
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
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start max-w-6xl mx-auto">
      {/* Left Column: Unobstructed Question Card */}
      <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-3.5 lg:space-y-5">
        {/* Context text if provided */}
        {question.contextText && (
          <div className="p-3 lg:p-3.5 rounded-xl bg-[#080B14]/80 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {question.contextText}
          </div>
        )}

        {/* Question prompt & type indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'Вопрос'} ·{' '}
              {isMultiple ? 'Несколько вариантов' : 'Один вариант'}
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
                <span>{hintLabel}</span>
              </button>
            )}
          </div>

          <h3 className="w-full [text-wrap:wrap] font-display text-base sm:text-lg font-semibold text-white leading-snug">
            {question.prompt}
          </h3>
        </div>

        {/* Smart 2-Column or 1-Column Options Grid */}
        {renderOptionsGrid()}

        {/* Multiple-choice submit button */}
        {isMultiple && !submitted && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={selectedIndices.length === 0}
              onClick={() => checkAnswer(selectedIndices)}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Проверить ответ
            </button>
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
