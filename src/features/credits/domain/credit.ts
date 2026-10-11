import type { Credit, CreditStatus, Payment } from "../types";
import {
  subtractAmounts,
  sumAmounts,
  toMinor,
} from "../../../shared/domain/money";
import { calendarDay, validateDateRange } from "../../../shared/domain/dates";

export function reconcileCredit(credit: Credit): Credit {
  if (!credit.contact.trim()) throw new Error("Le contact est obligatoire.");
  toMinor(credit.initialAmount);
  validateDateRange(credit.startDate, credit.endDate);
  credit.payments.forEach((payment) => {
    toMinor(payment.amount);
    if (calendarDay(payment.date) < calendarDay(credit.startDate))
      throw new Error("Un paiement ne peut pas précéder le crédit.");
  });
  const remainingAmount = subtractAmounts(
    credit.initialAmount,
    sumAmounts(credit.payments.map((p) => p.amount)),
  );
  if (remainingAmount < 0)
    throw new Error(
      "Le montant initial ne peut pas être inférieur aux paiements enregistrés.",
    );
  return { ...credit, contact: credit.contact.trim(), remainingAmount };
}

export function recordPayment(credit: Credit, payment: Payment): Credit {
  if (credit.payments.some((p) => p.id === payment.id))
    throw new Error("Ce paiement existe déjà.");
  toMinor(payment.amount);
  if (
    toMinor(payment.amount) >
    toMinor(reconcileCredit(credit).remainingAmount, true)
  ) {
    throw new Error("Le paiement dépasse le montant restant.");
  }
  return reconcileCredit({
    ...credit,
    payments: [...credit.payments, payment],
  });
}

export function getCreditStatus(
  credit: Credit,
  today = new Date(),
): CreditStatus {
  if (credit.remainingAmount === 0) return "paid";
  if (!credit.endDate) return "unpaid";
  const days =
    (calendarDay(credit.endDate) -
      calendarDay(today.toISOString().slice(0, 10))) /
    86400000;
  return days < 0 ? "expired" : days <= 7 ? "warning" : "unpaid";
}
