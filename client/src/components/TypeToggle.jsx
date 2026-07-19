import React from "react";

// Single source for the debit/credit type selector (R9). One active-red /
// active-green pair shared by RecurringList and TransactionForm; `size`
// covers the only real difference between the two call sites.
function TypeToggle({ value, onChange, debitLabel, creditLabel, size = "md" }) {
  const sizeClass = size === "sm" ? "py-2 px-3 text-sm" : "py-2.5 px-4";
  const base = `flex-1 ${sizeClass} rounded-lg font-medium transition-all`;
  const inactive =
    "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#333333] dark:text-gray-300 dark:hover:bg-[#3a3a3a]";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange("debit")}
        className={`${base} ${
          value === "debit"
            ? "bg-red-600 text-white shadow-md dark:bg-red-700"
            : inactive
        }`}
      >
        {debitLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("credit")}
        className={`${base} ${
          value === "credit"
            ? "bg-green-600 text-white shadow-md dark:bg-green-700"
            : inactive
        }`}
      >
        {creditLabel}
      </button>
    </div>
  );
}

export default TypeToggle;
