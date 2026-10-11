import { DomainError } from "./errors";

// Store minor units (hundredths of MGA). Never accumulate floating point amounts.
export function toMinor(amount: number, allowZero = false): number {
  const scaled = Math.round(amount * 100);
  if (
    !Number.isFinite(amount) ||
    !Number.isSafeInteger(scaled) ||
    (allowZero ? amount < 0 : amount <= 0) ||
    amount !== Number(amount.toFixed(2))
  ) {
    throw new DomainError(
      "VALIDATION",
      "Montant invalide : positif, avec au plus deux décimales",
    );
  }
  return scaled;
}

export function fromMinor(amount: number): number {
  if (!Number.isSafeInteger(amount))
    throw new DomainError("VALIDATION", "Montant total trop élevé");
  return amount / 100;
}

export function sumMinor(amounts: number[]): number {
  const sum = amounts.reduce((total, value) => total + value, 0);
  fromMinor(sum);
  return sum;
}
