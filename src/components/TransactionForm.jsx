import React, { useState } from "react";
import { getTodayDate } from "../utils";

function TransactionForm({ onAddTransaction }) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "debit",
    date: getTodayDate(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.date) {
      alert("Please fill in all fields");
      return;
    }

    onAddTransaction({
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type,
      date: formData.date,
    });

    // Reset form
    setFormData({
      name: "",
      amount: "",
      type: "debit",
      date: getTodayDate(),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
        Add Transaction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Description</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Rent payment"
            required
          />
        </div>

        <div>
          <label className="label">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="input"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="label">Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "debit" })}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                formData.type === "debit"
                  ? "bg-red-600 text-white shadow-md dark:bg-red-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#333333] dark:text-gray-300 dark:hover:bg-[#3a3a3a]"
              }`}
            >
              Debit (Payment)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "credit" })}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                formData.type === "credit"
                  ? "bg-green-600 text-white shadow-md dark:bg-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#333333] dark:text-gray-300 dark:hover:bg-[#3a3a3a]"
              }`}
            >
              Credit (Income)
            </button>
          </div>
        </div>

        <div>
          <label className="label">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="input cursor-pointer w-full"
            style={{
              WebkitAppearance: "none",
              MozAppearance: "textfield",
              appearance: "none",
            }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Add Transaction
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
