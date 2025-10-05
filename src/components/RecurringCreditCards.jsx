import React, { useState } from "react";

function CreditCardItem({
  item,
  onDelete,
  onUse,
  currentDate,
  forecastEndDate,
  transactions,
}) {
  const [showAmountForm, setShowAmountForm] = useState(false);
  const [amount, setAmount] = useState("");

  // Calculate the next occurrence date based on dayOfMonth and existing transactions
  const getNextOccurrenceDate = () => {
    if (!item.dayOfMonth) return "";

    const today = new Date(currentDate);
    const endDate = new Date(forecastEndDate);

    // Find all existing transactions for this credit card
    const existingDates = transactions
      .filter((t) => t.name === item.name)
      .map((t) => new Date(t.date))
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
      const testDate = new Date(
        currentYear,
        currentMonth + i,
        Math.min(
          item.dayOfMonth,
          new Date(currentYear, currentMonth + i + 1, 0).getDate()
        )
      );

      // Check if this date is valid (after today and not already used)
      const isAfterToday = testDate > today;
      const isNotUsed = !existingDates.some(
        (existing) =>
          existing.toISOString().split("T")[0] ===
          testDate.toISOString().split("T")[0]
      );
      const isWithinForecast = testDate <= endDate;

      if (isAfterToday && isNotUsed && isWithinForecast) {
        targetDate = testDate;
        break;
      }
    }

    if (!targetDate) {
      return ""; // No upcoming date within forecast range
    }

    return targetDate.toISOString().split("T")[0];
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
        <div>
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {item.name}
          </div>
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
              Next: {new Date(nextDate).toLocaleDateString()}
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
            Payment date:{" "}
            {nextDate ? new Date(nextDate).toLocaleDateString() : "N/A"}
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
