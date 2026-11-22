import { useState } from 'react';
import { HERO_SEQUENCE_IMAGES } from '../data/scenes';
import type { LightingMode } from '../types/nekoscape';

interface SequenceChapter {
  id: LightingMode;
  label: string;
  caption: string;
  image: string;
  alt: string;
}

const CHAPTERS: readonly SequenceChapter[] = [
  {
    id: 'day',
    label: 'Morning light',
    caption: 'Bright daylight drifts across the room as you start your day.',
    image: HERO_SEQUENCE_IMAGES.day,
    alt: 'NekoScape Golden Study room in bright morning daylight',
  },
  {
    id: 'golden',
    label: 'Golden hour',
    caption: 'Warm late-afternoon sunbeams stretch across the rug.',
    image: HERO_SEQUENCE_IMAGES.golden,
    alt: 'NekoScape Golden Study room bathed in warm late-afternoon sunbeams',
  },
  {
    id: 'night',
    label: 'Quiet nights',
    caption: 'Soft moonlight settles in beside a warm desk lamp.',
    image: HERO_SEQUENCE_IMAGES.night,
    alt: 'NekoScape Golden Study room at night with glowing desk lamp and cat eyes',
  },
] as const;

export function ImageScrollSequence() {
  const [activeChapter, setActiveChapter] = useState<LightingMode>('day');

  return (
    <section
      aria-label="Lighting through the day"
      className="relative bg-ns-elevated/45 py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl">
          <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ns-ink">
            Light that follows your day.
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-ns-ink-secondary">
            From bright morning sun to a quiet desk lamp at night.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_260px]">
          <div
            className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-ns-elevated"
            style={{ boxShadow: 'var(--ns-specular-top), var(--ns-shadow-ambient)' }}
          >
            {CHAPTERS.map((chapter) => {
              const isActive = activeChapter === chapter.id;
              return (
                <img
                  key={chapter.id}
                  src={chapter.image}
                  alt={chapter.alt}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  decoding="async"
                  aria-hidden={!isActive}
                  className={[
                    'absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-[var(--ease-out)]',
                    isActive ? 'opacity-100' : 'pointer-events-none opacity-0',
                  ].join(' ')}
                />
              );
            })}
          </div>

          <div
            role="group"
            aria-label="Time of day"
            className="flex flex-col divide-y divide-[var(--ns-hairline)]"
          >
            {CHAPTERS.map((chapter) => {
              const isActive = activeChapter === chapter.id;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => setActiveChapter(chapter.id)}
                  aria-pressed={isActive}
                  className="ns-pressable group cursor-pointer py-5 text-left first:pt-0 last:pb-0"
                >
                  <span
                    className={[
                      'block font-display text-xl font-semibold tracking-[-0.02em] transition-colors duration-200',
                      isActive
                        ? 'text-ns-ink'
                        : 'text-ns-ink-tertiary [@media(hover:hover)]:group-hover:text-ns-ink',
                    ].join(' ')}
                  >
                    {chapter.label}
                  </span>
                  <p
                    className={[
                      'mt-1.5 text-sm leading-relaxed transition-colors duration-200',
                      isActive ? 'text-ns-ink-secondary' : 'text-ns-ink-tertiary/80',
                    ].join(' ')}
                  >
                    {chapter.caption}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ImageScrollSequence;
