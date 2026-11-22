import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CaretRight, Check, Plus } from '@phosphor-icons/react';
import { ScrollExpandHero } from '../components/ScrollExpandHero';
import { ImageScrollSequence } from '../components/ImageScrollSequence';
import { SceneCarousel } from '../components/SceneCarousel';
import { FeaturesBento } from '../components/FeaturesBento';
import { BreedShowcase } from '../components/BreedShowcase';
import { PRICING_TIERS } from '../data/pricing';
import { FAQ_ITEMS } from '../data/faq';

export interface HomePageProps {
  onOpenDownload: () => void;
}

export function HomePage({ onOpenDownload }: HomePageProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  return (
    <div className="bg-ns-base text-ns-ink">
      <ScrollExpandHero onOpenDownload={onOpenDownload} />

      <ImageScrollSequence />

      <section aria-labelledby="scenes-heading" className="py-24 sm:py-32">
        <div className="mx-auto mb-12 flex max-w-6xl flex-col justify-between gap-4 px-5 sm:flex-row sm:items-end sm:px-8">
          <div className="max-w-xl">
            <h2
              id="scenes-heading"
              className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ns-ink"
            >
              Thirteen quiet rooms.
            </h2>
            <p className="mt-3 text-lg text-ns-ink-secondary">
              From sunlit wooden studies to rainy window sills and moonlit balconies.
            </p>
          </div>

          <Link
            to="/scenes"
            className="inline-flex min-h-[44px] items-center gap-1 self-start text-sm font-medium text-ns-honey-hover transition-colors duration-150 [@media(hover:hover)]:hover:text-ns-ink sm:self-auto"
          >
            <span>View all scenes</span>
            <CaretRight size={15} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        <SceneCarousel lightingMode="golden" linkToScenes />
      </section>

      <section
        id="features"
        aria-labelledby="features-heading"
        className="scroll-mt-20 border-t border-[var(--ns-hairline)] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-xl">
            <h2
              id="features-heading"
              className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ns-ink"
            >
              Designed to stay out of your way.
            </h2>
            <p className="mt-3 text-lg text-ns-ink-secondary">
              Everything feels natural, responsive, and calm.
            </p>
          </div>

          <FeaturesBento />

          <div className="mt-24 border-t border-[var(--ns-hairline)] pt-20">
            <BreedShowcase />
          </div>
        </div>
      </section>

      <section
        id="pricing"
        aria-labelledby="pricing-heading"
        className="scroll-mt-20 border-t border-[var(--ns-hairline)] bg-ns-elevated/40 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2
              id="pricing-heading"
              className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ns-ink"
            >
              Pay once. Keep forever.
            </h2>
            <p className="mt-3 text-lg text-ns-ink-secondary">
              Start free, or unlock every room and breed with no subscriptions.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={[
                  'flex flex-col justify-between rounded-[22px] p-7 sm:p-8',
                  tier.recommended ? 'bg-ns-ivory' : 'bg-ns-base/80',
                ].join(' ')}
                style={{
                  boxShadow: tier.recommended
                    ? 'var(--ns-specular-top), var(--ns-shadow-elevated)'
                    : 'var(--ns-specular-top), 0 0 0 1px var(--ns-hairline)',
                }}
              >
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ns-ink">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-ns-ink-secondary">{tier.summary}</p>

                  <div className="mt-6 flex items-baseline gap-2.5">
                    <span className="ns-tabular font-display text-4xl font-bold tracking-[-0.03em] text-ns-ink">
                      {tier.priceLabel}
                    </span>
                    <span className="text-sm text-ns-ink-tertiary">{tier.cadence}</span>
                  </div>

                  <ul className="mt-7 space-y-3 border-t border-[var(--ns-hairline)] pt-6 text-sm text-ns-ink-secondary">
                    {tier.highlights.map((line) => (
                      <li key={line} className="flex items-start gap-2.5">
                        <Check
                          size={16}
                          weight="bold"
                          className="mt-0.5 shrink-0 text-ns-honey-hover"
                          aria-hidden="true"
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={onOpenDownload}
                  className={[
                    'mt-8 inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold',
                    tier.recommended ? 'ns-btn-primary' : 'ns-btn-secondary',
                  ].join(' ')}
                >
                  {tier.ctaLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="scroll-mt-20 border-t border-[var(--ns-hairline)] py-24 sm:py-32"
      >
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2
              id="faq-heading"
              className="font-display text-[clamp(2.5rem,5vw,3.75rem)] font-extrabold leading-none tracking-[-0.03em] text-ns-ink"
            >
              FAQ
            </h2>
            <p className="mt-4 max-w-[26ch] text-base leading-relaxed text-ns-ink-secondary">
              Questions, answered. Have more questions? Don&apos;t hesitate to{' '}
              <a
                href="mailto:support@nekoscape.app"
                className="font-semibold text-ns-ink underline decoration-ns-ink/40 underline-offset-4 transition-colors duration-150 [@media(hover:hover)]:hover:decoration-ns-honey"
              >
                contact us
              </a>
              .
            </p>
          </div>

          <div className="divide-y divide-[var(--ns-hairline)] border-y border-[var(--ns-hairline)]">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              const panelId = `faq-panel-${item.id}`;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="flex min-h-[68px] w-full cursor-pointer items-center justify-between gap-6 py-6 text-left sm:py-7"
                  >
                    <span className="font-display text-base font-semibold tracking-[-0.015em] text-ns-ink sm:text-lg">
                      {item.question}
                    </span>
                    <Plus
                      size={18}
                      weight="regular"
                      aria-hidden="true"
                      className="shrink-0 text-ns-ink-tertiary transition-transform duration-200 ease-[var(--ease-out)]"
                      style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  <div
                    id={panelId}
                    className="grid transition-[grid-template-rows] duration-250 ease-[var(--ease-out)]"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[60ch] pb-7 text-base leading-relaxed text-ns-ink-secondary">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-label="Download NekoScape" className="border-t border-[var(--ns-hairline)] py-24 sm:py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ns-ink">
              Ready for a calmer desktop?
            </h2>
            <p className="mt-3 text-lg text-ns-ink-secondary">
              Download NekoScape free for Windows 10 and Windows 11.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenDownload}
            className="ns-btn-primary inline-flex min-h-[48px] cursor-pointer items-center rounded-full px-7 text-sm font-semibold"
          >
            Download for Windows
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
