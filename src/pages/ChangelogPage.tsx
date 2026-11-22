import { CHANGELOG } from '../data/changelog';

export interface ChangelogPageProps {
  onOpenDownload: () => void;
}

export function ChangelogPage({ onOpenDownload }: ChangelogPageProps) {
  return (
    <div className="min-h-[100dvh] bg-ns-base pt-20 pb-28 sm:pt-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <header className="max-w-xl">
          <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ns-ink">
            What&apos;s new.
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-ns-ink-secondary">
            Every update to NekoScape for Windows.
          </p>
        </header>

        <div className="mt-16 divide-y divide-[var(--ns-hairline)] border-t border-[var(--ns-hairline)]">
          {CHANGELOG.map((entry) => (
            <article
              key={entry.version}
              className="grid gap-6 py-12 sm:grid-cols-[170px_1fr] sm:gap-10"
            >
              <div>
                <p className="ns-tabular font-mono text-sm font-semibold text-ns-ink">
                  Version {entry.version}
                </p>
                <p className="mt-1 text-sm text-ns-ink-tertiary">{entry.date}</p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ns-ink">
                  {entry.title}
                </h2>
                <ul className="mt-4 space-y-2.5 text-base leading-relaxed text-ns-ink-secondary">
                  {entry.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-[var(--ns-hairline)] pt-12 sm:flex-row sm:items-center">
          <p className="font-display text-xl font-semibold tracking-[-0.02em] text-ns-ink">
            Always up to date with the latest build.
          </p>
          <button
            type="button"
            onClick={onOpenDownload}
            className="ns-btn-primary inline-flex min-h-[44px] cursor-pointer items-center rounded-full px-6 text-sm font-semibold"
          >
            Download 2.1.2
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangelogPage;
