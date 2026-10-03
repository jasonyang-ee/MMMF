import { useId, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { formatDate, getTodayDate } from "../utils";
import { addDays, localDate, parseDate } from "../../../shared/dates.js";
import { getLanguage } from "../../../shared/preferences.js";

export default function DatePicker({
  value,
  onChange,
  min,
  className = "",
  label,
  dateFormat,
}) {
  const { t, language } = useI18n();
  const id = useId();
  const dialog = useRef(null);
  const trigger = useRef(null);
  const [month, setMonth] = useState(() => parseDate(value) || new Date());
  const [focused, setFocused] = useState(value);
  const [saveError, setSaveError] = useState(false);
  const valid = (date) => !min || date >= min;
  const locale = getLanguage(language).locale;
  const monthStart = new Date(month);
  monthStart.setDate(1);
  const lastDay = new Date(month);
  lastDay.setMonth(lastDay.getMonth() + 1, 0);
  const cells = [
    ...Array(monthStart.getDay()).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, day) => {
      const date = new Date(monthStart);
      date.setDate(day + 1);
      return localDate(date);
    }),
  ];
  while (cells.length % 7) cells.push(null);
  const weekdays = Array.from({ length: 7 }, (_, day) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
      new Date(2023, 0, 1 + day),
    ),
  );
  function focusDate(date) {
    if (!valid(date)) date = min;
    const parsed = parseDate(date);
    if (!parsed) return;
    setFocused(date);
    setMonth(parsed);
    requestAnimationFrame(() =>
      document.getElementById(`${id}-${date}`)?.focus(),
    );
  }
  function open() {
    setSaveError(false);
    const date =
      valid(value) && parseDate(value) ? value : min || getTodayDate();
    focusDate(date);
    dialog.current.showModal();
  }
  function shiftMonth(delta) {
    const next = new Date(monthStart);
    next.setMonth(next.getMonth() + delta);
    focusDate(localDate(next));
  }
  async function choose(date) {
    if (!valid(date)) return;
    setSaveError(false);
    if ((await onChange(date)) !== false) dialog.current.close();
    else {
      setSaveError(true);
      focusDate(date);
    }
  }
  return (
    <div className="w-full">
      <button
        type="button"
        ref={trigger}
        onClick={open}
        className={`input min-h-11 text-start ${className}`}
        aria-label={`${label || t("common:selectDate")}: ${formatDate(value, dateFormat, language) || ""}`}
        aria-haspopup="dialog"
      >
        {value
          ? formatDate(value, dateFormat, language)
          : t("common:selectDate")}
      </button>
      <dialog
        ref={dialog}
        onClose={() => requestAnimationFrame(() => trigger.current?.focus())}
        className="calendar-dialog m-auto w-[calc(100vw-8px)] max-w-sm rounded-lg border border-gray-300 bg-gray-50 text-gray-900 dark:bg-[#2a2a2a] dark:text-gray-100 dark:border-[#444444] p-0 shadow-2xl"
        aria-labelledby={`${id}-title`}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <div>
          <div className="flex items-center justify-between p-2">
            <button
              type="button"
              className="btn min-w-11"
              aria-label={t("datepicker:previousMonth")}
              onClick={() => shiftMonth(-1)}
            >
              ‹
            </button>
            <h3 id={`${id}-title`} aria-live="polite" className="font-semibold">
              {new Intl.DateTimeFormat(locale, {
                year: "numeric",
                month: "long",
                calendar: "gregory",
              }).format(month)}
            </h3>
            <button
              type="button"
              className="btn min-w-11"
              aria-label={t("datepicker:nextMonth")}
              onClick={() => shiftMonth(1)}
            >
              ›
            </button>
          </div>
          <table
            role="grid"
            className="w-full table-fixed"
            aria-label={label || t("common:selectDate")}
          >
            <thead>
              <tr>
                {weekdays.map((day, index) => (
                  <th key={index} className="text-xs py-2 font-normal">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: cells.length / 7 }, (_, row) => (
                <tr key={row}>
                  {cells.slice(row * 7, row * 7 + 7).map((date, col) => (
                    <td
                      key={col}
                      className="p-0"
                      aria-selected={Boolean(date && date === value)}
                    >
                      {date && (
                        <button
                          id={`${id}-${date}`}
                          type="button"
                          disabled={!valid(date)}
                          tabIndex={date === focused ? 0 : -1}
                          aria-label={formatDate(
                            date,
                            "MMM dd, yyyy",
                            language,
                          )}
                          aria-current={
                            date === getTodayDate() ? "date" : undefined
                          }
                          className={`min-h-11 min-w-11 w-full rounded-lg disabled:opacity-30 ${date === value ? "bg-primary-600 text-white" : "hover:bg-gray-200 dark:hover:bg-[#444444]"}`}
                          onFocus={() => setFocused(date)}
                          onClick={() => choose(date)}
                          onKeyDown={(event) => {
                            const direction =
                              getLanguage(language).dir === "rtl" ? -1 : 1;
                            const delta = {
                              ArrowLeft: -direction,
                              ArrowRight: direction,
                              ArrowUp: -7,
                              ArrowDown: 7,
                            }[event.key];
                            if (delta) {
                              event.preventDefault();
                              focusDate(addDays(date, delta));
                            } else if (
                              event.key === "PageUp" ||
                              event.key === "PageDown"
                            ) {
                              event.preventDefault();
                              shiftMonth(event.key === "PageUp" ? -1 : 1);
                            } else if (
                              event.key === "Home" ||
                              event.key === "End"
                            ) {
                              event.preventDefault();
                              const day = parseDate(date).getDay();
                              focusDate(
                                addDays(
                                  date,
                                  event.key === "Home" ? -day : 6 - day,
                                ),
                              );
                            }
                          }}
                        >
                          {new Intl.NumberFormat(locale).format(
                            parseDate(date).getDate(),
                          )}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {saveError && (
            <p
              role="alert"
              className="px-3 py-2 text-sm text-red-700 dark:text-red-300"
            >
              {t("common:saveError")}
            </p>
          )}
          <div className="flex gap-2 p-2 border-t border-gray-300 dark:border-[#444444]">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              disabled={!valid(getTodayDate())}
              onClick={() => choose(getTodayDate())}
            >
              {t("common:today")}
            </button>
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => dialog.current.close()}
            >
              {t("common:cancel")}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
