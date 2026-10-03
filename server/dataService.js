import { addDays, localDate, parseDate } from "../shared/dates.js";
import { dateFormats, isCurrency, isLanguage } from "../shared/preferences.js";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const collections = ["transactions", "recurring", "credit-cards"];
const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isName = (value) =>
  typeof value === "string" && value.trim().length > 0;

export function defaultSettings(language) {
  const currentDate = localDate();
  return {
    startingBalance: 0,
    currentDate,
    forecastEndDate: addDays(currentDate, 30),
    currencySymbol: "USD",
    dateFormat: dateFormats[0],
    language: isLanguage(language) ? language : "en",
  };
}

export function normalizeSettings(value, language) {
  if (!isObject(value)) throw new ApiError(500, "Invalid stored settings");
  const defaults = defaultSettings(language);
  const currentDate = parseDate(value.currentDate)
    ? value.currentDate
    : defaults.currentDate;
  return {
    startingBalance: Number.isFinite(value.startingBalance)
      ? value.startingBalance
      : defaults.startingBalance,
    currentDate,
    forecastEndDate:
      parseDate(value.forecastEndDate) && value.forecastEndDate >= currentDate
        ? value.forecastEndDate
        : parseDate(addDays(currentDate, 30))
          ? addDays(currentDate, 30)
          : currentDate,
    currencySymbol: isCurrency(value.currencySymbol)
      ? value.currencySymbol
      : defaults.currencySymbol,
    dateFormat: dateFormats.includes(value.dateFormat)
      ? value.dateFormat
      : defaults.dateFormat,
    language:
      value.language === undefined
        ? defaults.language
        : isLanguage(value.language)
          ? value.language
          : "en",
  };
}

function validateSettings(value) {
  if (
    !isObject(value) ||
    !Number.isFinite(value.startingBalance) ||
    !isLanguage(value.language) ||
    !isCurrency(value.currencySymbol) ||
    !dateFormats.includes(value.dateFormat) ||
    !parseDate(value.currentDate) ||
    !parseDate(value.forecastEndDate) ||
    value.forecastEndDate < value.currentDate
  ) {
    throw new ApiError(400, "Invalid settings");
  }
  return normalizeSettings(value);
}

function validateEntity(key, value, { preserveName = false } = {}) {
  if (
    !isObject(value) ||
    !isName(value.name) ||
    (!preserveName && value.name.length > 200)
  )
    throw new ApiError(400, "Invalid name");
  const entity = { name: preserveName ? value.name : value.name.trim() };
  if (key !== "credit-cards") {
    if (
      !Number.isFinite(value.amount) ||
      value.amount <= 0 ||
      !["credit", "debit"].includes(value.type)
    )
      throw new ApiError(400, "Invalid amount or type");
    Object.assign(entity, { amount: value.amount, type: value.type });
  }
  if (key === "transactions") {
    if (!parseDate(value.date)) throw new ApiError(400, "Invalid date");
    entity.date = value.date;
    if (value.creditCardId !== undefined) {
      if (
        typeof value.creditCardId !== "string" ||
        !/^\d+$/.test(value.creditCardId)
      )
        throw new ApiError(400, "Invalid credit card ID");
      entity.creditCardId = value.creditCardId;
    }
  } else {
    if (
      !Number.isInteger(value.dayOfMonth) ||
      value.dayOfMonth < 1 ||
      value.dayOfMonth > 31
    )
      throw new ApiError(400, "Invalid day of month");
    entity.dayOfMonth = value.dayOfMonth;
  }
  return entity;
}

function checkCollection(value, key) {
  if (!Array.isArray(value))
    throw new ApiError(500, "Invalid stored collection");
  try {
    for (const item of value) {
      validateEntity(key, item, { preserveName: true });
      if (
        typeof item.id !== "string" ||
        !item.id ||
        typeof item.createdAt !== "string"
      )
        throw new Error("Invalid metadata");
    }
  } catch {
    throw new ApiError(500, "Invalid stored collection");
  }
  return value;
}

// All mutations run inside the adapter's read/modify/write boundary.
export function createDataService(store, language) {
  return {
    async list(key) {
      return checkCollection(await store.read(key, []), key);
    },
    async create(key, body) {
      let preserveName = false;
      if (
        key === "transactions" &&
        isObject(body) &&
        typeof body.name === "string" &&
        body.name.length > 200 &&
        body.type === "debit" &&
        typeof body.creditCardId === "string" &&
        /^\d+$/.test(body.creditCardId)
      ) {
        // Inherit only an exact card name from this account/session's store.
        const cards = checkCollection(
          await store.read("credit-cards", []),
          "credit-cards",
        );
        preserveName = cards.some(
          (card) => card.id === body.creditCardId && card.name === body.name,
        );
      }
      const entity = validateEntity(key, body, { preserveName });
      let result;
      await store.update(key, [], async (value) => {
        const items = checkCollection(value, key);
        let id = Date.now().toString();
        while (items.some((item) => item.id === id)) {
          await new Promise((resolve) => setTimeout(resolve, 1));
          id = Date.now().toString();
        }
        result = { ...entity, id, createdAt: new Date().toISOString() };
        return [...items, result];
      });
      return result;
    },
    async update(key, id, body) {
      if (!isObject(body)) throw new ApiError(400, "Invalid body");
      let result;
      await store.update(key, [], (value) => {
        const items = checkCollection(value, key);
        const index = items.findIndex((item) => item.id === id);
        if (index < 0) throw new ApiError(404, "Item not found");
        result = {
          ...validateEntity(
            key,
            { ...items[index], ...body },
            { preserveName: !Object.hasOwn(body, "name") || body.name === items[index].name },
          ),
          id,
          createdAt: items[index].createdAt,
        };
        return items.map((item, position) =>
          position === index ? result : item,
        );
      });
      return result;
    },
    async remove(key, id) {
      await store.update(key, [], (value) =>
        checkCollection(value, key).filter((item) => item.id !== id),
      );
      return { success: true };
    },
    async clear() {
      await store.update("transactions", [], (value) => {
        checkCollection(value, "transactions");
        return [];
      });
      return { success: true };
    },
    async settings() {
      return normalizeSettings(await store.read("settings", {}), language);
    },
    async saveSettings(body) {
      if (
        !isObject(body) ||
        Object.keys(body).some(
          (key) => !Object.hasOwn(defaultSettings(language), key),
        )
      )
        throw new ApiError(400, "Invalid settings");
      let result;
      await store.update("settings", {}, (value) => {
        result = validateSettings({
          ...normalizeSettings(value, language),
          ...body,
        });
        return result;
      });
      return result;
    },
  };
}
