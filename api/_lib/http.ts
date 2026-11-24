import type { IncomingMessage, ServerResponse } from 'node:http';

export type ApiRequest = IncomingMessage & {
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type ApiResponse = ServerResponse & {
  status?: (code: number) => ApiResponse;
  json?: (payload: unknown) => void;
};

export function sendJson(res: ApiResponse, statusCode: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(body);
}

export function getHeaderValue(req: IncomingMessage, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function getQueryParam(req: ApiRequest, name: string): string | undefined {
  const parsed = req.query?.[name];
  if (typeof parsed === 'string') {
    return parsed;
  }
  if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
    return parsed[0];
  }

  const rawUrl = req.url ?? '';
  const queryStart = rawUrl.indexOf('?');
  if (queryStart === -1) {
    return undefined;
  }

  const params = new URLSearchParams(rawUrl.slice(queryStart + 1));
  return params.get(name) ?? undefined;
}

export function getClientIp(req: IncomingMessage): string {
  const forwarded = getHeaderValue(req, 'x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = getHeaderValue(req, 'x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

export async function readRawBody(req: ApiRequest, maxBytes = 1_048_576): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8');
  }

  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > maxBytes) {
      throw new Error('Request body exceeds maximum allowed size.');
    }
    chunks.push(buf);
  }

  if (chunks.length > 0) {
    return Buffer.concat(chunks);
  }

  if (req.body && typeof req.body === 'object') {
    return Buffer.from(JSON.stringify(req.body), 'utf8');
  }

  return Buffer.alloc(0);
}

export function resolveRequestOrigin(req: IncomingMessage): string | null {
  const host = getHeaderValue(req, 'x-forwarded-host') ?? getHeaderValue(req, 'host');
  if (!host) {
    return null;
  }
  const protoHeader = getHeaderValue(req, 'x-forwarded-proto');
  const proto = protoHeader?.split(',')[0]?.trim() || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function isOriginAllowed(req: IncomingMessage, allowedOriginEnv?: string, appBaseUrlEnv?: string): boolean {
  const allowedOrigins = new Set<string>();

  for (const raw of [allowedOriginEnv, appBaseUrlEnv]) {
    if (!raw) continue;
    for (const part of raw.split(',')) {
      const candidate = part.trim();
      if (!candidate) continue;
      try {
        allowedOrigins.add(new URL(candidate).origin);
      } catch {
        // Ignore malformed env origin entries.
      }
    }
  }

  const hostOrigin = resolveRequestOrigin(req);
  if (hostOrigin) {
    try {
      allowedOrigins.add(new URL(hostOrigin).origin);
    } catch {
      // Ignore malformed host header.
    }
  }

  const originHeader = getHeaderValue(req, 'origin')?.trim();
  if (originHeader) {
    try {
      return allowedOrigins.has(new URL(originHeader).origin);
    } catch {
      return false;
    }
  }

  const refererHeader = getHeaderValue(req, 'referer')?.trim();
  if (refererHeader) {
    try {
      return allowedOrigins.has(new URL(refererHeader).origin);
    } catch {
      return false;
    }
  }

  const fetchSite = getHeaderValue(req, 'sec-fetch-site')?.trim();
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return false;
  }

  return allowedOrigins.size > 0;
}
