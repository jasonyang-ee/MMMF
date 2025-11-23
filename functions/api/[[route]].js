import { handle } from "hono/cloudflare-pages";
import app from "../../server/hono-app.js";

export const onRequest = handle(app);
