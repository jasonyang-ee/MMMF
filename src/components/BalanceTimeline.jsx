import React from "react";
import { formatCurrency, formatDate } from "../utils";

function BalanceTimeline({
  balanceHistory,
  forecastEndDate,
  onDeleteTransaction,
  currencySymbol = "USD",
  dateFormat = "MMM dd, yyyy",
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
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-gray-100">
        Balance Timeline
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-[#2a2a2a] border-b-2 border-gray-300 dark:border-[#3a3a3a]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-400">
                Action
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-400">
                Description
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-400">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-400">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-400">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#3a3a3a]">
            {filteredHistory.map((entry, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 dark:hover:bg-[#2a2a2a] ${
                  entry.transaction ? "" : "bg-gray-50 dark:bg-[#2a2a2a]/50"
                }`}
              >
                <td className="px-4 py-3">
                  {entry.transaction && !entry.transaction.isRecurring && (
                    <button
                      onClick={() => onDeleteTransaction(entry.transaction.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
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
                    <span className="text-gray-400 dark:text-gray-500 text-xs px-1">
                      Auto
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {entry.transaction
                    ? entry.transaction.name
                    : "Starting Balance"}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {entry.transaction && (
                    <span
                      className={`font-medium ${
                        entry.transaction.type === "credit"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {entry.transaction.type === "credit" ? "+" : "-"}
                      {formatCurrency(entry.transaction.amount, currencySymbol)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`text-lg font-bold ${
                      entry.balance >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(entry.balance, currencySymbol)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {formatDate(entry.date, dateFormat)}
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
