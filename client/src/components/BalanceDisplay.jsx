import React, { useState, useRef, useEffect } from "react";
import { formatCurrency, formatDate, currencyStep } from "../utils";
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
  const saving = useRef(false);
  const { t, language } = useI18n();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = async () => {
    if (isEditing && !saving.current) {
      const newValue = parseFloat(tempBalance) || 0;
      saving.current = true;
      const saved = await onStartingBalanceChange(newValue);
      saving.current = false;
      if (!saved) return;
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
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 dark:text-gray-100">
        {t("balance:accountBalance")}
      </h2>

      <div className="space-y-3 sm:space-y-4">
        {/* Starting Balance */}
        <div>
          <label className="label">{t("balance:startingBalance")}</label>
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              step={currencyStep(currencySymbol)}
              aria-label={t("balance:startingBalance")}
              value={tempBalance}
              onChange={(e) => setTempBalance(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="input text-2xl sm:text-3xl font-bold"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={handleClick}
              className="btn-inline text-start text-2xl sm:text-3xl font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded dark:text-gray-100"
              title={t("recurring:clickToEditAmount")}
            >
              {formatCurrency(startingBalance, currencySymbol, language)}
            </button>
          )}
        </div>

        {/* Current Balance */}
        <div className="border-t dark:border-[#3a3a3a] pt-3 sm:pt-4">
          <label className="label">{t("balance:forecastedBalance")}</label>
          <div className="text-2xl sm:text-3xl font-bold">
            <span
              className={
                currentBalance >= 0 ? "balance-positive" : "balance-negative"
              }
            >
              {formatCurrency(currentBalance, currencySymbol, language)}
            </span>
          </div>
        </div>

        {/* Balance Change */}
        <div className="border-t dark:border-[#3a3a3a] pt-3 sm:pt-4">
          <label className="label">{t("balance:netChange")}</label>
          <div className="text-2xl sm:text-3xl font-bold">
            <span
              className={
                balanceChange >= 0 ? "balance-positive" : "balance-negative"
              }
            >
              {balanceChange >= 0 ? "+" : ""}
              {formatCurrency(balanceChange, currencySymbol, language)}
            </span>
          </div>
        </div>

        {/* Lowest Balance */}
        <div className="border-t dark:border-[#3a3a3a] pt-3 sm:pt-4">
          <label className="label">{t("balance:lowestBalance")}</label>
          <div className="text-2xl sm:text-3xl font-bold">
            <span
              className={
                lowestBalance >= 0 ? "balance-positive" : "balance-negative"
              }
            >
              {formatCurrency(lowestBalance, currencySymbol, language)}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t("balance:onDate")}{" "}
            {formatDate(lowestBalanceDate, dateFormat, language)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceDisplay;
