import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Copy,
  DownloadSimple,
  Key,
  WarningCircle,
} from '@phosphor-icons/react';

export interface CheckoutSuccessPageProps {
  onOpenDownload: () => void;
}

interface VerifiedLicenseResponse {
  ok: boolean;
  tier: 'pro';
  licenseKey: string;
  activateUri: string;
  customerEmailMasked: string | null;
  installerPath: string;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: VerifiedLicenseResponse };

export function CheckoutSuccessPage({ onOpenDownload }: CheckoutSuccessPageProps) {
  const [searchParams] = useSearchParams();
  const checkoutId =
    (searchParams.get('checkout_id') ?? searchParams.get('session_id'))?.trim() ?? '';
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [copied, setCopied] = useState(false);

  const loadLicense = useCallback(
    async (attempt = 0, signal?: AbortSignal) => {
      if (!checkoutId) {
        setState({
          status: 'error',
          message: 'We couldn’t find your purchase details in this link.',
        });
        return;
      }

      setState({ status: 'loading' });

      try {
        const response = await fetch(
          `/api/license?checkout_id=${encodeURIComponent(checkoutId)}`,
          {
            cache: 'no-store',
            signal,
          },
        );
        const contentType = response.headers.get('content-type') ?? '';
        if (!contentType.includes('application/json')) {
          throw new Error(
            'Purchase confirmation isn’t available right now. Please try again in a moment.',
          );
        }

        const payload = (await response.json()) as Partial<VerifiedLicenseResponse> & {
          error?: string;
        };

        if (response.status === 409 && attempt < 4 && !signal?.aborted) {
          window.setTimeout(() => {
            if (!signal?.aborted) {
              void loadLicense(attempt + 1, signal);
            }
          }, 1500);
          return;
        }

        if (!response.ok || !payload.ok || !payload.licenseKey || !payload.activateUri) {
          throw new Error(payload.error || 'Could not verify your checkout session.');
        }

        setState({
          status: 'ready',
          data: {
            ok: true,
            tier: 'pro',
            licenseKey: payload.licenseKey,
            activateUri: payload.activateUri,
            customerEmailMasked: payload.customerEmailMasked ?? null,
            installerPath: payload.installerPath ?? '/download',
          },
        });
      } catch (error) {
        if (signal?.aborted) {
          return;
        }
        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to verify your NekoScape Pro purchase right now.',
        });
      }
    },
    [checkoutId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadLicense(0, controller.signal);
    return () => controller.abort();
  }, [loadLicense]);

  const handleCopyKey = async (licenseKey: string) => {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-ns-base pt-20 pb-28 sm:pt-24">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-ns-ink-secondary transition-colors duration-150 [@media(hover:hover)]:hover:text-ns-ink"
        >
          <ArrowLeft size={16} weight="bold" aria-hidden="true" />
          <span>Back to NekoScape</span>
        </Link>

        <section
          aria-live="polite"
          className="mt-6 rounded-[24px] bg-ns-ivory p-7 sm:p-9"
          style={{
            boxShadow: 'var(--ns-specular-top), var(--ns-shadow-elevated)',
          }}
        >
          {state.status === 'loading' ? (
            <div className="py-6">
              <p className="font-mono text-xs font-semibold tracking-wider text-ns-honey-hover uppercase">
                Verifying purchase
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-ns-ink">
                Confirming your purchase…
              </h1>
              <p className="mt-3 text-base leading-relaxed text-ns-ink-secondary">
                Getting your NekoScape Pro license key ready. This usually takes a second.
              </p>
            </div>
          ) : null}

          {state.status === 'error' ? (
            <div className="py-2">
              <div className="flex items-center gap-2.5 text-ns-coral">
                <WarningCircle size={22} weight="fill" aria-hidden="true" />
                <span className="text-sm font-semibold">Verification incomplete</span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-ns-ink">
                Unable to retrieve license key
              </h1>
              <p className="mt-3 text-base leading-relaxed text-ns-ink-secondary">{state.message}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                {checkoutId ? (
                  <button
                    type="button"
                    onClick={() => void loadLicense()}
                    className="ns-btn-primary inline-flex min-h-[44px] cursor-pointer items-center rounded-full px-6 text-sm font-semibold"
                  >
                    Try again
                  </button>
                ) : null}
                <Link
                  to="/#pricing"
                  className="ns-btn-secondary inline-flex min-h-[44px] items-center rounded-full px-6 text-sm font-semibold"
                >
                  Return to Pricing
                </Link>
                <button
                  type="button"
                  onClick={onOpenDownload}
                  className="ns-btn-secondary inline-flex min-h-[44px] cursor-pointer items-center rounded-full px-6 text-sm font-semibold"
                >
                  Download Installer
                </button>
              </div>
            </div>
          ) : null}

          {state.status === 'ready' ? (
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-ns-sage/12 px-3.5 py-1.5 text-xs font-semibold text-ns-sage">
                <CheckCircle size={16} weight="fill" aria-hidden="true" />
                <span>NekoScape Pro Unlocked</span>
              </div>

              <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-ns-ink sm:text-4xl">
                Your Pro license key is ready.
              </h1>

              <p className="mt-2.5 text-base leading-relaxed text-ns-ink-secondary">
                Save this key somewhere safe—it works right on your PC with no account needed.
                {state.data.customerEmailMasked
                  ? ` Receipt verified for ${state.data.customerEmailMasked}.`
                  : ''}
              </p>

              <div
                className="mt-6 rounded-2xl bg-ns-elevated/70 p-4 sm:p-5"
                style={{ boxShadow: 'inset 0 0 0 1px var(--ns-hairline)' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold tracking-wide text-ns-ink-tertiary uppercase">
                    Your License Key
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCopyKey(state.data.licenseKey)}
                    className="ns-pressable inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full bg-ns-ivory px-3.5 text-xs font-semibold text-ns-ink shadow-xs"
                    style={{ boxShadow: '0 0 0 1px var(--ns-hairline)' }}
                  >
                    {copied ? (
                      <>
                        <Check size={14} weight="bold" className="text-ns-sage" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} weight="bold" aria-hidden="true" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-3 select-all break-all font-mono text-sm leading-relaxed font-medium text-ns-ink sm:text-[15px]">
                  {state.data.licenseKey}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={state.data.activateUri}
                  className="ns-btn-primary inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold"
                >
                  <Key size={18} weight="bold" aria-hidden="true" />
                  <span>Activate in NekoScape</span>
                </a>

                <button
                  type="button"
                  onClick={onOpenDownload}
                  className="ns-btn-secondary inline-flex min-h-[48px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold"
                >
                  <DownloadSimple size={18} weight="bold" aria-hidden="true" />
                  <span>Download NekoScape</span>
                </button>
              </div>

              <div className="mt-8 border-t border-[var(--ns-hairline)] pt-6">
                <h2 className="font-display text-lg font-semibold tracking-[-0.015em] text-ns-ink">
                  Activate in 3 quick steps
                </h2>
                <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-ns-ink-secondary">
                  <li>
                    <span className="font-semibold text-ns-ink">1. Download &amp; install</span>{' '}
                    NekoScape if you haven&apos;t installed it yet.
                  </li>
                  <li>
                    <span className="font-semibold text-ns-ink">2. Open NekoScape</span> on Windows
                    10 or Windows 11.
                  </li>
                  <li>
                    <span className="font-semibold text-ns-ink">3. Unlock Pro</span> by clicking{' '}
                    <strong className="font-semibold text-ns-ink">Activate in NekoScape</strong>{' '}
                    above, or paste your key in{' '}
                    <span className="font-semibold text-ns-ink">Settings → License</span>.
                  </li>
                </ol>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default CheckoutSuccessPage;
