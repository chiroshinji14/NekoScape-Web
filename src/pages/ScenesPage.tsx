import { useState } from 'react';
import { SCENES } from '../data/scenes';
import type { LightingMode } from '../types/nekoscape';
import { SceneCarousel } from '../components/SceneCarousel';
import { SceneCard } from '../components/SceneCard';

export interface ScenesPageProps {
  onOpenDownload: () => void;
}

const LIGHTING_OPTIONS: readonly { id: LightingMode; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'golden', label: 'Golden' },
  { id: 'night', label: 'Night' },
];

export function ScenesPage({ onOpenDownload }: ScenesPageProps) {
  const [lightingMode, setLightingMode] = useState<LightingMode>('golden');

  return (
    <div className="min-h-[100dvh] bg-ns-base pt-20 pb-28 sm:pt-24">
      <header className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ns-ink">
              Thirteen quiet rooms.
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-ns-ink-secondary">
              Switch scenes anytime, or let the light shift naturally from morning to night.
            </p>
          </div>

          <div
            role="group"
            aria-label="Preview lighting"
            className="flex items-center gap-6 border-b border-[var(--ns-hairline)] pb-1 self-start md:self-auto"
          >
            {LIGHTING_OPTIONS.map((option) => {
              const isActive = lightingMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setLightingMode(option.id)}
                  aria-pressed={isActive}
                  className={[
                    'ns-pressable inline-flex min-h-[44px] cursor-pointer items-center border-b-2 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'border-ns-honey text-ns-ink'
                      : 'border-transparent text-ns-ink-tertiary [@media(hover:hover)]:hover:text-ns-ink',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <section aria-label="Scene previews" className="mt-14">
        <SceneCarousel scenes={SCENES} lightingMode={lightingMode} />
      </section>

      <section aria-label="All rooms" className="mx-auto mt-20 max-w-6xl px-5 sm:px-8">
        <div
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))' }}
          className="grid gap-x-7 gap-y-10"
        >
          {SCENES.map((scene) => (
            <SceneCard key={scene.id} scene={scene} lightingMode={lightingMode} />
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-[var(--ns-hairline)] pt-14 sm:flex-row sm:items-center">
          <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-ns-ink">
            Try them live on your Windows desktop.
          </p>
          <button
            type="button"
            onClick={onOpenDownload}
            className="ns-btn-primary inline-flex min-h-[44px] cursor-pointer items-center rounded-full px-6 text-sm font-semibold"
          >
            Download for Windows
          </button>
        </div>
      </section>
    </div>
  );
}

export default ScenesPage;
