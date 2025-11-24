import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// API routes with CORS
app.use("/api/*", cors());

// Helper to get data from KV with default
async function getData(c, key, defaultValue = []) {
  const data = await c.env.MMMF_KV.get(key);
  return data ? JSON.parse(data) : defaultValue;
}

// Helper to save data to KV
async function saveData(c, key, data) {
  await c.env.MMMF_KV.put(key, JSON.stringify(data));
}

// --- Transactions ---

app.get("/api/transactions", async (c) => {
  const transactions = await getData(c, "transactions");
  return c.json(transactions);
});

app.post("/api/transactions", async (c) => {
  const transactions = await getData(c, "transactions");
  const body = await c.req.json();
  const newTransaction = {
    id: Date.now().toString(),
    ...body,
    createdAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  await saveData(c, "transactions", transactions);
  return c.json(newTransaction, 201);
});

app.put("/api/transactions/:id", async (c) => {
  const id = c.req.param("id");
  const transactions = await getData(c, "transactions");
  const index = transactions.findIndex((t) => t.id === id);

  if (index !== -1) {
    const body = await c.req.json();
    transactions[index] = { ...transactions[index], ...body };
    await saveData(c, "transactions", transactions);
    return c.json(transactions[index]);
  }
  return c.json({ error: "Transaction not found" }, 404);
});

app.delete("/api/transactions/:id", async (c) => {
  const id = c.req.param("id");
  const transactions = await getData(c, "transactions");
  const filtered = transactions.filter((t) => t.id !== id);
  await saveData(c, "transactions", filtered);
  return c.json({ success: true });
});

app.delete("/api/transactions", async (c) => {
  await saveData(c, "transactions", []);
  return c.json({ success: true });
});

// --- Recurring ---

app.get("/api/recurring", async (c) => {
  const recurring = await getData(c, "recurring");
  return c.json(recurring);
});

app.post("/api/recurring", async (c) => {
  const recurring = await getData(c, "recurring");
  const body = await c.req.json();
  const newRecurring = {
    id: Date.now().toString(),
    ...body,
    createdAt: new Date().toISOString(),
  };
  recurring.push(newRecurring);
  await saveData(c, "recurring", recurring);
  return c.json(newRecurring, 201);
});

app.put("/api/recurring/:id", async (c) => {
  const id = c.req.param("id");
  const recurring = await getData(c, "recurring");
  const index = recurring.findIndex((r) => r.id === id);

  if (index !== -1) {
    const body = await c.req.json();
    recurring[index] = { ...recurring[index], ...body };
    await saveData(c, "recurring", recurring);
    return c.json(recurring[index]);
  }
  return c.json({ error: "Recurring transaction not found" }, 404);
});

app.delete("/api/recurring/:id", async (c) => {
  const id = c.req.param("id");
  const recurring = await getData(c, "recurring");
  const filtered = recurring.filter((r) => r.id !== id);
  await saveData(c, "recurring", filtered);
  return c.json({ success: true });
});

// --- Credit Cards ---

app.get("/api/credit-cards", async (c) => {
  const cards = await getData(c, "credit-cards");
  return c.json(cards);
});

app.post("/api/credit-cards", async (c) => {
  const cards = await getData(c, "credit-cards");
  const body = await c.req.json();
  const newCard = {
    id: Date.now().toString(),
    ...body,
    createdAt: new Date().toISOString(),
  };
  cards.push(newCard);
  await saveData(c, "credit-cards", cards);
  return c.json(newCard, 201);
});

app.put("/api/credit-cards/:id", async (c) => {
  const id = c.req.param("id");
  const cards = await getData(c, "credit-cards");
  const index = cards.findIndex((c) => c.id === id);

  if (index !== -1) {
    const body = await c.req.json();
    cards[index] = { ...cards[index], ...body, id }; // Ensure ID doesn't change
    await saveData(c, "credit-cards", cards);
    return c.json(cards[index]);
  }
  return c.json({ error: "Credit card not found" }, 404);
});

app.delete("/api/credit-cards/:id", async (c) => {
  const id = c.req.param("id");
  const cards = await getData(c, "credit-cards");
  const filtered = cards.filter((c) => c.id !== id);
  await saveData(c, "credit-cards", filtered);
  return c.json({ success: true });
});

// --- Settings ---

app.get("/api/settings", async (c) => {
  let settings = await getData(c, "settings", null);

  // Default settings logic (mirrored from server/index.js)
  if (!settings) {
    settings = { startingBalance: 0 };
  }

  if (!settings.currentDate) {
    const today = new Date();
    settings.currentDate = today.toISOString().split("T")[0];
  }

  if (!settings.forecastEndDate) {
    const forecastEnd = new Date(settings.currentDate);
    forecastEnd.setDate(forecastEnd.getDate() + 30);
    settings.forecastEndDate = forecastEnd.toISOString().split("T")[0];
  }

  if (!settings.currencySymbol) settings.currencySymbol = "USD";
  if (!settings.dateFormat) settings.dateFormat = "MMM dd, yyyy";
  if (!settings.language) settings.language = "en";

  return c.json(settings);
});

app.put("/api/settings", async (c) => {
  const body = await c.req.json();
  await saveData(c, "settings", body);
  return c.json(body);
});

export default app;
