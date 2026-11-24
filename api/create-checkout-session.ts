import {
  type ApiRequest,
  type ApiResponse,
  isOriginAllowed,
  resolveRequestOrigin,
  sendJson,
} from './_lib/http';
import { createPolarCheckoutSession } from './_lib/polarVerify';

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
    return;
  }

  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const appBaseUrl = process.env.APP_BASE_URL || resolveRequestOrigin(req) || '';

  if (!isOriginAllowed(req, allowedOrigin, appBaseUrl)) {
    sendJson(res, 403, { ok: false, error: 'Cross-origin checkout requests are not allowed.' });
    return;
  }

  const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
  const productId = process.env.POLAR_PRO_PRODUCT_ID;
  const polarServer = process.env.POLAR_SERVER;

  if (!polarAccessToken || !productId || !appBaseUrl) {
    sendJson(res, 503, {
      ok: false,
      error: 'Polar checkout is not configured on this server yet.',
    });
    return;
  }

  try {
    const checkout = await createPolarCheckoutSession({
      polarAccessToken,
      productId,
      appBaseUrl,
      polarServer,
      successUrl: process.env.POLAR_SUCCESS_URL,
    });

    sendJson(res, 200, {
      ok: true,
      url: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start Polar Checkout.';
    sendJson(res, 502, { ok: false, error: message });
  }
}
