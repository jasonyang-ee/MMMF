import { useState, useRef, useEffect } from "react";
import { format, parse, isValid } from "date-fns";
import { useI18n } from "../i18n";

export default function DatePicker({ value, onChange, min, className = "" }) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const date = parse(value, "yyyy-MM-dd", new Date());
      if (isValid(date)) {
        setSelectedDate(date);
        setDisplayValue(format(date, "MMM dd, yyyy"));
        setCurrentMonth(date);
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateClick = (date) => {
    if (date) {
      const minDate = min ? parse(min, "yyyy-MM-dd", new Date()) : null;
      if (minDate && date < minDate) {
        return; // Don't allow dates before min
      }

      setSelectedDate(date);
      setDisplayValue(format(date, "MMM dd, yyyy"));
      onChange(format(date, "yyyy-MM-dd"));
      setIsOpen(false);
    }
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    if (!min) return false;
    const minDate = parse(min, "yyyy-MM-dd", new Date());
    return date < minDate;
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = t("datepicker:weekdaysShort");

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={displayValue}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        className={`input cursor-pointer ${className}`}
        placeholder={t("common:selectDate")}
      />

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg shadow-2xl border border-gray-300 dark:border-[#444444] p-4 w-80">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={previousMonth}
              className="p-2 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={isDateDisabled(date)}
                className={`
                  h-10 flex items-center justify-center rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${
                    !date
                      ? "invisible"
                      : isDateSelected(date)
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : isToday(date)
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : isDateDisabled(date)
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : "hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300"
                  }
                `}
              >
                {date && date.getDate()}
              </button>
            ))}
          </div>

          {/* Today Button */}
          <div className="mt-4 pt-3 border-t border-gray-300 dark:border-[#444444]">
            <button
              type="button"
              onClick={() => handleDateClick(new Date())}
              className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-lg transition-colors"
            >
              {t("common:today")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
