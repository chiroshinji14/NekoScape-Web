import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCENES } from '../data/scenes';
import type { LightingMode, SceneDefinition } from '../types/nekoscape';
import { useLenis } from '../hooks/useLenis';

gsap.registerPlugin(ScrollTrigger);

export interface SceneCarouselProps {
  scenes?: readonly SceneDefinition[];
  lightingMode?: LightingMode;
  linkToScenes?: boolean;
}

interface CarouselTileProps {
  scene: SceneDefinition;
  lightingMode: LightingMode;
  linkToScenes: boolean;
  isDuplicate?: boolean;
}

function CarouselTile({
  scene,
  lightingMode,
  linkToScenes,
  isDuplicate = false,
}: CarouselTileProps) {
  const content = (
    <>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[16px] bg-ns-elevated">
        <img
          src={scene.images[lightingMode]}
          alt={scene.label}
          width={1920}
          height={1080}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-2.5 text-sm font-medium text-ns-ink">{scene.label}</p>
    </>
  );

  const sharedClasses =
    'group flex w-[280px] shrink-0 flex-col text-left sm:w-[356px]';

  if (linkToScenes) {
    return (
      <Link
        to="/scenes"
        tabIndex={isDuplicate ? -1 : undefined}
        className={`${sharedClasses} ns-pressable`}
      >
        {content}
      </Link>
    );
  }

  return <figure className={sharedClasses}>{content}</figure>;
}

export function SceneCarousel({
  scenes = SCENES,
  lightingMode = 'golden',
  linkToScenes = false,
}: SceneCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const row1MomentumRef = useRef<HTMLDivElement | null>(null);
  const row2MomentumRef = useRef<HTMLDivElement | null>(null);
  const { reducedMotion } = useLenis();

  const { row1, row2 } = useMemo(() => {
    const splitIndex = Math.ceil(scenes.length / 2);
    return {
      row1: scenes.slice(0, splitIndex),
      row2: scenes.slice(splitIndex),
    };
  }, [scenes]);

  useEffect(() => {
    const containerEl = containerRef.current;
    const row1El = row1MomentumRef.current;
    const row2El = row2MomentumRef.current;

    if (!containerEl || !row1El || !row2El) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        row1El,
        { x: 24 },
        {
          x: -56,
          ease: 'none',
          scrollTrigger: {
            trigger: containerEl,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.65,
          },
        },
      );

      gsap.fromTo(
        row2El,
        { x: -56 },
        {
          x: 24,
          ease: 'none',
          scrollTrigger: {
            trigger: containerEl,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.65,
          },
        },
      );
    });

    return () => {
      mm.revert();
    };
  }, []);

  if (reducedMotion) {
    return (
      <div ref={containerRef} className="space-y-6">
        <div className="flex gap-5 overflow-x-auto px-5 pb-2 sm:px-8">
          {row1.map((scene) => (
            <CarouselTile
              key={scene.id}
              scene={scene}
              lightingMode={lightingMode}
              linkToScenes={linkToScenes}
            />
          ))}
        </div>
        <div className="flex gap-5 overflow-x-auto px-5 pb-2 sm:px-8">
          {row2.map((scene) => (
            <CarouselTile
              key={scene.id}
              scene={scene}
              lightingMode={lightingMode}
              linkToScenes={linkToScenes}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="ns-carousel-root relative w-full overflow-hidden py-1">
      <style>{`
        @keyframes ns-marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes ns-marquee-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .ns-track-left {
          animation: ns-marquee-left 48s linear infinite;
          will-change: transform;
        }
        .ns-track-right {
          animation: ns-marquee-right 54s linear infinite;
          will-change: transform;
        }
        .ns-carousel-row:hover .ns-track-left,
        .ns-carousel-row:focus-within .ns-track-left,
        .ns-carousel-row:hover .ns-track-right,
        .ns-carousel-row:focus-within .ns-track-right {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .ns-track-left,
          .ns-track-right {
            animation: none !important;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-ns-base to-transparent sm:w-20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-ns-base to-transparent sm:w-20"
      />

      <div className="space-y-6">
        <div className="ns-carousel-row overflow-hidden">
          <div ref={row1MomentumRef} className="will-change-transform">
            <div className="ns-track-left flex w-max">
              <div className="flex shrink-0 gap-5 pr-5">
                {row1.map((scene) => (
                  <CarouselTile
                    key={`r1-a-${scene.id}`}
                    scene={scene}
                    lightingMode={lightingMode}
                    linkToScenes={linkToScenes}
                  />
                ))}
              </div>
              <div className="flex shrink-0 gap-5 pr-5" aria-hidden="true">
                {row1.map((scene) => (
                  <CarouselTile
                    key={`r1-b-${scene.id}`}
                    scene={scene}
                    lightingMode={lightingMode}
                    linkToScenes={linkToScenes}
                    isDuplicate
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="ns-carousel-row overflow-hidden">
          <div ref={row2MomentumRef} className="will-change-transform">
            <div className="ns-track-right flex w-max">
              <div className="flex shrink-0 gap-5 pr-5">
                {row2.map((scene) => (
                  <CarouselTile
                    key={`r2-a-${scene.id}`}
                    scene={scene}
                    lightingMode={lightingMode}
                    linkToScenes={linkToScenes}
                  />
                ))}
              </div>
              <div className="flex shrink-0 gap-5 pr-5" aria-hidden="true">
                {row2.map((scene) => (
                  <CarouselTile
                    key={`r2-b-${scene.id}`}
                    scene={scene}
                    lightingMode={lightingMode}
                    linkToScenes={linkToScenes}
                    isDuplicate
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SceneCarousel;
