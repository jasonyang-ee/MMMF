import React, { useState, useRef, useEffect } from "react";
import { formatCurrency } from "../utils";
import { useI18n } from "../i18n";
import TypeToggle from "./TypeToggle";
import DeleteButton from "./DeleteButton";

function RecurringItem({ item, onDelete, onUpdate, currencySymbol = "USD" }) {
  const { t } = useI18n();
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editAmount, setEditAmount] = useState(item.amount);
  const [editName, setEditName] = useState(item.name);
  const amountInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isEditingAmount && amountInputRef.current) {
      amountInputRef.current.select();
    }
  }, [isEditingAmount]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleAmountClick = () => {
    setEditAmount(item.amount);
    setIsEditingAmount(true);
  };

  const handleNameClick = () => {
    setEditName(item.name);
    setIsEditingName(true);
  };

  const handleAmountBlur = () => {
    if (isEditingAmount) {
      const newAmount = parseFloat(editAmount);
      if (newAmount && newAmount > 0 && newAmount !== item.amount) {
        onUpdate(item.id, { ...item, amount: newAmount });
      }
      setIsEditingAmount(false);
    }
  };

  const handleNameBlur = () => {
    if (isEditingName) {
      const trimmedName = editName.trim();
      if (trimmedName && trimmedName !== item.name) {
        onUpdate(item.id, { ...item, name: trimmedName });
      }
      setIsEditingName(false);
    }
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAmountBlur();
    } else if (e.key === "Escape") {
      setEditAmount(item.amount);
      setIsEditingAmount(false);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setEditName(item.name);
      setIsEditingName(false);
    }
  };

  return (
    <div className="transaction-item py-1.5 px-2">
      <div className="flex-1 min-w-0">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="input text-sm font-medium w-full py-0.5 px-1.5 mb-0.5"
            autoFocus
          />
        ) : (
          <div
            onClick={handleNameClick}
            className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-0.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3a3a] px-1 py-0.5 rounded -ml-1"
            title={t("recurring:clickToEditDesc")}
          >
            {item.name}
          </div>
        )}
        {item.dayOfMonth && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("recurring:dayOfMonth", item.dayOfMonth)}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1.5 flex-shrink-0">
        {isEditingAmount ? (
          <div className="flex items-center">
            <span
              className={`text-sm font-semibold mr-1 ${
                item.type === "credit"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {item.type === "credit" ? "+" : "-"}
            </span>
            <input
              ref={amountInputRef}
              type="number"
              step="0.01"
              min="0"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              onBlur={handleAmountBlur}
              onKeyDown={handleAmountKeyDown}
              className="input text-sm font-semibold w-20 py-0.5 px-1.5"
              autoFocus
            />
          </div>
        ) : (
          <span
            onClick={handleAmountClick}
            className={`text-sm font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3a3a] px-1.5 py-0.5 rounded ${
              item.type === "credit"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
            title={t("recurring:clickToEditAmount")}
          >
            {item.type === "credit" ? "+" : "-"}
            {formatCurrency(item.amount, currencySymbol)}
          </span>
        )}

        <DeleteButton
          onClick={() => onDelete(item.id)}
          title={t("recurring:deleteRecurring")}
        />
      </div>
    </div>
  );
}

function RecurringList({
  recurring = [],
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  currencySymbol = "USD",
}) {
  const { t } = useI18n();
  const safeRecurring = Array.isArray(recurring) ? recurring : [];
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "debit",
    dayOfMonth: "",
  });
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (showForm && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showForm]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.dayOfMonth) {
      alert(t("recurring:validationAll"));
      return;
    }

    const dayOfMonth = parseInt(formData.dayOfMonth);
    if (dayOfMonth < 1 || dayOfMonth > 31) {
      alert(t("recurring:validationDayRange"));
      return;
    }

    onAddRecurring({
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type,
      dayOfMonth: dayOfMonth,
    });

    setFormData({ name: "", amount: "", type: "debit", dayOfMonth: "" });
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold dark:text-gray-100">
          {t("recurring:title")}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-link"
        >
          {showForm ? t("common:cancel") : t("recurring:addButton")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg space-y-3"
        >
          <input
            ref={nameInputRef}
            type="text"
            placeholder={t("recurring:descriptionPh")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input text-sm"
            required
          />

          <input
            type="number"
            placeholder={t("recurring:amountPh")}
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            step="0.01"
            min="0"
            className="input text-sm"
            required
          />

          <input
            type="number"
            placeholder={t("recurring:dayOfMonthPh")}
            value={formData.dayOfMonth}
            onChange={(e) =>
              setFormData({ ...formData, dayOfMonth: e.target.value })
            }
            min="1"
            max="31"
            className="input text-sm"
            required
          />

          <TypeToggle
            value={formData.type}
            onChange={(type) => setFormData({ ...formData, type })}
            debitLabel={t("recurring:payment")}
            creditLabel={t("recurring:income")}
            size="sm"
          />

          <button type="submit" className="btn btn-submit w-full text-sm">
            {t("recurring:saveRecurring")}
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
        {safeRecurring.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t("recurring:noRecurring")}</p>
            <p className="text-sm mt-2">{t("recurring:autoNote")}</p>
          </div>
        ) : (
          safeRecurring.map((item) => (
            <RecurringItem
              key={item.id}
              item={item}
              onUpdate={onUpdateRecurring}
              onDelete={onDeleteRecurring}
              currencySymbol={currencySymbol}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RecurringList;
