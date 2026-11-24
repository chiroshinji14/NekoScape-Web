import crypto from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const EPOCH_2025_UTC_MS = Date.UTC(2025, 0, 1);
const MS_PER_DAY = 86_400_000;

export const LICENSE_VERSION_V1 = 0x01;
export const LICENSE_TIER_PERSONAL = 0x00;
export const LICENSE_TIER_PRO = 0x01;

export interface MintProLicenseInput {
  sessionId: string;
  privateKeyPem: string;
  orderSecret: string;
  issuedUtcMs?: number;
}

function normalizePrivateKeyPem(rawPem: string): string {
  let candidate = rawPem.trim();
  if (
    (candidate.startsWith('"') && candidate.endsWith('"')) ||
    (candidate.startsWith("'") && candidate.endsWith("'"))
  ) {
    candidate = candidate.slice(1, -1).trim();
  }

  if (!candidate.includes('PRIVATE KEY') && /^[A-Za-z0-9+/=\s]+$/.test(candidate)) {
    const decoded = Buffer.from(candidate.replace(/\s+/g, ''), 'base64').toString('utf8');
    if (decoded.includes('PRIVATE KEY')) {
      candidate = decoded.trim();
    }
  }

  candidate = candidate
    .replace(/\\\\r\\\\n|\\\\n|\\r\\n|\\n/g, '\n')
    .replace(/\r\n?/g, '\n');

  const pemMatch = candidate.match(/-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/);
  if (!pemMatch) {
    return candidate;
  }

  const label = pemMatch[1].trim();
  const base64Body = pemMatch[2].replace(/\s+/g, '');
  const wrappedLines = base64Body.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${wrappedLines.join('\n')}\n-----END ${label}-----\n`;
}

export function encodeBase32Unpadded(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';

  for (let i = 0; i < bytes.length; i += 1) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }

  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }

  return out;
}

export function formatLicenseKey(base32: string): string {
  const groups: string[] = [];
  for (let i = 0; i < base32.length; i += 4) {
    groups.push(base32.slice(i, i + 4));
  }
  return `NEKO-${groups.join('-')}`;
}

export function deriveOrderNonce(orderSecret: string, sessionId: string): number {
  if (!orderSecret || orderSecret.trim().length < 16) {
    throw new Error('NEKOSCAPE_ORDER_SECRET must be configured with at least 16 characters.');
  }
  const digest = crypto.createHmac('sha256', orderSecret).update(sessionId, 'utf8').digest();
  return digest.readUInt32BE(0);
}

export function buildLicensePayload8(
  tierByte: number,
  issuedUtcMs: number,
  nonceUint32: number,
): Buffer {
  const days = Math.max(
    0,
    Math.min(65535, Math.floor((issuedUtcMs - EPOCH_2025_UTC_MS) / MS_PER_DAY)),
  );

  const payload = Buffer.alloc(8);
  payload.writeUInt8(LICENSE_VERSION_V1, 0);
  payload.writeUInt8(tierByte & 0xff, 1);
  payload.writeUInt16BE(days, 2);
  payload.writeUInt32BE(nonceUint32 >>> 0, 4);
  return payload;
}

export function mintProLicenseKey({
  sessionId,
  privateKeyPem,
  orderSecret,
  issuedUtcMs = Date.now(),
}: MintProLicenseInput): string {
  if (!sessionId) {
    throw new Error('sessionId is required to mint a license key.');
  }

  const normalizedPem = privateKeyPem ? normalizePrivateKeyPem(privateKeyPem) : '';
  if (!normalizedPem || !normalizedPem.includes('PRIVATE KEY')) {
    throw new Error('NEKOSCAPE_LICENSE_PRIVATE_KEY_PEM is missing or invalid.');
  }

  const nonce = deriveOrderNonce(orderSecret, sessionId);
  const payload8 = buildLicensePayload8(LICENSE_TIER_PRO, issuedUtcMs, nonce);

  let keyObject: crypto.KeyObject;
  try {
    keyObject = crypto.createPrivateKey(normalizedPem);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unable to parse PEM.';
    throw new Error(
      `NEKOSCAPE_LICENSE_PRIVATE_KEY_PEM could not be decoded (${detail}). Ensure it is an unencrypted ECDSA P-256 PKCS#8 PEM private key.`,
    );
  }

  if (keyObject.asymmetricKeyType !== 'ec' || keyObject.asymmetricKeyDetails?.namedCurve !== 'prime256v1') {
    throw new Error(
      `NEKOSCAPE_LICENSE_PRIVATE_KEY_PEM must be an ECDSA prime256v1 (P-256) key, got ${keyObject.asymmetricKeyType ?? 'unknown'} (${keyObject.asymmetricKeyDetails?.namedCurve ?? 'unknown'}).`,
    );
  }

  const sig64 = crypto.sign('sha256', payload8, {
    key: keyObject,
    dsaEncoding: 'ieee-p1363',
  });

  if (sig64.length !== 64) {
    throw new Error(`Expected 64-byte IEEE P1363 P-256 signature, got ${sig64.length} bytes.`);
  }

  const signedBlob72 = Buffer.concat([payload8, sig64]);
  const base32 = encodeBase32Unpadded(signedBlob72);
  if (base32.length !== 116) {
    throw new Error(`Expected 116 Base32 characters, got ${base32.length}.`);
  }

  return formatLicenseKey(base32);
}

export function maskEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return null;
  }

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const visibleCount = local.length <= 2 ? 1 : 2;
  return `${local.slice(0, visibleCount)}***@${domain}`;
}
