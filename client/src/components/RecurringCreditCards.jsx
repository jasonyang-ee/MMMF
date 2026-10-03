import React, { useState, useRef, useEffect } from "react";
import { formatDate, nextCardDate, currencyStep } from "../utils";
import { useI18n } from "../i18n";
import DeleteButton from "./DeleteButton";

function CreditCardItem({
  item,
  onDelete,
  onUpdate,
  onUse,
  currentDate,
  forecastEndDate,
  transactions = [],
  dateFormat = "MMM dd, yyyy",
  currencySymbol = "USD",
}) {
  const { t, language } = useI18n();
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const [showAmountForm, setShowAmountForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const nameInputRef = useRef(null);
  const saving = useRef(false);
  const amountInputRef = useRef(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (showAmountForm && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [showAmountForm]);

  const handleNameClick = () => {
    setEditName(item.name);
    setIsEditingName(true);
  };

  const handleNameBlur = async () => {
    if (isEditingName && !saving.current) {
      const trimmedName = editName.trim();
      if (trimmedName && trimmedName !== item.name) {
        saving.current = true;
        const saved = await onUpdate(item.id, { name: trimmedName });
        saving.current = false;
        if (!saved) return;
      }
      setIsEditingName(false);
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

  const getNextOccurrenceDate = () =>
    nextCardDate(item, safeTransactions, currentDate, forecastEndDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextDate = getNextOccurrenceDate();

    if (!amount) {
      alert(t("cards:enterAmount"));
      return;
    }

    if (!nextDate) {
      alert(t("cards:noUpcomingInRange"));
      return;
    }

    const saved = await onUse({
      creditCardId: item.id,
      name: item.name,
      amount: parseFloat(amount),
      date: nextDate,
    });
    if (!saved) return;
    setAmount("");
    setShowAmountForm(false);
  };

  const nextDate = getNextOccurrenceDate();

  return (
    <div className="border border-gray-200 dark:border-[#3a3a3a] rounded-lg p-1.5 bg-white dark:bg-[#2a2a2a]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              aria-label={t("recurring:descriptionPh")}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="input text-sm font-medium w-full py-0.5 px-1.5"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={handleNameClick}
              className="btn-inline text-start font-medium text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3a3a] px-1 py-0.5 rounded -ml-1"
              title={t("cards:clickToEditName")}
            >
              {item.name}
            </button>
          )}
          {item.dayOfMonth && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t("cards:dayOfMonth", item.dayOfMonth)}
            </div>
          )}
        </div>
        <DeleteButton
          onClick={() => onDelete(item.id)}
          title={t("cards:deleteCard")}
          className="flex-shrink-0"
        />
      </div>

      {!showAmountForm ? (
        <div>
          {nextDate && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {t("cards:next")} {formatDate(nextDate, dateFormat, language)}
            </p>
          )}
          <button
            onClick={() => setShowAmountForm(true)}
            className="btn btn-submit w-full px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!nextDate}
          >
            {nextDate ? t("cards:addPayment") : t("cards:noUpcoming")}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {t("cards:paymentDate")}{" "}
            {nextDate
              ? formatDate(nextDate, dateFormat, language)
              : t("cards:noUpcoming")}
          </div>
          <input
            ref={amountInputRef}
            type="number"
            placeholder={t("recurring:amountPh")}
            aria-label={t("recurring:amountPh")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step={currencyStep(currencySymbol)}
            min={currencyStep(currencySymbol)}
            className="input text-sm py-1"
            required
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="btn btn-submit flex-1 px-3 py-1.5 text-xs"
            >
              {t("common:add")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAmountForm(false);
                setAmount("");
              }}
              className="btn btn-secondary text-xs flex-1 py-1.5"
            >
              {t("common:cancel")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function RecurringCreditCards({
  creditCards = [],
  onAddCreditCard,
  onUpdateCreditCard,
  onDeleteCreditCard,
  onUseCreditCard,
  currentDate,
  forecastEndDate,
  transactions = [],
  dateFormat = "MMM dd, yyyy",
  currencySymbol = "USD",
}) {
  const { t } = useI18n();
  const safeCreditCards = Array.isArray(creditCards) ? creditCards : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dayOfMonth: "",
  });
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (showForm && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dayOfMonth) {
      alert(t("recurring:validationAll"));
      return;
    }

    const dayOfMonth = parseInt(formData.dayOfMonth);
    if (dayOfMonth < 1 || dayOfMonth > 31) {
      alert(t("recurring:validationDayRange"));
      return;
    }

    const saved = await onAddCreditCard({
      name: formData.name,
      dayOfMonth: dayOfMonth,
    });
    if (!saved) return;
    setFormData({ name: "", dayOfMonth: "" });
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold dark:text-gray-100">
          {t("cards:title")}
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-link">
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
            placeholder={t("cards:cardNamePh")}
            aria-label={t("cards:cardNamePh")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input text-sm"
            required
          />
          <input
            type="number"
            placeholder={t("recurring:dayOfMonthPh")}
            aria-label={t("recurring:dayOfMonthPh")}
            value={formData.dayOfMonth}
            onChange={(e) =>
              setFormData({ ...formData, dayOfMonth: e.target.value })
            }
            min="1"
            max="31"
            className="input text-sm"
            required
          />
          <button type="submit" className="btn btn-submit w-full text-sm">
            {t("cards:saveCard")}
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
        {safeCreditCards.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t("cards:noCards")}</p>
            <p className="text-sm mt-2">{t("cards:addNote")}</p>
          </div>
        ) : (
          safeCreditCards.map((item) => (
            <CreditCardItem
              key={item.id}
              item={item}
              onDelete={onDeleteCreditCard}
              onUpdate={onUpdateCreditCard}
              onUse={onUseCreditCard}
              currentDate={currentDate}
              forecastEndDate={forecastEndDate}
              transactions={safeTransactions}
              dateFormat={dateFormat}
              currencySymbol={currencySymbol}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RecurringCreditCards;
