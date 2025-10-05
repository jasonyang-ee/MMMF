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

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Forecast Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="label">Current Date</label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => onCurrentDateChange(e.target.value)}
            className="input cursor-pointer w-full"
            style={{ colorScheme: "light" }}
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
            style={{ colorScheme: "light" }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
          />
          <p className="text-sm text-gray-500 mt-1">
            {daysDiff > 0
              ? `${daysDiff} days from current date`
              : "Select a future date"}
          </p>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={onClearCalculations}
            className="btn btn-danger w-full"
          >
            Clear All Transactions
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This will keep your recurring transactions
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForecastSettings;
