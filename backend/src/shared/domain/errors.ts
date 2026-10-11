export type ErrorCode =
  "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "UNAUTHORIZED";

export class DomainError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export function required<T>(
  value: T | undefined,
  message = "Ressource introuvable",
): T {
  if (value === undefined) throw new DomainError("NOT_FOUND", message);
  return value;
}
