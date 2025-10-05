import { format, parseISO } from "date-fns";

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateString) {
  try {
    return format(parseISO(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
}

export function calculateBalance(
  startingBalance,
  transactions,
  upToDate = null
) {
  let balance = parseFloat(startingBalance) || 0;
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const balanceHistory = [
    {
      date: new Date().toISOString().split("T")[0],
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
