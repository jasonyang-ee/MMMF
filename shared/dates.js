// Dates are calendar days, never UTC timestamps. String ordering is chronological.
export function localDate(date = new Date()) {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return year >= 1 && localDate(date) === value ? date : null;
}

export function addDays(value, days) {
  const date = parseDate(value);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  return localDate(date);
}

export function monthlyDates(dayOfMonth, start, end) {
  if (
    !Number.isInteger(dayOfMonth) ||
    dayOfMonth < 1 ||
    dayOfMonth > 31 ||
    !parseDate(start) ||
    !parseDate(end) ||
    end < start
  )
    return [];
  const endDate = parseDate(end);
  const cursor = parseDate(start);
  cursor.setDate(1);
  const dates = [];
  while (cursor <= endDate) {
    const occurrence = new Date(cursor);
    const last = new Date(cursor);
    last.setMonth(last.getMonth() + 1, 0);
    occurrence.setDate(Math.min(dayOfMonth, last.getDate()));
    const value = localDate(occurrence);
    if (value >= start && value <= end) dates.push(value);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return dates;
}
