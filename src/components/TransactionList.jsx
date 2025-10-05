import React from "react";
import { formatCurrency, formatDate } from "../utils";

function TransactionList({ transactions, onDeleteTransaction }) {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">
        Transactions ({transactions.length})
      </h2>

      {sortedTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions yet</p>
          <p className="text-sm mt-2">
            Add your first transaction to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {sortedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {transaction.name}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(transaction.date)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`text-lg font-semibold ${
                    transaction.type === "credit"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "credit" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>

                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionList;
