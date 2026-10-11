import { DomainError } from "../../../shared/domain/errors";
import { fromMinor, sumMinor } from "../../../shared/domain/money";
import type { Credit, Payment } from "./models";

export function paidAmount(credit: Credit) {
  return sumMinor(credit.payments.map((p) => p.amountMinor));
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
  const days = credit.endDate
    ? Math.ceil((Date.parse(credit.endDate) - today.getTime()) / 86400000)
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
