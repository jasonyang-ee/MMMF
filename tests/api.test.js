import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import http from "node:http";
import { spawnSync } from "node:child_process";
import { createApp } from "../server/app.js";
import hono from "../server/hono-app.js";
import {
  cleanupExpiredSessions,
  resolveSession,
  SESSION_MAX_AGE,
} from "../server/demo-session.js";
import { languages } from "../shared/preferences.js";
import worker from "../cloudflare/worker.js";

const legacy = JSON.parse(
  await fs.readFile(new URL("./fixtures/legacy-collections.json", import.meta.url), "utf8"),
);

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
    const server = createApp({ dataDirectory: directory, staticDirectory: directory, env }).listen(
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
    base,
    directory,
    KV,
    async seed(key, value, cookie) {
      const text = JSON.stringify(value, null, 2);
      const session = cookie?.split("=")[1];
      if (runtime === "Express") {
        const target = session ? path.join(directory, "sessions", session) : directory;
        await fs.mkdir(target, { recursive: true });
        await fs.writeFile(path.join(target, `${key}.json`), text);
      } else KV.values.set(session ? `${session}:${key}` : key, text);
      return text;
    },
    async stored(key, cookie) {
      const session = cookie?.split("=")[1];
      if (runtime === "Express")
        return fs.readFile(
          path.join(directory, ...(session ? ["sessions", session] : []), `${key}.json`),
          "utf8",
        );
      return KV.values.get(session ? `${session}:${key}` : key);
    },
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
  test(`${runtime}: legacy names preserve CRUD and unchanged patches`, async (t) => {
    const h = await harness(t, runtime);
    for (const [key, value] of Object.entries(legacy)) {
      const before = await h.seed(key, value);
      const read = await h.call(key);
      assert.equal(read.status, 200);
      assert.deepEqual(read.data, value);
      assert.equal(await h.stored(key), before, "GET must not migrate storage");
    }
    for (const key of ["transactions", "recurring", "credit-cards"]) {
      const original = legacy[key][0];
      const route = `${key}/${original.id}`;
      const added = await h.call(key, "POST", { ...original, name: "New neighbor" });
      assert.equal(added.status, 201);
      assert.equal((await h.call(`${key}/${added.data.id}`, "PUT", { name: "Edited neighbor" })).status, 200);
      const patch = key === "credit-cards" ? { dayOfMonth: 20 } : { amount: 75 };
      for (const body of [patch, { ...patch, name: original.name, id: "spoof", createdAt: "spoof" }]) {
        const updated = await h.call(route, "PUT", body);
        assert.equal(updated.status, 200);
        assert.deepEqual(updated.data, { ...original, ...patch });
      }
      assert.equal((await h.call(route, "DELETE")).status, 200);
      assert.deepEqual((await h.call(key)).data.map((item) => item.name), ["Edited neighbor"]);
    }
    for (const [key, value] of Object.entries(legacy)) await h.seed(key, value);
    assert.equal((await h.call("transactions", "DELETE")).status, 200);
    assert.deepEqual((await h.call("transactions")).data, []);
    for (const key of ["recurring", "credit-cards", "settings"])
      assert.deepEqual((await h.call(key)).data, legacy[key]);
  });
  test(`${runtime}: new and changed names retain validation`, async (t) => {
    const h = await harness(t, runtime);
    for (const key of ["transactions", "recurring", "credit-cards"]) {
      const original = legacy[key][0];
      const before = await h.seed(key, [original]);
      for (const name of ["x".repeat(201), original.name + "changed", " ", "", null, 123]) {
        assert.equal((await h.call(key, "POST", { ...original, name })).status, 400);
        assert.equal((await h.call(`${key}/${original.id}`, "PUT", { name })).status, 400);
        assert.equal(await h.stored(key), before, "Rejected names must leave storage intact");
      }
      const renamed = await h.call(`${key}/${original.id}`, "PUT", { name: "  Short name  " });
      assert.equal(renamed.status, 200);
      assert.deepEqual(renamed.data, { ...original, name: "Short name" });
      assert.equal((await h.call(key, "POST", { ...original, name: "x".repeat(200) })).status, 201);
    }
  });
  test(`${runtime}: legacy card names require a matching same-session debit link`, async (t) => {
    const h = await harness(t, runtime, { DEMO: "true" });
    const a = (await h.call("settings")).cookie;
    const b = (await h.call("settings")).cookie;
    const card = legacy["credit-cards"][0];
    const before = await h.seed("credit-cards", [card], a);
    const payment = { ...transaction, type: "debit", name: card.name, creditCardId: card.id };
    for (const patch of [
      { creditCardId: undefined }, { creditCardId: "999" }, { creditCardId: "bad" },
      { creditCardId: 1600000000003 }, { type: "credit" },
      { name: card.name.trim() }, { name: card.name + "different" },
      { amount: 0 }, { date: "2026-02-30" },
    ]) assert.equal((await h.call("transactions", "POST", { ...payment, ...patch }, a)).status, 400);
    assert.equal((await h.call("transactions", "POST", payment, b)).status, 400);
    await h.seed("credit-cards", [{ ...card, id: "999" }], b);
    assert.equal((await h.call("transactions", "POST", payment, b)).status, 400);
    assert.deepEqual((await h.call("transactions", "GET", undefined, b)).data, []);
    const created = await h.call("transactions", "POST", payment, a);
    assert.equal(created.status, 201);
    assert.deepEqual(created.data, { ...payment, id: created.data.id, createdAt: created.data.createdAt });
    assert.match(created.data.id, /^\d+$/);
    assert.equal(await h.stored("credit-cards", a), before);
    assert.equal((await h.call(`credit-cards/${card.id}`, "DELETE", undefined, a)).status, 200);
    const updated = await h.call(`transactions/${created.data.id}`, "PUT", { amount: 15, name: card.name }, a);
    assert.equal(updated.status, 200);
    assert.deepEqual(updated.data, { ...created.data, amount: 15 });
    assert.equal((await h.call("transactions", "POST", payment, a)).status, 400);
    assert.equal((await h.call("transactions", "POST", { ...payment, name: "Orphaned short link" }, a)).status, 201);
  });
  test(`${runtime}: other corrupt fields still fail without storage changes`, async (t) => {
    const h = await harness(t, runtime);
    for (const key of ["transactions", "recurring", "credit-cards"]) {
      const original = legacy[key][0];
      const corruptions = [
        { name: " " }, { name: 123 }, { id: "" }, { id: 123 }, { createdAt: null },
        ...(key !== "credit-cards" ? [{ amount: -1 }, { amount: "55" }, { type: "other" }] : []),
        ...(key === "transactions" ? [{ date: "2026-02-30" }, { creditCardId: "bad" }] : [{ dayOfMonth: 0 }, { dayOfMonth: 1.5 }]),
      ];
      for (const corruption of corruptions) {
        const before = await h.seed(key, [{ ...original, ...corruption }]);
        for (const [route, method, body] of [
          [key, "GET"], [key, "POST", { ...original, name: "Valid" }],
          [`${key}/${original.id}`, "PUT", { name: "Valid" }],
          [`${key}/${original.id}`, "DELETE"],
          ...(key === "transactions" ? [[key, "DELETE"]] : []),
        ]) {
          assert.equal((await h.call(route, method, body)).status, 500, `${key} ${method} ${JSON.stringify(corruption)}`);
          assert.equal(await h.stored(key), before);
        }
      }
    }
  });
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

function httpGet(base, route, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = http.get(`${base}${route}`, { headers }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, headers: response.headers, body }));
      response.on("error", reject);
    });
    request.on("error", reject);
  });
}

