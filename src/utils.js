import { format, parseISO } from "date-fns";

export function formatCurrency(amount, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

export function formatDate(dateString, dateFormat = "MMM dd, yyyy") {
  try {
    return format(parseISO(dateString), dateFormat);
  } catch {
    return dateString;
  }
}

export function calculateBalance(
  startingBalance,
  transactions,
  currentDate,
  upToDate = null
) {
  let balance = parseFloat(startingBalance) || 0;
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // First, sort by date
    const dateDiff = dateA - dateB;
    if (dateDiff !== 0) return dateDiff;

    // If dates are the same, prioritize credits (positive) before debits (negative)
    // credit should come first (return -1), debit should come second (return 1)
    if (a.type === "credit" && b.type === "debit") return -1;
    if (a.type === "debit" && b.type === "credit") return 1;

    return 0;
  });

  const balanceHistory = [
    {
      date: currentDate,
      balance: balance,
      transaction: null,
    },
  ];

  for (const transaction of sortedTransactions) {
    if (upToDate && new Date(transaction.date) > new Date(upToDate)) {
      break;
    }

    if (transaction.type === "credit") {
      balance += parseFloat(transaction.amount) || 0;
    } else if (transaction.type === "debit") {
      balance -= parseFloat(transaction.amount) || 0;
    }

    balanceHistory.push({
      date: transaction.date,
      balance: balance,
      transaction: transaction,
    });
  }

  return { currentBalance: balance, balanceHistory };
}

export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export function generateRecurringTransactions(
  manualTransactions,
  recurringTemplates,
  currentDate,
  forecastEndDate
) {
  const allTransactions = [...manualTransactions];
  const startDate = new Date(currentDate);
  const endDate = new Date(forecastEndDate);

  // For each recurring template, generate transactions for each month
  recurringTemplates.forEach((template) => {
    if (!template.dayOfMonth) return;

    let currentMonthDate = new Date(startDate);
    // Start from the current month
    currentMonthDate.setDate(1); // Set to first day of month

    while (currentMonthDate <= endDate) {
      // Create date for this month's occurrence
      const year = currentMonthDate.getFullYear();
      const month = currentMonthDate.getMonth();
      const dayOfMonth = Math.min(
        template.dayOfMonth,
        new Date(year, month + 1, 0).getDate() // Get last day of month
      );

      const transactionDate = new Date(year, month, dayOfMonth);

      // Only add if the date is between current date and forecast end date
      if (transactionDate >= startDate && transactionDate <= endDate) {
        // Check if a manual transaction doesn't already exist for this exact date and recurring item
        const isDuplicate = manualTransactions.some(
          (t) =>
            t.date === transactionDate.toISOString().split("T")[0] &&
            t.name === template.name &&
            t.amount === template.amount
        );

        if (!isDuplicate) {
          allTransactions.push({
            id: `recurring-${template.id}-${transactionDate.getTime()}`,
            name: template.name,
            amount: template.amount,
            type: template.type,
            date: transactionDate.toISOString().split("T")[0],
            isRecurring: true,
            recurringId: template.id,
          });
        }
      }

      // Move to next month
      currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    }
  });

  return allTransactions;
}
