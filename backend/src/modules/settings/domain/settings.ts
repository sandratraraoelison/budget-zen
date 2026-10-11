import { DomainError } from "../../../shared/domain/errors";

export interface Settings {
  currency: string;
}
export const emptySettings = (): Settings => ({ currency: "MGA" });

export function validateCurrency(currency: string): string {
  if (!Intl.supportedValuesOf("currency").includes(currency)) {
    throw new DomainError(
      "VALIDATION",
      "Choose a supported ISO 4217 currency.",
    );
  }
  return currency;
}
