import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = process.env.PORT || 3600;
let app;
try {
  app = createApp({
    dataDirectory: process.env.DATA_DIR || path.join(root, "data"),
    staticDirectory: path.join(root, "client/dist"),
  });
} catch (error) {
  console.error(`[ERROR] [Server] ${error.message}`);
  process.exit(1);
}
app.listen(port, () => {
  console.log(`[INFO] [Server] Running on port ${port}`);
  console.log(
    `[INFO] [Server] Environment: ${process.env.NODE_ENV || "development"}`,
  );
});
