import React, { useState, useRef, useEffect } from "react";
import { formatCurrency, formatDate } from "../utils";
import { useI18n } from "../i18n";

function BalanceDisplay({
  startingBalance,
  currentBalance,
  lowestBalance,
  lowestBalanceDate,
  onStartingBalanceChange,
  currencySymbol = "USD",
  dateFormat = "MMM dd, yyyy",
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBalance, setTempBalance] = useState(startingBalance);
  const inputRef = useRef(null);
  const { t } = useI18n();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (isEditing) {
      const newValue = parseFloat(tempBalance) || 0;
      onStartingBalanceChange(newValue);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setTempBalance(startingBalance);
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
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">{t("balance:accountBalance")}</h2>

      <div className="space-y-4">
        {/* Starting Balance */}
        <div>
          <label className="label">{t("balance:startingBalance")}</label>
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              value={tempBalance}
              onChange={(e) => setTempBalance(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="input text-3xl font-bold"
              autoFocus
            />
          ) : (
            <div
              onClick={handleClick}
              className="text-3xl font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded dark:text-gray-100"
              title={t("recurring:clickToEditAmount")}
            >
              {formatCurrency(startingBalance, currencySymbol)}
            </div>
          )}
        </div>

        {/* Current Balance */}
        <div className="border-t dark:border-[#3a3a3a] pt-4">
          <label className="label">{t("balance:forecastedBalance")}</label>
          <div className="text-3xl font-bold">
            <span
              className={
                currentBalance >= 0 ? "balance-positive" : "balance-negative"
              }
            >
              {formatCurrency(currentBalance, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Balance Change */}
        <div className="border-t dark:border-[#3a3a3a] pt-4">
          <label className="label">{t("balance:netChange")}</label>
          <div className="text-3xl font-bold">
            <span
              className={
                balanceChange >= 0 ? "balance-positive" : "balance-negative"
              }
            >
              {balanceChange >= 0 ? "+" : ""}
              {formatCurrency(balanceChange, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Lowest Balance */}
        <div className="border-t dark:border-[#3a3a3a] pt-4">
          <label className="label">{t("balance:lowestBalance")}</label>
          <div className="text-3xl font-bold">
            <span
              className={
                lowestBalance >= 0 ? "balance-positive" : "balance-negative"
              }
            >
              {formatCurrency(lowestBalance, currencySymbol)}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t("balance:onDate")} {formatDate(lowestBalanceDate, dateFormat)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceDisplay;
