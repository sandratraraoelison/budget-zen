import { DomainError } from "../../../shared/domain/errors";
import { fromMinor, sumMinor, toMinor } from "../../../shared/domain/money";
import type { Credit, Payment } from "./models";

export function paidAmount(credit: Credit) {
  return sumMinor(
    credit.payments.map(
      (p) =>
        p.amountMinor -
        toMinor(p.interest ?? 0, true) -
        toMinor(p.insurance ?? 0, true),
    ),
  );
}
export function remainingAmount(credit: Credit) {
  return credit.initialAmountMinor - paidAmount(credit);
}

export function assertCreditBalance(credit: Credit) {
  if (remainingAmount(credit) < 0)
    throw new DomainError(
      "VALIDATION",
      "Le montant initial ne peut pas être inférieur aux paiements déjà effectués",
    );
}

export const paymentView = ({ amountMinor, ...payment }: Payment) => ({
  ...payment,
  amount: fromMinor(amountMinor),
});
export function creditView(
  { initialAmountMinor, payments, ...credit }: Credit,
  today: Date,
) {
  const remaining = remainingAmount({
    ...credit,
    initialAmountMinor,
    payments,
  });
  // Deadlines use calendar days in UTC; yesterday is overdue even if less
  // than 24 hours have elapsed, and a deadline today remains due today.
  const todayStart = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const deadline = credit.endDate ? new Date(credit.endDate) : undefined;
  const days = deadline
    ? (Date.UTC(
        deadline.getUTCFullYear(),
        deadline.getUTCMonth(),
        deadline.getUTCDate(),
      ) -
        todayStart) /
      86400000
    : undefined;
  const status =
    remaining === 0
      ? "paid"
      : days !== undefined && days < 0
        ? "expired"
        : days !== undefined && days <= 7
          ? "warning"
          : "unpaid";
  return {
    ...credit,
    initialAmount: fromMinor(initialAmountMinor),
    remainingAmount: fromMinor(remaining),
    payments: payments.map(paymentView),
    status,
  };
}

export function creditCashBalance(credit: Credit) {
  return (
    (credit.type === "borrowed" ? 1 : -1) *
      (credit.initialAmountMinor -
        sumMinor(credit.payments.map((p) => p.amountMinor))) -
    toMinor(credit.bankLoan?.fees ?? 0, true)
  );
}
