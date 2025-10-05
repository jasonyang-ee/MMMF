import React, { useState } from "react";

function CreditCardItem({ item, onDelete, onUse }) {
  const [showAmountForm, setShowAmountForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !date) {
      alert("Please enter amount and date");
      return;
    }
    onUse({
      name: item.name,
      amount: parseFloat(amount),
      date: date,
    });
    setAmount("");
    setDate("");
    setShowAmountForm(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-gray-900">{item.name}</div>
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
        <button
          onClick={() => setShowAmountForm(true)}
          className="btn btn-primary w-full text-sm"
        >
          Add Payment
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
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
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input text-sm cursor-pointer"
            style={{ colorScheme: "light" }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
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
                setDate("");
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
}) {
  const [showForm, setShowForm] = useState(false);
  const [cardName, setCardName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cardName) {
      alert("Please enter a card name");
      return;
    }
    onAddCreditCard({ name: cardName });
    setCardName("");
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Recurring Credit Cards ({creditCards.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {showForm ? "Cancel" : "+ Add Card"}
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
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
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
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RecurringCreditCards;
