import { DomainError } from "./errors";

function validCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  const calendar = value.slice(0, 10);
  const date = new Date(`${calendar}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === calendar;
}

export function validateDateRange(start: string, end?: string): void {
  if (
    !validCalendarDate(start) ||
    (end &&
      (!validCalendarDate(end) ||
        Date.parse(end) < Date.parse(start)))
  ) {
    throw new DomainError(
      "VALIDATION",
      "La date de fin doit être postérieure ou égale à la date de début",
    );
  }
}
