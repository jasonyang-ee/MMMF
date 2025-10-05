import React from "react";
import { formatCurrency, formatDate } from "../utils";

function BalanceTimeline({
  balanceHistory,
  forecastEndDate,
  onDeleteTransaction,
}) {
  if (balanceHistory.length === 0) {
    return null;
  }

  // Filter to only show entries up to forecast end date
  const filteredHistory = balanceHistory.filter(
    (entry) => new Date(entry.date) <= new Date(forecastEndDate)
  );

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Balance Timeline
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Action
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Description
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredHistory.map((entry, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${
                  entry.transaction ? "" : "bg-primary-50"
                }`}
              >
                <td className="px-4 py-3">
                  {entry.transaction && !entry.transaction.isRecurring && (
                    <button
                      onClick={() => onDeleteTransaction(entry.transaction.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete transaction"
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
                  )}
                  {entry.transaction && entry.transaction.isRecurring && (
                    <span className="text-gray-400 text-xs px-1">Auto</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {entry.transaction
                    ? entry.transaction.name
                    : "Starting Balance"}
                  {entry.transaction && entry.transaction.isRecurring && (
                    <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Recurring
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {entry.transaction && (
                    <span
                      className={`font-medium ${
                        entry.transaction.type === "credit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {entry.transaction.type === "credit" ? "+" : "-"}
                      {formatCurrency(entry.transaction.amount)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`text-lg font-bold ${
                      entry.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(entry.balance)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {formatDate(entry.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BalanceTimeline;
