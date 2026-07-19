import React from "react";

// Single source for the trash-icon delete control (R11). Bakes the >=44px
// touch target (V19); callers vary only the icon size and optional extra
// classes (e.g. flex-shrink-0 inside a flex row).
function DeleteButton({ onClick, title, iconSize = "w-4 h-4", className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 min-h-11 min-w-11 inline-flex items-center justify-center ${className}`}
      title={title}
    >
      <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
}

export default DeleteButton;
