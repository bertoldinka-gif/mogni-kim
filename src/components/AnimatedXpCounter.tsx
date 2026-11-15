import React, { useEffect, useRef, useState } from 'react';

interface AnimatedXpValueProps {
  value: number;
  durationMs?: number;
  suffix?: string;
}

/**
 * Pure React + requestAnimationFrame smooth counter (0.5-0.7s default 600ms).
 * Purely visual; does not alter underlying XP state or calculations.
 */
export const AnimatedXpValue: React.FC<AnimatedXpValueProps> = ({
  value,
  durationMs = 600,
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const currentDisplayedRef = useRef<number>(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startVal = currentDisplayedRef.current;
    const targetVal = value;

    if (startVal === targetVal) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || durationMs <= 0) {
      currentDisplayedRef.current = targetVal;
      setDisplayValue(targetVal);
      return;
    }

    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Cubic ease-out for crisp settling
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(startVal + (targetVal - startVal) * eased);

      currentDisplayedRef.current = nextVal;
      setDisplayValue(nextVal);

      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        currentDisplayedRef.current = targetVal;
        setDisplayValue(targetVal);
        rafRef.current = null;
      }
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [value, durationMs]);

  return (
    <>
      {displayValue}
      {suffix}
    </>
  );
};

export interface XpDeltaToastState {
  key: number;
  delta: number;
}

/**
 * Pure React hook watching XP changes to trigger a 1-second non-blocking floating delta indicator.
 */
export function useXpDeltaToast(xp: number): XpDeltaToastState | null {
  const prevXpRef = useRef<number>(xp);
  const [toast, setToast] = useState<XpDeltaToastState | null>(null);

  useEffect(() => {
    const prev = prevXpRef.current;
    if (prev !== xp) {
      const delta = xp - prev;
      prevXpRef.current = xp;
      const key = Date.now() + Math.random();
      setToast({ key, delta });

      const timer = window.setTimeout(() => {
        setToast((curr) => (curr?.key === key ? null : curr));
      }, 1000);

      return () => window.clearTimeout(timer);
    }
  }, [xp]);

  return toast;
}

interface FloatingXpBadgeProps {
  delta: number;
  toastKey: number;
  className?: string;
}

export const FloatingXpBadge: React.FC<FloatingXpBadgeProps> = ({
  delta,
  toastKey,
  className = '-top-1 right-0',
}) => {
  if (delta === 0) return null;
  const isGain = delta > 0;

  return (
    <span
      key={toastKey}
      aria-hidden="true"
      className={`pointer-events-none select-none absolute z-30 px-2 py-0.5 rounded-md border text-[11px] font-mono-num font-bold shadow-lg whitespace-nowrap animate-xp-float ${className} ${
        isGain
          ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200 shadow-emerald-950/60'
          : 'bg-rose-500/25 border-rose-400/60 text-rose-200 shadow-rose-950/60'
      }`}
    >
      {isGain ? `+${delta} XP` : `${delta} XP`}
    </span>
  );
};
