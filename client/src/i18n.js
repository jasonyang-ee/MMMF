import React, { createContext, useContext, useEffect, useMemo } from "react";
import { getLanguage, languages } from "../../shared/preferences.js";
import { translate } from "./translations.js";
export { translate } from "./translations.js";
export const supportedLanguages = Object.fromEntries(
  languages.map((language) => [language.value, language]),
);
const I18nContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => translate("en", key),
});

export function I18nProvider({ language, setLanguage, children }) {
  useEffect(() => {
    const metadata = getLanguage(language);
    document.documentElement.lang = metadata.locale;
    document.documentElement.dir = metadata.dir;
  }, [language]);
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key, ...args) => translate(language, key, ...args),
    }),
    [language, setLanguage],
  );
  return React.createElement(I18nContext.Provider, { value }, children);
}
export function useI18n() {
  return useContext(I18nContext);
}
