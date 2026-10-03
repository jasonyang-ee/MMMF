import React, { useState, useEffect, useMemo } from "react";
import { useI18n } from "../i18n";
import SearchSelect from "./SearchSelect";
import {
  currencyCodes,
  getLanguage,
  languages,
  dateFormats,
} from "../../../shared/preferences.js";
import { formatDate } from "../utils";

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
    let savedMode;
    try {
      savedMode = localStorage.getItem("darkMode");
    } catch {
      /* Storage may be disabled. */
    }
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
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
    try {
      localStorage.setItem("darkMode", newMode.toString());
    } catch {
      /* Keep the current session usable. */
    }

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const currencyOptions = useMemo(() => {
    const locale = getLanguage(language).locale;
    const names = new Intl.DisplayNames([locale], { type: "currency" });
    const english = new Intl.DisplayNames(["en"], { type: "currency" });
    return [...new Set([...currencyCodes, currencySymbol])]
      .sort()
      .map((code) => {
        const symbol =
          new Intl.NumberFormat(locale, {
            style: "currency",
            currency: code,
            currencyDisplay: "narrowSymbol",
          })
            .formatToParts(0)
            .find((part) => part.type === "currency")?.value || code;
        return {
          value: code,
          label: `${code} · ${symbol}`,
          description: names.of(code),
          search: english.of(code),
        };
      });
  }, [language, currencySymbol]);
  const languageOptions = languages.map((item) => ({
    value: item.value,
    label: item.nativeName,
    description: item.name,
    search: item.locale,
  }));

  return (
    <div className="card space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
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
            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500"
            role="switch"
            aria-checked={isDarkMode}
            aria-label={t("settings:darkMode")}
          >
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? "bg-gray-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode
                    ? "translate-x-6 rtl:-translate-x-6"
                    : "translate-x-1 rtl:-translate-x-1"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Language Selection */}
      <div className="pb-3 border-b border-gray-200 dark:border-[#3a3a3a]">
        <SearchSelect
          label={t("settings:language")}
          value={language}
          onChange={setLanguage}
          options={languageOptions}
        />
      </div>

      {/* Currency Symbol Selection */}
      <div className="pb-3 border-b border-gray-200 dark:border-[#3a3a3a]">
        <SearchSelect
          label={t("settings:currency")}
          value={currencySymbol}
          onChange={onCurrencyChange}
          options={currencyOptions}
        />
      </div>

      {/* Date Format Selection */}
      <div>
        <label className="label" htmlFor="date-format">
          {t("settings:dateFormat")}
        </label>
        <select
          id="date-format"
          value={dateFormat}
          onChange={(e) => onDateFormatChange(e.target.value)}
          className="input cursor-pointer"
        >
          {dateFormats.map((option) => (
            <option key={option} value={option}>
              {formatDate("2025-10-05", option, language)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default GlobalSettings;
