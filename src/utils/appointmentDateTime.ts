const dateKey = (value: Date | string): string => {
  if (!(value instanceof Date)) return String(value).slice(0, 10);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

export const formatAppointmentDate = (value: Date | string): string => {
  const [year, month, day] = dateKey(value).split("-").map(Number);
  if (!year || !month || !day) return dateKey(value);
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
};

export const formatAppointmentTime = (value: string): string => value.slice(0, 5);
