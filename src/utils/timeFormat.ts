/**
 * Formats elapsed seconds as ММ:СС (or ЧЧ:ММ:СС if >= 1 hour).
 */
export function formatStopwatch(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formats elapsed seconds into human-readable Russian duration (e.g. "18 мин 42 сек").
 */
export function formatDurationRu(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (hours > 0) {
    return `${hours} ч ${mins} мин ${secs} сек`;
  }
  if (mins > 0) {
    return `${mins} мин ${secs} сек`;
  }
  return `${secs} сек`;
}
