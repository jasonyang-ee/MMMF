import React, { useState } from "react";

function CreditCardItem({
  item,
  onDelete,
  onUse,
  currentDate,
  forecastEndDate,
}) {
  const [showAmountForm, setShowAmountForm] = useState(false);
  const [amount, setAmount] = useState("");

  // Calculate the next occurrence date based on dayOfMonth
  const getNextOccurrenceDate = () => {
    if (!item.dayOfMonth) return "";

    const today = new Date(currentDate);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // Try current month first
    let targetDate = new Date(
      currentYear,
      currentMonth,
      Math.min(
        item.dayOfMonth,
        new Date(currentYear, currentMonth + 1, 0).getDate()
      )
    );

    // If the date has passed this month, move to next month
    if (targetDate <= today) {
      targetDate = new Date(
        currentYear,
        currentMonth + 1,
        Math.min(
          item.dayOfMonth,
          new Date(currentYear, currentMonth + 2, 0).getDate()
        )
      );
    }

    // Check if the date is within forecast range
    const endDate = new Date(forecastEndDate);
    if (targetDate > endDate) {
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
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          {item.dayOfMonth && (
            <div className="text-xs text-gray-500">
              Day {item.dayOfMonth} of month
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-600 hover:text-red-700 p-1"
          title="Delete credit card"
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

      {!showAmountForm ? (
        <div>
          {nextDate && (
            <p className="text-xs text-blue-600 mb-2">
              Next: {new Date(nextDate).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={() => setShowAmountForm(true)}
            className="btn btn-primary w-full text-sm"
            disabled={!nextDate}
          >
            {nextDate ? "Add Payment" : "No upcoming date"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="text-xs text-gray-600 mb-1">
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
            className="input text-sm"
            required
          />
          <div className="flex space-x-2">
            <button type="submit" className="btn btn-primary text-sm flex-1">
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAmountForm(false);
                setAmount("");
              }}
              className="btn text-sm flex-1"
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
        <h2 className="text-xl font-semibold">Recurring Credit Cards</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3"
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
          <button type="submit" className="btn btn-primary w-full text-sm">
            Save Credit Card
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {creditCards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
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
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RecurringCreditCards;