test("TRUST_PROXY accepts only scoped address lists", () => {
  for (const value of [undefined, "", " \t "])
    assert.equal(createApp({ env: { TRUST_PROXY: value } }).get("trust proxy"), false);
  const app = createApp({ env: { TRUST_PROXY: " 127.0.0.1/32, ::1/128, 192.0.2.0/24, 2001:db8::/32 " } });
  const trust = app.get("trust proxy fn");
  for (const ip of ["127.0.0.1", "::ffff:127.0.0.1", "::1", "192.0.2.10", "2001:db8:1::1"])
    assert.equal(trust(ip), true, ip);
  for (const ip of ["127.0.0.2", "203.0.113.1", "2001:db9::1"])
    assert.equal(trust(ip), false, ip);
  for (const ip of ["127.0.0.1", "::1", "::ffff:127.0.0.1"])
    assert.equal(createApp({ env: { TRUST_PROXY: ip } }).get("trust proxy fn")(ip), true);
  for (const value of [
    "true", "false", "1", "0", "loopback", "uniquelocal", "*", "localhost", ",",
    "127.0.0.1,", ",127.0.0.1", "127.0.0.1,,::1", "127.0.0.1, ,::1",
    "999.0.0.1", "127.1", "::gg", "127.0.0.1:1234", "[::1]",
    "0.0.0.0/0", "::/0", "127.0.0.1/33", "::1/129", "127.0.0.1/-1",
    "::1/+1", "127.0.0.1/1.5", "127.0.0.1/", "::1/64/2", "127.0.0.1/255.0.0.0",
  ]) assert.throws(() => createApp({ env: { TRUST_PROXY: value } }), /Invalid TRUST_PROXY/, value);
});

