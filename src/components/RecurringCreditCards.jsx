import React, { useState, useRef, useEffect } from "react";
import { formatDate } from "../utils";

function CreditCardItem({
  item,
  onDelete,
  onUpdate,
  onUse,
  currentDate,
  forecastEndDate,
  transactions,
}) {
  const [showAmountForm, setShowAmountForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameClick = () => {
    setEditName(item.name);
    setIsEditingName(true);
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

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setEditName(item.name);
      setIsEditingName(false);
    }
  };

  // Calculate the next occurrence date based on dayOfMonth and existing transactions
  const getNextOccurrenceDate = () => {
    if (!item.dayOfMonth) return "";

    // Parse dates in local timezone to avoid off-by-one errors
    const parseLocalDate = (dateString) => {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const today = parseLocalDate(currentDate);
    const endDate = parseLocalDate(forecastEndDate);

    // Find all existing transactions for this credit card
    const existingDates = transactions
      .filter((t) => t.name === item.name)
      .map((t) => parseLocalDate(t.date))
      .sort((a, b) => b - a); // Sort descending to get most recent first

    // Start from current month
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();

    // If there are existing transactions, start from the month after the latest one
    if (existingDates.length > 0) {
      const latestTransaction = existingDates[0];
      currentYear = latestTransaction.getFullYear();
      currentMonth = latestTransaction.getMonth() + 1; // Next month after latest transaction

      // Handle year rollover
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    // Find the next valid date starting from the determined month
    let targetDate = null;
    const maxIterations = 12; // Check up to 12 months ahead

    for (let i = 0; i < maxIterations; i++) {
      const testMonth = currentMonth + i;
      const testYear = currentYear + Math.floor(testMonth / 12);
      const normalizedMonth = testMonth % 12;

      // Get the last day of the target month
      const lastDayOfMonth = new Date(
        testYear,
        normalizedMonth + 1,
        0
      ).getDate();

      // Use the specified day or the last day of the month, whichever is smaller
      const dayToUse = Math.min(item.dayOfMonth, lastDayOfMonth);

      const testDate = new Date(testYear, normalizedMonth, dayToUse);

      // Check if this date is valid (after today and not already used)
      const isAfterToday = testDate > today;
      const isNotUsed = !existingDates.some((existing) => {
        return (
          existing.getFullYear() === testDate.getFullYear() &&
          existing.getMonth() === testDate.getMonth() &&
          existing.getDate() === testDate.getDate()
        );
      });
      const isWithinForecast = testDate <= endDate;

      if (isAfterToday && isNotUsed && isWithinForecast) {
        targetDate = testDate;
        break;
      }
    }

    if (!targetDate) {
      return ""; // No upcoming date within forecast range
    }

    // Format as YYYY-MM-DD
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextDate = getNextOccurrenceDate();

    if (!amount) {
      alert("Please enter amount");
      return;
    }

    if (!nextDate) {
      alert("No upcoming payment date within forecast range");
      return;
    }

    onUse({
      name: item.name,
      amount: parseFloat(amount),
      date: nextDate,
    });
    setAmount("");
    setShowAmountForm(false);
  };

  const nextDate = getNextOccurrenceDate();

  return (
    <div className="border border-gray-200 dark:border-[#3a3a3a] rounded-lg p-1.5 bg-white dark:bg-[#2a2a2a]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="input text-sm font-medium w-full py-0.5 px-1.5"
              autoFocus
            />
          ) : (
            <div
              onClick={handleNameClick}
              className="font-medium text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3a3a] px-1 py-0.5 rounded -ml-1"
              title="Click to edit name"
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
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-0.5"
          title="Delete credit card"
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

      {!showAmountForm ? (
        <div>
          {nextDate && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Next: {formatDate(nextDate)}
            </p>
          )}
          <button
            onClick={() => setShowAmountForm(true)}
            className="w-full px-3 py-1.5 rounded-lg font-medium transition-colors duration-200 bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!nextDate}
          >
            {nextDate ? "Add Payment" : "No upcoming date"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Payment date: {nextDate ? formatDate(nextDate) : "N/A"}
          </div>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            className="input text-sm py-1"
            required
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 rounded-lg font-medium transition-colors duration-200 bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAmountForm(false);
                setAmount("");
              }}
              className="btn btn-secondary text-xs flex-1 py-1.5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function RecurringCreditCards({
  creditCards,
  onAddCreditCard,
  onUpdateCreditCard,
  onDeleteCreditCard,
  onUseCreditCard,
  currentDate,
  forecastEndDate,
  transactions,
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dayOfMonth: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dayOfMonth) {
      alert("Please enter card name and day of month");
      return;
    }

    const dayOfMonth = parseInt(formData.dayOfMonth);
    if (dayOfMonth < 1 || dayOfMonth > 31) {
      alert("Day of month must be between 1 and 31");
      return;
    }

    onAddCreditCard({
      name: formData.name,
      dayOfMonth: dayOfMonth,
    });
    setFormData({ name: "", dayOfMonth: "" });
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold dark:text-gray-100">
          Recurring Credit Cards
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
            type="text"
            placeholder="Card Name (e.g., Chase Sapphire)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm"
          >
            Save Credit Card
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {creditCards.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No credit cards</p>
            <p className="text-sm mt-2">
              Add credit cards to quickly enter payments
            </p>
          </div>
        ) : (
          creditCards.map((item) => (
            <CreditCardItem
              key={item.id}
              item={item}
              onDelete={onDeleteCreditCard}
              onUpdate={onUpdateCreditCard}
              onUse={onUseCreditCard}
              currentDate={currentDate}
              forecastEndDate={forecastEndDate}
              transactions={transactions}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RecurringCreditCards;
