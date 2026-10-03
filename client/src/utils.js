import { getLanguage, isCurrency } from "../../shared/preferences.js";
import { localDate, monthlyDates, parseDate } from "../../shared/dates.js";

export function formatCurrency(amount, currencyCode = "USD", language = "en") {
  return new Intl.NumberFormat(getLanguage(language).locale, {
    style: "currency",
    currency: isCurrency(currencyCode) ? currencyCode : "USD",
    currencyDisplay: "symbol",
  }).format(amount);
}

export function currencyStep(currencyCode) {
  const digits = new Intl.NumberFormat("en", {
    style: "currency",
    currency: isCurrency(currencyCode) ? currencyCode : "USD",
  }).resolvedOptions().maximumFractionDigits;
  return 10 ** -digits;
}

export function formatDate(
  value,
  dateFormat = "MMM dd, yyyy",
  language = "en",
) {
  const date = parseDate(value);
  if (!date) return value;
  const [year, month, day] = value.split("-");
  if (dateFormat === "yyyy/MM/dd") return `${year}/${month}/${day}`;
  if (dateFormat === "MM/dd/yyyy") return `${month}/${day}/${year}`;
  return new Intl.DateTimeFormat(getLanguage(language).locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    calendar: "gregory",
  }).format(date);
}

export function calculateBalance(
  startingBalance,
  transactions,
  currentDate,
  upToDate = null,
) {
  let balance = Number(startingBalance) || 0;
  if (!parseDate(currentDate))
    return { currentBalance: balance, balanceHistory: [] };
  const sorted = transactions
    .filter(
      (item) =>
        parseDate(item.date) &&
        item.date >= currentDate &&
        (!upToDate || item.date <= upToDate),
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.type === b.type ? 0 : a.type === "credit" ? -1 : 1),
    );
  const balanceHistory = [{ date: currentDate, balance, transaction: null }];
  for (const transaction of sorted) {
    const amount = Number(transaction.amount);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !["credit", "debit"].includes(transaction.type)
    )
      continue;
    balance += transaction.type === "credit" ? amount : -amount;
    balanceHistory.push({ date: transaction.date, balance, transaction });
  }
  return { currentBalance: balance, balanceHistory };
}

export const getTodayDate = localDate;

export function generateRecurringTransactions(
  manualTransactions,
  recurringTemplates,
  currentDate,
  forecastEndDate,
) {
  const all = [...manualTransactions];
  for (const template of recurringTemplates) {
    for (const date of monthlyDates(
      template.dayOfMonth,
      currentDate,
      forecastEndDate,
    )) {
      const duplicate = manualTransactions.some(
        (item) =>
          item.date === date &&
          item.name === template.name &&
          Number(item.amount) === Number(template.amount) &&
          item.type === template.type,
      );
      if (!duplicate)
        all.push({
          ...template,
          id: `recurring-${template.id}-${date}`,
          date,
          isRecurring: true,
          recurringId: template.id,
        });
    }
  }
  return all;
}

export function nextCardDate(card, transactions, start, end) {
  const used = new Set(
    transactions
      .filter(
        (item) =>
          item.type === "debit" &&
          (item.creditCardId
            ? item.creditCardId === card.id
            : item.name === card.name),
      )
      .map((item) => item.date),
  );
  return (
    monthlyDates(card.dayOfMonth, start, end).find((date) => !used.has(date)) ||
    ""
  );
}
