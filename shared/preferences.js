// Persisted language IDs are kept stable; locale contains the BCP 47 tag.
export const languages = [
  {
    value: "en",
    name: "English",
    nativeName: "English",
    locale: "en-US",
    dir: "ltr",
  },
  {
    value: "es",
    name: "Spanish",
    nativeName: "Español",
    locale: "es",
    dir: "ltr",
  },
  {
    value: "zht",
    name: "Chinese (Traditional)",
    nativeName: "繁體中文",
    locale: "zh-Hant",
    dir: "ltr",
  },
  {
    value: "ja",
    name: "Japanese",
    nativeName: "日本語",
    locale: "ja",
    dir: "ltr",
  },
  {
    value: "zhs",
    name: "Chinese (Simplified)",
    nativeName: "简体中文",
    locale: "zh-Hans",
    dir: "ltr",
  },
  {
    value: "ko",
    name: "Korean",
    nativeName: "한국어",
    locale: "ko",
    dir: "ltr",
  },
  {
    value: "de",
    name: "German",
    nativeName: "Deutsch",
    locale: "de",
    dir: "ltr",
  },
  {
    value: "fr",
    name: "French",
    nativeName: "Français",
    locale: "fr",
    dir: "ltr",
  },
  {
    value: "pt",
    name: "Portuguese",
    nativeName: "Português",
    locale: "pt",
    dir: "ltr",
  },
  {
    value: "it",
    name: "Italian",
    nativeName: "Italiano",
    locale: "it",
    dir: "ltr",
  },
  {
    value: "ru",
    name: "Russian",
    nativeName: "Русский",
    locale: "ru",
    dir: "ltr",
  },
  {
    value: "ar",
    name: "Arabic",
    nativeName: "العربية",
    locale: "ar",
    dir: "rtl",
  },
  {
    value: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    locale: "hi",
    dir: "ltr",
  },
  { value: "th", name: "Thai", nativeName: "ไทย", locale: "th", dir: "ltr" },
  {
    value: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    locale: "vi",
    dir: "ltr",
  },
  {
    value: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    locale: "id",
    dir: "ltr",
  },
  {
    value: "ms",
    name: "Malay",
    nativeName: "Bahasa Melayu",
    locale: "ms",
    dir: "ltr",
  },
  {
    value: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    locale: "nl",
    dir: "ltr",
  },
  {
    value: "pl",
    name: "Polish",
    nativeName: "Polski",
    locale: "pl",
    dir: "ltr",
  },
  {
    value: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    locale: "tr",
    dir: "ltr",
  },
];

export const isLanguage = (value) =>
  languages.some((language) => language.value === value);
export const getLanguage = (value) =>
  languages.find((language) => language.value === value) || languages[0];
export const dateFormats = ["MMM dd, yyyy", "yyyy/MM/dd", "MM/dd/yyyy"];

// The browser/Node ICU catalog supplies current currency codes and symbols.
const fallbackCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "INR",
  "CAD",
  "AUD",
  "CHF",
  "KRW",
  "GTQ",
];
export const currencyCodes =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("currency")
    : fallbackCurrencies;

export function isCurrency(value) {
  if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value)) return false;
  // A saved ISO-style code must survive differences between ICU versions.
  try {
    new Intl.NumberFormat("en", { style: "currency", currency: value });
    return true;
  } catch {
    return false;
  }
}
