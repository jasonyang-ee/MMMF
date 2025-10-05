import React from "react";
import DatePicker from "./DatePicker";

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
          <DatePicker
            value={currentDate}
            onChange={onCurrentDateChange}
            className="w-full"
          />
        </div>

        <div>
          <label className="label">Forecast Until</label>
          <DatePicker
            value={forecastEndDate}
            onChange={onForecastEndDateChange}
            min={currentDate}
            className="w-full"
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

        <div className="pt-4 border-t dark:border-[#3a3a3a]">
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
