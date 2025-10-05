import React, { useState, useRef, useEffect } from "react";
import { formatCurrency } from "../utils";

function RecurringItem({ item, onDelete, onUpdate }) {
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editAmount, setEditAmount] = useState(item.amount);
  const [editName, setEditName] = useState(item.name);
  const amountInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isEditingAmount && amountInputRef.current) {
      amountInputRef.current.select();
    }
  }, [isEditingAmount]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleAmountClick = () => {
    setEditAmount(item.amount);
    setIsEditingAmount(true);
  };

  const handleNameClick = () => {
    setEditName(item.name);
    setIsEditingName(true);
  };

  const handleAmountBlur = () => {
    if (isEditingAmount) {
      const newAmount = parseFloat(editAmount);
      if (newAmount && newAmount > 0 && newAmount !== item.amount) {
        onUpdate(item.id, { ...item, amount: newAmount });
      }
      setIsEditingAmount(false);
    }
  };

  const handleNameBlur = () => {
    if (isEditingName) {
      const trimmedName = editName.trim();
      if (trimmedName && trimmedName !== item.name) {
        onUpdate(item.id, { ...item, name: trimmedName });
      }
      setIsEditingName(false);
    }
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAmountBlur();
    } else if (e.key === "Escape") {
      setEditAmount(item.amount);
      setIsEditingAmount(false);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setEditName(item.name);
      setIsEditingName(false);
    }
  };

  return (
    <div className="transaction-item py-1.5 px-2">
      <div className="flex-1 min-w-0">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="input text-sm font-medium w-full py-0.5 px-1.5 mb-0.5"
            autoFocus
          />
        ) : (
          <div
            onClick={handleNameClick}
            className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-0.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3a3a] px-1 py-0.5 rounded -ml-1"
            title="Click to edit description"
          >
            {item.name}
          </div>
        )}
        {item.dayOfMonth && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Day {item.dayOfMonth} of month
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1.5 flex-shrink-0">
        {isEditingAmount ? (
          <div className="flex items-center">
            <span
              className={`text-sm font-semibold mr-1 ${
                item.type === "credit"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {item.type === "credit" ? "+" : "-"}$
            </span>
            <input
              ref={amountInputRef}
              type="number"
              step="0.01"
              min="0"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              onBlur={handleAmountBlur}
              onKeyDown={handleAmountKeyDown}
              className="input text-sm font-semibold w-20 py-0.5 px-1.5"
              autoFocus
            />
          </div>
        ) : (
          <span
            onClick={handleAmountClick}
            className={`text-sm font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3a3a] px-1.5 py-0.5 rounded ${
              item.type === "credit"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
            title="Click to edit amount"
          >
            {item.type === "credit" ? "+" : "-"}
            {formatCurrency(item.amount)}
          </span>
        )}

        <button
          onClick={() => onDelete(item.id)}
          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-0.5"
          title="Delete recurring transaction"
        >
          <svg
            className="w-4 h-4"
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
  onUpdateRecurring,
  onDeleteRecurring,
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "debit",
    dayOfMonth: "",
  });
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (showForm && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showForm]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.dayOfMonth) {
      alert("Please fill in all fields");
      return;
    }

    const dayOfMonth = parseInt(formData.dayOfMonth);
    if (dayOfMonth < 1 || dayOfMonth > 31) {
      alert("Day of month must be between 1 and 31");
      return;
    }

    onAddRecurring({
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type,
      dayOfMonth: dayOfMonth,
    });

    setFormData({ name: "", amount: "", type: "debit", dayOfMonth: "" });
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold dark:text-gray-100">
          Recurring Transactions
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-primary-600 hover:text-primary-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium"
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg space-y-3"
        >
          <input
            ref={nameInputRef}
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

          <input
            type="number"
            placeholder="Day of Month (1-31)"
            value={formData.dayOfMonth}
            onChange={(e) =>
              setFormData({ ...formData, dayOfMonth: e.target.value })
            }
            min="1"
            max="31"
            className="input text-sm"
            required
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "debit" })}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                formData.type === "debit"
                  ? "bg-red-600 text-white shadow-md dark:bg-red-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#333333] dark:text-gray-300 dark:hover:bg-[#3a3a3a]"
              }`}
            >
              Payment
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "credit" })}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                formData.type === "credit"
                  ? "bg-green-600 text-white shadow-md dark:bg-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#333333] dark:text-gray-300 dark:hover:bg-[#3a3a3a]"
              }`}
            >
              Income
            </button>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm"
          >
            Save Recurring Transaction
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {recurring.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No recurring transactions</p>
            <p className="text-sm mt-2">
              Recurring transactions are auto-generated each month
            </p>
          </div>
        ) : (
          recurring.map((item) => (
            <RecurringItem
              key={item.id}
              item={item}
              onUpdate={onUpdateRecurring}
              onDelete={onDeleteRecurring}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RecurringList;
