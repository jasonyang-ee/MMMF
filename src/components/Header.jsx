import React from "react";

function Header() {
  return (
    <header className="bg-gray-50 dark:bg-[#2a2a2a] shadow-sm dark:shadow-black/50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-600 dark:text-gray-100">
            MMMF
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Max Money Market Funds. Forecast Best MMF Deposit Amount.
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;
