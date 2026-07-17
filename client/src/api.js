const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:3600/api";

async function checkOk(res) {
  if (!res.ok) {
    throw new Error(`${res.statusText} ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Transactions
  async getTransactions() {
    const res = await fetch(`${API_BASE}/transactions`);
    return checkOk(res);
  },

  async addTransaction(transaction) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });
    return checkOk(res);
  },

  async updateTransaction(id, transaction) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });
    return checkOk(res);
  },

  async deleteTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: "DELETE",
    });
    return checkOk(res);
  },

  async clearTransactions() {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: "DELETE",
    });
    return checkOk(res);
  },

  // Recurring transactions
  async getRecurring() {
    const res = await fetch(`${API_BASE}/recurring`);
    return checkOk(res);
  },

  async addRecurring(recurring) {
    const res = await fetch(`${API_BASE}/recurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recurring),
    });
    return checkOk(res);
  },

  async updateRecurring(id, recurring) {
    const res = await fetch(`${API_BASE}/recurring/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recurring),
    });
    return checkOk(res);
  },

  async deleteRecurring(id) {
    const res = await fetch(`${API_BASE}/recurring/${id}`, {
      method: "DELETE",
    });
    return checkOk(res);
  },

  // Credit Cards
  async getCreditCards() {
    const res = await fetch(`${API_BASE}/credit-cards`);
    return checkOk(res);
  },

  async addCreditCard(card) {
    const res = await fetch(`${API_BASE}/credit-cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
    return checkOk(res);
  },

  async updateCreditCard(id, card) {
    const res = await fetch(`${API_BASE}/credit-cards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
    return checkOk(res);
  },

  async deleteCreditCard(id) {
    const res = await fetch(`${API_BASE}/credit-cards/${id}`, {
      method: "DELETE",
    });
    return checkOk(res);
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return checkOk(res);
  },

  async updateSettings(settings) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return checkOk(res);
  },
};
