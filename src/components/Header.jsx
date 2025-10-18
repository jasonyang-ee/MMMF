import React from "react";
import { useI18n } from "../i18n";

function Header() {
  const { t, language, setLanguage } = useI18n();
  const nextLang = language === "en" ? "es" : "en";
  return (
    <header className="bg-gray-50 dark:bg-[#2a2a2a] shadow-sm dark:shadow-black/50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary-600 dark:text-gray-100">{t("header:title")}</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t("header:tagline")}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(nextLang)}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-200 dark:bg-[#3a3a3a] text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-[#4a4a4a]"
              title={t("header:toggleTo")}
            >
              {t("header:toggleTo")}
            </button>
            <a
              href="https://github.com/jasonyang-ee/MMMF"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              title={t("header:github")}
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
