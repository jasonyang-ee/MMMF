import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  localDate,
  monthlyDates,
  parseDate,
} from "../shared/dates.js";
import {
  calculateBalance,
  currencyStep,
  formatCurrency,
  formatDate,
  generateRecurringTransactions,
  nextCardDate,
} from "../client/src/utils.js";
import { currencyCodes, languages } from "../shared/preferences.js";
import { translations, translate } from "../client/src/translations.js";

for (const timezone of ["UTC", "America/Los_Angeles", "Asia/Tokyo"]) {
  test(`date-only forecasting in ${timezone}`, () => {
    const previous = process.env.TZ;
    process.env.TZ = timezone;
    try {
      assert.equal(localDate(new Date(2026, 0, 31, 23, 30)), "2026-01-31");
      assert.equal(addDays("2026-03-07", 2), "2026-03-09");
      assert.equal(parseDate("2026-02-30"), null);
      assert.deepEqual(monthlyDates(31, "2024-01-31", "2024-03-31"), [
        "2024-01-31",
        "2024-02-29",
        "2024-03-31",
      ]);
      const template = {
        id: "1",
        name: "Salary",
        type: "credit",
        amount: 100,
        dayOfMonth: 1,
      };
      const generated = generateRecurringTransactions(
        [],
        [template],
        "2026-01-01",
        "2026-03-01",
      );
      assert.deepEqual(
        generated.map((item) => item.date),
        ["2026-01-01", "2026-02-01", "2026-03-01"],
      );
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });
}
test("forecast excludes old/future transactions and orders credits before debits", () => {
  const items = [
    { name: "Old", date: "2025-12-31", amount: 500, type: "debit" },
    { name: "Debit", date: "2026-01-01", amount: 30, type: "debit" },
    { name: "Credit", date: "2026-01-01", amount: 20, type: "credit" },
    { name: "Later", date: "2026-02-01", amount: 40, type: "debit" },
  ];
  const result = calculateBalance(100, items, "2026-01-01", "2026-01-31");
  assert.deepEqual(
    result.balanceHistory.map((entry) => entry.balance),
    [100, 120, 90],
  );
  assert.equal(result.currentBalance, 90);
});
test("opposite transaction types do not suppress a monthly occurrence", () => {
  const template = {
    id: "1",
    name: "Test",
    amount: 10,
    type: "credit",
    dayOfMonth: 1,
  };
  const manual = {
    name: "Test",
    amount: 10,
    type: "debit",
    date: "2026-01-01",
  };
  assert.equal(
    generateRecurringTransactions(
      [manual],
      [template],
      "2026-01-01",
      "2026-01-31",
    ).length,
    2,
  );
  assert.equal(
    generateRecurringTransactions(
      [{ ...manual, type: "credit" }],
      [template],
      "2026-01-01",
      "2026-01-31",
    ).length,
    1,
  );
});
test("card scheduling includes today, fills gaps, and follows IDs after renaming", () => {
  const card = { id: "1", name: "Renamed", dayOfMonth: 31 };
  const payments = [
    { creditCardId: "1", name: "Old name", date: "2026-03-31", type: "debit" },
    { creditCardId: "2", name: "Renamed", date: "2026-01-31", type: "debit" },
  ];
  assert.equal(
    nextCardDate(card, payments, "2026-01-31", "2026-03-31"),
    "2026-01-31",
  );
  payments.push({
    creditCardId: "1",
    name: "Old name",
    date: "2026-01-31",
    type: "debit",
  });
  assert.equal(
    nextCardDate(card, payments, "2026-01-31", "2026-03-31"),
    "2026-02-28",
  );
  assert.equal(
    nextCardDate(
      card,
      [{ name: "Renamed", date: "2026-01-31", type: "debit" }],
      "2026-01-31",
      "2026-02-28",
    ),
    "2026-02-28",
  );
});
test("all currency choices format; currency precision and localized dates agree", () => {
  for (const code of currencyCodes)
    assert.equal(typeof formatCurrency(12.345, code, "ja"), "string");
  assert.equal(currencyStep("JPY"), 1);
  assert.equal(currencyStep("USD"), 0.01);
  assert.equal(currencyStep("KWD"), 0.001);
  assert.match(formatCurrency(12, "EUR", "de"), /12,00/);
  assert.equal(formatDate("2026-01-02", "yyyy/MM/dd", "ja"), "2026/01/02");
});
test("every selectable language has a complete catalog and stable interpolation", () => {
  for (const { value } of languages) {
    const catalog = translations[value];
    assert.ok(catalog, value);
    for (const [namespace, entries] of Object.entries(translations.en)) {
      for (const key of Object.keys(entries)) {
        assert.ok(
          Object.hasOwn(catalog[namespace] || {}, key),
          `${value}:${namespace}:${key}`,
        );
        assert.notEqual(
          translate(value, `${namespace}:${key}`, 7),
          `${namespace}:${key}`,
        );
      }
    }
    assert.ok(translate(value, "recurring:dayOfMonth", 7).includes("7"), value);
  }
  assert.equal(languages.length, 20);
  assert.equal(translate("invalid", "common:save"), "Save");
});

test("monthly generation stops at the largest supported calendar year", () => {
  assert.deepEqual(monthlyDates(31, "9999-12-01", "9999-12-31"), [
    "9999-12-31",
  ]);
});
