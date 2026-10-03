import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs/promises";
import rateLimit from "express-rate-limit";
import { collections, createDataService } from "./dataService.js";
import { createFileStore } from "./fileStoreService.js";
import {
  isSessionExpired,
  resolveSession,
  sessionCookie,
} from "./demo-session.js";

export function createApp({
  dataDirectory,
  env = process.env,
  staticDirectory = path.resolve("client/dist"),
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 300,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many requests, slow down" },
    }),
  );
  app.use("/api", (req, res, next) => {
    const origin = req.get("origin");
    let sameOrigin = false;
    try {
      const parsed = new URL(origin);
      sameOrigin =
        ["http:", "https:"].includes(parsed.protocol) &&
        parsed.host === req.get("host");
    } catch {
      /* Absent or invalid Origin. */
    }
    if (origin && !sameOrigin && origin !== env.ALLOWED_ORIGIN)
      return res.status(403).json({ error: "Origin not allowed" });
    next();
  });
  app.use(
    "/api",
    cors({ origin: env.ALLOWED_ORIGIN || false, credentials: true }),
  );
  app.use("/api", express.json({ limit: "100kb" }));
  let lastCleanup = 0;
  app.use("/api", async (req, res, next) => {
    let directory = dataDirectory;
    if (env.DEMO === "true") {
      const session = resolveSession(req.headers.cookie);
      if (session.fresh)
        res.setHeader("Set-Cookie", sessionCookie(session.id, req.secure));
      directory = path.join(dataDirectory, "sessions", session.id);
      if (Date.now() - lastCleanup > 86_400_000) {
        lastCleanup = Date.now();
        const sessions = path.join(dataDirectory, "sessions");
        fs.readdir(sessions, { withFileTypes: true })
          .then(async (entries) => {
            for (const entry of entries) {
              if (
                entry.isDirectory() &&
                entry.name.startsWith("demo_") &&
                isSessionExpired(entry.name)
              )
                await fs.rm(path.join(sessions, entry.name), {
                  recursive: true,
                  force: true,
                });
            }
          })
          .catch((error) => {
            if (error.code !== "ENOENT")
              console.error(
                "[ERROR] [DemoSession] Cleanup failed:",
                error.code || error.name,
              );
          });
      }
    }
    req.dataService = createDataService(
      createFileStore(directory),
      env.DEFAULT_LANGUAGE,
    );
    next();
  });
  for (const key of collections) {
    app.get(`/api/${key}`, async (req, res) =>
      res.json(await req.dataService.list(key)),
    );
    app.post(`/api/${key}`, async (req, res) =>
      res.status(201).json(await req.dataService.create(key, req.body)),
    );
    app.put(`/api/${key}/:id`, async (req, res) =>
      res.json(await req.dataService.update(key, req.params.id, req.body)),
    );
    app.delete(`/api/${key}/:id`, async (req, res) =>
      res.json(await req.dataService.remove(key, req.params.id)),
    );
  }
  app.delete("/api/transactions", async (req, res) =>
    res.json(await req.dataService.clear()),
  );
  app.get("/api/settings", async (req, res) =>
    res.json(await req.dataService.settings()),
  );
  app.put("/api/settings", async (req, res) =>
    res.json(await req.dataService.saveSettings(req.body)),
  );
  app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));
  const staticLimiter = rateLimit({
    windowMs: 1_000,
    limit: 50,
    skip: (req) => req.ip === "::1" || /^(::ffff:)?127\./.test(req.ip || ""),
    message: { error: "Too many requests, slow down" },
  });
  app.use(staticLimiter, express.static(staticDirectory));
  app.get(/.*/, (req, res) =>
    res.sendFile(path.join(staticDirectory, "index.html")),
  );
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status || 500;
    if (status >= 500)
      console.error(
        "[ERROR] [DataStore] Request failed:",
        error.code || error.name,
      );
    res.status(status).json({
      error:
        status >= 500
          ? "Storage unavailable"
          : status === 400
            ? "Invalid request"
            : error.message,
    });
  });
  return app;
}
