import React from "react";

function Header() {
  return (
    <header className="bg-white dark:bg-[#2a2a2a] shadow-sm dark:shadow-black/50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-600 dark:text-gray-100">
              Budget Forecast
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track and forecast your account balance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <svg
              className="w-10 h-10 text-primary-600 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
