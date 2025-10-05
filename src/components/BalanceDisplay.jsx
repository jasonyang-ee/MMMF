import React, { useState } from "react";
import { formatCurrency } from "../utils";

function BalanceDisplay({
  startingBalance,
  currentBalance,
  onStartingBalanceChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBalance, setTempBalance] = useState(startingBalance);

  const handleSave = () => {
    onStartingBalanceChange(parseFloat(tempBalance) || 0);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempBalance(startingBalance);
    setIsEditing(false);
  };

  const balanceChange = currentBalance - startingBalance;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Account Balance</h2>

      <div className="space-y-4">
        {/* Starting Balance */}
        <div>
          <label className="label">Starting Balance</label>
          {isEditing ? (
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.01"
                value={tempBalance}
                onChange={(e) => setTempBalance(e.target.value)}
                className="input flex-1"
                autoFocus
              />
              <button onClick={handleSave} className="btn btn-primary">
                Save
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {formatCurrency(startingBalance)}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Current Balance */}
        <div className="border-t pt-4">
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
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Net Change</span>
            <span
              className={`text-lg font-semibold ${
                balanceChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {balanceChange >= 0 ? "+" : ""}
              {formatCurrency(balanceChange)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceDisplay;
