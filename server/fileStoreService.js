import fs from "node:fs/promises";
import path from "node:path";

const pending = new Map();

export function createFileStore(directory) {
  const file = (key) => path.join(directory, `${key}.json`);
  const read = async (key, fallback) => {
    try {
      return JSON.parse(await fs.readFile(file(key), "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return fallback;
      throw error;
    }
  };
  return {
    read,
    async update(key, fallback, change) {
      const target = file(key);
      const previous = pending.get(target) || Promise.resolve();
      const operation = previous
        .catch(() => {})
        .then(async () => {
          const result = await change(await read(key, fallback));
          await fs.mkdir(directory, { recursive: true });
          const temporary = `${target}.tmp`;
          try {
            const handle = await fs.open(temporary, "w", 0o600);
            try {
              await handle.writeFile(JSON.stringify(result, null, 2));
              await handle.sync();
            } finally {
              await handle.close();
            }
            await fs.rename(temporary, target);
          } finally {
            await fs.rm(temporary, { force: true });
          }
        });
      pending.set(target, operation);
      try {
        await operation;
      } finally {
        if (pending.get(target) === operation) pending.delete(target);
      }
    },
  };
}
