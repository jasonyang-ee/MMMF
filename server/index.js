import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = process.env.PORT || 3600;
const app = createApp({
  dataDirectory: process.env.DATA_DIR || path.join(root, "data"),
  staticDirectory: path.join(root, "client/dist"),
});
app.listen(port, () => {
  console.log(`[INFO] [Server] Running on port ${port}`);
  console.log(
    `[INFO] [Server] Environment: ${process.env.NODE_ENV || "development"}`,
  );
});
