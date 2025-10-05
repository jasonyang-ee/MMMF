import React from "react";
import { formatCurrency } from "../utils";

function RecurringItem({ item, onDelete }) {
  return (
    <div className="transaction-item">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{item.name}</div>
        <div className="text-sm text-gray-500">
          {item.type === "credit" ? "Income" : "Payment"}
          {item.dayOfMonth && ` • Day ${item.dayOfMonth} of month`}
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

function RecurringList({ recurring, onDeleteRecurring }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recurring Transactions</h2>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {recurring.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
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
              onDelete={onDeleteRecurring}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RecurringList;
