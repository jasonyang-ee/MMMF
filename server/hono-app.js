import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { collections, createDataService } from "./dataService.js";
import {
  cleanupExpiredSessions,
  getKVKey,
  resolveSession,
  sessionCookie,
  sessionExpiry,
} from "./demo-session.js";

const app = new Hono();
app.use("*", (c, next) => {
  c.header("Cache-Control", "no-store");
  return next();
});
// This serializes mutations within an isolate only. KV has no cross-isolate lock.
const queues = new WeakMap();
const cleanupTimes = new WeakMap();
const limits = new WeakMap();
function kvStore(KV, sessionId) {
  if (!queues.has(KV)) queues.set(KV, new Map());
  const pending = queues.get(KV);
  const read = async (key, fallback) => {
    const value = await KV.get(getKVKey(key, sessionId));
    return value === null ? fallback : JSON.parse(value);
  };
  return {
    read,
    async update(key, fallback, change) {
      const storageKey = getKVKey(key, sessionId);
      const previous = pending.get(storageKey) || Promise.resolve();
      const operation = previous
        .catch(() => {})
        .then(async () => {
          const value = await change(await read(key, fallback));
          await KV.put(
            storageKey,
            JSON.stringify(value),
            sessionId
              ? {
                  expiration: Math.max(
                    Math.ceil(sessionExpiry(sessionId) / 1000),
                    Math.floor(Date.now() / 1000) + 60,
                  ),
                }
              : undefined,
          );
        });
      pending.set(storageKey, operation);
      try {
        await operation;
      } finally {
        if (pending.get(storageKey) === operation) pending.delete(storageKey);
      }
    },
  };
}
// Per-isolate protection; use Cloudflare rate limiting for distributed enforcement.
app.use("/api/*", async (c, next) => {
  const KV = c.env.MMMF_KV;
  if (!limits.has(KV)) limits.set(KV, new Map());
  const clients = limits.get(KV);
  const now = Date.now();
  for (const [key, entry] of clients)
    if (entry.reset <= now) clients.delete(key);
  const ip = c.req.header("CF-Connecting-IP") || "local";
  const entry = clients.get(ip) || { count: 0, reset: now + 60_000 };
  clients.set(ip, entry);
  if (++entry.count > 300) {
    c.header("Retry-After", String(Math.ceil((entry.reset - now) / 1000)));
    return c.json({ error: "Too many requests, slow down" }, 429);
  }
  return next();
});
app.use(
  "/api/*",
  bodyLimit({
    maxSize: 100 * 1024,
    onError: (c) => c.json({ error: "Request too large" }, 413),
  }),
);
app.use("/api/*", async (c, next) => {
  const origin = c.req.header("origin");
  if (
    origin &&
    origin !== new URL(c.req.url).origin &&
    origin !== c.env.ALLOWED_ORIGIN
  )
    return c.json({ error: "Origin not allowed" }, 403);
  return next();
});
app.use(
  "/api/*",
  cors({
    origin: (origin, c) => (c.env.ALLOWED_ORIGIN === origin ? origin : null),
    credentials: true,
  }),
);
app.use("/api/*", async (c, next) => {
  let sessionId = null;
  if (c.env.DEMO === "true") {
    const session = resolveSession(c.req.header("cookie"));
    sessionId = session.id;
    if (session.fresh)
      c.header(
        "Set-Cookie",
        sessionCookie(sessionId, new URL(c.req.url).protocol === "https:"),
      );
    const KV = c.env.MMMF_KV;
    if (Date.now() - (cleanupTimes.get(KV) || 0) > 86_400_000) {
      cleanupTimes.set(KV, Date.now());
      const cleanup = cleanupExpiredSessions(KV).catch((error) =>
        console.error(
          "[ERROR] [DemoSession] Cleanup failed:",
          error.code || error.name,
        ),
      );
      try {
        c.executionCtx.waitUntil(cleanup);
      } catch {
        await cleanup;
      }
    }
  }
  c.set(
    "dataService",
    createDataService(
      kvStore(c.env.MMMF_KV, sessionId),
      c.env.DEFAULT_LANGUAGE,
    ),
  );
  return next();
});
async function body(c) {
  if (
    c.req.header("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  ) {
    const error = new Error("Invalid request");
    error.status = 400;
    throw error;
  }
  try {
    return await c.req.json();
  } catch {
    const error = new Error("Invalid request");
    error.status = 400;
    throw error;
  }
}
for (const key of collections) {
  app.get(`/api/${key}`, async (c) =>
    c.json(await c.get("dataService").list(key)),
  );
  app.post(`/api/${key}`, async (c) =>
    c.json(await c.get("dataService").create(key, await body(c)), 201),
  );
  app.put(`/api/${key}/:id`, async (c) =>
    c.json(
      await c.get("dataService").update(key, c.req.param("id"), await body(c)),
    ),
  );
  app.delete(`/api/${key}/:id`, async (c) =>
    c.json(await c.get("dataService").remove(key, c.req.param("id"))),
  );
}
app.delete("/api/transactions", async (c) =>
  c.json(await c.get("dataService").clear()),
);
app.get("/api/settings", async (c) =>
  c.json(await c.get("dataService").settings()),
);
app.put("/api/settings", async (c) =>
  c.json(await c.get("dataService").saveSettings(await body(c))),
);
app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((error, c) => {
  const status = error.status || 500;
  if (status >= 500)
    console.error(
      "[ERROR] [DataStore] Request failed:",
      error.code || error.name,
    );
  return c.json(
    {
      error:
        status >= 500
          ? "Storage unavailable"
          : status === 400
            ? "Invalid request"
            : error.message,
    },
    status,
  );
});
export default app;
