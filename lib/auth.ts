import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "mil_data_session";

type AuthUser = {
  user: string;
  code: string;
  expiresAt: Date;
};

type SessionPayload = {
  user: string;
  exp: number;
};

export function getConfiguredUsers(): AuthUser[] {
  const raw = process.env.auth_env ?? process.env.AUTH_ENV ?? "";
  if (!raw.trim()) {
    return [];
  }

  const users = new Map<string, Partial<AuthUser>>();

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const authMatch = trimmed.match(/^(user\d+)_auth\s*=\s*(.+)$/i);
    if (authMatch) {
      const user = authMatch[1];
      users.set(user, {
        ...users.get(user),
        user,
        code: parseAuthCode(authMatch[2]),
      });
      continue;
    }

    const expireMatch = trimmed.match(/^(user\d+)_expire_date\s*=\s*(.+)$/i);
    if (expireMatch) {
      const user = expireMatch[1];
      users.set(user, {
        ...users.get(user),
        user,
        expiresAt: parseExpireDate(expireMatch[2]),
      });
    }
  }

  return Array.from(users.values()).filter(
    (user): user is AuthUser =>
      Boolean(user.user && user.code && user.expiresAt && Number.isFinite(user.expiresAt.getTime())),
  );
}

export function authenticateCode(code: string) {
  const normalizedCode = code.trim();
  const now = Date.now();

  if (!normalizedCode) {
    return null;
  }

  return (
    getConfiguredUsers().find(
      (user) => user.code === normalizedCode && user.expiresAt.getTime() >= now,
    ) ?? null
  );
}

export function createSession(user: AuthUser) {
  const payload: SessionPayload = {
    user: user.user,
    exp: Math.floor(user.expiresAt.getTime() / 1000),
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return {
    value: `${encodedPayload}.${signature}`,
    maxAge: Math.max(0, Math.floor((user.expiresAt.getTime() - Date.now()) / 1000)),
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(AUTH_COOKIE)?.value;

  if (!cookie) {
    return null;
  }

  return verifySession(cookie);
}

export function verifySession(cookieValue: string) {
  const [encodedPayload, signature] = cookieValue.split(".");
  if (!encodedPayload || !signature || !constantTimeEqual(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    if (!payload.user || !payload.exp || payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function parseAuthCode(value: string) {
  const stripped = stripQuotes(value.trim());
  if (stripped.startsWith("{") && stripped.endsWith("}")) {
    const body = stripped.slice(1, -1).trim();
    const propertyMatch = body.match(
      /(?:code|auth|password|token|value)\s*[:=]\s*["']?([^"',}\s]+)["']?/i,
    );
    if (propertyMatch) {
      return propertyMatch[1];
    }

    const quotedMatch = body.match(/["']([^"']+)["']/);
    return quotedMatch?.[1] ?? "";
  }

  return stripped;
}

function parseExpireDate(value: string) {
  const date = stripQuotes(value.trim());
  return new Date(`${date}T23:59:59+09:00`);
}

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function getSessionSecret() {
  return (
    process.env.AUTH_SESSION_SECRET ??
    process.env.auth_env ??
    process.env.AUTH_ENV ??
    "local-development-session-secret"
  );
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
