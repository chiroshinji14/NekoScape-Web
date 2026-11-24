import { type ApiRequest, type ApiResponse, getHeaderValue, readRawBody, sendJson } from './_lib/http';
import { maskEmail, mintProLicenseKey } from './_lib/licenseCrypto';
import {
  isPaidProOrder,
  type PolarOrder,
  verifyPolarWebhookSignature,
} from './_lib/polarVerify';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface PolarWebhookEvent {
  type?: string;
  data?: PolarOrder;
}

const PROCESSED_ORDER_CAP = 512;
const processedOrders = new Set<string>();

function markOrderProcessed(orderKey: string): boolean {
  if (processedOrders.has(orderKey)) {
    return false;
  }
  if (processedOrders.size >= PROCESSED_ORDER_CAP) {
    const oldest = processedOrders.values().next().value;
    if (oldest) {
      processedOrders.delete(oldest);
    }
  }
  processedOrders.add(orderKey);
  return true;
}

function parseIsoTimestampMs(isoString: string | null | undefined): number {
  if (!isoString) {
    return Date.now();
  }
  const parsed = Date.parse(isoString);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

async function sendLicenseBackupEmail(params: {
  resendApiKey: string;
  fromEmail: string;
  toEmail: string;
  licenseKey: string;
  appBaseUrl?: string;
}): Promise<void> {
  const activateUri = `nekoscape://activate?key=${encodeURIComponent(params.licenseKey)}`;
  const downloadUrl = params.appBaseUrl
    ? `${params.appBaseUrl.replace(/\/+$/, '')}/download`
    : 'https://nekoscape.app/download';

  const textBody = [
    'Thank you for purchasing NekoScape Pro!',
    '',
    'Your offline Pro license key:',
    params.licenseKey,
    '',
    'How to activate:',
    `1. Download and install NekoScape for Windows (${downloadUrl})`,
    '2. Open NekoScape -> Settings -> License and paste your key,',
    `   or open this link on Windows: ${activateUri}`,
    '',
    'Keep this email as a backup for future Windows installs.',
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.fromEmail,
      to: [params.toEmail],
      subject: 'Your NekoScape Pro License Key',
      text: textBody,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend email delivery failed (${response.status}).`);
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
    return;
  }

  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  const privateKeyPem = process.env.NEKOSCAPE_LICENSE_PRIVATE_KEY_PEM;
  const orderSecret = process.env.NEKOSCAPE_ORDER_SECRET;

  if (!webhookSecret || !privateKeyPem || !orderSecret) {
    sendJson(res, 503, { ok: false, error: 'Webhook licensing environment is not configured.' });
    return;
  }

  let rawBody: Buffer;
  try {
    rawBody = await readRawBody(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to read request body.';
    sendJson(res, 400, { ok: false, error: message });
    return;
  }

  const validSignature = verifyPolarWebhookSignature({
    rawBody,
    webhookId: getHeaderValue(req, 'webhook-id'),
    webhookTimestamp: getHeaderValue(req, 'webhook-timestamp'),
    webhookSignature: getHeaderValue(req, 'webhook-signature'),
    webhookSecret,
  });

  if (!validSignature) {
    sendJson(res, 403, { ok: false, error: 'Invalid Polar webhook signature.' });
    return;
  }

  let event: PolarWebhookEvent;
  try {
    event = JSON.parse(rawBody.toString('utf8')) as PolarWebhookEvent;
  } catch {
    sendJson(res, 400, { ok: false, error: 'Invalid JSON webhook payload.' });
    return;
  }

  if (event.type !== 'order.paid') {
    sendJson(res, 200, { received: true, ignored: true, eventType: event.type ?? 'unknown' });
    return;
  }

  const order = event.data;
  if (!order?.id) {
    sendJson(res, 400, { ok: false, error: 'Webhook event missing Polar order object.' });
    return;
  }

  const paidCheck = isPaidProOrder(order, process.env.POLAR_PRO_PRODUCT_ID);
  if (!paidCheck.ok && order.metadata?.tier !== 'pro') {
    sendJson(res, 200, { received: true, issued: false, reason: paidCheck.reason });
    return;
  }

  const deterministicSessionId = order.checkout_id || order.id;
  const issuedUtcMs = parseIsoTimestampMs(order.created_at);
  const licenseKey = mintProLicenseKey({
    sessionId: deterministicSessionId,
    privateKeyPem,
    orderSecret,
    issuedUtcMs,
  });

  const isFirstDelivery = markOrderProcessed(deterministicSessionId);
  const customerEmail = order.customer?.email ?? null;
  const resendApiKey = process.env.RESEND_API_KEY;
  let emailStatus: 'sent' | 'skipped' | 'duplicate' | 'failed' = 'skipped';

  if (!isFirstDelivery) {
    emailStatus = 'duplicate';
  } else if (resendApiKey && customerEmail) {
    try {
      await sendLicenseBackupEmail({
        resendApiKey,
        fromEmail: process.env.RESEND_FROM_EMAIL || 'NekoScape <licenses@nekoscape.app>',
        toEmail: customerEmail,
        licenseKey,
        appBaseUrl: process.env.APP_BASE_URL,
      });
      emailStatus = 'sent';
    } catch {
      emailStatus = 'failed';
    }
  }

  sendJson(res, 200, {
    received: true,
    issued: true,
    tier: 'pro',
    duplicate: !isFirstDelivery,
    emailStatus,
    customerEmailMasked: maskEmail(customerEmail),
  });
}
