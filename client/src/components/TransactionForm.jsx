import React, { useState } from "react";
import { getTodayDate, currencyStep } from "../utils";
import DatePicker from "./DatePicker";
import TypeToggle from "./TypeToggle";
import { useI18n } from "../i18n";

function TransactionForm({ onAddTransaction, currencySymbol, dateFormat }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "debit",
    date: getTodayDate(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.date) {
      alert(t("transactions:fillAllFields"));
      return;
    }

    const saved = await onAddTransaction({
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type,
      date: formData.date,
    });

    if (!saved) return;
    // Reset form
    setFormData({
      name: "",
      amount: "",
      type: "debit",
      date: getTodayDate(),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 dark:text-gray-100">
        {t("transactions:addTransaction")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="label" htmlFor="transaction-name">
            {t("transactions:description")}
          </label>
          <input
            id="transaction-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder={t("transactions:descriptionPh")}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="transaction-amount">
            {t("transactions:amount")}
          </label>
          <input
            id="transaction-amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step={currencyStep(currencySymbol)}
            min={currencyStep(currencySymbol)}
            className="input"
            placeholder={t("transactions:amountPh")}
            required
          />
        </div>

        <div>
          <label className="label">{t("transactions:type")}</label>
          <TypeToggle
            value={formData.type}
            onChange={(type) => setFormData({ ...formData, type })}
            debitLabel={t("transactions:debitPayment")}
            creditLabel={t("transactions:creditIncome")}
          />
        </div>

        <div>
          <label className="label">{t("transactions:date")}</label>
          <DatePicker
            label={t("transactions:date")}
            dateFormat={dateFormat}
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
            className="w-full"
          />
        </div>

        <button type="submit" className="btn btn-submit w-full">
          {t("transactions:addBtn")}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
