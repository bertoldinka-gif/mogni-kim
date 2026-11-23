import React, { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { MentorCharacter } from '../data/petsData';

export type MentorMood = 'idle' | 'mistake' | 'combo';

interface MentorAvatarProps {
  mentor: MentorCharacter;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  ringTone?: 'violet' | 'amber' | 'emerald';
  locked?: boolean;
  /** Текущее эмоциональное состояние наставника (влияет на анимацию и подсветку рамки) */
  mood?: MentorMood;
  /** Счётчик-триггер для повторного запуска анимации реакции (например, номер вопроса или комбо) */
  reactionTrigger?: number;
  /** Внешняя реплика для автоматического показа в облачке с эффектом печатающегося текста */
  speechText?: string | null;
  /** Включить реакцию и случайную реплику по клику на портрет (по умолчанию true для незаблокированных) */
  interactive?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<MentorAvatarProps['size']>, string> = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-11 h-11 text-xs',
  md: 'w-14 h-14 sm:w-16 sm:h-16 text-base',
  lg: 'w-20 h-20 text-xl',
  xl: 'w-24 h-24 sm:w-28 sm:h-28 text-2xl',
  '2xl': 'w-36 h-36 text-3xl',
};

const DEFAULT_TAP_QUOTES = [
  'Ну что, готов разнести этот вариант?',
  'Не торопись, вчитайся в каждое слово!',
  'Я слежу за твоим прогрессом. Жми дальше!',
  'Экзаменаторы ФИПИ уже нервно курят в сторонке!',
];

export const MentorAvatar: React.FC<MentorAvatarProps> = ({
  mentor,
  size = 'md',
  ringTone = 'violet',
  locked = false,
  mood = 'idle',
  reactionTrigger = 0,
  speechText = null,
  interactive = true,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const [activeAnim, setActiveAnim] = useState<'none' | 'mistake' | 'combo' | 'tap'>('none');
  const [bubbleFullText, setBubbleFullText] = useState<string | null>(null);
  const [typedText, setTypedText] = useState('');
  const hideTimerRef = useRef<number | null>(null);

  // Запуск анимации при смене настроения (ошибка или комбо)
  useEffect(() => {
    if (locked || mood === 'idle') return;
    setActiveAnim(mood);
    const t = window.setTimeout(() => setActiveAnim('none'), 650);
    return () => window.clearTimeout(t);
  }, [mood, reactionTrigger, locked]);

  // Автоматический показ облачка, если сверху передан speechText
  useEffect(() => {
    if (!speechText || locked) return;
    showBubble(speechText);
  }, [speechText, reactionTrigger, locked]);

  // Эффект печатной машинки для текста в облачке
  useEffect(() => {
    if (!bubbleFullText) {
      setTypedText('');
      return;
    }
    let idx = 0;
    setTypedText('');
    const interval = window.setInterval(() => {
      idx += 1;
      setTypedText(bubbleFullText.slice(0, idx));
      if (idx >= bubbleFullText.length) {
        window.clearInterval(interval);
      }
    }, 18);

    return () => window.clearInterval(interval);
  }, [bubbleFullText]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const showBubble = (text: string) => {
    setBubbleFullText(text);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setBubbleFullText(null);
    }, 4500);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    if (locked || !interactive || size === 'xs') return;
    // Не перехватываем клик, если аватарка находится внутри большой кнопки-карточки, но даём лёгкую анимацию
    setActiveAnim('tap');
    window.setTimeout(() => setActiveAnim('none'), 400);

    const pool = [
      ...(mentor.chatIntroQuotes ?? []),
      ...(mentor.comboQuotes ?? []),
      ...DEFAULT_TAP_QUOTES,
    ];
    const randomLine = pool[Math.floor(Math.random() * pool.length)];
    if (randomLine) {
      showBubble(randomLine);
    }
  };

  const ringClass =
    activeAnim === 'mistake'
      ? 'ring-2 ring-rose-500 shadow-lg shadow-rose-600/50'
      : activeAnim === 'combo'
      ? 'ring-2 ring-amber-300 shadow-lg shadow-amber-500/60'
      : ringTone === 'emerald'
      ? 'ring-2 ring-emerald-400/75 shadow-lg shadow-emerald-950/50'
      : ringTone === 'amber'
      ? 'ring-2 ring-amber-400/70 shadow-lg shadow-amber-950/50'
      : 'ring-2 ring-violet-500/50 shadow-lg shadow-violet-950/50';

  const filterClass = locked
    ? 'grayscale-[55%] brightness-75 opacity-85'
    : 'grayscale-0 brightness-100 opacity-100';

  const isLarge = size === 'xl' || size === '2xl';
  const canInteract = !locked && interactive && size !== 'xs';

  const motionClass =
    activeAnim === 'mistake'
      ? 'mentor-anim-shake'
      : activeAnim === 'combo'
      ? 'mentor-anim-combo'
      : activeAnim === 'tap'
      ? 'mentor-anim-tap'
      : !locked && size !== 'xs'
      ? 'mentor-anim-float'
      : '';

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <style>{`
        @keyframes mentorFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes mentorShake {
          0%, 100% { transform: translateX(0); }
          18% { transform: translateX(-6px) rotate(-3deg); }
          36% { transform: translateX(6px) rotate(3deg); }
          54% { transform: translateX(-4px) rotate(-2deg); }
          72% { transform: translateX(4px) rotate(2deg); }
        }
        @keyframes mentorCombo {
          0% { transform: scale(1); }
          35% { transform: scale(1.14) translateY(-5px); }
          70% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes mentorTap {
          0% { transform: scale(1); }
          40% { transform: scale(0.91); }
          80% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .mentor-anim-float {
          animation: mentorFloat 3.4s ease-in-out infinite;
        }
        .mentor-anim-shake {
          animation: mentorShake 0.48s cubic-bezier(.36,.07,.19,.97) both;
        }
        .mentor-anim-combo {
          animation: mentorCombo 0.55s ease-out both;
        }
        .mentor-anim-tap {
          animation: mentorTap 0.35s ease-out both;
        }
      `}</style>

      <div
        onClick={handleAvatarClick}
        title={canInteract ? `${mentor.name} — нажми, чтобы услышать реплику` : mentor.name}
        className={`relative ${SIZE_CLASSES[size]} rounded-full overflow-hidden ${ringClass} ${motionClass} ${
          canInteract ? 'cursor-pointer hover:brightness-110' : ''
        } bg-slate-900 shrink-0 transition-colors duration-200 ${className}`}
      >
        {hasError || !mentor.avatarUrl ? (
          <div
            className={`w-full h-full rounded-full ${mentor.accentBg} ${mentor.accentText} ${filterClass} flex items-center justify-center font-display font-bold transition-all duration-200`}
            aria-label={mentor.name}
          >
            {mentor.monogram}
          </div>
        ) : (
          <img
            src={mentor.avatarUrl}
            alt={mentor.name}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className={`w-full h-full rounded-full object-cover object-top transition-all duration-200 ${filterClass}`}
          />
        )}

        {locked && (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-slate-950/25 pointer-events-none"
          >
            <div
              className={`${
                isLarge ? 'w-8 h-8' : 'w-6 h-6'
              } rounded-full bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-slate-200 shadow-md`}
            >
              <Lock className={isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            </div>
          </div>
        )}
      </div>

            {/* Всплывающее диалоговое облачко с эффектом печатающегося текста */}
      {bubbleFullText && !locked && (
        <div
          role="status"
          onClick={(e) => {
            e.stopPropagation();
            setBubbleFullText(null);
          }}
          className="absolute bottom-full left-0 mb-2.5 z-50 w-56 sm:w-64 max-w-[calc(100vw-2rem)] px-3 py-2 rounded-xl bg-slate-900/95 border border-violet-400/50 text-xs text-slate-100 shadow-2xl shadow-black/70 backdrop-blur-md pointer-events-auto cursor-pointer animate-fade-in"
        >
          <div className="font-semibold text-[10px] uppercase tracking-wider text-violet-300 mb-0.5">
            {mentor.name}
          </div>
          <p className="leading-snug text-slate-100">
            {typedText}
            {typedText.length < bubbleFullText.length && (
              <span className="inline-block w-1.5 h-3 ml-0.5 bg-violet-400 animate-pulse align-middle" />
            )}
          </p>
          <div className="absolute top-full left-5 -mt-px border-4 border-transparent border-t-slate-900/95" />
        </div>
      )}
    </div>
  );
};


