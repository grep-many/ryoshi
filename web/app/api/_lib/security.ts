import { NextRequest, NextResponse } from "next/server";

type RateLimitOptions = {
  max: number;
  windowMs: number;
};

type ApiGuardOptions = {
  route: string;
  rateLimit: RateLimitOptions;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __ryoshiRateLimit: Map<string, RateLimitEntry> | undefined;
}

const rateLimitStore: Map<string, RateLimitEntry> = globalThis.__ryoshiRateLimit ?? new Map();
if (!globalThis.__ryoshiRateLimit) {
  globalThis.__ryoshiRateLimit = rateLimitStore;
}

const SECURITY_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
};

const ALLOWED_METHODS = "GET, HEAD, OPTIONS";

function parseBoolean(value?: string) {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseList(value?: string) {
  if (!value) return [] as string[];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getEnvNumber(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function mergeHeaders(headers: HeadersInit = {}) {
  return {
    ...SECURITY_HEADERS,
    ...headers,
  } as Record<string, string>;
}

function getRequestOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const referer = req.headers.get("referer");
  if (!referer) return "";
  try {
    return new URL(referer).origin;
  } catch {
    return "";
  }
}

function isOriginAllowed(origin: string, allowed: string[]) {
  if (allowed.length === 0) return true;
  if (!origin) return false;
  return allowed.includes(origin);
}

function hasValidApiKey(req: NextRequest, apiKey: string) {
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const [scheme, token] = authHeader.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token === apiKey) return true;
  }

  const keyHeader = req.headers.get("x-api-key");
  if (keyHeader && keyHeader === apiKey) return true;

  return false;
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip") ?? req.headers.get("cf-connecting-ip");
  if (realIp) return realIp.trim();

  const ip = (req as { ip?: string }).ip;
  return ip?.trim() || "unknown";
}

function checkRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    const entry = { count: 1, resetAt };
    rateLimitStore.set(key, entry);
    return { ok: true, remaining: Math.max(0, max - 1), resetAt };
  }

  const updated = { ...existing, count: existing.count + 1 };
  rateLimitStore.set(key, updated);

  return {
    ok: updated.count <= max,
    remaining: Math.max(0, max - updated.count),
    resetAt: updated.resetAt,
  };
}

export function enforceApiSecurity(req: NextRequest, options: ApiGuardOptions) {
  if (!ALLOWED_METHODS.split(", ").includes(req.method)) {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405, headers: mergeHeaders({ Allow: ALLOWED_METHODS }) },
    );
  }

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: mergeHeaders({ Allow: ALLOWED_METHODS }),
    });
  }

  const allowedOrigins = parseList(process.env.APP_ORIGIN);
  const requestOrigin = getRequestOrigin(req);
  const originAllowed = isOriginAllowed(requestOrigin, allowedOrigins);

  const apiKey = (process.env.API_ACCESS_KEY ?? "").trim();
  const authRequired = parseBoolean(process.env.API_AUTH_REQUIRED);
  const hasKey = apiKey ? hasValidApiKey(req, apiKey) : false;

  if (authRequired && !apiKey) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500, headers: mergeHeaders() },
    );
  }

  if (authRequired && !hasKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: mergeHeaders() });
  }

  if (!authRequired && apiKey && !originAllowed && !hasKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: mergeHeaders() });
  }

  if (allowedOrigins.length > 0 && !originAllowed && !hasKey) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: mergeHeaders() });
  }

  const ip = getClientIp(req);
  const rate = checkRateLimit(
    `${options.route}:${ip}`,
    options.rateLimit.max,
    options.rateLimit.windowMs,
  );

  if (!rate.ok) {
    const retryAfterSeconds = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000));

    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: mergeHeaders({
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(options.rateLimit.max),
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.ceil(rate.resetAt / 1000)),
        }),
      },
    );
  }

  return null;
}
