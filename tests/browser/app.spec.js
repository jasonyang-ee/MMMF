import { test, expect } from "@playwright/test";
import { languages } from "../../shared/preferences.js";
import { translate } from "../../client/src/translations.js";

async function openApp(page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Global Settings" }),
  ).toBeVisible();
}
async function choose(page, label, search, option) {
  const field = page.getByRole("combobox", { name: label, exact: true });
  await field.click();
  await field.fill(search);
  await page.getByRole("option", { name: option }).click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(page.locator("fieldset")).toBeEnabled();
}
test("search selectors support full catalogs, keyboard, cancel, precision and persistence", async ({
  page,
}) => {
  await openApp(page);
  const language = page.getByRole("combobox", {
    name: "Language",
    exact: true,
  });
  await language.click();
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(20);
  await language.fill("no-such-language");
  await expect(page.getByRole("status")).toHaveText("No matches found");
  await language.press("Escape");
  await expect(language).toHaveValue("English");
  await language.click();
  await language.fill("espanol");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(1);
  await language.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await choose(page, "Idioma", "English", "English");
  const currency = page.getByRole("combobox", {
    name: "Currency",
    exact: true,
  });
  await currency.click();
  expect(
    await page.getByRole("listbox").getByRole("option").count(),
  ).toBeGreaterThan(150);
  const height = await page
    .getByRole("listbox")
    .evaluate(
      (element) => element.parentElement.getBoundingClientRect().height,
    );
  expect(height).toBeLessThanOrEqual(302);
  await currency.fill("KWD");
  await currency.press("ArrowDown");
  await currency.press("Enter");
  await expect(currency).toHaveValue(/KWD/);
  await expect(page.locator('input[name="amount"]')).toHaveAttribute(
    "step",
    "0.001",
  );
  await page.reload();
  await expect(currency).toHaveValue(/KWD/);
});

