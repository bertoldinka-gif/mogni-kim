import React, { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import { FillLetterQuestion, SavedQuestionState } from '../../types/platform';
import { TrainerSidePanel } from './TrainerSidePanel';

interface FillLetterEngineProps {
  question: FillLetterQuestion;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<{ selectedOption: string | null }>;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: { selectedOption: string | null },
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

export const FillLetterEngine: React.FC<FillLetterEngineProps> = ({
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
  const [selectedOption, setSelectedOption] = useState<string | null>(
    () => savedState?.userState?.selectedOption ?? null
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
    setSelectedOption(savedState?.userState?.selectedOption ?? null);
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

  const handleSelect = (opt: string) => {
    if (submitted) return;
    const correct = opt.toLowerCase() === question.correctAnswer.toLowerCase();

    let quote: string | null = null;
    if (activeMentor) {
      if (!correct) {
        quote = pickRandomQuote(activeMentor.mistakeQuotes);
      } else if (comboStreak + 1 >= 2) {
        quote = pickRandomQuote(activeMentor.comboQuotes);
      }
      setMentorQuote(quote);
    }

    setSelectedOption(opt);
    setSubmitted(true);
    setIsCorrect(correct);
    onAnswered(correct, { selectedOption: opt }, quote);
  };

  // Render targetWord with '..' highlighted or filled
  const renderTargetWord = () => {
    const parts = question.targetWord.split('..');
    if (parts.length < 2) {
      return <span className="font-semibold text-violet-300">{question.targetWord}</span>;
    }

    const gapContent = submitted ? question.correctAnswer : '..';
    const gapClass = submitted
      ? isCorrect
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
        : 'bg-rose-500/20 text-rose-300 border-rose-500/60'
      : 'bg-violet-500/20 text-violet-300 border-violet-500/60';

    return (
      <span className="inline-flex items-baseline font-semibold text-white">
        <span>{parts[0]}</span>
        <span
          className={`inline-block mx-0.5 px-1.5 py-0.5 rounded border text-base sm:text-lg leading-none font-mono-num ${gapClass}`}
        >
          {gapContent}
        </span>
        <span>{parts.slice(1).join('..')}</span>
      </span>
    );
  };

  const renderSentence = () => {
    const idx = question.sentence.indexOf(question.targetWord);
    if (idx === -1) {
      return (
        <div className="space-y-3 text-center">
          <p className="text-base sm:text-xl text-slate-200 leading-relaxed">
            {question.sentence}
          </p>
          <div className="text-xl sm:text-2xl tracking-wide">{renderTargetWord()}</div>
        </div>
      );
    }

    const before = question.sentence.slice(0, idx);
    const after = question.sentence.slice(idx + question.targetWord.length);

    return (
      <p className="text-base sm:text-xl text-slate-200 leading-relaxed text-center">
        <span>{before}</span>
        {renderTargetWord()}
        <span>{after}</span>
      </p>
    );
  };

  const filledWord = question.targetWord.replace('..', question.correctAnswer);

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start max-w-6xl mx-auto">
      {/* Left Column: Unobstructed Question Card */}
      <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-400">
            {question.topicTag || 'Орфография'} · Вставьте пропущенную букву
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

        {/* Sentence Display Box */}
        <div className="p-3.5 sm:p-6 lg:p-7 rounded-xl bg-[#080B14]/80 border border-slate-800/80 flex items-center justify-center min-h-[88px] sm:min-h-[120px]">
          {renderSentence()}
        </div>

        {/* Compact, horizontally centered option buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
          {question.options.map((opt) => {
            const isChosen = selectedOption === opt;
            const isRightOption = opt.toLowerCase() === question.correctAnswer.toLowerCase();

            let btnStyle =
              'bg-[#080B14]/80 border-slate-700/90 text-slate-100 hover:border-violet-500 hover:bg-violet-500/15';

            if (submitted) {
              if (isRightOption) {
                btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-200';
              } else if (isChosen && !isRightOption) {
                btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-200';
              } else {
                btnStyle = 'bg-[#080B14]/40 border-slate-800 text-slate-500';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(opt)}
                className={`w-fit min-w-[72px] px-5 py-3 whitespace-nowrap rounded-xl border text-base font-display font-bold transition-all duration-150 ${
                  submitted ? 'cursor-default' : 'cursor-pointer'
                } ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
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
        correctAnswerHighlight={`${question.correctAnswer} (${filledWord})`}
        lexicalMeaning={question.lexicalMeaning}
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
