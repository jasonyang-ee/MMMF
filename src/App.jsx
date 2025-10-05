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
import TransactionList from "./components/TransactionList";
import RecurringList from "./components/RecurringList";
import RecurringCreditCards from "./components/RecurringCreditCards";
import ForecastSettings from "./components/ForecastSettings";
import BalanceTimeline from "./components/BalanceTimeline";

function App() {
  const [startingBalance, setStartingBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [forecastEndDate, setForecastEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

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
      setTransactions(transactionsData || []);
      setRecurring(recurringData || []);
      setCreditCards(creditCardsData || []);

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
    setStartingBalance(newBalance);
    await api.updateSettings({
      startingBalance: newBalance,
      currentDate: currentDate,
      forecastEndDate: forecastEndDate,
    });
  }

  async function handleCurrentDateChange(newDate) {
    setCurrentDate(newDate);
    await api.updateSettings({
      startingBalance: startingBalance,
      currentDate: newDate,
      forecastEndDate: forecastEndDate,
    });
  }

  async function handleForecastEndDateChange(newDate) {
    setForecastEndDate(newDate);
    await api.updateSettings({
      startingBalance: startingBalance,
      currentDate: currentDate,
      forecastEndDate: newDate,
    });
  }

  async function handleAddTransaction(transaction) {
    const newTransaction = await api.addTransaction(transaction);
    setTransactions([...transactions, newTransaction]);
  }

  async function handleDeleteTransaction(id) {
    await api.deleteTransaction(id);
    setTransactions(transactions.filter((t) => t.id !== id));
  }

  async function handleAddRecurring(recurring) {
    const newRecurring = await api.addRecurring(recurring);
    setRecurring((prev) => [...prev, newRecurring]);
  }

  async function handleDeleteRecurring(id) {
    await api.deleteRecurring(id);
    setRecurring(recurring.filter((r) => r.id !== id));
  }

  async function handleAddCreditCard(card) {
    const newCard = await api.addCreditCard(card);
    setCreditCards((prev) => [...prev, newCard]);
  }

  async function handleDeleteCreditCard(id) {
    await api.deleteCreditCard(id);
    setCreditCards(creditCards.filter((c) => c.id !== id));
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
        "Clear all transactions? Recurring transactions will be kept."
      )
    ) {
      await api.clearTransactions();
      setTransactions([]);
    }
  }

  // Generate all transactions including recurring ones
  const allTransactions = generateRecurringTransactions(
    transactions,
    recurring,
    currentDate,
    forecastEndDate
  );

  const { currentBalance, balanceHistory } = calculateBalance(
    startingBalance,
    allTransactions,
    currentDate,
    forecastEndDate
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Layout: Sidebar + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6">
          {/* Left Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Account Balance - Top */}
            <BalanceDisplay
              startingBalance={startingBalance}
              currentBalance={currentBalance}
              onStartingBalanceChange={handleStartingBalanceChange}
            />

            {/* Forecast Settings - Second */}
            <ForecastSettings
              currentDate={currentDate}
              forecastEndDate={forecastEndDate}
              onCurrentDateChange={handleCurrentDateChange}
              onForecastEndDateChange={handleForecastEndDateChange}
              onClearCalculations={handleClearCalculations}
            />
          </div>

          {/* Center - Balance Timeline */}
          <div className="min-w-0">
            <BalanceTimeline
              balanceHistory={balanceHistory}
              currentDate={currentDate}
              forecastEndDate={forecastEndDate}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-96 space-y-6">
            {/* Recurring Transactions - First */}
            <RecurringList
              recurring={recurring}
              onAddRecurring={handleAddRecurring}
              onDeleteRecurring={handleDeleteRecurring}
            />

            {/* Recurring Credit Cards - Second */}
            <RecurringCreditCards
              creditCards={creditCards}
              onAddCreditCard={handleAddCreditCard}
              onDeleteCreditCard={handleDeleteCreditCard}
              onUseCreditCard={handleUseCreditCard}
              currentDate={currentDate}
              forecastEndDate={forecastEndDate}
              transactions={transactions}
            />

            {/* Add Transaction Form - Third */}
            <TransactionForm onAddTransaction={handleAddTransaction} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
