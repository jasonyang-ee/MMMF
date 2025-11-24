import app from "./server/hono-app.js";
import { serveStatic } from "hono/cloudflare-workers";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle API routes
    if (url.pathname.startsWith("/api")) {
      return app.fetch(request, env, ctx);
    }

    // Serve static assets from dist folder
    const staticApp = new (await import("hono")).Hono();

    staticApp.use("*", serveStatic({ root: "./", path: "./dist" }));

    // Fallback to index.html for SPA routing
    staticApp.get("*", serveStatic({ path: "./dist/index.html" }));

    return staticApp.fetch(request, env, ctx);
  },
};
