import { useEffect, useId, useRef, useState } from 'react';
import { CheckCircle, DownloadSimple, X } from '@phosphor-icons/react';

export interface DownloadSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type BuildKind = 'installer' | 'portable';

export function DownloadSheet({ isOpen, onClose }: DownloadSheetProps) {
  const titleId = useId();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [entered, setEntered] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState<BuildKind | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const raf = requestAnimationFrame(() => {
        setEntered(true);
      });
      return () => cancelAnimationFrame(raf);
    }

    setEntered(false);
    const timer = window.setTimeout(() => {
      setShouldRender(false);
      setSelectedBuild(null);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close download sheet"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-ns-ink/30 backdrop-blur-sm transition-opacity duration-200 ease-[var(--ease-out)]"
        style={{ opacity: entered ? 1 : 0 }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-[24px] bg-ns-ivory p-7 text-ns-ink transition-[transform,opacity] duration-200 ease-[var(--ease-out)] sm:p-8"
        style={{
          boxShadow: 'var(--ns-specular-top), var(--ns-shadow-elevated)',
          transform: entered ? 'scale(1)' : 'scale(0.95)',
          opacity: entered ? 1 : 0,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/nekoscape-logo.webp"
              width={36}
              height={36}
              alt="NekoScape"
              className="h-9 w-9 object-contain"
            />
            <h2
              id={titleId}
              className="font-display text-2xl font-bold tracking-[-0.025em] text-ns-ink"
            >
              Download NekoScape
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close download modal"
            className="ns-pressable inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full text-ns-ink-secondary [@media(hover:hover)]:hover:bg-ns-control/60 [@media(hover:hover)]:hover:text-ns-ink"
          >
            <X size={20} weight="regular" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-3 text-base leading-relaxed text-ns-ink-secondary">
          Ready for Windows 10 and Windows 11. Free to start, with a quick guided setup.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setSelectedBuild('installer')}
            className="ns-btn-primary inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold"
          >
            <DownloadSimple size={18} weight="bold" aria-hidden="true" />
            <span>Download Installer for Windows</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedBuild('portable')}
            className="ns-btn-secondary inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-full px-5 text-sm font-medium"
          >
            Download Portable ZIP
          </button>
        </div>

        {selectedBuild ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 flex items-start gap-2.5 rounded-2xl bg-ns-elevated/80 px-4 py-3 text-sm text-ns-ink-secondary"
          >
            <CheckCircle
              size={18}
              weight="fill"
              className="mt-0.5 shrink-0 text-ns-sage"
              aria-hidden="true"
            />
            <p>
              {selectedBuild === 'installer'
                ? 'NekoScape-Setup.exe (18.4 MB) is ready. Open it to set up your first room.'
                : 'NekoScape-win-x64.zip (19.1 MB) is ready. Unzip anywhere and run NekoScape.exe.'}
            </p>
          </div>
        ) : null}

        <p className="mt-5 text-xs text-ns-ink-tertiary">
          Version 2.1.2 for 64-bit Windows. Restores your wallpaper cleanly on exit.
        </p>
      </div>
    </div>
  );
}

export default DownloadSheet;
