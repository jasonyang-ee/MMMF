import { nanoid } from "nanoid";

export const SESSION_MAX_AGE = 5 * 24 * 60 * 60;
export const DEMO_SESSION_COOKIE = "mmmf_demo_session";
const sessionPattern = /^demo_[A-Za-z0-9_-]{16}_(\d{13})$/;

export function generateSessionId() {
  return `demo_${nanoid(16)}_${Date.now()}`;
}
export function sessionExpiry(sessionId) {
  const match = sessionPattern.exec(sessionId || "");
  return match ? Number(match[1]) + SESSION_MAX_AGE * 1000 : 0;
}
export function isSessionExpired(sessionId) {
  const expiry = sessionExpiry(sessionId);
  return (
    !expiry ||
    expiry <= Date.now() ||
    expiry > Date.now() + SESSION_MAX_AGE * 1000
  );
}
export function resolveSession(cookieHeader = "") {
  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${DEMO_SESSION_COOKIE}=`));
  let id;
  try {
    id = decodeURIComponent(entry?.slice(DEMO_SESSION_COOKIE.length + 1) || "");
  } catch {
    /* Invalid cookies start a fresh session. */
  }
  return id && !isSessionExpired(id)
    ? { id, fresh: false }
    : { id: generateSessionId(), fresh: true };
}
export function sessionCookie(id, secure) {
  return `${DEMO_SESSION_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}${secure ? "; Secure" : ""}`;
}
export function getKVKey(key, sessionId) {
  return sessionId ? `${sessionId}:${key}` : key;
}

// Legacy keys did not have a TTL; paginate so cleanup reaches every old session.
export async function cleanupExpiredSessions(KV) {
  let cursor;
  do {
    const page = await KV.list({ prefix: "demo_", cursor });
    for (const key of page.keys) {
      if (isSessionExpired(key.name.split(":")[0])) await KV.delete(key.name);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
}
