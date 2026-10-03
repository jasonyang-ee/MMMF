import React, { useState, useEffect, useRef } from "react";
import { api } from "./api";
import {
  calculateBalance,
  getTodayDate,
  generateRecurringTransactions,
} from "./utils";
import { addDays } from "../../shared/dates.js";
import { isLanguage } from "../../shared/preferences.js";
import Header from "./components/Header";
import BalanceDisplay from "./components/BalanceDisplay";
import TransactionForm from "./components/TransactionForm";
import RecurringList from "./components/RecurringList";
import RecurringCreditCards from "./components/RecurringCreditCards";
import ForecastSettings from "./components/ForecastSettings";
import BalanceTimeline from "./components/BalanceTimeline";
import GlobalSettings from "./components/GlobalSettings";
import { I18nProvider, translate } from "./i18n";

function cookieLanguage() {
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("lang="))
    ?.slice(5);
  return isLanguage(value) ? value : null;
}

function App() {
  const [settings, setSettings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [language, setLanguage] = useState(cookieLanguage() || "en");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(0);
  const [reload, setReload] = useState(0);
  const loadRequest = useRef(null);
  const mutations = useRef(Promise.resolve());
  const t = (key, ...args) => translate(language, key, ...args);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    // Establish the demo cookie first. Reuse the request during StrictMode's effect replay.
    if (!loadRequest.current)
      loadRequest.current = (async () => {
        const settingsData = await api.getSettings();
        const [transactionsData, recurringData, cardsData] = await Promise.all([
          api.getTransactions(),
          api.getRecurring(),
          api.getCreditCards(),
        ]);
        return { settingsData, transactionsData, recurringData, cardsData };
      })();
    loadRequest.current
      .then(({ settingsData, transactionsData, recurringData, cardsData }) => {
        if (!active) return;
        setSettings(settingsData);
        setLanguage(cookieLanguage() || settingsData.language);
        setTransactions(transactionsData);
        setRecurring(recurringData);
        setCreditCards(cardsData);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  function mutate(operation) {
    setPending((count) => count + 1);
    const result = mutations.current.then(async () => {
      try {
        await operation();
        setError(false);
        return true;
      } catch {
        setError(true);
        return false;
      } finally {
        setPending((count) => count - 1);
      }
    });
    mutations.current = result;
    return result;
  }
  function saveSettings(change) {
    return mutate(async () => setSettings(await api.updateSettings(change)));
  }
  const handleStartingBalanceChange = (startingBalance) =>
    saveSettings({ startingBalance });
  const handleCurrentDateChange = (currentDate) =>
    saveSettings({
      currentDate,
      ...(currentDate > settings.forecastEndDate
        ? { forecastEndDate: addDays(currentDate, 30) }
        : {}),
    });
  const handleForecastEndDateChange = (forecastEndDate) =>
    saveSettings({ forecastEndDate });
  const handleCurrencyChange = (currencySymbol) =>
    saveSettings({ currencySymbol });
  const handleDateFormatChange = (dateFormat) => saveSettings({ dateFormat });
  const handleLanguageChange = (next) =>
    mutate(async () => {
      if (!isLanguage(next)) return;
      const saved = await api.updateSettings({ language: next });
      setSettings(saved);
      setLanguage(next);
      document.cookie = `lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
    });
  const handleAddTransaction = (value) =>
    mutate(async () => {
      const saved = await api.addTransaction(value);
      setTransactions((items) => [...items, saved]);
    });
  const handleDeleteTransaction = (id) =>
    mutate(async () => {
      await api.deleteTransaction(id);
      setTransactions((items) => items.filter((item) => item.id !== id));
    });
  const handleAddRecurring = (value) =>
    mutate(async () => {
      const saved = await api.addRecurring(value);
      setRecurring((items) => [...items, saved]);
    });
  const handleUpdateRecurring = (id, value) =>
    mutate(async () => {
      const saved = await api.updateRecurring(id, value);
      setRecurring((items) =>
        items.map((item) => (item.id === id ? saved : item)),
      );
    });
  const handleDeleteRecurring = (id) =>
    mutate(async () => {
      await api.deleteRecurring(id);
      setRecurring((items) => items.filter((item) => item.id !== id));
    });
  const handleAddCreditCard = (value) =>
    mutate(async () => {
      const saved = await api.addCreditCard(value);
      setCreditCards((items) => [...items, saved]);
    });
  const handleUpdateCreditCard = (id, value) =>
    mutate(async () => {
      const saved = await api.updateCreditCard(id, value);
      setCreditCards((items) =>
        items.map((item) => (item.id === id ? saved : item)),
      );
    });
  const handleDeleteCreditCard = (id) =>
    mutate(async () => {
      await api.deleteCreditCard(id);
      setCreditCards((items) => items.filter((item) => item.id !== id));
    });
  const handleUseCreditCard = (value) =>
    handleAddTransaction({ ...value, type: "debit" });
  const handleClearCalculations = () => {
    if (!window.confirm(t("forecast:clearConfirm"))) return;
    return mutate(async () => {
      await api.clearTransactions();
      setTransactions([]);
      const currentDate = getTodayDate();
      setSettings(
        await api.updateSettings({
          currentDate,
          forecastEndDate: addDays(currentDate, 30),
        }),
      );
    });
  };
  if (loading || loadError || !settings)
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center">
        <p role={loadError ? "alert" : "status"}>
          {t(loadError ? "common:loadError" : "common:loading")}
        </p>
        {loadError && (
          <button
            className="btn btn-submit"
            onClick={() => {
              loadRequest.current = null;
              setReload((value) => value + 1);
            }}
          >
            {t("common:retry")}
          </button>
        )}
      </div>
    );
  const {
    startingBalance,
    currentDate,
    forecastEndDate,
    currencySymbol,
    dateFormat,
  } = settings;
  const allTransactions = generateRecurringTransactions(
    transactions,
    recurring,
    currentDate,
    forecastEndDate,
  );
  const { currentBalance, balanceHistory } = calculateBalance(
    startingBalance,
    allTransactions,
    currentDate,
    forecastEndDate,
  );
  const lowestBalanceInfo = balanceHistory.reduce(
    (lowest, entry) => (entry.balance < lowest.balance ? entry : lowest),
    { balance: startingBalance, date: currentDate },
  );

  return (
    <I18nProvider language={language} setLanguage={handleLanguageChange}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#1f1f1f]">
        <Header />

        {error && (
          <div
            role="alert"
            className="sticky top-2 z-40 mx-4 mt-4 rounded-lg border border-red-300 p-3 text-red-700 dark:text-red-300"
          >
            {t("common:saveError")}
          </div>
        )}
        {pending > 0 && (
          <p role="status" className="sr-only">
            {t("common:saving")}
          </p>
        )}
        <main className="max-w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
          <fieldset disabled={pending > 0} className="min-w-0">
            {/* Layout: 3-col sidebars (min-[1100px]) | single-col stack below */}
            <div className="grid grid-cols-1 min-[1100px]:grid-cols-[320px_1fr_384px] gap-4 sm:gap-6">
              {/* Left Sidebar */}
              <div className="space-y-6">
                <BalanceDisplay
                  startingBalance={startingBalance}
                  currentBalance={currentBalance}
                  lowestBalance={lowestBalanceInfo.balance}
                  lowestBalanceDate={lowestBalanceInfo.date}
                  onStartingBalanceChange={handleStartingBalanceChange}
                  currencySymbol={currencySymbol}
                  dateFormat={dateFormat}
                />

                <ForecastSettings
                  currentDate={currentDate}
                  forecastEndDate={forecastEndDate}
                  onCurrentDateChange={handleCurrentDateChange}
                  onForecastEndDateChange={handleForecastEndDateChange}
                  onClearCalculations={handleClearCalculations}
                  dateFormat={dateFormat}
                />

                <GlobalSettings
                  currencySymbol={currencySymbol}
                  dateFormat={dateFormat}
                  onCurrencyChange={handleCurrencyChange}
                  onDateFormatChange={handleDateFormatChange}
                />
              </div>

              {/* Center - Balance Timeline */}
              <div className="min-w-0">
                <BalanceTimeline
                  balanceHistory={balanceHistory}
                  currentDate={currentDate}
                  forecastEndDate={forecastEndDate}
                  onDeleteTransaction={handleDeleteTransaction}
                  currencySymbol={currencySymbol}
                  dateFormat={dateFormat}
                />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                <RecurringCreditCards
                  creditCards={creditCards}
                  onAddCreditCard={handleAddCreditCard}
                  onUpdateCreditCard={handleUpdateCreditCard}
                  onDeleteCreditCard={handleDeleteCreditCard}
                  onUseCreditCard={handleUseCreditCard}
                  currentDate={currentDate}
                  forecastEndDate={forecastEndDate}
                  transactions={transactions}
                  dateFormat={dateFormat}
                  currencySymbol={currencySymbol}
                />

                <RecurringList
                  recurring={recurring}
                  onAddRecurring={handleAddRecurring}
                  onUpdateRecurring={handleUpdateRecurring}
                  onDeleteRecurring={handleDeleteRecurring}
                  currencySymbol={currencySymbol}
                />

                <TransactionForm
                  onAddTransaction={handleAddTransaction}
                  currencySymbol={currencySymbol}
                  dateFormat={dateFormat}
                />
              </div>
            </div>
          </fieldset>
        </main>
      </div>
    </I18nProvider>
  );
}

export default App;