test("invalid TRUST_PROXY stops the real entrypoint before listening", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mmmf-startup-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const child = spawnSync(process.execPath, ["server/index.js"], {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: { ...process.env, TRUST_PROXY: "true", PORT: "0", DATA_DIR: directory },
    encoding: "utf8",
    timeout: 5000,
  });
  assert.equal(child.status, 1, child.stderr);
  assert.match(child.stderr, /^\[ERROR\] \[Server\] Invalid TRUST_PROXY/m);
  assert.doesNotMatch(child.stdout, /Running on port/);
  assert.deepEqual(await fs.readdir(directory), []);
});

test("trusted HTTPS proxy receives Secure demo cookies", async (t) => {
  const h = await harness(t, "Express", { DEMO: "true", TRUST_PROXY: "127.0.0.1/32" });
  const headers = {
    Host: "finance.example", Origin: "https://finance.example",
    "X-Forwarded-For": "203.0.113.1", "X-Forwarded-Proto": "https",
  };
  const a = await httpGet(h.base, "/api/settings", headers);
  assert.equal(a.status, 200);
  const cookie = a.headers["set-cookie"][0];
  for (const attribute of ["Secure", "HttpOnly", "SameSite=Strict", "Path=/", "Max-Age=432000"])
    assert.ok(cookie.split("; ").includes(attribute), attribute);
  const b = await httpGet(h.base, "/api/settings", headers);
  const aCookie = cookie.split(";")[0];
  const bCookie = b.headers["set-cookie"][0].split(";")[0];
  assert.notEqual(aCookie, bCookie);
  assert.equal((await h.call("transactions", "POST", transaction, aCookie, { "X-Forwarded-Proto": "https" })).status, 201);
  assert.equal((await h.call("transactions", "GET", undefined, aCookie)).data.length, 1);
  assert.deepEqual((await h.call("transactions", "GET", undefined, bCookie)).data, []);
  const plain = await httpGet(h.base, "/api/settings", { ...headers, "X-Forwarded-Proto": "http" });
  assert.doesNotMatch(plain.headers["set-cookie"][0], /; Secure/);
  assert.equal((await httpGet(h.base, "/api/settings", {
    ...headers, Origin: "https://attacker.example", "X-Forwarded-Host": "attacker.example",
  })).status, 403);
});

test("untrusted forwarding cannot change protocol or quotas", async (t) => {
  for (const TRUST_PROXY of [undefined, "192.0.2.1/32"]) {
    const h = await harness(t, "Express", { DEMO: "true", TRUST_PROXY });
    const headers = { "X-Forwarded-For": "203.0.113.1", "X-Forwarded-Proto": "https" };
    const response = await h.call("settings", "GET", undefined, undefined, headers);
    assert.equal(response.status, 200);
    assert.doesNotMatch(response.headers.get("set-cookie"), /; Secure/);
    for (let count = 1; count < 300; count++)
      assert.equal((await h.call("transactions", "GET", undefined, response.cookie, headers)).status, 200);
    assert.equal((await h.call("transactions", "GET", undefined, response.cookie, {
      ...headers, "X-Forwarded-For": "203.0.113.2",
    })).status, 429);
  }
});

test("trusted clients have independent API and static quotas", async (t) => {
  // Hold the clock and limiter intervals inside one window, even on slow CI.
  t.mock.timers.enable({ apis: ["Date", "setInterval"], now: Date.now() });
  const h = await harness(t, "Express", { TRUST_PROXY: "127.0.0.1/32,192.0.2.0/24" });
  await fs.writeFile(path.join(h.directory, "index.html"), "frontend");
  const a = { "X-Forwarded-For": "198.51.100.9, 203.0.113.1, 192.0.2.10" };
  const spoof = { "X-Forwarded-For": "198.51.100.10, 203.0.113.1, 192.0.2.10" };
  const b = { "X-Forwarded-For": "203.0.113.2, 192.0.2.10" };
  for (let count = 0; count < 300; count++)
    assert.equal((await h.call("transactions", "GET", undefined, undefined, a)).status, 200);
  assert.equal((await h.call("transactions", "GET", undefined, undefined, a)).status, 429);
  assert.equal((await h.call("transactions", "GET", undefined, undefined, spoof)).status, 429);
  assert.equal((await h.call("transactions", "GET", undefined, undefined, b)).status, 200);
  for (let count = 0; count < 50; count++)
    assert.equal((await httpGet(h.base, "/", a)).status, 200);
  assert.equal((await httpGet(h.base, "/", a)).status, 429);
  assert.equal((await httpGet(h.base, "/", spoof)).status, 429);
  assert.equal((await httpGet(h.base, "/", b)).status, 200);
  for (let count = 0; count < 55; count++)
    assert.equal((await httpGet(h.base, "/")).status, 200, "Direct loopback health checks remain exempt");
});
