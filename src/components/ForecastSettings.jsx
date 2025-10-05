import React from "react";

function ForecastSettings({
  currentDate,
  forecastEndDate,
  onCurrentDateChange,
  onForecastEndDateChange,
  onClearCalculations,
}) {
  // Calculate days between dates
  const startDate = new Date(currentDate);
  const endDate = new Date(forecastEndDate);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  // Handle quick date selection
  const handleQuickSelect = (days) => {
    const newEndDate = new Date(currentDate);
    newEndDate.setDate(newEndDate.getDate() + days);
    onForecastEndDateChange(newEndDate.toISOString().split("T")[0]);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
        Forecast Settings
      </h2>

      <div className="space-y-4">
        <div>
          <label className="label">Current Date</label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => onCurrentDateChange(e.target.value)}
            className="input cursor-pointer w-full"
            style={{
              colorScheme: "light",
              WebkitAppearance: "none",
              MozAppearance: "textfield",
            }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
          />
        </div>

        <div>
          <label className="label">Forecast Until</label>
          <input
            type="date"
            value={forecastEndDate}
            onChange={(e) => onForecastEndDateChange(e.target.value)}
            min={currentDate}
            className="input cursor-pointer w-full"
            style={{
              colorScheme: "light",
              WebkitAppearance: "none",
              MozAppearance: "textfield",
            }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleQuickSelect(30)}
              className="btn btn-secondary text-xs flex-1"
              title="Set to 30 days from current date"
            >
              30 days
            </button>
            <button
              onClick={() => handleQuickSelect(60)}
              className="btn btn-secondary text-xs flex-1"
              title="Set to 60 days from current date"
            >
              60 days
            </button>
            <button
              onClick={() => handleQuickSelect(90)}
              className="btn btn-secondary text-xs flex-1"
              title="Set to 90 days from current date"
            >
              90 days
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {daysDiff > 0
              ? `${daysDiff} days from current date`
              : "Select a future date"}
          </p>
        </div>

        <div className="pt-4 border-t dark:border-gray-700">
          <button
            onClick={onClearCalculations}
            className="btn btn-danger w-full"
          >
            Clear All Transactions
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            This will keep your recurring transactions
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForecastSettings;
