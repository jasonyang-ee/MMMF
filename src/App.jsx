import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { api } from "./api";
import { calculateBalance, getTodayDate } from "./utils";
import Header from "./components/Header";
import BalanceDisplay from "./components/BalanceDisplay";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import RecurringList from "./components/RecurringList";
import ForecastSettings from "./components/ForecastSettings";
import BalanceTimeline from "./components/BalanceTimeline";

function App() {
  const [startingBalance, setStartingBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [forecastEndDate, setForecastEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [settingsData, transactionsData, recurringData] = await Promise.all(
        [api.getSettings(), api.getTransactions(), api.getRecurring()]
      );

      setStartingBalance(settingsData.startingBalance || 0);
      setTransactions(transactionsData || []);
      setRecurring(recurringData || []);

      // Set default forecast end date to 30 days from now
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 30);
      setForecastEndDate(defaultEndDate.toISOString().split("T")[0]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartingBalanceChange(newBalance) {
    setStartingBalance(newBalance);
    await api.updateSettings({ startingBalance: newBalance });
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

  async function handleUseRecurring(recurringItem) {
    const transaction = {
      name: recurringItem.name,
      amount: recurringItem.amount,
      type: recurringItem.type,
      date: getTodayDate(),
    };
    await handleAddTransaction(transaction);
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

  const { currentBalance, balanceHistory } = calculateBalance(
    startingBalance,
    transactions,
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
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Balance and Settings Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <BalanceDisplay
                startingBalance={startingBalance}
                currentBalance={currentBalance}
                onStartingBalanceChange={handleStartingBalanceChange}
              />
            </div>
            <div>
              <ForecastSettings
                forecastEndDate={forecastEndDate}
                onForecastEndDateChange={setForecastEndDate}
                onClearCalculations={handleClearCalculations}
              />
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="mb-8">
            <BalanceTimeline
              balanceHistory={balanceHistory}
              forecastEndDate={forecastEndDate}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Transaction Form */}
            <div className="lg:col-span-1">
              <TransactionForm onAddTransaction={handleAddTransaction} />
            </div>

            {/* Middle Column - Transactions List */}
            <div className="lg:col-span-1">
              <TransactionList
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>

            {/* Right Column - Recurring Transactions */}
            <div className="lg:col-span-1">
              <RecurringList
                recurring={recurring}
                onAddRecurring={handleAddRecurring}
                onDeleteRecurring={handleDeleteRecurring}
                onUseRecurring={handleUseRecurring}
              />
            </div>
          </div>
        </main>
      </div>
    </DndProvider>
  );
}

export default App;
