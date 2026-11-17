import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Flame,
  RotateCcw,
  Timer,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  BlitzQuestion,
  getBlitzQuestionPool,
  shuffleQuestions,
} from '../data/curriculum';
import { MentorCharacter, pickRandomQuote } from '../data/petsData';
import { BlitzModeId, GradeLevel } from '../types/platform';
import { LogoMark } from './LogoMark';
import { MentorAvatar, MentorMood } from './MentorAvatar';

interface MentorBlitzDuelProps {
  mode: BlitzModeId;
  grade: GradeLevel;
  activeMentor: MentorCharacter | null;
  onExit: () => void;
  onDuelFinished: (outcome: { won: boolean; xpReward: number }) => void;
}

const BLITZ_DURATION_SEC = 60;
const MENTOR_POINT_INTERVAL_MS = 4000;
const MISTAKE_PENALTY_SEC = 3;
const WIN_XP_REWARD = 150;
const PARTICIPATION_XP_REWARD = 25;

const MODE_LABELS: Record<BlitzModeId, string> = {
  orthoepy: 'Ударения',
  paronyms: 'Паронимы',
  vocabulary: 'Словарные слова',
  mix: 'Микс на скорость',
};

function getMultiplier(streak: number): 1 | 2 | 3 {
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

function formatSentenceBlank(sentence: string, targetWord: string): string {
  if (sentence.includes('..')) return sentence;
  return `${sentence} (${targetWord})`;
}

export const MentorBlitzDuel: React.FC<MentorBlitzDuelProps> = ({
  mode,
  grade,
  activeMentor,
  onExit,
  onDuelFinished,
}) => {
  const [duelRunId, setDuelRunId] = useState(0);
  const [deck, setDeck] = useState<BlitzQuestion[]>(() =>
    getBlitzQuestionPool(mode, grade)
  );
  const [questionIdx, setQuestionIdx] = useState(0);

  const [timeLeft, setTimeLeft] = useState<number>(BLITZ_DURATION_SEC);
  const [studentScore, setStudentScore] = useState(0);
  const [mentorScore, setMentorScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [feedback, setFeedback] = useState<{
    selectedIdx: number;
    isCorrect: boolean;
    pointsGained: number;
  } | null>(null);
  const [mentorPulseKey, setMentorPulseKey] = useState(0);
  const [studentFlashKey, setStudentFlashKey] = useState(0);
  const [mentorMood, setMentorMood] = useState<MentorMood>('idle');
  const [reactionTrigger, setReactionTrigger] = useState(0);
  const [mentorSpeech, setMentorSpeech] = useState<string | null>(null);
  const [endQuote, setEndQuote] = useState<string>('');

  const mentorAccumulatorRef = useRef(0);
  const advanceTimerRef = useRef<number | null>(null);
  const rewardClaimedRef = useRef(false);

  const isFinished = timeLeft <= 0;
  const currentQuestion = deck[questionIdx % Math.max(1, deck.length)];
  const multiplier = getMultiplier(streak);
  const mentorName = activeMentor ? activeMentor.name : 'Штаб ФИПИ';

  // Reset entire duel on rematch or mode/grade change
  const resetDuel = () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    mentorAccumulatorRef.current = 0;
    rewardClaimedRef.current = false;
    setDeck(getBlitzQuestionPool(mode, grade));
    setQuestionIdx(0);
    setTimeLeft(BLITZ_DURATION_SEC);
    setStudentScore(0);
    setMentorScore(0);
    setStreak(0);
    setMaxStreak(0);
    setAnsweredCount(0);
    setCorrectCount(0);
    setFeedback(null);
    setMentorPulseKey(0);
    setStudentFlashKey(0);
    setMentorMood('idle');
    setReactionTrigger(0);
    setMentorSpeech(null);
    setEndQuote('');
    setDuelRunId((n) => n + 1);
  };

  useEffect(() => {
    resetDuel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, grade]);

  // 100ms precision timer + simulated mentor scoring (+1 every 4.0s)
  useEffect(() => {
    if (isFinished) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) return 0;
        return Math.max(0, Math.round((prev - 0.1) * 10) / 10);
      });

      mentorAccumulatorRef.current += 100;
      if (mentorAccumulatorRef.current >= MENTOR_POINT_INTERVAL_MS) {
        mentorAccumulatorRef.current -= MENTOR_POINT_INTERVAL_MS;
        setMentorScore((m) => m + 1);
        setMentorPulseKey((k) => k + 1);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [isFinished, duelRunId]);

  // Cleanup pending auto-advance timeout
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  // Grant XP & increment duelsWon exactly once when timer hits 0
  useEffect(() => {
    if (!isFinished || rewardClaimedRef.current) return;
    rewardClaimedRef.current = true;
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    const won = studentScore > mentorScore;
    const xpReward = won
      ? WIN_XP_REWARD
      : answeredCount >= 3
      ? PARTICIPATION_XP_REWARD
      : 0;

    if (activeMentor) {
      setEndQuote(
        pickRandomQuote(
          won ? activeMentor.comboQuotes : activeMentor.mistakeQuotes
        )
      );
    } else {
      setEndQuote(
        won
          ? 'Невероятная скорость и безошибочная грамотность! Даже эксперты ФИПИ впечатлены.'
          : 'Соперник оказался быстрее на финишной прямой. Попробуйте реванш — темп уже набран!'
      );
    }

    onDuelFinished({ won, xpReward });
  }, [isFinished, studentScore, mentorScore, answeredCount, activeMentor, onDuelFinished]);

  const handleAnswerClick = (optionIdx: number) => {
    if (isFinished || feedback || !currentQuestion) return;

    const selectedOpt = currentQuestion.options[optionIdx];
    const isCorrect =
      currentQuestion.type === 'fill_letter'
        ? selectedOpt === currentQuestion.correctAnswer
        : optionIdx === currentQuestion.correctAnswer;

    setAnsweredCount((c) => c + 1);

    if (isCorrect) {
      const nextStreak = streak + 1;
      const mult = getMultiplier(streak);
      setStudentScore((s) => s + mult);
      setStreak(nextStreak);
      setMaxStreak((m) => Math.max(m, nextStreak));
      setCorrectCount((c) => c + 1);
      setStudentFlashKey((k) => k + 1);
      setFeedback({ selectedIdx: optionIdx, isCorrect: true, pointsGained: mult });

      // При серии из 3, 6, 9... верных ответов наставник нервничает и комментирует
      if (activeMentor && nextStreak > 0 && nextStreak % 3 === 0) {
        setMentorMood('mistake');
        setMentorSpeech(pickRandomQuote(activeMentor.comboQuotes));
        setReactionTrigger((t) => t + 1);
      }
    } else {
      setStreak(0);
      setTimeLeft((prev) => Math.max(0, Math.round((prev - MISTAKE_PENALTY_SEC) * 10) / 10));
      setFeedback({ selectedIdx: optionIdx, isCorrect: false, pointsGained: 0 });

      // При ошибке ученика наставник радуется, подпрыгивает и отпускает реплику
      if (activeMentor) {
        setMentorMood('combo');
        setMentorSpeech(pickRandomQuote(activeMentor.mistakeQuotes));
        setReactionTrigger((t) => t + 1);
      }
    }

    advanceTimerRef.current = window.setTimeout(() => {
      setFeedback(null);
      setQuestionIdx((idx) => {
        const nextIdx = idx + 1;
        if (nextIdx >= deck.length) {
          setDeck((prev) => shuffleQuestions(prev));
          return 0;
        }
        return nextIdx;
      });
    }, 300);
  };

  // Optional 1-4 number key shortcuts for rapid play
  useEffect(() => {
    if (isFinished || !currentQuestion) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (feedback) return;
      const num = Number(e.key);
      if (num >= 1 && num <= currentQuestion.options.length) {
        e.preventDefault();
        handleAnswerClick(num - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // Tug-of-war ratio
  const tugPct = useMemo(() => {
    const totalPts = studentScore + mentorScore;
    if (totalPts === 0) return 50;
    return Math.min(92, Math.max(8, Math.round((studentScore / totalPts) * 100)));
  }, [studentScore, mentorScore]);

  const won = studentScore > mentorScore;
  const accuracy =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  if (isFinished) {
    const xpEarned = won
      ? WIN_XP_REWARD
      : answeredCount >= 3
      ? PARTICIPATION_XP_REWARD
      : 0;

    return (
      <div className="max-w-2xl mx-auto">
        <div
          className={`p-6 sm:p-8 rounded-2xl backdrop-blur-md border space-y-6 ${
            won
              ? 'bg-gradient-to-br from-emerald-950/50 via-slate-900 to-violet-950/40 border-emerald-500/40 shadow-2xl shadow-emerald-950/30'
              : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/35 shadow-xl'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                  won
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                    : 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                }`}
              >
                {won ? <Trophy className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">
                  Блиц-дуэль · {MODE_LABELS[mode]}
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {won ? 'Ты могнул наставника!' : 'Наставник оказался быстрее'}
{xpEarned > 0 && (
              <span className="font-mono-num px-3.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/50 text-sm font-bold text-amber-200 w-fit">
                +{xpEarned} XP
              </span>
            )}
{/* Final Duel Scoreboard */}


Твой счёт

{studentScore}



{mentorName}

{mentorScore}



Точность

{accuracy}%


Отвечено вопросов: {answeredCount}
Макс. серия: ×{maxStreak}
{/* Mentor Reaction Card */}

{activeMentor ? (
<MentorAvatar
mentor={activeMentor}
size="md"
ringTone={won ? 'emerald' : 'amber'}
mood={won ? 'mistake' : 'combo'}
reactionTrigger={1}
/>
) : (



)}


{mentorName}


«{endQuote}»


Выйти в меню



Реванш!




);
}
const isLowTime = timeLeft < 10;
return (

{/* Top Return & Mode Bar */}



Прервать дуэль
⚡ Блиц-дуэль · {MODE_LABELS[mode]}

{/* Top Duel HUD: Countdown + Tug-of-War Scoreboard /}


{/ Student Score */}

<div
key={studentFlashKey}
className={px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center shrink-0 transition-transform ${ studentFlashKey > 0 ? 'scale-105' : '' }}
>

{studentScore}


Вы · ×{multiplier}


{streak >= 2 && (


{streak}

)}
{/* Live 60s Countdown */}

<div
className={inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border font-mono-num text-xl sm:text-2xl font-bold transition-colors ${ isLowTime ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse' : 'bg-[#080B14]/85 border-slate-700/80 text-white' }}
>
<Timer className={w-5 h-5 ${isLowTime ? 'text-rose-400' : 'text-amber-400'}} />
{timeLeft.toFixed(1)}s

{feedback && (
<div
className={mt-1 text-xs font-mono-num font-bold ${ feedback.isCorrect ? 'text-emerald-400' : 'text-rose-400' }}
>
{feedback.isCorrect
? +${feedback.pointsGained} ${feedback.pointsGained > 1 ? 'очка!' : 'очко!'}
: -${MISTAKE_PENALTY_SEC} сек!}

)}
{/* Mentor Simulated Score */}



{mentorName}


+1 каждые 4с



{activeMentor ? (

) : (



)}
<span
key={mentorPulseKey}
className={absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-violet-600 border border-violet-400 font-mono-num text-[11px] font-bold text-white shadow transition-transform ${ mentorPulseKey > 0 ? 'scale-110' : '' }}
>
{mentorScore}



{/* Tug-of-War Bar */}


<div
className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
style={{ width: ${tugPct}% }}
/>


Серия ×3 → множитель x2 · ×6 → x3
Ошибок без штрафа XP


{/* Rapid-Fire Question Card */}
{currentQuestion && (


{currentQuestion.topicTag || MODE_LABELS[mode]}
Решено: {answeredCount}
{currentQuestion.type === 'fill_letter' ? (

Выберите правильную букву:

{formatSentenceBlank(currentQuestion.sentence, currentQuestion.targetWord)}


) : (

{currentQuestion.contextText && (

{currentQuestion.contextText}

)}

{currentQuestion.prompt}


)}
<div
className={grid gap-3 ${ currentQuestion.options.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2' }}
>
{currentQuestion.options.map((opt, idx) => {
const cleanOpt = opt.replace(/^\s*\d+[).]\s*/, '');
const isSelected = feedback?.selectedIdx === idx;
const isOptRight =
currentQuestion.type === 'fill_letter'
? opt === currentQuestion.correctAnswer
: idx === currentQuestion.correctAnswer;
let btnClass =
'bg-[#080B14]/80 border-slate-700/85 hover:border-amber-400/70 hover:bg-slate-800/80 text-white';
if (feedback) {
if (isOptRight) {
btnClass =
'bg-emerald-500/20 border-emerald-500 text-emerald-100';
} else if (isSelected) {
btnClass = 'bg-rose-500/20 border-rose-500 text-rose-200';
} else {
btnClass = 'bg-[#080B14]/40 border-slate-800 text-slate-500';
}
}
return (
<button
key={${currentQuestion.id}-opt-${idx}}
type="button"
disabled={Boolean(feedback)}
onClick={() => handleAnswerClick(idx)}
className={w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border text-left text-sm sm:text-base font-medium transition-all cursor-pointer ${btnClass}}
>


{idx + 1}

{cleanOpt}

{feedback && isOptRight && (

)}
{feedback && isSelected && !isOptRight && (

)}

);
})}


)}

);
};
