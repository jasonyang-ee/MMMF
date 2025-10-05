const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:3600/api";

export const api = {
  // Transactions
  async getTransactions() {
    const res = await fetch(`${API_BASE}/transactions`);
    return res.json();
  },

  async addTransaction(transaction) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });
    return res.json();
  },

  async updateTransaction(id, transaction) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });
    return res.json();
  },

  async deleteTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },

  async clearTransactions() {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: "DELETE",
    });
    return res.json();
  },

  // Recurring transactions
  async getRecurring() {
    const res = await fetch(`${API_BASE}/recurring`);
    return res.json();
  },

  async addRecurring(recurring) {
    const res = await fetch(`${API_BASE}/recurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recurring),
    });
    return res.json();
  },

  async updateRecurring(id, recurring) {
    const res = await fetch(`${API_BASE}/recurring/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recurring),
    });
    return res.json();
  },

  async deleteRecurring(id) {
    const res = await fetch(`${API_BASE}/recurring/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },

  // Credit Cards
  async getCreditCards() {
    const res = await fetch(`${API_BASE}/credit-cards`);
    return res.json();
  },

  async addCreditCard(card) {
    const res = await fetch(`${API_BASE}/credit-cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
    return res.json();
  },

  async deleteCreditCard(id) {
    const res = await fetch(`${API_BASE}/credit-cards/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settings) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return res.json();
  },
};
