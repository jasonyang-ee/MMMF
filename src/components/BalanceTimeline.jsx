import React from "react";
import { formatCurrency, formatDate } from "../utils";

function BalanceTimeline({ balanceHistory, forecastEndDate }) {
  if (balanceHistory.length === 0) {
    return null;
  }

  // Filter to only show entries up to forecast end date
  const filteredHistory = balanceHistory.filter(
    (entry) => new Date(entry.date) <= new Date(forecastEndDate)
  );

  // Calculate min and max for scaling
  const balances = filteredHistory.map((entry) => entry.balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const range = maxBalance - minBalance || 1;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Balance Timeline</h2>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Chart Area */}
          <div className="relative h-64 border-l-2 border-b-2 border-gray-300 mb-2">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 -ml-16 text-right text-sm text-gray-600">
              {formatCurrency(maxBalance)}
            </div>
            <div className="absolute left-0 bottom-0 -ml-16 text-right text-sm text-gray-600">
              {formatCurrency(minBalance)}
            </div>

            {/* Zero line if applicable */}
            {minBalance < 0 && maxBalance > 0 && (
              <div
                className="absolute left-0 right-0 border-t-2 border-red-300 border-dashed"
                style={{
                  bottom: `${((0 - minBalance) / range) * 100}%`,
                }}
              >
                <span className="absolute -top-3 left-2 text-xs text-red-600 bg-white px-1">
                  $0
                </span>
              </div>
            )}

            {/* Plot points and lines */}
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              <polyline
                points={filteredHistory
                  .map((entry, index) => {
                    const x = (index / (filteredHistory.length - 1 || 1)) * 100;
                    const y =
                      100 - ((entry.balance - minBalance) / range) * 100;
                    return `${x}%,${y}%`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Data points */}
            {filteredHistory.map((entry, index) => {
              const x = (index / (filteredHistory.length - 1 || 1)) * 100;
              const y = 100 - ((entry.balance - minBalance) / range) * 100;

              return (
                <div
                  key={index}
                  className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-primary-600 border-2 border-white hover:scale-150 transition-transform cursor-pointer group"
                  style={{
                    left: `${x}%`,
                    bottom: `${((entry.balance - minBalance) / range) * 100}%`,
                  }}
                  title={`${formatDate(entry.date)}: ${formatCurrency(
                    entry.balance
                  )}`}
                >
                  <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    <div className="font-semibold">
                      {formatCurrency(entry.balance)}
                    </div>
                    <div>{formatDate(entry.date)}</div>
                    {entry.transaction && (
                      <div className="text-gray-300">
                        {entry.transaction.name}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline entries */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredHistory.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  entry.transaction ? "bg-gray-50" : "bg-primary-50"
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {entry.transaction
                      ? entry.transaction.name
                      : "Starting Balance"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(entry.date)}
                  </div>
                </div>

                {entry.transaction && (
                  <div
                    className={`font-medium mr-4 ${
                      entry.transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {entry.transaction.type === "credit" ? "+" : "-"}
                    {formatCurrency(entry.transaction.amount)}
                  </div>
                )}

                <div
                  className={`font-semibold ${
                    entry.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(entry.balance)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceTimeline;
