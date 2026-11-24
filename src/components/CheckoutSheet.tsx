import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, CreditCard, LockSimple, WarningCircle, X } from '@phosphor-icons/react';
import { PRICING_TIERS } from '../data/pricing';
import { useAnimatedModal } from '../hooks/useAnimatedModal';

export interface CheckoutSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDownload: () => void;
}

interface CreateCheckoutResponse {
  ok?: boolean;
  url?: string;
  error?: string;
}

const PRO_TIER = PRICING_TIERS.find((tier) => tier.id === 'pro') ?? PRICING_TIERS[1];

export function CheckoutSheet({ isOpen, onClose, onOpenDownload }: CheckoutSheetProps) {
  const titleId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleAfterClose = useCallback(() => {
    setIsSubmitting(false);
    setErrorMessage(null);
  }, []);

  const { shouldRender, entered } = useAnimatedModal(isOpen, {
    exitDurationMs: 180,
    onAfterClose: handleAfterClose,
  });

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleCheckout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type') ?? '';
      let data: CreateCheckoutResponse = {};
      if (contentType.includes('application/json')) {
        data = (await response.json()) as CreateCheckoutResponse;
      }

      if (!response.ok || !data.ok || !data.url) {
        if (response.status === 404 || response.status === 503 || !contentType.includes('application/json')) {
          throw new Error(
            'Online checkout isn’t available right now. If you already have a license key, you can download NekoScape below.',
          );
        }
        throw new Error(data.error || 'Unable to start checkout right now.');
      }

      window.location.assign(data.url);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to connect to checkout. Please try again in a moment.';
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  const handleJumpToDownload = () => {
    onClose();
    onOpenDownload();
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close checkout modal"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        className="fixed inset-0 cursor-default bg-ns-ink/30 backdrop-blur-sm"
        style={{
          opacity: entered ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: entered ? '240ms' : '160ms',
          transitionTimingFunction: 'var(--ease-out)',
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-[24px] bg-ns-ivory p-7 text-ns-ink will-change-[transform,opacity] sm:p-8"
        style={{
          boxShadow: 'var(--ns-specular-top), var(--ns-shadow-elevated)',
          transform: entered ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 14px, 0) scale(0.95)',
          opacity: entered ? 1 : 0,
          transitionProperty: 'transform, opacity',
          transitionDuration: entered ? '240ms' : '160ms',
          transitionTimingFunction: 'var(--ease-out)',
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
            <div>
              <h2
                id={titleId}
                className="font-display text-2xl font-bold tracking-[-0.025em] text-ns-ink"
              >
                NekoScape Pro
              </h2>
              <p className="ns-tabular text-sm font-medium text-ns-ink-secondary">
                {PRO_TIER.priceLabel} · {PRO_TIER.cadence}
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close checkout modal"
            className="ns-pressable inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full text-ns-ink-secondary disabled:cursor-not-allowed disabled:opacity-50 [@media(hover:hover)]:hover:bg-ns-control/60 [@media(hover:hover)]:hover:text-ns-ink"
          >
            <X size={20} weight="regular" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ns-ink-secondary">
          Get your license key right after checkout—no account needed.
        </p>

        <ul className="mt-5 space-y-2.5 rounded-2xl bg-ns-elevated/65 p-4 text-sm text-ns-ink-secondary">
          {PRO_TIER.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check
                size={16}
                weight="bold"
                className="mt-0.5 shrink-0 text-ns-honey-hover"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-2xl bg-ns-coral/10 px-4 py-3 text-sm text-ns-ink"
            style={{ boxShadow: '0 0 0 1px rgba(200, 70, 50, 0.24)' }}
          >
            <WarningCircle
              size={18}
              weight="fill"
              className="mt-0.5 shrink-0 text-ns-coral"
              aria-hidden="true"
            />
            <p className="leading-relaxed text-ns-ink-secondary">{errorMessage}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCheckout}
            className="ns-btn-primary inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold disabled:cursor-wait disabled:opacity-75"
          >
            <CreditCard size={18} weight="bold" aria-hidden="true" />
            <span>{isSubmitting ? 'Opening Checkout…' : 'Continue to Checkout — $2.49'}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleJumpToDownload}
            className="ns-btn-secondary inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-full px-5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            Already have a key? Download NekoScape
          </button>
        </div>

        <p className="mt-5 flex items-center gap-1.5 text-xs text-ns-ink-tertiary">
          <LockSimple size={14} weight="duotone" aria-hidden="true" />
          <span>Secure one-time payment. Yours to keep forever.</span>
        </p>
      </div>
    </div>
  );
}

export default CheckoutSheet;
