import { useRef, useEffect, useCallback } from 'react';

const FPS = 8;
const FRAME_INTERVAL = 1000 / FPS;

// useAnimation: runs a requestAnimationFrame loop at specified FPS
// callback receives (deltaTime, frameCount) each frame
export function useAnimation(callback, active = true) {
  const frameRef = useRef(0);
  const lastTickRef = useRef(0);
  const rafRef = useRef(null);

  const loop = useCallback((timestamp) => {
    if (!lastTickRef.current) lastTickRef.current = timestamp;

    const delta = timestamp - lastTickRef.current;
    if (delta >= FRAME_INTERVAL) {
      lastTickRef.current = timestamp - (delta % FRAME_INTERVAL);
      frameRef.current += 1;
      callback(delta, frameRef.current);
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [callback]);

  useEffect(() => {
    if (!active) return;
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, loop]);
}
