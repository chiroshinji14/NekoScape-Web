import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DownloadSimple } from '@phosphor-icons/react';
import { useLenis } from '../hooks/useLenis';
import { HeroCatChaseSvg } from './HeroCatChaseSvg';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollExpandHeroProps {
  onOpenDownload: () => void;
}

function getOffsetCenterY(el: HTMLElement, ancestor: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top + el.offsetHeight / 2;
}

export function ScrollExpandHero({ onOpenDownload }: ScrollExpandHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinWrapperRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const stageFrameRef = useRef<HTMLDivElement | null>(null);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  const { reducedMotion } = useLenis();
  const [introOffscreen, setIntroOffscreen] = useState(false);

  useLayoutEffect(() => {
    const sectionEl = sectionRef.current;
    const pinEl = pinWrapperRef.current;
    const introEl = introRef.current;
    const stageEl = stageFrameRef.current;

    if (!sectionEl || !pinEl || !introEl || !stageEl) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add(
      '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
      () => {
        const marginY = 56;
        let lastIntroHidden = false;
        let lastNavHidden = false;

        const setNavHidden = (hidden: boolean) => {
          if (hidden === lastNavHidden) return;
          lastNavHidden = hidden;
          window.dispatchEvent(
            new CustomEvent('ns:hero-nav-hide', { detail: { hidden } }),
          );
        };

        const getExpandedMetrics = () => {
          const maxW = Math.min(1220, Math.max(320, pinEl.clientWidth * 0.78));
          const maxH = Math.max(240, pinEl.clientHeight - marginY * 2);
          const baseW = Math.max(stageEl.offsetWidth, 1);
          const baseH = Math.max(stageEl.offsetHeight, 1);
          const scale = Math.min(maxW / baseW, maxH / baseH);
          const targetCenterY = pinEl.clientHeight / 2;
          return { scale, targetCenterY };
        };

        gsap.set(stageEl, {
          transformOrigin: '50% 50%',
          force3D: true,
        });
        gsap.set(introEl, { force3D: true });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionEl,
            start: 'top top',
            end: '+=75%',
            scrub: true,
            pin: pinEl,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              const nextIntroHidden = p > 0.72;
              if (nextIntroHidden !== lastIntroHidden) {
                lastIntroHidden = nextIntroHidden;
                setIntroOffscreen(nextIntroHidden);
              }
              setNavHidden(self.isActive && p > 0.08);
            },
            onLeave: () => {
              setNavHidden(false);
            },
            onLeaveBack: () => {
              if (lastIntroHidden) {
                lastIntroHidden = false;
                setIntroOffscreen(false);
              }
              setNavHidden(false);
            },
          },
        });

        tl.to(
          introEl,
          {
            y: () => -(introEl.offsetTop + introEl.offsetHeight + 32),
            duration: 0.9,
            ease: 'none',
          },
          0,
        );

        tl.to(
          stageEl,
          {
            y: () => getExpandedMetrics().targetCenterY - getOffsetCenterY(stageEl, pinEl),
            scale: () => getExpandedMetrics().scale,
            duration: 1,
            ease: 'none',
          },
          0,
        );

        return () => {
          setNavHidden(false);
          setIntroOffscreen(false);
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, []);

  useEffect(() => {
    const stageEl = stageFrameRef.current;
    const parallaxEl = parallaxRef.current;
    if (!stageEl || !parallaxEl || typeof window === 'undefined') {
      return;
    }

    const canParallax =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      window.matchMedia('(min-width: 900px)').matches;

    if (!canParallax) {
      return;
    }

    const xTo = gsap.quickTo(parallaxEl, 'x', { duration: 0.55, ease: 'power3.out' });
    const yTo = gsap.quickTo(parallaxEl, 'y', { duration: 0.55, ease: 'power3.out' });

    const handleMove = (event: PointerEvent) => {
      const rect = stageEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      xTo(nx * -12);
      yTo(ny * -8);
    };

    const handleLeave = () => {
      xTo(0);
      yTo(0);
    };

    stageEl.addEventListener('pointermove', handleMove);
    stageEl.addEventListener('pointerleave', handleLeave);

    return () => {
      stageEl.removeEventListener('pointermove', handleMove);
      stageEl.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="NekoScape" className="relative bg-ns-base">
      <div
        ref={pinWrapperRef}
        className="relative flex w-full flex-col justify-start overflow-hidden pt-10 pb-10 sm:pt-12 sm:pb-12 lg:min-h-[100dvh]"
      >
        <div
          ref={introRef}
          className="relative z-10 mx-auto w-full max-w-4xl px-5 text-center will-change-transform sm:px-8"
        >
          <h1 className="font-display text-[clamp(2.85rem,7.2vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.03em] text-ns-ink">
            Your desktop,
            <br />
            alive with cats.
          </h1>

          <HeroCatChaseSvg paused={introOffscreen} />

          <p className="mx-auto mt-3 max-w-[52ch] text-base leading-relaxed text-ns-ink-secondary sm:text-lg">
            A living wallpaper for Windows where gentle cats roam behind your icons. Move a file,
            switch scenes, or hold Alt to play right on your desktop.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenDownload}
              className="ns-btn-primary inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full px-6 text-sm font-semibold"
            >
              <DownloadSimple size={17} weight="bold" aria-hidden="true" />
              <span>Download free</span>
            </button>

            <Link
              to="/scenes"
              className="ns-btn-secondary inline-flex min-h-[46px] items-center rounded-full px-6 text-sm font-semibold ring-1 ring-inset ring-[var(--ns-hairline)]"
            >
              See all scenes
            </Link>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-6 w-full max-w-4xl px-5 sm:mt-7 sm:px-8">
          <div
            ref={stageFrameRef}
            data-hero-stage
            className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] bg-ns-elevated will-change-transform"
            style={{
              boxShadow: 'var(--ns-specular-top), var(--ns-shadow-elevated)',
            }}
          >
            <div ref={parallaxRef} className="h-full w-full scale-[1.03] will-change-transform">
              {reducedMotion ? (
                <img
                  src="/assets/nekoscape_demo/nekoscape_demo-Cover.webp"
                  alt="Cats roaming behind Windows desktop icons in NekoScape"
                  width={1920}
                  height={1080}
                  loading="eager"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src="/assets/nekoscape_demo/nekoscape_demo.webm"
                  poster="/assets/nekoscape_demo/nekoscape_demo-Cover.webp"
                  width={1920}
                  height={1080}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  aria-label="Live demo of NekoScape cats roaming behind Windows desktop icons"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.45)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScrollExpandHero;
