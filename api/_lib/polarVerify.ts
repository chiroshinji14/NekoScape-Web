import crypto from 'node:crypto';

const POLAR_PRODUCTION_API_BASE = 'https://api.polar.sh/v1';
const POLAR_SANDBOX_API_BASE = 'https://sandbox-api.polar.sh/v1';
const DEFAULT_TOLERANCE_SECONDS = 300;
export const PRO_PRICE_CENTS_USD = 249;

export interface PolarCheckoutSession {
  id: string;
  url?: string | null;
  status?: string | null;
  currency?: string | null;
  amount?: number | null;
  total_amount?: number | null;
  product_id?: string | null;
  product_price_id?: string | null;
  products?: Array<{ id?: string | null }>;
  customer_email?: string | null;
  customer_name?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown>;
}

export interface PolarOrder {
  id: string;
  created_at?: string | null;
  status?: string | null;
  paid?: boolean | null;
  currency?: string | null;
  subtotal_amount?: number | null;
  total_amount?: number | null;
  product_id?: string | null;
  checkout_id?: string | null;
  customer?: {
    id?: string | null;
    email?: string | null;
    name?: string | null;
  } | null;
  metadata?: Record<string, unknown>;
}

export interface VerifyPolarWebhookSignatureOptions {
  rawBody: Buffer | string;
  webhookId: string | undefined;
  webhookTimestamp: string | undefined;
  webhookSignature: string | undefined;
  webhookSecret: string;
  toleranceSeconds?: number;
  nowSeconds?: number;
}

export function resolvePolarApiBase(polarServer?: string): string {
  return polarServer?.trim().toLowerCase() === 'sandbox'
    ? POLAR_SANDBOX_API_BASE
    : POLAR_PRODUCTION_API_BASE;
}

function getCandidateSecretKeys(webhookSecret: string): Buffer[] {
  const trimmed = webhookSecret.trim();
  const keys: Buffer[] = [];

  if (trimmed.startsWith('whsec_')) {
    const stripped = trimmed.slice('whsec_'.length);
    const decoded = Buffer.from(stripped, 'base64');
    if (decoded.length > 0) {
      keys.push(decoded);
    }
  }

  const rawUtf8 = Buffer.from(trimmed, 'utf8');
  if (rawUtf8.length > 0) {
    keys.push(rawUtf8);
  }

  return keys;
}

export function verifyPolarWebhookSignature({
  rawBody,
  webhookId,
  webhookTimestamp,
  webhookSignature,
  webhookSecret,
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
  nowSeconds = Math.floor(Date.now() / 1000),
}: VerifyPolarWebhookSignatureOptions): boolean {
  if (!webhookId || !webhookTimestamp || !webhookSignature || !webhookSecret) {
    return false;
  }

  const timestamp = Number(webhookTimestamp.trim());
  if (!Number.isInteger(timestamp) || timestamp <= 0) {
    return false;
  }

  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    return false;
  }

  const candidateSignatures: Buffer[] = [];
  for (const token of webhookSignature.trim().split(/\s+/)) {
    const commaIdx = token.indexOf(',');
    if (commaIdx <= 0) continue;
    const version = token.slice(0, commaIdx).trim();
    const sigBase64 = token.slice(commaIdx + 1).trim();
    if (version !== 'v1' || !sigBase64) continue;
    const sigBuf = Buffer.from(sigBase64, 'base64');
    if (sigBuf.length === 32) {
      candidateSignatures.push(sigBuf);
    }
  }

  if (candidateSignatures.length === 0) {
    return false;
  }

  const bodyBuf = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
  const signedPayload = Buffer.concat([
    Buffer.from(`${webhookId.trim()}.${webhookTimestamp.trim()}.`, 'utf8'),
    bodyBuf,
  ]);

  const secretKeys = getCandidateSecretKeys(webhookSecret);
  for (const key of secretKeys) {
    const expectedDigest = crypto.createHmac('sha256', key).update(signedPayload).digest();
    for (const candidate of candidateSignatures) {
      if (
        candidate.length === expectedDigest.length &&
        crypto.timingSafeEqual(candidate, expectedDigest)
      ) {
        return true;
      }
    }
  }

  return false;
}

function extractPolarErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback;
  }
  const record = data as Record<string, unknown>;
  if (typeof record.detail === 'string' && record.detail.trim()) {
    return record.detail;
  }
  if (typeof record.error === 'string' && record.error.trim()) {
    return record.error;
  }
  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message;
  }
  return fallback;
}

