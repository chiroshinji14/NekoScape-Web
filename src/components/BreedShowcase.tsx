import { useState } from 'react';
import { BREEDS } from '../data/breeds';
import type { BreedDefinition } from '../types/nekoscape';
import { CatModelCanvas } from './CatModelCanvas';

export function BreedShowcase() {
  const [activeId, setActiveId] = useState<BreedDefinition['id']>('persian');
  const [variantIndex, setVariantIndex] = useState(0);
  const [isKitten, setIsKitten] = useState(false);

  const activeBreed = BREEDS.find((b) => b.id === activeId) ?? BREEDS[0];
  const activeCoat = activeBreed.coatVariants[variantIndex] ?? activeBreed.coatVariants[0];

  const handleSelectBreed = (id: BreedDefinition['id']) => {
    setActiveId(id);
    setVariantIndex(0);
  };

  return (
    <div id="breeds" className="scroll-mt-24">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h3 className="font-display text-[clamp(1.75rem,3.2vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.025em] text-ns-ink">
            Fourteen breeds to adopt.
          </h3>
          <p className="mt-2 text-base text-ns-ink-secondary">
            Each with its own anatomy, coat patterns, stride, and temperament.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isKitten}
          onClick={() => setIsKitten((prev) => !prev)}
          className="ns-pressable inline-flex min-h-[44px] cursor-pointer items-center gap-3 self-start text-sm font-medium text-ns-ink sm:self-auto"
        >
          <span>Kitten Mode</span>
          <span
            aria-hidden="true"
            className={[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-[var(--ease-out)]',
              isKitten ? 'bg-ns-honey' : 'bg-ns-track',
            ].join(' ')}
          >
            <span
              className="h-5 w-5 rounded-full bg-ns-ivory shadow-xs transition-transform duration-200 ease-[var(--ease-out)]"
              style={{ transform: isKitten ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </span>
        </button>
      </div>

      <div
        className="mt-8 grid items-center gap-8 rounded-[22px] bg-ns-ivory p-7 sm:p-10 lg:grid-cols-[268px_1fr]"
        style={{ boxShadow: 'var(--ns-specular-top), var(--ns-shadow-ambient)' }}
      >
        <div
          className="flex flex-col items-center justify-center rounded-[18px] bg-ns-elevated/60 p-3"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.55)' }}
        >
          <CatModelCanvas
            breed={activeBreed}
            variantIndex={variantIndex}
            isKitten={isKitten}
          />
          <span className="mt-1 text-xs font-medium text-ns-ink-tertiary">
            {activeCoat.name}
          </span>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="font-display text-2xl font-bold tracking-[-0.02em] text-ns-ink sm:text-3xl">
              {activeBreed.label}
            </h4>

            <div
              role="group"
              aria-label={`${activeBreed.label} coat variants`}
              className="flex items-center gap-0.5 sm:gap-1"
            >
              {activeBreed.coatVariants.map((variant, idx) => {
                const isCoatActive = idx === variantIndex;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setVariantIndex(idx)}
                    aria-label={variant.name}
                    aria-pressed={isCoatActive}
                    title={variant.name}
                    className="ns-pressable flex h-11 w-11 cursor-pointer items-center justify-center rounded-full sm:h-9 sm:w-9"
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        'block h-6 w-6 rounded-full transition-transform duration-150',
                        isCoatActive
                          ? 'ring-2 ring-ns-honey ring-offset-2 ring-offset-ns-ivory'
                          : 'ring-1 ring-[var(--ns-hairline)] [@media(hover:hover)]:hover:scale-105',
                      ].join(' ')}
                      style={{
                        background: `linear-gradient(135deg, ${variant.baseColor} 55%, ${variant.earOuterColor} 55%)`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-2 max-w-[48ch] text-base leading-relaxed text-ns-ink-secondary">
            {activeBreed.summary}
          </p>

          <div
            role="tablist"
            aria-label="Cat breeds"
            className="mt-6 flex flex-wrap gap-x-5 gap-y-1 border-t border-[var(--ns-hairline)] pt-5"
          >
            {BREEDS.map((breed) => {
              const isSelected = breed.id === activeBreed.id;
              return (
                <button
                  key={breed.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectBreed(breed.id)}
                  className={[
                    'ns-pressable inline-flex min-h-[40px] cursor-pointer items-center text-sm transition-colors duration-150',
                    isSelected
                      ? 'font-semibold text-ns-ink underline decoration-ns-honey decoration-2 underline-offset-4'
                      : 'font-normal text-ns-ink-tertiary [@media(hover:hover)]:hover:text-ns-ink',
                  ].join(' ')}
                >
                  {breed.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreedShowcase;
