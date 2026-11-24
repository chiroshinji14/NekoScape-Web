# NekoScape Pro Licensing & Polar Checkout API (`api/`)

Serverless Node.js TypeScript endpoints for Polar Checkout, Standard Webhooks verification, and deterministic offline ECDSA P-256 license key issuance.

## Dependencies

Zero external npm packages are required. All handlers use built-in `node:crypto` and native `fetch`.

## Endpoints

- `POST /api/create-checkout-session`
  - Validates same-origin (`Origin` / `Referer` against `ALLOWED_ORIGIN`, `APP_BASE_URL`, or request `Host`).
  - Creates a Polar Checkout session (`POST /v1/checkouts/`) pinned to `POLAR_PRO_PRODUCT_ID`.
  - Redirects back to `${APP_BASE_URL}/checkout/success?checkout_id={CHECKOUT_ID}` on success and `${APP_BASE_URL}/#pricing` via `return_url`.
- `GET /api/license?checkout_id=...`
  - Validates `checkout_id` format (`^[A-Za-z0-9_-]{10,128}$`) and applies per-IP rate limiting.
  - Fetches the Checkout session directly from Polar (`GET /v1/checkouts/{id}`) using `POLAR_ACCESS_TOKEN`.
  - Verifies `status === 'succeeded'` and matching `POLAR_PRO_PRODUCT_ID` / USD amount (`>= 249` cents). Returns HTTP `409` while `status === 'confirmed'` so the success page can auto-retry during settlement.
  - Deterministically derives the 32-bit order nonce from `HMAC-SHA256(NEKOSCAPE_ORDER_SECRET, checkoutId)` and signs the 8-byte binary payload with `NEKOSCAPE_LICENSE_PRIVATE_KEY_PEM`.
  - Returns `{ ok: true, tier: 'pro', licenseKey, activateUri, customerEmailMasked, installerPath: '/download' }` with `Cache-Control: no-store`.
- `POST /api/webhook`
  - Reads the raw request body (`bodyParser: false` exported for Vercel).
  - Verifies Standard Webhooks headers (`webhook-id`, `webhook-timestamp`, `webhook-signature`) using `POLAR_WEBHOOK_SECRET` and `crypto.timingSafeEqual` within a 300-second window.
  - On `order.paid` with matching `POLAR_PRO_PRODUCT_ID` / USD amount, deterministically mints the Pro license key using `order.checkout_id || order.id` (idempotent across Polar retries) and optionally triggers email delivery if `RESEND_API_KEY` is configured.

## Cryptographic & Format Contract

Must match `NekoScape.Host.Licensing.LicenseKeyCrypto` in the Windows desktop app byte-for-byte:

1. **Payload (8 bytes, big-endian)**:
   - Byte `0`: `0x01` (Version 1)
   - Byte `1`: `0x01` (Tier: Pro)
   - Bytes `2..3`: `uint16BE` days since `2025-01-01T00:00:00Z`
   - Bytes `4..7`: `uint32BE` deterministic order nonce (first 4 bytes of `HMAC-SHA256(NEKOSCAPE_ORDER_SECRET, checkoutId)`)
2. **Signature**: ECDSA NIST P-256 (`prime256v1`) + SHA-256, IEEE P1363 fixed 64-byte concatenation (`r || s`).
3. **Encoding**: `payload8 || sig64` (72 bytes) encoded in unpadded RFC 4648 uppercase Base32 (`ABCDEFGHIJKLMNOPQRSTUVWXYZ234567`, 116 chars), formatted as `NEKO-` followed by 29 hyphen-separated groups of 4 characters.

## Environment Variables

See `.env.example` at the repository root. Never prefix any secret variable with `VITE_` or place private keys inside `src/` or `public/`.

## Vercel Deployment

1. Connect the repository to Vercel (Framework Preset: Vite).
2. Configure all variables from `.env.example` in Vercel Project Settings -> Environment Variables.
3. In Polar, create a **Raw** webhook endpoint (`API Version: 2026-04`) pointing to `https://<your-domain>/api/webhook` subscribed to `order.paid` (and optionally `order.refunded`).
4. Ensure `vercel.json` remains at the root so SPA routes (`/checkout/success`, `/scenes`, `/changelog`) rewrite to `/index.html` while `/api/*` routes directly to serverless functions.
