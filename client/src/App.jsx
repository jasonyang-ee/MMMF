import React, { useState, useEffect } from "react";
import { api } from "./api";
import {
  calculateBalance,
  getTodayDate,
  generateRecurringTransactions,
} from "./utils";
import Header from "./components/Header";
import BalanceDisplay from "./components/BalanceDisplay";
import TransactionForm from "./components/TransactionForm";
import RecurringList from "./components/RecurringList";
import RecurringCreditCards from "./components/RecurringCreditCards";
import ForecastSettings from "./components/ForecastSettings";
import BalanceTimeline from "./components/BalanceTimeline";
import GlobalSettings from "./components/GlobalSettings";
import { I18nProvider } from "./i18n";

function App() {
  const [startingBalance, setStartingBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [forecastEndDate, setForecastEndDate] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MMM dd, yyyy");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  function getCookie(name) {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  function setCookie(name, val, days = 365) {
    if (typeof document === "undefined") return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${val}; path=/; max-age=${maxAge}`;
  }

  async function loadData() {
    try {
      setLoading(true);
      const [settingsData, transactionsData, recurringData, creditCardsData] =
        await Promise.all([
          api.getSettings(),
          api.getTransactions(),
          api.getRecurring(),
          api.getCreditCards(),
        ]);

      setStartingBalance(settingsData.startingBalance || 0);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setRecurring(Array.isArray(recurringData) ? recurringData : []);
      setCreditCards(Array.isArray(creditCardsData) ? creditCardsData : []);

      // Load currency, date format and language settings
      setCurrencySymbol(settingsData.currencySymbol || "USD");
      setDateFormat(settingsData.dateFormat || "MMM dd, yyyy");
      const cookieLang = getCookie("lang");
      const serverLang = settingsData.language || "en";
      const initialLang =
        cookieLang && ["en", "es", "zht", "ja"].includes(cookieLang)
          ? cookieLang
          : serverLang;
      setLanguage(initialLang);
      // If cookie overrides server, sync back once
      if (initialLang !== serverLang) {
        await api.updateSettings({
          ...settingsData,
          language: initialLang,
        });
      }

      // Load dates from settings or use defaults
      const todayDate = getTodayDate();
      const savedCurrentDate = settingsData.currentDate || todayDate;
      setCurrentDate(savedCurrentDate);

      // Set forecast end date from settings or default to 30 days from current date
      if (settingsData.forecastEndDate) {
        setForecastEndDate(settingsData.forecastEndDate);
      } else {
        const defaultEndDate = new Date(savedCurrentDate);
        defaultEndDate.setDate(defaultEndDate.getDate() + 30);
        setForecastEndDate(defaultEndDate.toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartingBalanceChange(newBalance) {
    try {
      setStartingBalance(newBalance);
      await api.updateSettings({
        startingBalance: newBalance,
        currentDate: currentDate,
        forecastEndDate: forecastEndDate,
        currencySymbol: currencySymbol,
        dateFormat: dateFormat,
        language: language,
      });
    } catch (error) {
      console.error("Error updating starting balance:", error);
    }
  }

  async function handleCurrentDateChange(newDate) {
    try {
      setCurrentDate(newDate);
      await api.updateSettings({
        startingBalance: startingBalance,
        currentDate: newDate,
        forecastEndDate: forecastEndDate,
        currencySymbol: currencySymbol,
        dateFormat: dateFormat,
        language: language,
      });
    } catch (error) {
      console.error("Error updating current date:", error);
    }
  }

  async function handleForecastEndDateChange(newDate) {
    try {
      setForecastEndDate(newDate);
      await api.updateSettings({
        startingBalance: startingBalance,
        currentDate: currentDate,
        forecastEndDate: newDate,
        currencySymbol: currencySymbol,
        dateFormat: dateFormat,
        language: language,
      });
    } catch (error) {
      console.error("Error updating forecast end date:", error);
    }
  }

  async function handleCurrencyChange(newCurrency) {
    try {
      setCurrencySymbol(newCurrency);
      await api.updateSettings({
        startingBalance: startingBalance,
        currentDate: currentDate,
        forecastEndDate: forecastEndDate,
        currencySymbol: newCurrency,
        dateFormat: dateFormat,
        language: language,
      });
    } catch (error) {
      console.error("Error updating currency:", error);
    }
  }

  async function handleDateFormatChange(newFormat) {
    try {
      setDateFormat(newFormat);
      await api.updateSettings({
        startingBalance: startingBalance,
        currentDate: currentDate,
        forecastEndDate: forecastEndDate,
        currencySymbol: currencySymbol,
        dateFormat: newFormat,
        language: language,
      });
    } catch (error) {
      console.error("Error updating date format:", error);
    }
  }

  async function handleLanguageChange(newLanguage) {
    try {
      const nextLang = ["en", "es", "zht", "ja"].includes(newLanguage)
        ? newLanguage
        : "en";
      setCookie("lang", nextLang);
      setLanguage(nextLang);
      await api.updateSettings({
        startingBalance: startingBalance,
        currentDate: currentDate,
        forecastEndDate: forecastEndDate,
        currencySymbol: currencySymbol,
        dateFormat: dateFormat,
        language: nextLang,
      });
    } catch (error) {
      console.error("Error updating language:", error);
    }
  }

  async function handleAddTransaction(transaction) {
    try {
      const newTransaction = await api.addTransaction(transaction);
      setTransactions([...transactions, newTransaction]);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  }

  async function handleDeleteTransaction(id) {
    try {
      await api.deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  }

  async function handleAddRecurring(recurring) {
    try {
      const newRecurring = await api.addRecurring(recurring);
      setRecurring((prev) => [...prev, newRecurring]);
    } catch (error) {
      console.error("Error adding recurring transaction:", error);
    }
  }

  async function handleUpdateRecurring(id, updatedRecurring) {
    try {
      const updated = await api.updateRecurring(id, updatedRecurring);
      setRecurring(recurring.map((r) => (r.id === id ? updated : r)));
    } catch (error) {
      console.error("Error updating recurring transaction:", error);
    }
  }

  async function handleDeleteRecurring(id) {
    try {
      await api.deleteRecurring(id);
      setRecurring(recurring.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
    }
  }

  async function handleAddCreditCard(card) {
    try {
      const newCard = await api.addCreditCard(card);
      setCreditCards((prev) => [...prev, newCard]);
    } catch (error) {
      console.error("Error adding credit card:", error);
    }
  }

  async function handleUpdateCreditCard(id, updatedCard) {
    try {
      const updated = await api.updateCreditCard(id, updatedCard);
      setCreditCards(creditCards.map((c) => (c.id === id ? updated : c)));
    } catch (error) {
      console.error("Error updating credit card:", error);
    }
  }

  async function handleDeleteCreditCard(id) {
    try {
      await api.deleteCreditCard(id);
      setCreditCards(creditCards.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting credit card:", error);
    }
  }

  async function handleUseCreditCard(transactionData) {
    await handleAddTransaction({
      ...transactionData,
      type: "debit", // Credit card payments are always debits
    });
  }

  async function handleClearCalculations() {
    if (
      window.confirm(
        "Clear all transactions? Recurring transactions will be kept.",
      )
    ) {
      try {
        await api.clearTransactions();
        setTransactions([]);

        // Reset current date to today
        const todayDate = getTodayDate();
        setCurrentDate(todayDate);

        // Set forecast end date to 30 days from today
        const endDate = new Date(todayDate);
        endDate.setDate(endDate.getDate() + 30);
        const newForecastEndDate = endDate.toISOString().split("T")[0];
        setForecastEndDate(newForecastEndDate);

        await api.updateSettings({
          startingBalance: startingBalance,
          currentDate: todayDate,
          forecastEndDate: newForecastEndDate,
          currencySymbol: currencySymbol,
          dateFormat: dateFormat,
          language: language,
        });
      } catch (error) {
        console.error("Error clearing calculations:", error);
      }
    }
  }

  // Generate all transactions including recurring ones
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

  // Calculate lowest balance and its date from balance history
  const lowestBalanceInfo =
    balanceHistory.length > 0
      ? balanceHistory.reduce((lowest, entry) => {
          return entry.balance < lowest.balance ? entry : lowest;
        }, balanceHistory[0])
      : { balance: startingBalance, date: currentDate };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#1f1f1f]">
        <div className="text-xl text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <I18nProvider language={language} setLanguage={handleLanguageChange}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#1f1f1f]">
        <Header />

        <main className="max-w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
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
              />

              <RecurringList
                recurring={recurring}
                onAddRecurring={handleAddRecurring}
                onUpdateRecurring={handleUpdateRecurring}
                onDeleteRecurring={handleDeleteRecurring}
                currencySymbol={currencySymbol}
              />

              <TransactionForm onAddTransaction={handleAddTransaction} />
            </div>
          </div>
        </main>
      </div>
    </I18nProvider>
  );
}

export default App;
