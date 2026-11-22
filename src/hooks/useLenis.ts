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
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
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
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: options?.offset ?? 0,
        immediate: options?.immediate ?? false,
        duration: options?.duration,
      });
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (typeof target === 'number') {
      window.scrollTo({
        top: target + (options?.offset ?? 0),
        behavior: options?.immediate ? 'auto' : 'smooth',
      });
      return;
    }

    const element =
      typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY + (options?.offset ?? 0);
      window.scrollTo({
        top,
        behavior: options?.immediate ? 'auto' : 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => {
        ScrollTrigger.refresh();
        const el = document.querySelector<HTMLElement>(hash);
        if (el) {
          scrollTo(el, { offset: -72, immediate: reducedMotion });
        }
      }, 60);

      return () => window.clearTimeout(timer);
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    const rafId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
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
