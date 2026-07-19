import React from "react";
import { formatCurrency, formatDate } from "../utils";
import { useI18n } from "../i18n";
import DeleteButton from "./DeleteButton";

function BalanceTimeline({
  balanceHistory = [],
  forecastEndDate,
  onDeleteTransaction,
  currencySymbol = "USD",
  dateFormat = "MMM dd, yyyy",
}) {
  const { t } = useI18n();
  const safeBalanceHistory = Array.isArray(balanceHistory)
    ? balanceHistory
    : [];

  if (safeBalanceHistory.length === 0) {
    return null;
  }

  // Filter to only show entries up to forecast end date
  const filteredHistory = safeBalanceHistory.filter(
    (entry) => new Date(entry.date) <= new Date(forecastEndDate),
  );

  return (
    <div className="card">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center dark:text-gray-100">
        {t("timeline:title")}
      </h2>

      <div className="overflow-x-auto custom-scrollbar -mx-4 sm:mx-0">
        <table
          className="w-full mobile-compact-table"
          style={{ minWidth: "480px" }}
        >
          <thead className="bg-gray-100 dark:bg-[#2a2a2a] border-b-2 border-gray-300 dark:border-[#3a3a3a]">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-400 w-12 sm:w-20">
                {t("timeline:action")}
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-400">
                {t("timeline:description")}
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-400">
                {t("timeline:amount")}
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-400">
                {t("timeline:balance")}
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-400">
                {t("timeline:date")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#3a3a3a]">
            {filteredHistory.map((entry, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-100 dark:hover:bg-[#2a2a2a] ${
                  entry.transaction ? "" : "bg-gray-100 dark:bg-[#2a2a2a]/50"
                }`}
              >
                <td className="px-2 sm:px-4 py-2 sm:py-3 w-12 sm:w-20">
                  <div className="flex items-center justify-center">
                    {entry.transaction && !entry.transaction.isRecurring && (
                      <DeleteButton
                        onClick={() =>
                          onDeleteTransaction(entry.transaction.id)
                        }
                        title={t("timeline:delete")}
                        iconSize="w-5 h-5"
                      />
                    )}
                    {entry.transaction && entry.transaction.isRecurring && (
                      <span className="text-gray-400 dark:text-gray-500 text-xs px-1">
                        {t("common:auto")}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  {entry.transaction
                    ? entry.transaction.name
                    : t("balance:startingBalanceRow")}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right">
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
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                  <span
                    className={`text-sm sm:text-lg font-bold ${
                      entry.balance >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(entry.balance, currencySymbol)}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium">
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
