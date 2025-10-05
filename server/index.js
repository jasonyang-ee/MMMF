import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3600;

// Database file paths
const DATA_DIR = path.join(__dirname, "..", "data");
const TRANSACTIONS_FILE = path.join(DATA_DIR, "transactions.json");
const RECURRING_FILE = path.join(DATA_DIR, "recurring.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const CREDIT_CARDS_FILE = path.join(DATA_DIR, "credit-cards.json");

// Ensure data directory exists
async function initializeDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Initialize files if they don't exist
    try {
      await fs.access(TRANSACTIONS_FILE);
    } catch {
      await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify([], null, 2));
    }

    try {
      await fs.access(RECURRING_FILE);
    } catch {
      await fs.writeFile(RECURRING_FILE, JSON.stringify([], null, 2));
    }

    try {
      await fs.access(SETTINGS_FILE);
    } catch {
      // Initialize with default settings including current date and 30-day forecast
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const forecastEnd = new Date(today);
      forecastEnd.setDate(forecastEnd.getDate() + 30);
      const forecastEndStr = forecastEnd.toISOString().split("T")[0];

      await fs.writeFile(
        SETTINGS_FILE,
        JSON.stringify(
          {
            startingBalance: 0,
            currentDate: todayStr,
            forecastEndDate: forecastEndStr,
          },
          null,
          2
        )
      );
    }

    try {
      await fs.access(CREDIT_CARDS_FILE);
    } catch {
      await fs.writeFile(CREDIT_CARDS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error("Error initializing data directory:", error);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "dist")));
}

// Helper functions for file operations
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// API Routes

// Get all transactions
app.get("/api/transactions", async (req, res) => {
  const transactions = await readJsonFile(TRANSACTIONS_FILE);
  res.json(transactions || []);
});

// Add a new transaction
app.post("/api/transactions", async (req, res) => {
  const transactions = await readJsonFile(TRANSACTIONS_FILE);
  const newTransaction = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);

  if (await writeJsonFile(TRANSACTIONS_FILE, transactions)) {
    res.status(201).json(newTransaction);
  } else {
    res.status(500).json({ error: "Failed to save transaction" });
  }
});

// Update a transaction
app.put("/api/transactions/:id", async (req, res) => {
  const transactions = await readJsonFile(TRANSACTIONS_FILE);
  const index = transactions.findIndex((t) => t.id === req.params.id);

  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...req.body };
    if (await writeJsonFile(TRANSACTIONS_FILE, transactions)) {
      res.json(transactions[index]);
    } else {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  } else {
    res.status(404).json({ error: "Transaction not found" });
  }
});

// Delete a transaction
app.delete("/api/transactions/:id", async (req, res) => {
  const transactions = await readJsonFile(TRANSACTIONS_FILE);
  const filtered = transactions.filter((t) => t.id !== req.params.id);

  if (await writeJsonFile(TRANSACTIONS_FILE, filtered)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

// Clear all transactions (but keep recurring)
app.delete("/api/transactions", async (req, res) => {
  if (await writeJsonFile(TRANSACTIONS_FILE, [])) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Failed to clear transactions" });
  }
});

// Get all recurring transactions
app.get("/api/recurring", async (req, res) => {
  const recurring = await readJsonFile(RECURRING_FILE);
  res.json(recurring || []);
});

// Add a new recurring transaction
app.post("/api/recurring", async (req, res) => {
  const recurring = await readJsonFile(RECURRING_FILE);
  const newRecurring = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  recurring.push(newRecurring);

  if (await writeJsonFile(RECURRING_FILE, recurring)) {
    res.status(201).json(newRecurring);
  } else {
    res.status(500).json({ error: "Failed to save recurring transaction" });
  }
});

// Update a recurring transaction
app.put("/api/recurring/:id", async (req, res) => {
  const recurring = await readJsonFile(RECURRING_FILE);
  const index = recurring.findIndex((r) => r.id === req.params.id);

  if (index !== -1) {
    recurring[index] = { ...recurring[index], ...req.body };
    if (await writeJsonFile(RECURRING_FILE, recurring)) {
      res.json(recurring[index]);
    } else {
      res.status(500).json({ error: "Failed to update recurring transaction" });
    }
  } else {
    res.status(404).json({ error: "Recurring transaction not found" });
  }
});

// Delete a recurring transaction
app.delete("/api/recurring/:id", async (req, res) => {
  const recurring = await readJsonFile(RECURRING_FILE);
  const filtered = recurring.filter((r) => r.id !== req.params.id);

  if (await writeJsonFile(RECURRING_FILE, filtered)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Failed to delete recurring transaction" });
  }
});

// Get all credit cards
app.get("/api/credit-cards", async (req, res) => {
  const creditCards = await readJsonFile(CREDIT_CARDS_FILE);
  res.json(creditCards || []);
});

// Add a new credit card
app.post("/api/credit-cards", async (req, res) => {
  const creditCards = await readJsonFile(CREDIT_CARDS_FILE);
  const newCard = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  creditCards.push(newCard);

  if (await writeJsonFile(CREDIT_CARDS_FILE, creditCards)) {
    res.status(201).json(newCard);
  } else {
    res.status(500).json({ error: "Failed to save credit card" });
  }
});

// Update a credit card
app.put("/api/credit-cards/:id", async (req, res) => {
  const creditCards = await readJsonFile(CREDIT_CARDS_FILE);
  const index = creditCards.findIndex((c) => c.id === req.params.id);

  if (index !== -1) {
    creditCards[index] = {
      ...creditCards[index],
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
    };

    if (await writeJsonFile(CREDIT_CARDS_FILE, creditCards)) {
      res.json(creditCards[index]);
    } else {
      res.status(500).json({ error: "Failed to update credit card" });
    }
  } else {
    res.status(404).json({ error: "Credit card not found" });
  }
});

// Delete a credit card
app.delete("/api/credit-cards/:id", async (req, res) => {
  const creditCards = await readJsonFile(CREDIT_CARDS_FILE);
  const filtered = creditCards.filter((c) => c.id !== req.params.id);

  if (await writeJsonFile(CREDIT_CARDS_FILE, filtered)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Failed to delete credit card" });
  }
});

// Get settings (starting balance, etc.)
app.get("/api/settings", async (req, res) => {
  let settings = await readJsonFile(SETTINGS_FILE);

  // Ensure default values if settings exist but are missing fields
  if (!settings) {
    settings = { startingBalance: 0 };
  }

  // Add default dates if missing
  if (!settings.currentDate) {
    const today = new Date();
    settings.currentDate = today.toISOString().split("T")[0];
  }

  if (!settings.forecastEndDate) {
    const forecastEnd = new Date(settings.currentDate);
    forecastEnd.setDate(forecastEnd.getDate() + 30);
    settings.forecastEndDate = forecastEnd.toISOString().split("T")[0];
  }

  res.json(settings);
});

// Update settings
app.put("/api/settings", async (req, res) => {
  if (await writeJsonFile(SETTINGS_FILE, req.body)) {
    res.json(req.body);
  } else {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
  });
}

// Initialize and start server
await initializeDataDir();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
