import { type ApiRequest, type ApiResponse, getClientIp, getQueryParam, sendJson } from './_lib/http.js';
import { maskEmail, mintProLicenseKey } from './_lib/licenseCrypto.js';
import { fetchPolarCheckoutSession, isPaidProCheckout } from './_lib/polarVerify.js';

const CHECKOUT_ID_REGEX = /^[A-Za-z0-9_-]{10,128}$/;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 20;
const RATE_MAP_MAX_KEYS = 2048;

const ipHits = new Map<string, number[]>();

function checkRateLimit(ip: string, nowMs = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
  const cutoff = nowMs - RATE_WINDOW_MS;
  const existing = ipHits.get(ip) ?? [];
  const recent = existing.filter((ts) => ts > cutoff);

  if (recent.length >= RATE_MAX_REQUESTS) {
    const oldest = recent[0] ?? nowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + RATE_WINDOW_MS - nowMs) / 1000));
    ipHits.set(ip, recent);
    return { allowed: false, retryAfterSeconds };
  }

  if (!ipHits.has(ip) && ipHits.size >= RATE_MAP_MAX_KEYS) {
    const firstKey = ipHits.keys().next().value;
    if (firstKey) {
      ipHits.delete(firstKey);
    }
  }

  recent.push(nowMs);
  ipHits.set(ip, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

function parseIsoTimestampMs(isoString: string | null | undefined): number {
  if (!isoString) {
    return Date.now();
  }
  const parsed = Date.parse(isoString);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
    return;
  }

  const clientIp = getClientIp(req);
  const limit = checkRateLimit(clientIp);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds));
    sendJson(res, 429, {
      ok: false,
      error: 'Too many license verification requests. Please wait a moment and try again.',
    });
    return;
  }

  const checkoutId =
    (getQueryParam(req, 'checkout_id') ?? getQueryParam(req, 'session_id'))?.trim() ?? '';
  if (!CHECKOUT_ID_REGEX.test(checkoutId)) {
    sendJson(res, 400, { ok: false, error: 'Invalid or missing Polar checkout_id.' });
    return;
  }

  const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
  const privateKeyPem = process.env.NEKOSCAPE_LICENSE_PRIVATE_KEY_PEM;
  const orderSecret = process.env.NEKOSCAPE_ORDER_SECRET;

  if (!polarAccessToken || !privateKeyPem || !orderSecret) {
    sendJson(res, 503, { ok: false, error: 'License issuance is not configured on this server.' });
    return;
  }

  try {
    const checkout = await fetchPolarCheckoutSession(
      checkoutId,
      polarAccessToken,
      process.env.POLAR_SERVER,
    );
    const verification = isPaidProCheckout(checkout, process.env.POLAR_PRO_PRODUCT_ID);

    if (!verification.ok) {
      const statusCode = checkout.status === 'confirmed' ? 409 : 402;
      sendJson(res, statusCode, { ok: false, error: verification.reason });
      return;
    }

    const issuedUtcMs = parseIsoTimestampMs(checkout.created_at);
    const licenseKey = mintProLicenseKey({
      sessionId: checkout.id,
      privateKeyPem,
      orderSecret,
      issuedUtcMs,
    });

    const customerEmailMasked = maskEmail(checkout.customer_email ?? null);

    sendJson(res, 200, {
      ok: true,
      tier: 'pro',
      licenseKey,
      activateUri: `nekoscape://activate?key=${encodeURIComponent(licenseKey)}`,
      customerEmailMasked,
      installerPath: '/download',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to verify Polar payment.';
    sendJson(res, 502, { ok: false, error: message });
  }
}
