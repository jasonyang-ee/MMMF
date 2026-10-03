import app from "../server/hono-app.js";

export default {
  fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api" || pathname.startsWith("/api/"))
      return app.fetch(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};
