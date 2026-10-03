import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import { createApp } from "../server/app.js";
import hono from "../server/hono-app.js";
import {
  cleanupExpiredSessions,
  resolveSession,
  SESSION_MAX_AGE,
} from "../server/demo-session.js";
import { languages } from "../shared/preferences.js";
import worker from "../cloudflare/worker.js";

class MemoryKV {
  values = new Map();
  expirations = new Map();
  async get(key) {
    return this.values.get(key) ?? null;
  }
  async put(key, value, options) {
    this.values.set(key, value);
    if (options) this.expirations.set(key, options.expiration);
  }
  async delete(key) {
    this.values.delete(key);
  }
  async list({ prefix }) {
    return {
      keys: [...this.values.keys()]
        .filter((key) => key.startsWith(prefix))
        .map((name) => ({ name })),
      list_complete: true,
    };
  }
}
async function harness(t, runtime, env = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mmmf-test-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const KV = new MemoryKV();
  let base = "http://localhost";
  let request;
  if (runtime === "Express") {
    const server = createApp({ dataDirectory: directory, env }).listen(
      0,
      "127.0.0.1",
    );
    await once(server, "listening");
    base = `http://127.0.0.1:${server.address().port}`;
    request = (url, init) => fetch(url, init);
    t.after(
      () =>
        new Promise((resolve) => {
          server.closeAllConnections();
          server.close(resolve);
        }),
    );
  } else {
    request = (url, init) =>
      hono.fetch(new Request(url, init), { MMMF_KV: KV, ...env });
  }
  return {
    directory,
    KV,
    async call(route, method = "GET", body, cookie, headers = {}) {
      const response = await request(`${base}/api/${route}`, {
        method,
        headers: {
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
          ...headers,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      return {
        status: response.status,
        data: await response.json(),
        cookie: response.headers.get("set-cookie")?.split(";")[0],
        headers: response.headers,
      };
    },
  };
}
const transaction = {
  name: "Salary",
  amount: 125.25,
  type: "credit",
  date: "2026-10-01",
};

for (const runtime of ["Express", "Hono"]) {
  test(`${runtime}: CRUD, validation, metadata, defaults and language parity`, async (t) => {
    const h = await harness(t, runtime, { DEFAULT_LANGUAGE: "ja" });
    assert.equal((await h.call("settings")).data.language, "ja");
    for (const [stored, expected] of [
      [{ language: "unsupported" }, "en"],
      [{}, "ja"],
    ]) {
      if (runtime === "Express")
        await fs.writeFile(
          path.join(h.directory, "settings.json"),
          JSON.stringify(stored),
        );
      else h.KV.values.set("settings", JSON.stringify(stored));
      assert.equal((await h.call("settings")).data.language, expected);
    }
    for (const [key, input] of [
      ["transactions", transaction],
      [
        "recurring",
        { name: "Rent", amount: 500, type: "debit", dayOfMonth: 31 },
      ],
      ["credit-cards", { name: "Visa", dayOfMonth: 10 }],
    ]) {
      assert.deepEqual((await h.call(key)).data, []);
      assert.equal((await h.call(key, "POST", {})).status, 400);
      const created = await h.call(key, "POST", {
        ...input,
        id: "attacker",
        createdAt: "old",
        extra: "ignored",
      });
      assert.equal(created.status, 201);
      assert.match(created.data.id, /^\d+$/);
      assert.notEqual(created.data.createdAt, "old");
      assert.equal(created.data.extra, undefined);
      const updated = await h.call(`${key}/${created.data.id}`, "PUT", {
        name: "Updated",
        id: "changed",
        createdAt: "changed",
      });
      assert.equal(updated.data.id, created.data.id);
      assert.equal(updated.data.createdAt, created.data.createdAt);
      assert.equal(
        (await h.call(`${key}/missing`, "PUT", { name: "Missing" })).status,
        404,
      );
      assert.equal(
        (await h.call(`${key}/${created.data.id}`, "DELETE")).data.success,
        true,
      );
      assert.deepEqual((await h.call(key)).data, []);
    }
    for (const input of [
      null,
      [],
      { ...transaction, amount: "12" },
      { ...transaction, amount: -1 },
      { ...transaction, amount: 0 },
      { ...transaction, date: "2026-02-30" },
      { ...transaction, name: " " },
      { ...transaction, type: "other" },
    ]) {
      assert.equal(
        (await h.call("transactions", "POST", input)).status,
        400,
        JSON.stringify(input),
      );
    }
    assert.equal(
      (
        await h.call("recurring", "POST", {
          name: "Test",
          amount: 1,
          type: "credit",
          dayOfMonth: 1.5,
        })
      ).status,
      400,
    );
    for (const input of [
      null,
      [],
      { language: "unsupported" },
      { startingBalance: "0" },
      { currentDate: "bad" },
      { currencySymbol: "$" },
      { dateFormat: "invalid" },
      { currentDate: "2026-10-02", forecastEndDate: "2026-10-01" },
    ]) {
      assert.equal(
        (await h.call("settings", "PUT", input)).status,
        400,
        JSON.stringify(input),
      );
    }
    for (const { value } of languages)
      assert.equal(
        (await h.call("settings", "PUT", { language: value })).data.language,
        value,
      );
    await h.call("settings", "PUT", { startingBalance: 99 });
    assert.equal(
      (await h.call("settings", "PUT", { currencySymbol: "KWD" })).data
        .startingBalance,
      99,
    );
    await h.call("transactions", "POST", transaction);
    await h.call("recurring", "POST", {
      name: "Rent",
      amount: 100,
      type: "debit",
      dayOfMonth: 1,
    });
    await h.call("credit-cards", "POST", { name: "Visa", dayOfMonth: 1 });
    assert.equal((await h.call("transactions", "DELETE")).status, 200);
    assert.deepEqual((await h.call("transactions")).data, []);
    assert.equal((await h.call("recurring")).data.length, 1);
    assert.equal((await h.call("credit-cards")).data.length, 1);
    assert.equal((await h.call("missing")).status, 404);
    assert.equal(
      (
        await h.call("settings", "GET", undefined, undefined, {
          Origin: "https://attacker.example",
        })
      ).status,
      403,
    );
    assert.equal(
      (await h.call("settings")).headers.get("cache-control"),
      "no-store",
    );
  });
  test(`${runtime}: independent demo sessions, invalid and expired cookies`, async (t) => {
    const h = await harness(t, runtime, { DEMO: "true" });
    const first = await h.call("settings");
    const second = await h.call("settings");
    assert.notEqual(first.cookie, second.cookie);
    for (const key of ["transactions", "recurring", "credit-cards"]) {
      const input =
        key === "transactions"
          ? transaction
          : key === "recurring"
            ? { name: "Only A", amount: 1, type: "debit", dayOfMonth: 1 }
            : { name: "Only A", dayOfMonth: 1 };
      await h.call(key, "POST", input, first.cookie);
      assert.equal(
        (await h.call(key, "GET", undefined, first.cookie)).data.length,
        1,
      );
      assert.deepEqual(
        (await h.call(key, "GET", undefined, second.cookie)).data,
        [],
      );
    }
    await h.call("settings", "PUT", { startingBalance: 999 }, first.cookie);
    assert.equal(
      (await h.call("settings", "GET", undefined, second.cookie)).data
        .startingBalance,
      0,
    );
    for (const cookie of [
      "mmmf_demo_session=../../escape",
      "mmmf_demo_session=%ZZ",
      `mmmf_demo_session=demo_abcdefghijklmnop_${Date.now() - SESSION_MAX_AGE * 1000 - 1000}`,
    ]) {
      const result = await h.call("transactions", "GET", undefined, cookie);
      assert.equal(result.status, 200);
      assert.ok(result.cookie);
      assert.deepEqual(result.data, []);
    }
    if (runtime === "Hono") assert.equal(h.KV.expirations.size, 4);
  });
  test(`${runtime}: unreadable/corrupt persisted data fails visibly and is preserved`, async (t) => {
    const h = await harness(t, runtime);
    if (runtime === "Express")
      await fs.writeFile(
        path.join(h.directory, "transactions.json"),
        "broken-json",
      );
    else h.KV.values.set("transactions", "broken-json");
    for (const [method, body] of [
      ["GET", undefined],
      ["POST", transaction],
      ["DELETE", undefined],
    ])
      assert.equal((await h.call("transactions", method, body)).status, 500);
    const value =
      runtime === "Express"
        ? await fs.readFile(path.join(h.directory, "transactions.json"), "utf8")
        : h.KV.values.get("transactions");
    assert.equal(value, "broken-json");
  });
  test(`${runtime}: active API limiter also covers loopback requests`, async (t) => {
    const h = await harness(t, runtime);
    for (let count = 0; count < 300; count++)
      assert.equal((await h.call("transactions")).status, 200);
    assert.equal((await h.call("transactions")).status, 429);
  });
}
for (const runtime of ["Express", "Hono"]) {
  test(`${runtime}: structurally corrupt collections and oversized bodies are rejected`, async (t) => {
    const h = await harness(t, runtime);
    for (const value of ["{}", "[null]", "[{}]"]) {
      if (runtime === "Express")
        await fs.writeFile(path.join(h.directory, "recurring.json"), value);
      else h.KV.values.set("recurring", value);
      assert.equal((await h.call("recurring")).status, 500);
    }
    assert.equal(
      (
        await h.call("transactions", "POST", {
          ...transaction,
          name: "x".repeat(110_000),
        })
      ).status,
      413,
    );
  });
}
test("Express serializes concurrent additions and merges independent settings changes", async (t) => {
  const h = await harness(t, "Express");
  const results = await Promise.all(
    Array.from({ length: 30 }, (_, index) =>
      h.call("transactions", "POST", { ...transaction, name: String(index) }),
    ),
  );
  assert.ok(results.every((result) => result.status === 201));
  const all = (await h.call("transactions")).data;
  assert.equal(all.length, 30);
  assert.equal(new Set(all.map((item) => item.id)).size, 30);
  await Promise.all([
    h.call("settings", "PUT", { startingBalance: 44 }),
    h.call("settings", "PUT", { language: "fr" }),
  ]);
  const settings = (await h.call("settings")).data;
  assert.equal(settings.startingBalance, 44);
  assert.equal(settings.language, "fr");
  assert.match(
    await fs.readFile(path.join(h.directory, "transactions.json"), "utf8"),
    /\n  \{/,
  );
});
test("demo cleanup follows pagination and expires only old session keys", async () => {
  const old = `demo_abcdefghijklmnop_${Date.now() - SESSION_MAX_AGE * 1000 - 1000}`;
  const fresh = resolveSession().id;
  const removed = [];
  const KV = {
    list: async ({ cursor }) =>
      cursor
        ? {
            keys: [{ name: `${old}:settings` }, { name: `${fresh}:settings` }],
            list_complete: true,
          }
        : {
            keys: [{ name: `${old}:transactions` }],
            list_complete: false,
            cursor: "next",
          },
    delete: async (key) => removed.push(key),
  };
  await cleanupExpiredSessions(KV);
  assert.deepEqual(removed, [`${old}:transactions`, `${old}:settings`]);
});
test("Worker routes API errors to JSON and frontend navigation to ASSETS", async () => {
  const env = {
    MMMF_KV: new MemoryKV(),
    ASSETS: { fetch: () => new Response("frontend") },
  };
  assert.equal(
    await (
      await worker.fetch(new Request("https://test.example/deep/link"), env)
    ).text(),
    "frontend",
  );
  const response = await worker.fetch(
    new Request("https://test.example/api/missing"),
    env,
  );
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Not found" });
});
