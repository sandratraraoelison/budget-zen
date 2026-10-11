export function calendarDay(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("La date est invalide.");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error("La date est invalide.");
  }
  return date.getTime();
}

export function validateDateRange(start: string, end?: string) {
  const from = calendarDay(start);
  if (end && calendarDay(end) < from)
    throw new Error("La date de fin doit suivre la date de début.");
}
