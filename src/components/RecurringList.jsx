import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { formatCurrency } from "../utils";

const ITEM_TYPE = "RECURRING_TRANSACTION";

function RecurringItem({ item, onDelete, onUse }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { ...item },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onUse(item);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`transaction-item ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex-1">
        <div className="font-medium text-gray-900">{item.name}</div>
        <div className="text-sm text-gray-500">
          {item.type === "credit" ? "Income" : "Payment"}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span
          className={`text-lg font-semibold ${
            item.type === "credit" ? "text-green-600" : "text-red-600"
          }`}
        >
          {item.type === "credit" ? "+" : "-"}
          {formatCurrency(item.amount)}
        </span>

        <button
          onClick={() => onUse(item)}
          className="text-primary-600 hover:text-primary-700 p-1"
          title="Use this transaction"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="text-red-600 hover:text-red-700 p-1"
          title="Delete recurring transaction"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function RecurringList({
  recurring,
  onAddRecurring,
  onDeleteRecurring,
  onUseRecurring,
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "debit",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.amount) {
      alert("Please fill in all fields");
      return;
    }

    onAddRecurring({
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type,
    });

    setFormData({ name: "", amount: "", type: "debit" });
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Recurring Transactions ({recurring.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {showForm ? "Cancel" : "+ Add New"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3"
        >
          <input
            type="text"
            placeholder="Description"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input text-sm"
            required
          />

          <input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            step="0.01"
            min="0"
            className="input text-sm"
            required
          />

          <div className="flex space-x-3">
            <label className="flex items-center text-sm">
              <input
                type="radio"
                value="debit"
                checked={formData.type === "debit"}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="mr-1"
              />
              <span className="text-red-600">Payment</span>
            </label>
            <label className="flex items-center text-sm">
              <input
                type="radio"
                value="credit"
                checked={formData.type === "credit"}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="mr-1"
              />
              <span className="text-green-600">Income</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full text-sm">
            Save Recurring Transaction
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {recurring.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recurring transactions</p>
            <p className="text-sm mt-2">
              Add frequently used transactions here
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3 p-2 bg-blue-50 rounded">
              💡 Drag or click + to add to transactions
            </p>
            {recurring.map((item) => (
              <RecurringItem
                key={item.id}
                item={item}
                onDelete={onDeleteRecurring}
                onUse={onUseRecurring}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default RecurringList;
