import React, { useState } from "react";
import { formatCurrency, formatDate } from "../utils";

function BalanceDisplay({
  startingBalance,
  currentBalance,
  lowestBalance,
  lowestBalanceDate,
  onStartingBalanceChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBalance, setTempBalance] = useState(startingBalance);

  const handleBlur = () => {
    if (isEditing) {
      const newValue = parseFloat(tempBalance) || 0;
      onStartingBalanceChange(newValue);
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    setTempBalance(startingBalance);
    setIsEditing(true);
  };

  const balanceChange = currentBalance - startingBalance;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
        Account Balance
      </h2>

      <div className="space-y-4">
        {/* Starting Balance */}
        <div>
          <label className="label">Starting Balance</label>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={tempBalance}
              onChange={(e) => setTempBalance(e.target.value)}
              onBlur={handleBlur}
              className="input text-3xl font-bold"
              autoFocus
            />
          ) : (
            <div
              onClick={handleClick}
              className="text-3xl font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded dark:text-gray-100"
              title="Click to edit"
            >
              {formatCurrency(startingBalance)}
            </div>
          )}
        </div>

        {/* Current Balance */}
        <div className="border-t dark:border-[#3a3a3a] pt-4">
          <label className="label">Forecasted Balance</label>
          <div className="text-3xl font-bold">
            <span
              className={
                currentBalance >= 0 ? "balance-positive" : "balance-negative"
              }
            >
              {formatCurrency(currentBalance)}
            </span>
          </div>
        </div>

        {/* Balance Change */}
        <div className="border-t dark:border-[#3a3a3a] pt-4">
          <label className="label">Net Change</label>
          <div className="text-3xl font-bold">
            <span
              className={
                balanceChange >= 0 ? "balance-positive" : "balance-negative"
              }
            >
              {balanceChange >= 0 ? "+" : ""}
              {formatCurrency(balanceChange)}
            </span>
          </div>
        </div>

        {/* Lowest Balance */}
        <div className="border-t dark:border-[#3a3a3a] pt-4">
          <label className="label">Lowest Balance</label>
          <div className="text-3xl font-bold">
            <span
              className={
                lowestBalance >= 0 ? "balance-positive" : "balance-negative"
              }
            >
              {formatCurrency(lowestBalance)}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            on {formatDate(lowestBalanceDate)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceDisplay;
