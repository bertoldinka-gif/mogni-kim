import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Lightbulb, RotateCcw, Send, XCircle } from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import { PhraseologyHighlightQuestion, SavedQuestionState } from '../../types/platform';
import { TrainerSidePanel } from './TrainerSidePanel';

interface PhraseologyHighlightEngineProps {
  question: PhraseologyHighlightQuestion;
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

interface ParsedToken {
  index: number;
  leading: string;
  word: string;
  trailing: string;
  normalized: string;
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/ё/g, 'е').trim();
}

function parseParagraphTokens(paragraph: string): ParsedToken[] {
  const rawChunks = paragraph.trim().split(/\s+/);
  return rawChunks.map((chunk, idx) => {
    const match = chunk.match(/^([«„"'(—–-]*)(.*?)([»“"')….,!?:;—–-]*)$/);
    const leading = match?.[1] ?? '';
    const word = match?.[2] ?? chunk;
    const trailing = match?.[3] ?? '';
    return {
      index: idx,
      leading,
      word,
      trailing,
      normalized: normalizeWord(word),
    };
  });
}

function findTargetIndices(tokens: ParsedToken[], targetPhrase: string): number[] {
  const targetWords = targetPhrase
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/^[«„"'(—–-]+|[»“"')….,!?:;—–-]+$/g, ''))
    .map(normalizeWord)
    .filter(Boolean);

  if (targetWords.length === 0) return [];

  for (let i = 0; i <= tokens.length - targetWords.length; i++) {
    let matches = true;
    for (let j = 0; j < targetWords.length; j++) {
      if (tokens[i + j].normalized !== targetWords[j]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return targetWords.map((_, offset) => i + offset);
    }
  }

  return [];
}

export const PhraseologyHighlightEngine: React.FC<PhraseologyHighlightEngineProps> = ({
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
  const tokens = useMemo(() => parseParagraphTokens(question.paragraph), [question.paragraph]);
  const targetIndices = useMemo(
    () => findTargetIndices(tokens, question.targetPhrase),
    [tokens, question.targetPhrase]
  );

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

  useEffect(() => {
    setSelectedIndices(savedState?.userState?.selectedIndices ?? []);
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
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

  const toggleToken = (idx: number) => {
    if (submitted) return;
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSubmit = () => {
    if (submitted || selectedIndices.length === 0) return;

    const sortedSelected = [...selectedIndices].sort((a, b) => a - b);
    const sortedTarget = [...targetIndices].sort((a, b) => a - b);

    const exactMatch =
      sortedTarget.length > 0 &&
      sortedSelected.length === sortedTarget.length &&
      sortedSelected.every((val, i) => val === sortedTarget[i]);

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
    onAnswered(exactMatch, { selectedIndices }, quote);
  };

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start max-w-6xl mx-auto">
      {/* Left Column: Clickable Paragraph Workspace */}
      <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'Фразеологизмы'} · Нажмите на слова фразеологизма
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

        {/* Clickable Paragraph Container */}
        <div className="p-4 sm:p-6 rounded-xl bg-[#080B14]/85 border border-slate-800/90 leading-relaxed text-base sm:text-[17px] text-slate-200 flex flex-wrap items-baseline gap-y-2">
          {tokens.map((tok, idx) => {
            const isSelected = selectedIndices.includes(idx);
            const isTarget = targetIndices.includes(idx);

            if (!tok.word) {
              return (
                <span key={idx} className="mr-1.5 text-slate-400 select-none">
                  {tok.leading}
                  {tok.trailing}
                </span>
              );
            }

            let tokenStyle =
              'border-transparent text-slate-200 hover:bg-slate-800/90 hover:border-slate-700';

            if (!submitted && isSelected) {
              tokenStyle =
                'bg-violet-500/30 border-violet-400 text-white shadow-sm shadow-violet-950/50';
            } else if (submitted) {
              if (isTarget) {
                tokenStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-200';
              } else if (isSelected && !isTarget) {
                tokenStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 line-through';
              } else {
                tokenStyle = 'border-transparent text-slate-400';
              }
            }

            return (
              <span key={idx} className="inline-flex items-baseline mr-1.5">
                {tok.leading && (
                  <span className="text-slate-400 select-none">{tok.leading}</span>
                )}
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => toggleToken(idx)}
                  className={`px-1.5 py-0.5 rounded-md border text-left transition-all duration-150 ${
                    submitted ? 'cursor-default' : 'cursor-pointer'
                  } ${tokenStyle}`}
                >
                  {tok.word}
                </button>
                {tok.trailing && (
                  <span className="text-slate-400 select-none">{tok.trailing}</span>
                )}
              </span>
            );
          })}
        </div>

        {/* Phrase Meaning Banner after submit */}
        {submitted && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-100'
                : 'bg-violet-500/10 border-violet-500/35 text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">«{question.targetPhrase}»</span>
              <span className="text-slate-300"> — {question.phraseMeaning}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        {!submitted ? (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>
                Выделено слов:{' '}
                <strong className="font-mono-num text-slate-200">
                  {selectedIndices.length}
                </strong>
              </span>
              {selectedIndices.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIndices([])}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Сбросить</span>
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={selectedIndices.length === 0}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer whitespace-nowrap ml-auto"
            >
              <Send className="w-4 h-4" />
              <span>Проверить</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs pt-1">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-medium">
                  Фразеологизм найден точно!
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-rose-300 font-medium">
                  Верный фразеологизм выделен зелёным цветом в тексте.
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
        correctAnswerHighlight={`«${question.targetPhrase}» — ${question.phraseMeaning}`}
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
