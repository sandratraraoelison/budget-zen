/** Percentages apply to the outstanding balance, rounded to the nearest minor unit. */
export function repaymentAmount(remaining: number, percent: number): number {
  if (
    !Number.isFinite(remaining) ||
    remaining < 0 ||
    !Number.isSafeInteger(Math.round(remaining * 100)) ||
    !Number.isFinite(percent) ||
    percent < 0 ||
    percent > 100
  )
    throw new Error("Invalid repayment percentage");
  return Math.round((Math.round(remaining * 100) * percent) / 100) / 100;
}
export function repaymentPercent(remaining: number, amount: number): number {
  if (remaining <= 0 || !Number.isFinite(amount)) return 0;
  return Math.min(100, Math.max(0, (amount / remaining) * 100));
}
