import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LenisContextValue {
  lenis: Lenis | null;
  reducedMotion: boolean;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { offset?: number; immediate?: boolean; duration?: number },
  ) => void;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  reducedMotion: false,
  scrollTo: () => {},
});

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(getPrefersReducedMotion);
  const lenisRef = useRef<Lenis | null>(null);
  const prevPathnameRef = useRef<string>(pathname);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setReducedMotion(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      setLenisInstance(null);
      return;
    }

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    const handleScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on('scroll', handleScroll);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.off('scroll', handleScroll);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, [reducedMotion]);

  const scrollTo = useCallback<LenisContextValue['scrollTo']>((target, options) => {
    if (typeof window === 'undefined') {
      return;
    }

    const offset = options?.offset ?? 0;
    const immediate = options?.immediate ?? false;

    let top: number | null = null;
    if (typeof target === 'number') {
      top = Math.max(0, Math.round(target + offset));
    } else {
      const element =
        typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
      if (element) {
        top = Math.max(0, Math.round(element.getBoundingClientRect().top + window.scrollY + offset));
      }
    }

    if (top === null) {
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.resize();
      lenisRef.current.scrollTo(top, {
        immediate,
        duration: options?.duration,
        force: true,
      });
      return;
    }

    window.scrollTo({
      top,
      behavior: immediate ? 'auto' : 'smooth',
    });
  }, []);

  useEffect(() => {
    const isCrossRoute = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    if (hash) {
      let raf1 = 0;
      let raf2 = 0;
      let settleTimer = 0;

      const jumpToHash = (immediate: boolean) => {
        ScrollTrigger.refresh();
        lenisRef.current?.resize();
        const el = document.querySelector<HTMLElement>(hash);
        if (el) {
          scrollTo(el, { offset: -72, immediate });
          ScrollTrigger.update();
        }
      };

      if (isCrossRoute) {
        // Wait for the destination route and any GSAP pins to mount before measuring target Y
        raf1 = window.requestAnimationFrame(() => {
          raf2 = window.requestAnimationFrame(() => {
            jumpToHash(true);
            settleTimer = window.setTimeout(() => {
              jumpToHash(true);
            }, 140);
          });
        });
      } else {
        raf1 = window.requestAnimationFrame(() => {
          jumpToHash(reducedMotion);
        });
      }

      return () => {
        window.cancelAnimationFrame(raf1);
        window.cancelAnimationFrame(raf2);
        window.clearTimeout(settleTimer);
      };
    }

    if (lenisRef.current) {
      lenisRef.current.resize();
      lenisRef.current.scrollTo(0, { immediate: true, force: true });
    } else if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    const rafId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      lenisRef.current?.resize();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [pathname, hash, reducedMotion, scrollTo]);

  const value = useMemo<LenisContextValue>(
    () => ({
      lenis: lenisInstance,
      reducedMotion,
      scrollTo,
    }),
    [lenisInstance, reducedMotion, scrollTo],
  );

  return createElement(LenisContext.Provider, { value }, children);
}

export function useLenis(): LenisContextValue {
  return useContext(LenisContext);
}
