import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Highlighter,
  Keyboard,
  Lightbulb,
  MessageSquareQuote,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import { SavedQuestionState, WordInputQuestion } from '../../types/platform';
import { MentorAvatar } from '../MentorAvatar';
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
}> = [
  {
    id: 'none',
    label: 'Обычный режим',
    shortDesc: 'Чтение',
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

export interface WordInputDraftState {
  answer: string;
  wordMarks: Record<string, Exclude<MarkerTool, 'none'>>;
  ruleWordMarks: Record<string, string>;
}

interface WordInputEngineProps {
  question: WordInputQuestion;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<{ answer: string }>;
  draftState?: WordInputDraftState;
  onDraftChange?: (draft: WordInputDraftState) => void;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: { answer: string },
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

function normalizeAnswer(raw: string, stripAllSpaces: boolean): string {
  const base = raw
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[«»"'.,!?;:()]/g, '');
  if (stripAllSpaces) {
    return base.replace(/\s+/g, '');
  }
  return base.replace(/\s+/g, ' ').trim();
}

function normalizeDigitAnswer(raw: string): string {
  const digitsOnly = raw.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return Array.from(new Set(digitsOnly.split(''))).sort().join('');
}

export const WordInputEngine: React.FC<WordInputEngineProps> = ({
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
  const initialAnswer = (): string => {
    if (savedState?.userState?.answer !== undefined) return savedState.userState.answer;
    if (draftState?.answer !== undefined) return draftState.answer;
    return '';
  };

  const [answer, setAnswer] = useState<string>(initialAnswer);
  const [submitted, setSubmitted] = useState(() => Boolean(savedState));
  const [isCorrect, setIsCorrect] = useState(() => Boolean(savedState?.isCorrect));
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [learnedClicked, setLearnedClicked] = useState(false);
  const [mentorQuote, setMentorQuote] = useState<string | null>(
    () => savedState?.mentorQuote ?? null
  );
  const [activeTool, setActiveTool] = useState<MarkerTool>('none');
  const [wordMarks, setWordMarks] = useState<
    Record<string, Exclude<MarkerTool, 'none'>>
  >(() => draftState?.wordMarks ?? {});
  const [activeRuleId, setActiveRuleId] = useState<string>('none');
  const [ruleWordMarks, setRuleWordMarks] = useState<Record<string, string>>(
    () => draftState?.ruleWordMarks ?? {}
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  const isFullWidthTextMode =
    question.submode === 'text_lexicon' || Boolean(question.passage?.trim());

  const showScratchpad = Boolean(question.enableScratchpad);
  const isDigitMode = Boolean(question.digitOrderIndependent);

  const stripSpaces =
    Boolean(question.ignoreSpaces) || question.submode === 'phrase_transform';

  useEffect(() => {
    setAnswer(
      savedState?.userState?.answer ??
        draftState?.answer ??
        ''
    );
    setWordMarks(draftState?.wordMarks ?? {});
    setRuleWordMarks(draftState?.ruleWordMarks ?? {});
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
    setActiveTool('none');
    setActiveRuleId('none');

    if (!savedState) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
    }
  }, [question.id, savedState, draftState]);

  const pushDraft = (
    nextAnswer: string,
    nextMarks: Record<string, Exclude<MarkerTool, 'none'>>,
    nextRuleMarks: Record<string, string>
  ) => {
    if (!onDraftChange || submitted) return;
    onDraftChange({
      answer: nextAnswer,
      wordMarks: nextMarks,
      ruleWordMarks: nextRuleMarks,
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

  const hintLabel = showHint
    ? 'Скрыть подсказку'
    : hintUnlocked
    ? 'Подсказка'
    : 'Подсказка (-5 XP)';

  const handleSubmit = () => {
    if (submitted) return;

    let ok = false;
    if (isDigitMode) {
      const normalizedDigits = normalizeDigitAnswer(answer);
      if (!normalizedDigits) return;
      ok = question.acceptedAnswers.some(
        (expected) => normalizeDigitAnswer(expected) === normalizedDigits
      );
    } else {
      const normalizedUser = normalizeAnswer(answer, stripSpaces);
      if (!normalizedUser) return;
      ok = question.acceptedAnswers.some(
        (expected) => normalizeAnswer(expected, stripSpaces) === normalizedUser
      );
    }

    let quote: string | null = null;
    if (activeMentor) {
      if (!ok) {
        quote = pickRandomQuote(activeMentor.mistakeQuotes);
      } else if (comboStreak + 1 >= 2) {
        quote = pickRandomQuote(activeMentor.comboQuotes);
      }
      setMentorQuote(quote);
    }

    setSubmitted(true);
    setIsCorrect(ok);
    onAnswered(ok, { answer }, quote);
  };

  const correctHighlight =
    question.displayAnswer || question.acceptedAnswers[0] || '';

  const renderSentenceWithParentheses = (sentence: string) => {
    const lines = sentence
      .split('\n')
      .map((line) =>
        question.kimTaskNumber === 5 ? line.trim().replace(/^\d+\.\s*/, '') : line.trim()
      )
      .filter(Boolean);

    const renderInlineParts = (line: string) => {
      const parts = line.split(
        /(\*\*[^*]+\*\*|\([^)]+\)|(?<![А-ЯЁа-яёA-Za-z])[А-ЯЁ]{2,}(?:-[А-ЯЁ]{2,})*(?![А-ЯЁа-яё]))/g
      );
      return parts.map((part, idx) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong
              key={idx}
              className="inline-block mx-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold px-1.5 py-0.5 rounded-md shadow-sm"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (/^[А-ЯЁ]{2,}(?:-[А-ЯЁ]{2,})*$/.test(part)) {
          return (
            <strong
              key={idx}
              className="inline-block mx-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold px-1.5 py-0.5 rounded-md shadow-sm"
            >
              {part}
            </strong>
          );
        }
        if (part.startsWith('(') && part.endsWith(')')) {
          return (
            <span
              key={idx}
              className="inline-block mx-0.5 px-2 py-0.5 rounded-lg bg-violet-500/20 border border-violet-500/50 text-violet-200 font-semibold"
            >
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      });
    };

    if (lines.length <= 1) {
      return (
        <p className="text-base sm:text-lg font-normal text-slate-100 leading-relaxed">
          {renderInlineParts(lines[0] ?? sentence)}
        </p>
      );
    }

    return (
      <div className="space-y-2.5">
        {lines.map((line, lIdx) => (
          <p
            key={`line-${lIdx}`}
            className="text-base sm:text-lg font-normal text-slate-100 leading-relaxed"
          >
            {renderInlineParts(line)}
          </p>
        ))}
      </div>
    );
  };

  const hasInlinePassageBlank =
    question.kimTaskNumber === 1 &&
    Boolean(question.passage) &&
    /(?:<\.\.\.>|<…>|\(\.\.\.\)|\[_\])/.test(question.passage || '');

  const renderPassageWithBlanks = (passage: string) => {
    const parts = passage.split(/(<\.\.\.>|<…>|\(\.\.\.\)|\[_\]|\*\*[^*]+\*\*)/g);
    let inlineInputPlaced = false;

    return parts.map((part, idx) => {
      if (part === '<...>' || part === '<…>' || part === '(...)' || part === '[_]') {
        if (question.kimTaskNumber === 1 && !inlineInputPlaced) {
          inlineInputPlaced = true;
          const inlineBorderClass = submitted
            ? isCorrect
              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
              : 'border-rose-400 bg-rose-500/20 text-rose-100'
            : 'border-violet-400 bg-violet-500/15 text-white focus:border-violet-300 focus:bg-violet-500/25';

          return (
            <span key={idx} className="inline-flex items-center align-baseline mx-1 my-0.5">
              <input
                ref={inputRef}
                type="text"
                disabled={submitted}
                value={answer}
                onChange={(e) => {
                  if (submitted) return;
                  const v = e.target.value;
                  setAnswer(v);
                  pushDraft(v, wordMarks, ruleWordMarks);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (submitted) onNext();
                    else handleSubmit();
                  }
                }}
                placeholder="..."
                aria-label="Впишите пропущенное слово"
                style={{ width: `${Math.max((answer || '').length + 4, 11)}ch` }}
                className={`px-2.5 py-0.5 rounded-lg border-b-2 border text-sm sm:text-base font-semibold text-center outline-none transition-all ${inlineBorderClass}`}
              />
              {submitted && !isCorrect && (
                <span className="ml-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/50 text-xs sm:text-sm font-bold text-emerald-200">
                  {correctHighlight}
                </span>
              )}
            </span>
          );
        }

        return (
          <span
            key={idx}
            className="inline-block mx-1 px-2.5 py-0.5 rounded-md bg-violet-500/20 border border-violet-400/60 font-mono-num font-bold text-violet-200"
          >
            &lt;...&gt;
          </span>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong
            key={idx}
            className="inline-block mx-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold px-1.5 py-0.5 rounded-md shadow-sm"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const toggleWordMark = (key: string) => {
    if (activeTool === 'none') return;
    setWordMarks((prev) => {
      const next = { ...prev };
      if (next[key] === activeTool) {
        delete next[key];
      } else {
        next[key] = activeTool;
      }
      pushDraft(answer, next, ruleWordMarks);
      return next;
    });
  };

  const renderMarkablePassage = (passage: string) => {
    if (activeTool === 'none' && Object.keys(wordMarks).length === 0) {
      return renderPassageWithBlanks(passage);
    }

    const tokens = passage.split(/(\s+)/);
    return tokens.map((tok, tIdx) => {
      if (/^\s+$/.test(tok) || !tok) {
        return <React.Fragment key={`p-sp-${tIdx}`}>{tok}</React.Fragment>;
      }
      const markKey = `passage-${tIdx}`;
      const mark = wordMarks[markKey];
      const markClass = mark ? MARKER_STYLE_BY_ID[mark] : '';

      if (activeTool === 'none') {
        return (
          <span key={markKey} className={markClass}>
            {tok}
          </span>
        );
      }

      return (
        <span
          key={markKey}
          role="button"
          tabIndex={0}
          onClick={() => toggleWordMark(markKey)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleWordMark(markKey);
            }
          }}
          className={`inline cursor-pointer rounded px-0.5 transition-colors hover:bg-violet-500/20 ${markClass}`}
        >
          {tok}
        </span>
      );
    });
  };

  const isTask21Punctuation =
    question.kimTaskNumber === 21 ||
    (question.topicTag || '').toLowerCase().includes('задание 21');

  const getTask21RulePalette = () => {
    const promptLower = question.prompt.toLowerCase();

    if (promptLower.includes('двоеточ')) {
      return [
        {
          id: 'bsp',
          label: 'БСП',
          pillClass: 'bg-amber-500/25 border-amber-400 text-amber-200',
          markClass: 'bg-amber-500/30 text-amber-100 rounded px-0.5',
        },
        {
          id: 'gen',
          label: 'Обобщающее слово',
          pillClass: 'bg-emerald-500/25 border-emerald-400 text-emerald-200',
          markClass: 'bg-emerald-500/30 text-emerald-100 rounded px-0.5',
        },
        {
          id: 'speech',
          label: 'Прямая речь',
          pillClass: 'bg-fuchsia-500/25 border-fuchsia-400 text-fuchsia-200',
          markClass: 'bg-fuchsia-500/30 text-fuchsia-100 rounded px-0.5',
        },
      ];
    }

    if (promptLower.includes('запят')) {
      return [
        {
          id: 'hom',
          label: 'Однородные члены',
          pillClass: 'bg-violet-500/25 border-violet-400 text-violet-200',
          markClass: 'bg-violet-500/30 text-violet-100 rounded px-0.5',
        },
        {
          id: 'ssp',
          label: 'ССП',
          pillClass: 'bg-sky-500/25 border-sky-400 text-sky-200',
          markClass: 'bg-sky-500/30 text-sky-100 rounded px-0.5',
        },
        {
          id: 'spp',
          label: 'СПП',
          pillClass: 'bg-emerald-500/25 border-emerald-400 text-emerald-200',
          markClass: 'bg-emerald-500/30 text-emerald-100 rounded px-0.5',
        },
        {
          id: 'bsp',
          label: 'БСП',
          pillClass: 'bg-amber-500/25 border-amber-400 text-amber-200',
          markClass: 'bg-amber-500/30 text-amber-100 rounded px-0.5',
        },
        {
          id: 'part',
          label: 'Причастный оборот / об. опред.',
          pillClass: 'bg-cyan-500/25 border-cyan-400 text-cyan-200',
          markClass: 'bg-cyan-500/30 text-cyan-100 rounded px-0.5',
        },
        {
          id: 'advpart',
          label: 'Деепричастный оборот / об. обст.',
          pillClass: 'bg-teal-500/25 border-teal-400 text-teal-200',
          markClass: 'bg-teal-500/30 text-teal-100 rounded px-0.5',
        },
        {
          id: 'app',
          label: 'Приложение',
          pillClass: 'bg-orange-500/25 border-orange-400 text-orange-200',
          markClass: 'bg-orange-500/30 text-orange-100 rounded px-0.5',
        },
        {
          id: 'intro',
          label: 'Вводное',
          pillClass: 'bg-pink-500/25 border-pink-400 text-pink-200',
          markClass: 'bg-pink-500/30 text-pink-100 rounded px-0.5',
        },
        {
          id: 'addr',
          label: 'Обращение',
          pillClass: 'bg-rose-500/25 border-rose-400 text-rose-200',
          markClass: 'bg-rose-500/30 text-rose-100 rounded px-0.5',
        },
        {
          id: 'clar',
          label: 'Уточняющая конструкция',
          pillClass: 'bg-lime-500/25 border-lime-400 text-lime-200',
          markClass: 'bg-lime-500/30 text-lime-100 rounded px-0.5',
        },
        {
          id: 'comp',
          label: 'Сравнительный оборот',
          pillClass: 'bg-yellow-500/25 border-yellow-400 text-yellow-200',
          markClass: 'bg-yellow-500/30 text-yellow-100 rounded px-0.5',
        },
        {
          id: 'obj',
          label: 'Обособленное дополнение',
          pillClass: 'bg-indigo-500/25 border-indigo-400 text-indigo-200',
          markClass: 'bg-indigo-500/30 text-indigo-100 rounded px-0.5',
        },
      ];
    }

    return [
      {
        id: 'subj',
        label: 'Подлежащее — сказуемое',
        pillClass: 'bg-violet-500/25 border-violet-400 text-violet-200',
        markClass: 'bg-violet-500/30 text-violet-100 rounded px-0.5',
      },
      {
        id: 'app',
        label: 'Приложение',
        pillClass: 'bg-orange-500/25 border-orange-400 text-orange-200',
        markClass: 'bg-orange-500/30 text-orange-100 rounded px-0.5',
      },
      {
        id: 'bsp',
        label: 'БСП',
        pillClass: 'bg-amber-500/25 border-amber-400 text-amber-200',
        markClass: 'bg-amber-500/30 text-amber-100 rounded px-0.5',
      },
      {
        id: 'ins',
        label: 'Вставная конструкция',
        pillClass: 'bg-rose-500/25 border-rose-400 text-rose-200',
        markClass: 'bg-rose-500/30 text-rose-100 rounded px-0.5',
      },
      {
        id: 'intro',
        label: 'Вводная конструкция',
        pillClass: 'bg-pink-500/25 border-pink-400 text-pink-200',
        markClass: 'bg-pink-500/30 text-pink-100 rounded px-0.5',
      },
      {
        id: 'inc',
        label: 'Неполное',
        pillClass: 'bg-sky-500/25 border-sky-400 text-sky-200',
        markClass: 'bg-sky-500/30 text-sky-100 rounded px-0.5',
      },
      {
        id: 'gen',
        label: 'Обобщающее слово',
        pillClass: 'bg-emerald-500/25 border-emerald-400 text-emerald-200',
        markClass: 'bg-emerald-500/30 text-emerald-100 rounded px-0.5',
      },
      {
        id: 'speech',
        label: 'Прямая речь',
        pillClass: 'bg-fuchsia-500/25 border-fuchsia-400 text-fuchsia-200',
        markClass: 'bg-fuchsia-500/30 text-fuchsia-100 rounded px-0.5',
      },
    ];
  };

  const getTask21MatchedNumbers = (): string[] => {
    if (!isTask21Punctuation || !question.passage) return [];
    const ruleToSentences: Record<string, Set<string>> = {};

    Object.entries(ruleWordMarks).forEach(([key, ruleId]) => {
      const [, sentNum] = key.split('-');
      if (!sentNum) return;
      if (!ruleToSentences[ruleId]) {
        ruleToSentences[ruleId] = new Set();
      }
      ruleToSentences[ruleId].add(sentNum);
    });

    const matchedEntry = Object.values(ruleToSentences).find(
      (set) => set.size >= 2
    );

    return matchedEntry
      ? Array.from(matchedEntry).sort((a, b) => Number(a) - Number(b))
      : [];
  };

  const renderTask21ColorPassage = (passage: string) => {
    const palette = getTask21RulePalette();
    const markStyleMap = Object.fromEntries(
      palette.map((item) => [item.id, item.markClass])
    );
    const matchedNums = new Set(getTask21MatchedNumbers());
    const blocks = passage.split(/(?=\(\d+\))/g);

    return blocks.map((block, bIdx) => {
      const numMatch = block.match(/^\((\d+)\)/);
      const sentNum = numMatch ? numMatch[1] : `b${bIdx}`;
      const isSentenceMatched = Boolean(numMatch) && matchedNums.has(sentNum);
      const bodyText = numMatch ? block.slice(numMatch[0].length) : block;
      const tokens = bodyText.split(/(\s+)/);

      return (
        <React.Fragment key={`t21-blk-${bIdx}`}>
          {numMatch && (
            <span
              className={`inline-block mr-0.5 px-1.5 py-0.5 rounded font-mono-num text-xs font-bold transition-colors ${
                isSentenceMatched
                  ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-200 shadow-sm'
                  : 'text-violet-300'
              }`}
            >
              {numMatch[0]}
            </span>
          )}
          {tokens.map((tok, tIdx) => {
            if (!tok) return null;
            if (/^\s+$/.test(tok)) {
              return (
                <React.Fragment key={`t21-sp-${bIdx}-${tIdx}`}>
                  {tok}
                </React.Fragment>
              );
            }

            const markKey = `t21-${sentNum}-${tIdx}`;
            const appliedRuleId = ruleWordMarks[markKey];
            const appliedClass = appliedRuleId
              ? markStyleMap[appliedRuleId] || ''
              : '';

            if (activeRuleId === 'none') {
              return appliedClass ? (
                <span key={markKey} className={appliedClass}>
                  {tok}
                </span>
              ) : (
                <React.Fragment key={markKey}>{tok}</React.Fragment>
              );
            }

            return (
              <span
                key={markKey}
                role="button"
                tabIndex={0}
                onClick={() =>
                  setRuleWordMarks((prev) => {
                    const next = { ...prev };
                    if (next[markKey] === activeRuleId) {
                      delete next[markKey];
                    } else {
                      next[markKey] = activeRuleId;
                    }
                    pushDraft(answer, wordMarks, next);
                    return next;
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setRuleWordMarks((prev) => {
                      const next = { ...prev };
                      if (next[markKey] === activeRuleId) {
                        delete next[markKey];
                      } else {
                        next[markKey] = activeRuleId;
                      }
                      pushDraft(answer, wordMarks, next);
                      return next;
                    });
                  }
                }}
                className={`inline cursor-pointer rounded px-0.5 transition-colors hover:bg-slate-800/80 ${appliedClass}`}
              >
                {tok}
              </span>
            );
          })}
        </React.Fragment>
      );
    });
  };

  const renderScratchpadToolbar = () => {
    if (!showScratchpad) return null;

    if (isTask21Punctuation) {
      const palette = getTask21RulePalette();
      const matchedNums = getTask21MatchedNumbers();
      const hasAnyMarks = Object.keys(ruleWordMarks).length > 0;

      return (
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#080B14]/75 border border-slate-800/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
              <Highlighter className="w-3.5 h-3.5 text-violet-400" />
              <span>
                Цветной маркер правил (выберите правило и кликайте по словам в тексте):
              </span>
            </span>

            <div className="flex items-center gap-2">
              {matchedNums.length >= 2 && !submitted && (
                <button
                  type="button"
                  onClick={() => {
                    const joined = matchedNums.join('');
                    setAnswer(joined);
                    pushDraft(joined, wordMarks, ruleWordMarks);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/60 hover:bg-emerald-500/30 text-[11px] font-semibold text-emerald-200 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  <span>Подставить {matchedNums.join('')} в ответ</span>
                </button>
              )}

              {hasAnyMarks && (
                <button
                  type="button"
                  onClick={() => {
                    setRuleWordMarks({});
                    pushDraft(answer, wordMarks, {});
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Сбросить цвета</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveRuleId('none')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                activeRuleId === 'none'
                  ? 'bg-slate-800 border-slate-500 text-white'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Чтение
            </button>

            {palette.map((item) => {
              const isSelected = activeRuleId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveRuleId(item.id)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? item.pillClass + ' font-semibold shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

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
              <span className="font-mono-num text-[10px] opacity-75">
                {tool.shortDesc}
              </span>
            </button>
          );
        })}
        {hasMarks && (
          <button
            type="button"
            onClick={() => {
              setWordMarks({});
              pushDraft(answer, {}, ruleWordMarks);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сбросить</span>
          </button>
        )}
      </div>
    );
  };

  const renderAnswerInput = () => {
    if (hasInlinePassageBlank) {
      return !submitted ? (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-sm shadow-lg shadow-violet-600/25 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Проверить</span>
          </button>
        </div>
      ) : null;
    }

    return (
      <div className="space-y-2">
        {question.answerLabel && (
          <label
            htmlFor={`word-input-${question.id}`}
            className="block text-sm font-semibold text-slate-200"
          >
            {question.answerLabel}
          </label>
        )}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Keyboard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id={`word-input-${question.id}`}
              ref={inputRef}
              type="text"
              inputMode={isDigitMode ? 'numeric' : 'text'}
              disabled={submitted}
              value={answer}
              onChange={(e) => {
                if (submitted) return;
                const v = e.target.value;
                setAnswer(v);
                pushDraft(v, wordMarks, ruleWordMarks);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (submitted) onNext();
                  else handleSubmit();
                }
              }}
              placeholder={
                isDigitMode
                  ? 'Введите номер(-а) предложений без пробелов...'
                  : question.inputPlaceholder ||
                    (question.submode === 'phrase_transform'
                      ? 'Введите словосочетание (пробелы не важны)...'
                      : 'Введите ответ с клавиатуры...')
              }
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-base transition-all outline-none ${
                isDigitMode ? 'font-mono-num tracking-wider' : ''
              } ${
                submitted
                  ? isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-100'
                  : 'bg-[#080B14] border-slate-700/80 text-white placeholder-slate-500 focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20'
              }`}
            />
          </div>
          {!submitted && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-sm shadow-lg shadow-violet-600/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Проверить</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isFullWidthTextMode) {
    return (
      <div className="max-w-5xl mx-auto w-full space-y-4">
        <div className="p-4 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'Лексический анализ текста'} ·{' '}
              {isDigitMode ? 'Цифровой ответ' : 'Ввод ответа'}
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

          {showHint && question.hint && !submitted && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-200 leading-relaxed flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{question.hint}</span>
            </div>
          )}

          {renderScratchpadToolbar()}

          {question.passage && (
            <div
              className={`p-4 sm:p-5 rounded-xl bg-[#080B14]/85 border border-slate-800/90 text-sm sm:text-[15px] text-slate-200 leading-relaxed whitespace-pre-line ${
                showScratchpad &&
                (isTask21Punctuation
                  ? activeRuleId !== 'none'
                  : activeTool !== 'none')
                  ? 'ring-1 ring-violet-500/30 cursor-text'
                  : ''
              }`}
            >
              {isTask21Punctuation
                ? renderTask21ColorPassage(question.passage)
                : showScratchpad
                ? renderMarkablePassage(question.passage)
                : renderPassageWithBlanks(question.passage)}
            </div>
          )}

          <h3 className="w-full [text-wrap:wrap] font-display text-base sm:text-lg font-semibold text-white leading-snug">
            {question.prompt}
          </h3>

          {question.sentence && (
            <div className="p-4 rounded-xl bg-[#080B14]/75 border border-slate-800/80">
              {renderSentenceWithParentheses(question.sentence)}
            </div>
          )}

          {renderAnswerInput()}

          {!submitted && (onPrev || !isLastQuestion) && (
            <div className="hidden lg:flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
              {onPrev ? (
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={onPrev}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs sm:text-sm font-medium text-slate-300 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Назад</span>
                </button>
              ) : (
                <span />
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
                disabled={!answer.trim()}
                onClick={handleSubmit}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Проверить ответ</span>
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
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start max-w-6xl mx-auto">
      <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-400">
            {question.topicTag || 'Ввод ответа'} · Клавиатурный ввод
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

        {question.sentence && (
          <div className="p-4 sm:p-5 rounded-xl bg-[#080B14]/85 border border-slate-800/90">
            {renderSentenceWithParentheses(question.sentence)}
          </div>
        )}

        {renderAnswerInput()}

        {!submitted && (
          <div className="lg:hidden flex justify-end pt-1">
            <button
              type="button"
              disabled={!answer.trim()}
              onClick={handleSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Проверить ответ</span>
            </button>
          </div>
        )}
      </div>

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
