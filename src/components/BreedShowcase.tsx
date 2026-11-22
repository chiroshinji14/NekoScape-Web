import { useState } from 'react';
import { BREEDS } from '../data/breeds';
import type { BreedDefinition } from '../types/nekoscape';

function BreedPortrait({ breed, isKitten }: { breed: BreedDefinition; isKitten: boolean }) {
  const scale = isKitten ? 0.78 : 1;

  const renderEars = () => {
    switch (breed.earStyle) {
      case 'folded':
        return (
          <g>
            <path d="M58 64 C52 46 66 42 74 56 Z" fill={breed.accentColor} />
            <path d="M122 64 C128 46 114 42 106 56 Z" fill={breed.accentColor} />
          </g>
        );
      case 'bat':
        return (
          <g>
            <path d="M56 72 L38 26 L78 52 Z" fill={breed.accentColor} />
            <path d="M124 72 L142 26 L102 52 Z" fill={breed.accentColor} />
          </g>
        );
      case 'tufted':
        return (
          <g>
            <path d="M56 68 L48 26 L79 52 Z" fill={breed.accentColor} />
            <path d="M124 68 L132 26 L101 52 Z" fill={breed.accentColor} />
            <path d="M48 26 L44 18 M132 26 L136 18" stroke={breed.accentColor} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'curled':
        return (
          <g>
            <path d="M57 68 C46 52 50 32 64 38 C70 41 75 48 79 53 Z" fill={breed.accentColor} />
            <path d="M123 68 C134 52 130 32 116 38 C110 41 105 48 101 53 Z" fill={breed.accentColor} />
          </g>
        );
      case 'rounded':
        return (
          <g>
            <path d="M57 68 C50 44 62 38 78 53 Z" fill={breed.accentColor} />
            <path d="M123 68 C130 44 118 38 102 53 Z" fill={breed.accentColor} />
          </g>
        );
      default:
        return (
          <g>
            <path d="M57 68 L52 30 L80 53 Z" fill={breed.accentColor} />
            <path d="M123 68 L128 30 L100 53 Z" fill={breed.accentColor} />
          </g>
        );
    }
  };

  const renderTail = () => {
    if (breed.tailStyle === 'bobtail') {
      return <circle cx="144" cy="126" r="14" fill={breed.accentColor} />;
    }
    if (breed.tailStyle === 'plume') {
      return (
        <path
          d="M126 132 C154 132 162 104 146 86"
          fill="none"
          stroke={breed.accentColor}
          strokeWidth="15"
          strokeLinecap="round"
        />
      );
    }
    return (
      <path
        d="M126 132 C152 132 160 108 148 92"
        fill="none"
        stroke={breed.accentColor}
        strokeWidth={breed.tailStyle === 'plush' ? '11' : '7.5'}
        strokeLinecap="round"
      />
    );
  };

  return (
    <svg
      viewBox="0 0 180 165"
      width={180}
      height={165}
      aria-hidden="true"
      className="h-36 w-40 transition-transform duration-300 ease-[var(--ease-out)] sm:h-40 sm:w-44"
      style={{ transform: `scale(${scale})` }}
    >
      <ellipse cx="90" cy="146" rx="50" ry="10" fill="rgba(58, 38, 24, 0.1)" />
      {renderTail()}
      <ellipse cx="90" cy="116" rx="44" ry="30" fill={breed.furColor} />
      {renderEars()}
      <circle cx="90" cy="76" r="32" fill={breed.furColor} />
      <circle cx="77" cy="74" r={isKitten ? 5 : 4.2} fill={breed.eyeColor} />
      <circle cx="103" cy="74" r={isKitten ? 5 : 4.2} fill={breed.eyeColor} />
      <circle cx="78.5" cy="72.5" r="1.4" fill="#FFF9F1" />
      <circle cx="104.5" cy="72.5" r="1.4" fill="#FFF9F1" />
      <path d="M87 83 L93 83 L90 86.5 Z" fill={breed.accentColor} opacity="0.7" />
      <path
        d="M84 89 Q90 93 96 89"
        fill="none"
        stroke={breed.accentColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

export function BreedShowcase() {
  const [activeId, setActiveId] = useState<BreedDefinition['id']>('persian');
  const [isKitten, setIsKitten] = useState(false);

  const activeBreed = BREEDS.find((b) => b.id === activeId) ?? BREEDS[0];

  return (
    <div id="breeds" className="scroll-mt-24">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h3 className="font-display text-[clamp(1.75rem,3.2vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.025em] text-ns-ink">
            Fourteen breeds to adopt.
          </h3>
          <p className="mt-2 text-base text-ns-ink-secondary">
            Each with its own shape, stride, and temperament.
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

      <div className="mt-8 grid items-center gap-8 rounded-[22px] bg-ns-ivory p-7 sm:p-10 lg:grid-cols-[220px_1fr]"
        style={{ boxShadow: 'var(--ns-specular-top), var(--ns-shadow-ambient)' }}
      >
        <div className="flex flex-col items-center justify-center">
          <BreedPortrait breed={activeBreed} isKitten={isKitten} />
        </div>

        <div>
          <h4 className="font-display text-2xl font-bold tracking-[-0.02em] text-ns-ink sm:text-3xl">
            {activeBreed.label}
          </h4>
          <p className="mt-2 max-w-[46ch] text-base leading-relaxed text-ns-ink-secondary">
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
                  onClick={() => setActiveId(breed.id)}
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
