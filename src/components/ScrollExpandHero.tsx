import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CaretRight } from '@phosphor-icons/react';
import { HERO_SEQUENCE_IMAGES } from '../data/scenes';

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

  useEffect(() => {
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
        gsap.set(stageEl, {
          clipPath: 'inset(0px round 22px)',
          transformOrigin: '50% 50%',
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionEl,
            start: 'top top',
            end: '+=110%',
            scrub: 0.6,
            pin: pinEl,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          introEl,
          {
            opacity: 0,
            y: -40,
            duration: 0.45,
            ease: 'none',
          },
          0,
        );

        tl.to(
          stageEl,
          {
            y: () => pinEl.clientHeight / 2 - getOffsetCenterY(stageEl, pinEl),
            scale: () =>
              Math.max(
                pinEl.clientWidth / Math.max(stageEl.offsetWidth, 1),
                pinEl.clientHeight / Math.max(stageEl.offsetHeight, 1),
              ) * 1.01,
            clipPath: 'inset(0px round 0px)',
            duration: 1,
            ease: 'none',
          },
          0,
        );
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
        className="relative flex w-full flex-col justify-start overflow-hidden pt-16 pb-10 sm:pt-20 sm:pb-12 lg:min-h-[100dvh] lg:justify-between"
      >
        <div
          ref={introRef}
          className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8"
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h1 className="max-w-2xl font-display text-[clamp(2.5rem,5.4vw,4.5rem)] font-bold leading-[1.03] tracking-[-0.03em] text-ns-ink">
              Your desktop,
              <br />
              alive with cats.
            </h1>

            <div className="max-w-sm lg:pb-1">
              <p className="text-lg leading-relaxed text-ns-ink-secondary">
                Gentle companions that roam behind your icons on Windows.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={onOpenDownload}
                  className="ns-btn-primary inline-flex min-h-[44px] cursor-pointer items-center rounded-full px-6 text-sm font-semibold"
                >
                  Download for Windows
                </button>

                <Link
                  to="/scenes"
                  className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-ns-honey-hover transition-colors duration-150 [@media(hover:hover)]:hover:text-ns-ink"
                >
                  <span>Explore scenes</span>
                  <CaretRight size={15} weight="bold" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-10 w-full max-w-6xl px-5 sm:mt-12 sm:px-8">
          <div
            ref={stageFrameRef}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] bg-ns-elevated will-change-transform"
            style={{
              boxShadow: 'var(--ns-specular-top), var(--ns-shadow-elevated)',
            }}
          >
            <div ref={parallaxRef} className="h-full w-full scale-[1.03] will-change-transform">
              <img
                src={HERO_SEQUENCE_IMAGES.golden}
                alt="Cats lounging on a sunlit oak study floor in NekoScape"
                width={1600}
                height={900}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
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
