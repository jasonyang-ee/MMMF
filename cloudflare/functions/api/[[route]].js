// Cloudflare Pages Functions Entry Point
// This file handles API routes for Cloudflare Pages deployment
// Static files are served automatically by Pages

import { handle } from "hono/cloudflare-pages";
import app from "../../server/hono-app.js";

export const onRequest = handle(app);
