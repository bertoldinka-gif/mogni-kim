import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BookmarkCheck,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  MessageSquareQuote,
  XCircle,
} from 'lucide-react';
import { MentorCharacter } from '../../data/petsData';
import { MentorAvatar } from '../MentorAvatar';

interface TrainerSidePanelProps {
  submitted: boolean;
  isCorrect: boolean;
  ruleTitle: string;
  ruleExplanation: string;
  hint?: string;
  showHint: boolean;
  hintUnlocked?: boolean;
  canAffordHint?: boolean;
  onToggleHint: () => void;
  correctAnswerHighlight?: string;
  lexicalMeaning?: string;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  learnedClicked?: boolean;
  activeMentor?: MentorCharacter | null;
  mentorQuote?: string | null;
  onMarkLearned?: () => void;
  onPrev?: () => void;
  onNext: () => void;
}

export const TrainerSidePanel: React.FC<TrainerSidePanelProps> = ({
  submitted,
  isCorrect,
  ruleTitle,
  ruleExplanation,
  hint,
  showHint,
  hintUnlocked = false,
  canAffordHint = true,
  onToggleHint,
  correctAnswerHighlight,
  lexicalMeaning,
  isReviewMode = false,
  isLastQuestion = false,
  canGoPrev = false,
  learnedClicked = false,
  activeMentor = null,
  mentorQuote = null,
  onMarkLearned,
  onPrev,
  onNext,
}) => {
  const hintDisabled = !hintUnlocked && !canAffordHint;
  const hintLabel = showHint
    ? 'Скрыть подсказку'
    : hintUnlocked
    ? 'Подсказка'
    : 'Подсказка (-5 XP)';

  return (
    <>
      {/* Side Panel on Desktop (lg:col-span-5), Compact Stacked Card on Mobile (< lg) */}
      <div className="lg:col-span-5 mt-3 lg:mt-0">
        {!submitted ? (
          <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 space-y-3 lg:space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <HelpCircle className="w-4 h-4 text-violet-400" />
                <span>Разбор и управление</span>
              </div>

              {hint && (
                <button
                  type="button"
                  disabled={hintDisabled}
                  title={
                    hintDisabled
                      ? 'Недостаточно XP для подсказки (нужно 5 XP)'
                      : undefined
                  }
                  onClick={onToggleHint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs font-medium text-violet-300 hover:text-violet-200 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{hintLabel}</span>
                </button>
              )}
            </div>

            {showHint && hint ? (
              <div className="p-3 lg:p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs lg:text-sm text-violet-200 leading-relaxed">
                <span className="font-semibold text-violet-300">Подсказка: </span>
                {hint}
              </div>
            ) : (
              <p className="text-xs lg:text-sm text-slate-400 leading-relaxed">
                Выполните задание в карточке вопроса. После проверки здесь появится
                полный разбор правила и кнопка перехода к следующему вопросу.
              </p>
            )}

            {(onPrev || !isLastQuestion) && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
                {onPrev ? (
                  <button
                    type="button"
                    disabled={!canGoPrev}
                    onClick={onPrev}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs font-medium text-slate-300 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Назад</span>
                  </button>
                ) : (
                  <span />
                )}

                {!isLastQuestion && (
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Вперёд</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className={`p-3 lg:p-6 rounded-2xl backdrop-blur-md border space-y-3 lg:space-y-4 ${
              isCorrect
                ? 'bg-[#0B1917]/90 border-emerald-500/40'
                : 'bg-[#1C0E14]/90 border-rose-500/40'
            }`}
          >
            {/* Header Status */}
            <div className="flex items-center justify-between gap-2">
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
              <span className="text-xs text-slate-400">Разбор и управление</span>
            </div>

            {/* Active Mentor Reaction Speech Bubble */}
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

            {/* Correct Answer Highlight (when wrong) */}
            {!isCorrect && correctAnswerHighlight && (
              <div className="p-2.5 lg:p-3 rounded-xl bg-[#080B14]/70 border border-rose-500/25 text-xs lg:text-sm text-rose-200/90 leading-relaxed">
                <span className="text-slate-400">Правильный ответ: </span>
                <span className="font-semibold text-emerald-300">
                  {correctAnswerHighlight}
                </span>
              </div>
            )}

            {/* Lexical Meaning Callout (for Словарные слова) */}
            {lexicalMeaning && (
              <div className="p-2.5 lg:p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Лексическое значение</span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  {lexicalMeaning}
                </p>
              </div>
            )}

            {/* Full Rule Title & Complete Explanation */}
            <div className="space-y-1">
              <h4 className="font-display text-xs sm:text-sm lg:text-base font-semibold text-white">
                {ruleTitle}
              </h4>
              <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
                {ruleExplanation}
              </p>
            </div>

            {/* Desktop-only Action Buttons inside the side card */}
            <div className="hidden lg:flex flex-col gap-2.5 pt-2">
              {isReviewMode && isCorrect && onMarkLearned && (
                <button
                  type="button"
                  disabled={learnedClicked}
                  onClick={onMarkLearned}
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
                      : 'Выучил (убрать из списка) · +10 XP'}
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
        )}
      </div>

      {/* Truly Fixed Mobile Bottom Action Bar (< lg) */}
      {submitted && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#080B14]/95 backdrop-blur-md border-t border-slate-800 px-4 py-3">
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
                onClick={onMarkLearned}
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
        </div>
      )}
    </>
  );
};
