import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLenis } from '../hooks/useLenis';

export interface FooterProps {
  onOpenDownload: () => void;
}

export function Footer({ onOpenDownload }: FooterProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollTo, reducedMotion } = useLenis();

  const handleHashLink = (hash: string) => {
    if (location.pathname === '/') {
      const target = document.querySelector<HTMLElement>(hash);
      if (target) {
        scrollTo(target, { offset: -72, immediate: reducedMotion });
      }
      navigate(`/${hash}`, { replace: true });
      return;
    }
    navigate(`/${hash}`);
  };

  return (
    <footer
      className="bg-ns-base text-ns-ink"
      style={{ borderTop: '1px solid rgba(58, 40, 27, 0.11)' }}
    >
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <Link
            to="/"
            className="ns-pressable inline-flex min-h-[44px] items-center gap-2.5 text-ns-ink"
          >
            <img
              src="/assets/nekoscape-logo.png"
              width={24}
              height={24}
              alt="NekoScape"
              className="h-6 w-6 object-contain"
            />
            <span className="font-display text-base font-semibold tracking-[-0.02em]">
              NekoScape
            </span>
          </Link>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ns-ink-secondary"
          >
            <button
              type="button"
              onClick={() => handleHashLink('#features')}
              className="inline-flex min-h-[44px] cursor-pointer items-center transition-colors duration-150 [@media(hover:hover)]:hover:text-ns-ink"
            >
              Features
            </button>
            <Link
              to="/scenes"
              className="inline-flex min-h-[44px] items-center transition-colors duration-150 [@media(hover:hover)]:hover:text-ns-ink"
            >
              Scenes
            </Link>
            <button
              type="button"
              onClick={() => handleHashLink('#pricing')}
              className="inline-flex min-h-[44px] cursor-pointer items-center transition-colors duration-150 [@media(hover:hover)]:hover:text-ns-ink"
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => handleHashLink('#faq')}
              className="inline-flex min-h-[44px] cursor-pointer items-center transition-colors duration-150 [@media(hover:hover)]:hover:text-ns-ink"
            >
              FAQ
            </button>
            <Link
              to="/changelog"
              className="inline-flex min-h-[44px] items-center transition-colors duration-150 [@media(hover:hover)]:hover:text-ns-ink"
            >
              Changelog
            </Link>
            <button
              type="button"
              onClick={onOpenDownload}
              className="inline-flex min-h-[44px] cursor-pointer items-center font-medium text-ns-honey-hover transition-colors duration-150 [@media(hover:hover)]:hover:text-ns-ink"
            >
              Download
            </button>
          </nav>
        </div>

        <p className="mt-8 text-xs text-ns-ink-tertiary">
          Built for Windows 10 and Windows 11. Runs quietly offline.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
