import { DomainError } from "./errors";

export function validateDateRange(start: string, end?: string): void {
  if (
    !Number.isFinite(Date.parse(start)) ||
    (end &&
      (!Number.isFinite(Date.parse(end)) ||
        Date.parse(end) < Date.parse(start)))
  ) {
    throw new DomainError(
      "VALIDATION",
      "La date de fin doit être postérieure ou égale à la date de début",
    );
  }
}