test("failed writes keep drafts and a successful retry updates the timeline", async ({
  page,
}) => {
  await openApp(page);
  await page.locator('input[name="name"]').fill("Retained draft");
  await page.locator('input[name="amount"]').fill("12.34");
  await page.route("**/api/transactions", async (route) => {
    if (route.request().method() === "POST")
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: '{"error":"Storage unavailable"}',
      });
    else await route.continue();
  });
  await page
    .getByRole("button", { name: "Add Transaction", exact: true })
    .click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.locator('input[name="name"]')).toHaveValue(
    "Retained draft",
  );
  await expect(page.locator('input[name="amount"]')).toHaveValue("12.34");
  await page.unroute("**/api/transactions");
  await page
    .getByRole("button", { name: "Add Transaction", exact: true })
    .click();
  await expect(page.locator('input[name="name"]')).toHaveValue("");
  await expect(
    page.getByRole("cell", { name: "Retained draft", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete transaction", exact: true })
    .click();
  await expect(
    page.getByRole("cell", { name: "Retained draft", exact: true }),
  ).toHaveCount(0);
});

test("initial-load failure offers retry instead of an editable empty account", async ({
  page,
}) => {
  await page.route("**/api/settings", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toHaveText("Could not load your data.");
  await expect(page.locator('input[name="name"]')).toHaveCount(0);
  await page.unroute("**/api/settings");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(
    page.getByRole("heading", { name: "Account Balance" }),
  ).toBeVisible();
});

test("calendar works with keyboard, restores focus and fits a 320px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await openApp(page);
  const trigger = page.getByRole("button", { name: /^Current Date:/ });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const current = await page.locator(":focus").getAttribute("aria-label");
  await page.keyboard.press("ArrowRight");
  expect(await page.locator(":focus").getAttribute("aria-label")).not.toBe(
    current,
  );
  const minimum = await dialog
    .getByRole("grid")
    .getByRole("button")
    .evaluateAll((buttons) =>
      Math.min(
        ...buttons.map((button) => button.getBoundingClientRect().width),
      ),
    );
  expect(minimum).toBeGreaterThanOrEqual(44);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("every language stays usable on mobile in light and dark themes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApp(page);
  let previous = "en";
  for (const language of languages) {
    await choose(
      page,
      translate(previous, "settings:language"),
      language.value,
      new RegExp(language.nativeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
    await expect(page.locator("html")).toHaveAttribute("lang", language.locale);
    await expect(page.locator("html")).toHaveAttribute("dir", language.dir);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const toggle = page.getByRole("switch");
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect
      .poll(() =>
        toggle.evaluate((button) => {
          const track = button.firstElementChild.getBoundingClientRect();
          const knob =
            button.firstElementChild.firstElementChild.getBoundingClientRect();
          return knob.left >= track.left && knob.right <= track.right;
        }),
      )
      .toBe(true);
    await toggle.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    previous = language.value;
  }
  await page.screenshot({
    path: "test-results/mobile-languages.png",
    fullPage: true,
  });
});

test("calendar save errors remain accessible inside the dialog and allow retry", async ({
  page,
}) => {
  await openApp(page);
  const trigger = page.getByRole("button", {
    name: /^Current Date:/,
    includeHidden: true,
  });
  const original = await trigger.textContent();
  await page.route("**/api/settings", (route) =>
    route.request().method() === "PUT"
      ? route.fulfill({
          status: 500,
          contentType: "application/json",
          body: "{}",
        })
      : route.continue(),
  );
  await trigger.click();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(trigger).toHaveText(original);
  await expect(dialog.locator("button:focus")).toHaveCount(1);
  await page.unroute("**/api/settings");
  await page.keyboard.press("Enter");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).not.toHaveText(original);
  await expect(trigger).toBeFocused();
});

test("inline editing saves once, cancels, and clear preserves templates and cards", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openApp(page);
  const settings = await (await page.request.get("/api/settings")).json();
  await page.request.post("/api/recurring", {
    data: { name: "Monthly rent", amount: 55, type: "debit", dayOfMonth: 1 },
  });
  await page.request.post("/api/credit-cards", {
    data: {
      name: "Review card",
      dayOfMonth: Number(settings.currentDate.slice(-2)),
    },
  });
  await page.reload();
  let settingsWrites = 0;
  page.on("request", (request) => {
    if (request.method() === "PUT" && request.url().endsWith("/api/settings"))
      settingsWrites++;
  });
  await page.getByRole("button", { name: "$0.00", exact: true }).click();
  const balanceInput = page.getByRole("spinbutton", {
    name: "Starting Balance",
    exact: true,
  });
  await balanceInput.fill("250");
  await balanceInput.press("Enter");
  await expect(
    page.getByRole("button", { name: "$250.00", exact: true }),
  ).toBeVisible();
  expect(settingsWrites).toBe(1);
  await page.getByRole("button", { name: "$250.00", exact: true }).click();
  await balanceInput.fill("999");
  await balanceInput.press("Escape");
  await expect(
    page.getByRole("button", { name: "$250.00", exact: true }),
  ).toBeVisible();
  expect(settingsWrites).toBe(1);
  const recurring = page.locator(".card").filter({
    has: page.getByRole("heading", {
      name: "Recurring Transactions",
      exact: true,
    }),
  });
  await recurring
    .getByRole("button", { name: "Monthly rent", exact: true })
    .click();
  await recurring
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Updated rent");
  await recurring
    .getByRole("textbox", { name: "Description", exact: true })
    .press("Enter");
  await expect(
    recurring.getByRole("button", { name: "Updated rent", exact: true }),
  ).toBeVisible();
  const cards = page.locator(".card").filter({
    has: page.getByRole("heading", {
      name: "Recurring Credit Cards",
      exact: true,
    }),
  });
  await cards.getByRole("button", { name: "Add Payment", exact: true }).click();
  const payment = cards.getByRole("spinbutton", {
    name: "Amount",
    exact: true,
  });
  await expect(payment).toBeFocused();
  await payment.fill("10");
  await cards.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Review card", exact: true }),
  ).toBeVisible();
  const paymentSchedule = await cards.locator("p").allTextContents();
  await cards.getByRole("button", { name: "Review card", exact: true }).click();
  await cards
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Renamed card");
  await cards
    .getByRole("textbox", { name: "Description", exact: true })
    .press("Enter");
  await expect(
    cards.getByRole("button", { name: "Renamed card", exact: true }),
  ).toBeVisible();
  expect(await cards.locator("p").allTextContents()).toEqual(paymentSchedule);
  await page.screenshot({
    path: "test-results/desktop-populated.png",
    fullPage: true,
  });
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Clear All Transactions", exact: true })
    .click();
  await expect(
    page.getByRole("cell", { name: "Review card", exact: true }),
  ).toHaveCount(0);
  await expect(
    recurring.getByRole("button", { name: "Updated rent", exact: true }),
  ).toBeVisible();
  await expect(
    cards.getByRole("button", { name: "Renamed card", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "$250.00", exact: true }),
  ).toBeVisible();
  await recurring
    .getByRole("button", { name: "Delete recurring transaction", exact: true })
    .click();
  await expect(
    recurring.getByText("No recurring transactions", { exact: true }),
  ).toBeVisible();
  await cards
    .getByRole("button", { name: "Delete credit card", exact: true })
    .click();
  await expect(
    cards.getByText("No credit cards", { exact: true }),
  ).toBeVisible();
});

test("failed recurring and card submissions retain the forms", async ({
  page,
}) => {
  await openApp(page);
  const recurring = page.locator(".card").filter({
    has: page.getByRole("heading", {
      name: "Recurring Transactions",
      exact: true,
    }),
  });
  await recurring.getByRole("button", { name: "+ Add", exact: true }).click();
  await recurring
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Draft recurring");
  await recurring
    .getByRole("spinbutton", { name: "Amount", exact: true })
    .fill("2.50");
  await recurring
    .getByRole("spinbutton", { name: "Day of Month (1-31)", exact: true })
    .fill("31");
  await page.route("**/api/recurring", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );
  await recurring
    .getByRole("button", { name: "Save Recurring Transaction" })
    .click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    recurring.getByRole("textbox", { name: "Description", exact: true }),
  ).toHaveValue("Draft recurring");
  await page.unroute("**/api/recurring");
  await recurring
    .getByRole("button", { name: "Save Recurring Transaction" })
    .click();
  await expect(
    recurring.getByRole("button", { name: "Draft recurring", exact: true }),
  ).toBeVisible();
  const cards = page.locator(".card").filter({
    has: page.getByRole("heading", {
      name: "Recurring Credit Cards",
      exact: true,
    }),
  });
  await cards.getByRole("button", { name: "+ Add", exact: true }).click();
  await cards.getByRole("textbox").fill("Draft card");
  await cards.getByRole("spinbutton").fill("15");
  await page.route("**/api/credit-cards", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );
  await cards.getByRole("button", { name: "Save Credit Card" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(cards.getByRole("textbox")).toHaveValue("Draft card");
  await page.unroute("**/api/credit-cards");
  await cards.getByRole("button", { name: "Save Credit Card" }).click();
  await expect(
    cards.getByRole("button", { name: "Draft card", exact: true }),
  ).toBeVisible();
});
