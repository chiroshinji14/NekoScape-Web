import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { List, X } from '@phosphor-icons/react';
import { useLenis } from '../hooks/useLenis';

export interface NavbarProps {
  onOpenDownload: () => void;
}

type NavEntry =
  | { kind: 'hash'; hash: string; label: string }
  | { kind: 'route'; to: string; label: string };

const NAV_ENTRIES: readonly NavEntry[] = [
  { kind: 'hash', hash: '#features', label: 'Features' },
  { kind: 'route', to: '/scenes', label: 'Scenes' },
  { kind: 'hash', hash: '#pricing', label: 'Pricing' },
  { kind: 'hash', hash: '#faq', label: 'FAQ' },
  { kind: 'route', to: '/changelog', label: 'Changelog' },
];

export function Navbar({ onOpenDownload }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hiddenByHero, setHiddenByHero] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollTo, reducedMotion } = useLenis();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const isHomeView = location.pathname === '/' || location.pathname === '/download';
    if (!isHomeView) {
      setHiddenByHero(false);
      return;
    }

    let rafId = 0;
    let cachedStage: HTMLElement | null = document.querySelector<HTMLElement>('[data-hero-stage]');
    let cachedNavHeight = headerRef.current?.offsetHeight ?? 56;
    let pinnedHeroHidden: boolean | null = null;

    const evaluateVisibility = () => {
      rafId = 0;
      if (!cachedStage || !cachedStage.isConnected) {
        cachedStage = document.querySelector<HTMLElement>('[data-hero-stage]');
      }
      if (!cachedStage) {
        setHiddenByHero(false);
        return;
      }

      const threshold = cachedNavHeight + 16;
      const rect = cachedStage.getBoundingClientRect();
      const isOverHero = rect.top <= threshold && rect.bottom > threshold;
      const nextHidden = pinnedHeroHidden === true ? isOverHero || rect.bottom > threshold : isOverHero;
      setHiddenByHero((prev) => (prev === nextHidden ? prev : nextHidden));
    };

    const scheduleEvaluate = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(evaluateVisibility);
    };

    const handleResize = () => {
      cachedNavHeight = headerRef.current?.offsetHeight ?? 56;
      scheduleEvaluate();
    };

    const handlePinnedHero = (event: Event) => {
      const hidden = (event as CustomEvent<{ hidden: boolean }>).detail?.hidden ?? false;
      pinnedHeroHidden = hidden;
      if (hidden) {
        setHiddenByHero((prev) => (prev ? prev : true));
      } else {
        scheduleEvaluate();
      }
    };

    evaluateVisibility();
    window.addEventListener('scroll', scheduleEvaluate, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('ns:hero-nav-hide', handlePinnedHero);

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', scheduleEvaluate);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('ns:hero-nav-hide', handlePinnedHero);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const handleHashNav = (hash: string) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      if (location.hash !== hash) {
        navigate(`/${hash}`, { replace: true });
      } else {
        scrollTo(hash, { offset: -72, immediate: reducedMotion });
      }
      return;
    }

    navigate(`/${hash}`);
  };

  const handleBrandClick = () => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      scrollTo(0, { immediate: reducedMotion });
    }
  };

  const handleMobileDownload = () => {
    setMobileOpen(false);
    onOpenDownload();
  };

  const isCurtainedUp = hiddenByHero && !mobileOpen && !hasFocusWithin;

  return (
    <header
      ref={headerRef}
      onFocus={() => setHasFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHasFocusWithin(false);
        }
      }}
      className={[
        'sticky top-0 z-40 w-full ns-nav-curtain',
        isCurtainedUp ? 'ns-nav-curtain--hidden' : '',
      ].join(' ')}
    >
      <div className="ns-glass-nav">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            to="/"
            onClick={handleBrandClick}
            className="ns-pressable inline-flex min-h-[44px] items-center gap-2.5 text-ns-ink"
          >
            <img
              src="/assets/nekoscape-logo.webp"
              width={26}
              height={26}
              alt="NekoScape"
              className="h-[26px] w-[26px] object-contain"
            />
            <span className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ns-ink">
              NekoScape
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
            {NAV_ENTRIES.map((entry) => {
              if (entry.kind === 'route') {
                return (
                  <NavLink
                    key={entry.to}
                    to={entry.to}
                    className={({ isActive }) =>
                      [
                        'inline-flex min-h-[44px] items-center text-[14px] font-medium transition-colors duration-150 ease-[var(--ease-out)]',
                        isActive
                          ? 'text-ns-ink'
                          : 'text-ns-ink-secondary [@media(hover:hover)]:hover:text-ns-ink',
                      ].join(' ')
                    }
                  >
                    {entry.label}
                  </NavLink>
                );
              }

              const isHashActive = location.pathname === '/' && location.hash === entry.hash;
              return (
                <button
                  key={entry.hash}
                  type="button"
                  onClick={() => handleHashNav(entry.hash)}
                  className={[
                    'inline-flex min-h-[44px] cursor-pointer items-center text-[14px] font-medium transition-colors duration-150 ease-[var(--ease-out)]',
                    isHashActive
                      ? 'text-ns-ink'
                      : 'text-ns-ink-secondary [@media(hover:hover)]:hover:text-ns-ink',
                  ].join(' ')}
                >
                  {entry.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenDownload}
              className="ns-btn-primary inline-flex min-h-[36px] cursor-pointer items-center rounded-full px-4 text-[13px] font-semibold"
            >
              Download
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              className="ns-pressable inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center text-ns-ink md:hidden"
            >
              {mobileOpen ? (
                <X size={20} weight="regular" aria-hidden="true" />
              ) : (
                <List size={20} weight="regular" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav-drawer"
          className="border-b border-[var(--ns-hairline)] bg-ns-base/98 px-5 py-4 backdrop-blur-xl md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col">
            {NAV_ENTRIES.map((entry) => {
              if (entry.kind === 'route') {
                return (
                  <NavLink
                    key={entry.to}
                    to={entry.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex min-h-[44px] items-center text-base font-medium',
                        isActive ? 'text-ns-ink' : 'text-ns-ink-secondary',
                      ].join(' ')
                    }
                  >
                    {entry.label}
                  </NavLink>
                );
              }

              return (
                <button
                  key={entry.hash}
                  type="button"
                  onClick={() => handleHashNav(entry.hash)}
                  className="flex min-h-[44px] w-full cursor-pointer items-center text-left text-base font-medium text-ns-ink-secondary"
                >
                  {entry.label}
                </button>
              );
            })}
          </nav>

          <div className="ns-hairline-t mt-3 pt-4">
            <button
              type="button"
              onClick={handleMobileDownload}
              className="ns-btn-primary flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold"
            >
              Download for Windows
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
