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
      <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>

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
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="debit"
                checked={formData.type === "debit"}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-red-600 font-medium">Debit (Payment)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="credit"
                checked={formData.type === "credit"}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-green-600 font-medium">
                Credit (Income)
              </span>
            </label>
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
            style={{ colorScheme: "light" }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Add Transaction
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
