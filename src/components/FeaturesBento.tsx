import { LockSimple } from '@phosphor-icons/react';

const CARD_STYLE = {
  boxShadow: 'var(--ns-specular-top), 0 0 0 1px var(--ns-hairline), var(--ns-shadow-ambient)',
} as const;

export function FeaturesBento() {
  return (
    <div className="mt-12 space-y-5">
      {/* Top Bento Row: Tall left showcase + right split stack */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* 1. Large Tall Card: Lives behind your icons */}
        <article
          className="group flex flex-col overflow-hidden rounded-[22px] bg-ns-ivory"
          style={CARD_STYLE}
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-ns-elevated lg:min-h-[280px] lg:flex-1">
            <img
              src="/images/feature_1st_image.webp"
              alt="Real Windows desktop icons resting on a soft stone floor mat with NekoScape cats roaming beside them"
              width={1061}
              height={725}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-left transition-transform duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.02]"
            />
          </div>

          <div className="p-6 sm:p-7">
            <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-ns-ink sm:text-2xl">
              Lives behind your icons
            </h3>
            <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ns-ink-secondary sm:text-[15px]">
              Nearby shortcuts coalesce into soft floor mats. Cats perch on edges and sniff new
              files without ever covering an icon or its label.
            </p>
          </div>
        </article>

        {/* Right Stack: Wide Sun-synced split card + 2 compact cards below */}
        <div className="flex flex-col gap-5">
          {/* 2. Top-Right Split Card: Sun-synced */}
          <article
            className="group grid overflow-hidden rounded-[22px] bg-ns-ivory sm:grid-cols-[1.08fr_1fr]"
            style={CARD_STYLE}
          >
            <div className="relative min-h-[190px] overflow-hidden bg-ns-elevated sm:min-h-[210px]">
              {/* Day half (base) */}
              <img
                src="/images/scenes/cafe-day.webp"
                alt="Cat Cafe scene in bright morning daylight"
                width={1920}
                height={1080}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.03]"
              />
              {/* Night half (pixel-aligned right split) */}
              <img
                src="/images/scenes/cafe-night.webp"
                alt="Cat Cafe scene in warm moonlit night lighting"
                width={1920}
                height={1080}
                loading="lazy"
                decoding="async"
                style={{ clipPath: 'inset(0 0 0 50%)' }}
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.03]"
              />
              {/* Crisp center split line */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-ns-ivory/90 shadow-sm"
              />
            </div>

            <div className="flex flex-col justify-center p-6">
              <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-ns-ink sm:text-2xl">
                Sun-synced
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ns-ink-secondary">
                Follows your local clock from morning sun to golden hour and moonlit night,
                lighting lamps and glowing cat eyes after dark.
              </p>
            </div>
          </article>

          {/* 3 & 4. Middle-Right Pair: Featherweight + Private */}
          <div className="grid flex-1 gap-5 sm:grid-cols-2">
            <article
              className="flex flex-col justify-center rounded-[22px] bg-ns-ivory p-6"
              style={CARD_STYLE}
            >
              <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-ns-ink sm:text-2xl">
                Featherweight
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ns-ink-secondary">
                Native Direct2D on Windows. Automatically pauses to ~0% CPU and GPU whenever a
                game, movie, or full-screen window covers your desktop.
              </p>
            </article>

            <article
              className="flex flex-col justify-center rounded-[22px] bg-ns-ivory p-6"
              style={CARD_STYLE}
            >
              <LockSimple
                size={22}
                weight="duotone"
                aria-hidden="true"
                className="mb-2.5 text-ns-honey-hover"
              />
              <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-ns-ink sm:text-2xl">
                Private
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ns-ink-secondary">
                Runs 100% locally on your Windows PC. No accounts, no telemetry, and no keystrokes
                ever logged or stored.
              </p>
            </article>
          </div>
        </div>
      </div>

      {/* Bottom Bento Row: Wide Every Display card + Play anytime & Alive pair */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* 5. Bottom-Left Wide Card: Every display (PC Monitor + Laptop model) */}
        <article
          className="group grid items-center overflow-hidden rounded-[22px] bg-ns-ivory sm:grid-cols-[1.18fr_1fr]"
          style={CARD_STYLE}
        >
          <div className="flex items-end justify-center gap-3 bg-ns-elevated/55 px-5 pt-8 pb-6 sm:h-full">
            {/* Desktop PC Monitor Model */}
            <div className="flex w-[56%] flex-col items-center transition-transform duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:-translate-y-0.5">
              {/* Monitor Bezel + Screen */}
              <div
                className="w-full rounded-[9px] bg-[#221A15] p-[4px] pb-[6px]"
                style={{
                  boxShadow:
                    'inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 12px 24px -8px rgba(34, 24, 17, 0.28)',
                }}
              >
                <div className="aspect-[16/10] w-full overflow-hidden rounded-[5px] bg-ns-elevated">
                  <img
                    src="/images/scenes/garden-day.webp"
                    alt="Desktop PC monitor running NekoScape Sunlit Garden"
                    width={1920}
                    height={1080}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div
                  aria-hidden="true"
                  className="mx-auto mt-[3px] h-[2px] w-[10px] rounded-full bg-ns-ivory/25"
                />
              </div>
              {/* Monitor Stand Neck */}
              <div
                aria-hidden="true"
                className="h-[14px] w-[18%] bg-gradient-to-b from-[#B9A793] to-[#D4C4B2]"
              />
              {/* Monitor Stand Base */}
              <div
                aria-hidden="true"
                className="h-[4px] w-[48%] rounded-full bg-[#C7B5A1]"
                style={{ boxShadow: '0 3px 8px -1px rgba(34, 24, 17, 0.25)' }}
              />
            </div>

            {/* Laptop Model */}
            <div className="flex w-[42%] flex-col items-center transition-transform duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:-translate-y-0.5">
              {/* Laptop Lid + Screen */}
              <div
                className="w-[88%] rounded-t-[7px] bg-[#221A15] p-[3.5px] pb-[4px]"
                style={{
                  boxShadow:
                    'inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 10px 20px -8px rgba(34, 24, 17, 0.24)',
                }}
              >
                <div
                  aria-hidden="true"
                  className="mx-auto mb-[2px] h-[2px] w-[2px] rounded-full bg-ns-ivory/35"
                />
                <div className="aspect-[16/10] w-full overflow-hidden rounded-[3.5px] bg-ns-elevated">
                  <img
                    src="/images/scenes/garden-day.webp"
                    alt="Laptop display running NekoScape Sunlit Garden"
                    width={1920}
                    height={1080}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              {/* Laptop Deck / Base */}
              <div
                aria-hidden="true"
                className="relative h-[6px] w-full rounded-b-[6px] rounded-t-[1px] bg-gradient-to-b from-[#DFD1C0] to-[#BDA995]"
                style={{ boxShadow: '0 4px 10px -2px rgba(34, 24, 17, 0.26)' }}
              >
                <div className="mx-auto h-[2px] w-[22%] rounded-b-full bg-[#9E8B78]/70" />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-ns-ink sm:text-2xl">
              Every display
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ns-ink-secondary">
              Target your primary display, pick any specific screen in a dual or multi-monitor
              setup, or run across all connected displays simultaneously with independent
              per-screen pause.
            </p>
          </div>
        </article>

        {/* 6 & 7. Bottom-Right Pair: Play anytime + Alive */}
        <div className="grid gap-5 sm:grid-cols-2">
          <article
            className="group flex flex-col overflow-hidden rounded-[22px] bg-ns-ivory"
            style={CARD_STYLE}
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-ns-elevated">
              <img
                src="/images/scenes/snowy_window-day.webp"
                alt="Cats chasing a crimson yarn ball and crystal prism on a winter rug"
                width={1920}
                height={1080}
                loading="lazy"
                decoding="async"
                className="h-full w-full scale-[1.18] object-cover object-center transition-transform duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.22]"
              />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-ns-ink">
                Play anytime
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ns-ink-secondary">
                Hold Alt for a laser dot, split beams off a prism, toss the yarn ball, or pet a
                cat right on your wallpaper.
              </p>
            </div>
          </article>

          <article
            className="group flex flex-col overflow-hidden rounded-[22px] bg-ns-ivory"
            style={CARD_STYLE}
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-ns-elevated">
              <img
                src="/images/scenes/aquarium-night.webp"
                alt="Cats lounging beside a glowing aquarium tank at night"
                width={1920}
                height={1080}
                loading="lazy"
                decoding="async"
                className="h-full w-full scale-[1.14] object-cover object-[68%_45%] transition-transform duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.18]"
              />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-ns-ink">
                Alive
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ns-ink-secondary">
                Cats leap into cardboard boxes, watch koi ponds and fish tanks, nap by warm lamps,
                and react when you tidy files.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default FeaturesBento;
