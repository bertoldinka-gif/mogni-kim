import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { MentorCharacter } from '../data/petsData';

interface MentorAvatarProps {
  mentor: MentorCharacter;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  ringTone?: 'violet' | 'amber' | 'emerald';
  locked?: boolean;
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

export const MentorAvatar: React.FC<MentorAvatarProps> = ({
  mentor,
  size = 'md',
  ringTone = 'violet',
  locked = false,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const ringClass =
    ringTone === 'emerald'
      ? 'ring-2 ring-emerald-400/75 shadow-lg shadow-emerald-950/50'
      : ringTone === 'amber'
      ? 'ring-2 ring-amber-400/70 shadow-lg shadow-amber-950/50'
      : 'ring-2 ring-violet-500/50 shadow-lg shadow-violet-950/50';

  const filterClass = locked
    ? 'grayscale-[55%] brightness-75 opacity-85'
    : 'grayscale-0 brightness-100 opacity-100';

  const isLarge = size === 'xl' || size === '2xl';

  return (
    <div
      className={`relative ${SIZE_CLASSES[size]} rounded-full overflow-hidden ${ringClass} bg-slate-900 shrink-0 transition-all duration-200 ${className}`}
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
  );
};
