import { useCallback, useRef } from 'react';

/**
 * Calls `onTrigger` after `required` taps that each land within `windowMs` of the previous one.
 * Used for the hidden Diagnostics entry (Settings → tap version 5×).
 */
export function useTapCounter(
  onTrigger: () => void,
  required = 5,
  windowMs = 1500,
  now: () => number = Date.now,
): () => number {
  const count = useRef(0);
  const last = useRef(0);

  return useCallback(() => {
    const t = now();
    count.current = t - last.current <= windowMs ? count.current + 1 : 1;
    last.current = t;
    if (count.current >= required) {
      count.current = 0;
      onTrigger();
    }
    return count.current;
  }, [onTrigger, required, windowMs, now]);
}
