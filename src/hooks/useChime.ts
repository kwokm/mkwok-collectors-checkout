import { useCallback, useEffect, useRef } from 'react';

/**
 * A one-shot UI sound, primed on the gesture that starts the flow.
 *
 * iOS will only let an <audio> element play if it has already been started
 * from inside a user gesture — and our chime fires 1.5s after the tap, long
 * past that window. So the tap starts and immediately rewinds the element
 * while muted, and completion just replays an element the system already
 * trusts.
 *
 * Whether it is audible at all is left to the platform: a phone on silent
 * stays silent, which is the right default for a sound nobody asked for.
 */
export function useChime(src: string) {
  const el = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    el.current = audio;
    return () => {
      audio.pause();
      el.current = null;
    };
  }, [src]);

  /** Call synchronously inside a user gesture. Silent, and safe to repeat. */
  const prime = useCallback(() => {
    const audio = el.current;
    if (!audio) return;
    audio.muted = true;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      })
      .catch(() => {
        // Autoplay refused entirely — the flow is silent, nothing else breaks.
        audio.muted = false;
      });
  }, []);

  const play = useCallback(() => {
    const audio = el.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  return { prime, play };
}
