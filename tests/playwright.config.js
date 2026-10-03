import { defineConfig } from "@playwright/test";
import os from "node:os";
import path from "node:path";

export default defineConfig({
  testDir: "./browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    locale: "en-US",
    timezoneId: "America/Los_Angeles",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && node server/index.js",
    cwd: path.resolve(import.meta.dirname, ".."),
    url: "http://127.0.0.1:4173/api/settings",
    env: {
      PORT: "4173",
      DEMO: "true",
      DATA_DIR: path.join(os.tmpdir(), `mmmf-ui-${process.pid}`),
      NODE_ENV: "production",
    },
    reuseExistingServer: false,
  },
});
