/** Monetary operations use integer hundredths; never accumulate decimal floats. */
export function toMinor(amount: number, allowZero = false): number {
  const minor = Math.round(amount * 100);
  if (
    !Number.isFinite(amount) ||
    !Number.isSafeInteger(minor) ||
    (allowZero ? minor < 0 : minor <= 0) ||
    amount !== Number(amount.toFixed(2))
  ) {
    throw new Error(
      "Le montant doit être positif et comporter au maximum deux décimales.",
    );
  }
  return minor;
}

export function sumAmounts(amounts: number[]): number {
  const minor = amounts.reduce((sum, amount) => {
    const next = sum + toMinor(amount, true);
    if (!Number.isSafeInteger(next))
      throw new Error("Le total dépasse la limite autorisée.");
    return next;
  }, 0);
  return minor / 100;
}

export function subtractAmounts(amount: number, paid: number): number {
  return (toMinor(amount, true) - toMinor(paid, true)) / 100;
}
