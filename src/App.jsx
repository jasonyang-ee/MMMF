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
import DarkModeToggle from "./components/DarkModeToggle";

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

  async function handleUpdateRecurring(id, updatedRecurring) {
    const updated = await api.updateRecurring(id, updatedRecurring);
    setRecurring(recurring.map((r) => (r.id === id ? updated : r)));
  }

  async function handleDeleteRecurring(id) {
    await api.deleteRecurring(id);
    setRecurring(recurring.filter((r) => r.id !== id));
  }

  async function handleAddCreditCard(card) {
    const newCard = await api.addCreditCard(card);
    setCreditCards((prev) => [...prev, newCard]);
  }

  async function handleUpdateCreditCard(id, updatedCard) {
    const updated = await api.updateCreditCard(id, updatedCard);
    setCreditCards(creditCards.map((c) => (c.id === id ? updated : c)));
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
      });
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#1f1f1f]">
      <Header />

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Layout: Sidebar + Main Content */}
        <div className="grid grid-cols-1 min-[1420px]:grid-cols-[320px_1fr_384px] gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Account Balance - Top */}
            <BalanceDisplay
              startingBalance={startingBalance}
              currentBalance={currentBalance}
              lowestBalance={lowestBalanceInfo.balance}
              lowestBalanceDate={lowestBalanceInfo.date}
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

            {/* Dark Mode Toggle - Third */}
            <DarkModeToggle />
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
          <div className="space-y-6">
            {/* Recurring Credit Cards - First */}
            <RecurringCreditCards
              creditCards={creditCards}
              onAddCreditCard={handleAddCreditCard}
              onUpdateCreditCard={handleUpdateCreditCard}
              onDeleteCreditCard={handleDeleteCreditCard}
              onUseCreditCard={handleUseCreditCard}
              currentDate={currentDate}
              forecastEndDate={forecastEndDate}
              transactions={transactions}
            />

            {/* Recurring Transactions - Second */}
            <RecurringList
              recurring={recurring}
              onAddRecurring={handleAddRecurring}
              onUpdateRecurring={handleUpdateRecurring}
              onDeleteRecurring={handleDeleteRecurring}
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
