import { useEffect, useRef, useState } from 'react';

interface UseAnimatedModalOptions {
  exitDurationMs?: number;
  onAfterClose?: () => void;
}

export function useAnimatedModal(
  isOpen: boolean,
  { exitDurationMs = 180, onAfterClose }: UseAnimatedModalOptions = {},
) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [entered, setEntered] = useState(false);
  const onAfterCloseRef = useRef(onAfterClose);
  onAfterCloseRef.current = onAfterClose;

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isOpen) {
      setShouldRender(true);

      if (prefersReducedMotion) {
        setEntered(true);
        return;
      }

      let raf1 = 0;
      let raf2 = 0;

      // Double rAF guarantees the initial scale/opacity state paints before transitioning in.
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          setEntered(true);
        });
      });

      return () => {
        window.cancelAnimationFrame(raf1);
        window.cancelAnimationFrame(raf2);
      };
    }

    setEntered(false);

    if (!shouldRender) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        setShouldRender(false);
        onAfterCloseRef.current?.();
      },
      prefersReducedMotion ? 0 : exitDurationMs,
    );

    return () => window.clearTimeout(timer);
  }, [exitDurationMs, isOpen, shouldRender]);

  return { shouldRender, entered };
}
