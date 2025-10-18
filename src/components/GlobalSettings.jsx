import React, { useState, useEffect } from "react";
import { useI18n } from "../i18n";

function GlobalSettings({
  currencySymbol,
  dateFormat,
  onCurrencyChange,
  onDateFormatChange,
}) {
  const { t, language, setLanguage } = useI18n();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldBeDark = savedMode === "true" || (!savedMode && prefersDark);

    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const currencyOptions = [
    { value: "USD", label: "$ (USD)", symbol: "$" },
    { value: "EUR", label: "€ (EUR)", symbol: "€" },
    { value: "GBP", label: "£ (GBP)", symbol: "£" },
    { value: "JPY", label: "¥ (JPY)", symbol: "¥" },
    { value: "CNY", label: "¥ (CNY)", symbol: "¥" },
    { value: "INR", label: "₹ (INR)", symbol: "₹" },
    { value: "CAD", label: "$ (CAD)", symbol: "$" },
    { value: "AUD", label: "$ (AUD)", symbol: "$" },
    { value: "CHF", label: "Fr (CHF)", symbol: "Fr" },
    { value: "KRW", label: "₩ (KRW)", symbol: "₩" },
    { value: "GTQ", label: "Q (GTQ)", symbol: "Q" },
  ];

  const dateFormatOptions = [
    { value: "MMM dd, yyyy", label: "Oct 05, 2025", example: "Oct 05, 2025" },
    { value: "yyyy/MM/dd", label: "2025/10/05", example: "2025/10/05" },
    { value: "MM/dd/yyyy", label: "10/05/2025", example: "10/05/2025" },
  ];

  return (
    <div className="card space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {t("settings:globalSettings")}
      </h2>

      {/* Dark Mode Toggle */}
      <div className="pb-3 border-b border-gray-200 dark:border-[#3a3a3a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isDarkMode ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              )}
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isDarkMode ? t("settings:darkMode") : t("settings:lightMode")}
            </span>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
              isDarkMode ? "bg-gray-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={isDarkMode}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDarkMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Currency Symbol Selection */
      }
      <div className="pb-3 border-b border-gray-200 dark:border-[#3a3a3a]">
        <div className="flex items-center justify-between">
          <label className="label">{t("settings:currency")}</label>
          <div className="flex items-center gap-2">
            <label className="label text-xs">Lang</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input cursor-pointer text-xs py-1 px-2"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
        <select
          value={currencySymbol}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="input cursor-pointer"
        >
          {currencyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Format Selection */}
      <div>
        <label className="label">{t("settings:dateFormat")}</label>
        <select
          value={dateFormat}
          onChange={(e) => onDateFormatChange(e.target.value)}
          className="input cursor-pointer"
        >
          {dateFormatOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default GlobalSettings;