export interface CreatePolarCheckoutParams {
  polarAccessToken: string;
  productId: string;
  appBaseUrl: string;
  polarServer?: string;
  successUrl?: string;
}

export async function createPolarCheckoutSession({
  polarAccessToken,
  productId,
  appBaseUrl,
  polarServer,
  successUrl,
}: CreatePolarCheckoutParams): Promise<PolarCheckoutSession> {
  const base = appBaseUrl.replace(/\/+$/, '');
  const apiBase = resolvePolarApiBase(polarServer);
  const resolvedSuccessUrl = successUrl?.trim() || `${base}/checkout/success?checkout_id={CHECKOUT_ID}`;

  const response = await fetch(`${apiBase}/checkouts/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${polarAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      products: [productId],
      success_url: resolvedSuccessUrl,
      return_url: `${base}/#pricing`,
      metadata: {
        product: 'nekoscape_pro',
        tier: 'pro',
      },
    }),
  });

  const data = (await response.json().catch(() => null)) as PolarCheckoutSession | null;

  if (!response.ok || !data?.id || !data?.url) {
    throw new Error(
      extractPolarErrorMessage(data, `Polar Checkout creation failed (${response.status}).`),
    );
  }

  return data;
}

export async function fetchPolarCheckoutSession(
  checkoutId: string,
  polarAccessToken: string,
  polarServer?: string,
): Promise<PolarCheckoutSession> {
  const apiBase = resolvePolarApiBase(polarServer);
  const url = `${apiBase}/checkouts/${encodeURIComponent(checkoutId)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${polarAccessToken}`,
    },
  });

  const data = (await response.json().catch(() => null)) as PolarCheckoutSession | null;

  if (!response.ok || !data?.id) {
    throw new Error(
      extractPolarErrorMessage(data, `Unable to retrieve Polar checkout (${response.status}).`),
    );
  }

  return data;
}

function checkoutMatchesProduct(checkout: PolarCheckoutSession, expectedProductId: string): boolean {
  if (checkout.product_id === expectedProductId) {
    return true;
  }
  if (Array.isArray(checkout.products)) {
    return checkout.products.some((product) => product?.id === expectedProductId);
  }
  return false;
}

export function isPaidProCheckout(
  checkout: PolarCheckoutSession,
  expectedProductId?: string,
): { ok: true } | { ok: false; reason: string } {
  if (checkout.status !== 'succeeded') {
    return {
      ok: false,
      reason:
        checkout.status === 'confirmed'
          ? 'Payment is still processing. Please wait a moment and try again.'
          : 'Checkout payment has not completed yet.',
    };
  }

  const hasMatchingProduct = Boolean(
    expectedProductId && checkoutMatchesProduct(checkout, expectedProductId),
  );
  const amountCents = checkout.total_amount ?? checkout.amount;
  const meetsUsdMinimum =
    checkout.currency?.toLowerCase() === 'usd' &&
    typeof amountCents === 'number' &&
    amountCents >= PRO_PRICE_CENTS_USD;

  if (expectedProductId && !hasMatchingProduct) {
    return { ok: false, reason: 'Checkout product does not match NekoScape Pro.' };
  }

  if (!hasMatchingProduct && !meetsUsdMinimum) {
    return { ok: false, reason: 'Checkout amount or product does not qualify for NekoScape Pro.' };
  }

  return { ok: true };
}

export function isPaidProOrder(
  order: PolarOrder,
  expectedProductId?: string,
): { ok: true } | { ok: false; reason: string } {
  if (order.paid !== true && order.status !== 'paid') {
    return { ok: false, reason: 'Order has not settled as paid.' };
  }

  const hasMatchingProduct = Boolean(expectedProductId && order.product_id === expectedProductId);
  const amountCents = order.total_amount ?? order.subtotal_amount;
  const meetsUsdMinimum =
    order.currency?.toLowerCase() === 'usd' &&
    typeof amountCents === 'number' &&
    amountCents >= PRO_PRICE_CENTS_USD;

  if (expectedProductId && order.product_id && !hasMatchingProduct) {
    return { ok: false, reason: 'Order product does not match NekoScape Pro.' };
  }

  if (!hasMatchingProduct && !meetsUsdMinimum) {
    return { ok: false, reason: 'Order amount or product does not qualify for NekoScape Pro.' };
  }

  return { ok: true };
}
