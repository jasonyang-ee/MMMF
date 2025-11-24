// Demo mode utilities for session-based data isolation
import { nanoid } from "nanoid";

const DEMO_SESSION_COOKIE = "mmmf_demo_session";
const SESSION_EXPIRY_DAYS = 5;
const SESSION_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a unique session ID
 */
export function generateSessionId() {
  return `demo_${nanoid(16)}_${Date.now()}`;
}

/**
 * Get or create a session ID from cookie
 */
export function getSessionId(request, response) {
  // Check if demo mode is enabled
  const isDemoMode = process.env.DEMO === "true";
  if (!isDemoMode) {
    return null; // Normal mode, no session isolation
  }

  // Try to get existing session from cookie
  const cookies = parseCookies(request.headers.cookie || "");
  let sessionId = cookies[DEMO_SESSION_COOKIE];

  // Create new session if none exists
  if (!sessionId) {
    sessionId = generateSessionId();

    // Set cookie for 5 days
    const expires = new Date();
    expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);

    response.setHeader(
      "Set-Cookie",
      `${DEMO_SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires.toUTCString()}`
    );
  }

  return sessionId;
}

/**
 * Get prefixed key for KV storage
 */
export function getKVKey(baseKey, sessionId) {
  if (!sessionId) {
    return baseKey; // Normal mode, use original key
  }
  return `${sessionId}:${baseKey}`;
}

/**
 * Parse cookies from header string
 */
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
}

/**
 * Check if session is expired (older than 5 days)
 */
export function isSessionExpired(sessionId) {
  if (!sessionId || !sessionId.startsWith("demo_")) {
    return false;
  }

  // Extract timestamp from session ID
  const parts = sessionId.split("_");
  const timestamp = parseInt(parts[parts.length - 1]);

  if (isNaN(timestamp)) {
    return true; // Invalid format, consider expired
  }

  const sessionAge = Date.now() - timestamp;
  const maxAge = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  return sessionAge > maxAge;
}

/**
 * Clean up expired sessions from KV
 * This should be called periodically
 */
export async function cleanupExpiredSessions(KV) {
  if (!KV) return;

  try {
    console.log("Starting cleanup of expired demo sessions...");

    const { keys } = await KV.list({ prefix: "demo_" });
    let deletedCount = 0;

    for (const key of keys) {
      const sessionId = key.name.split(":")[0];

      if (isSessionExpired(sessionId)) {
        await KV.delete(key.name);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} expired session keys`);
  } catch (error) {
    console.error("Error during session cleanup:", error);
  }
}

/**
 * Middleware to handle demo mode sessions for Express
 */
export function demoSessionMiddleware(req, res, next) {
  // Get or create session ID
  req.sessionId = getSessionId(req, res);

  // Helper function to get prefixed keys
  req.getKVKey = (baseKey) => getKVKey(baseKey, req.sessionId);

  next();
}

/**
 * Middleware to handle demo mode sessions for Hono
 */
export function demoSessionMiddlewareHono(c, next) {
  const isDemoMode = c.env.DEMO === "true";

  if (!isDemoMode) {
    c.set("sessionId", null);
    c.set("getKVKey", (key) => key);
    return next();
  }

  // Parse cookies
  const cookieHeader = c.req.header("Cookie") || "";
  const cookies = parseCookies(cookieHeader);
  let sessionId = cookies[DEMO_SESSION_COOKIE];

  // Create new session if none exists
  if (!sessionId) {
    sessionId = generateSessionId();

    const expires = new Date();
    expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);

    c.header(
      "Set-Cookie",
      `${DEMO_SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires.toUTCString()}`
    );
  }

  // Store session ID in context
  c.set("sessionId", sessionId);
  c.set("getKVKey", (key) => getKVKey(key, sessionId));

  return next();
}
