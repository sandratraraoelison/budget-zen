import { bankProjection, validateBankLoan } from "../domain/bank-loan";
import type {
  Runtime,
  StateRepository,
} from "../../../shared/application/state-repository";
import { DomainError, required } from "../../../shared/domain/errors";
import { toMinor } from "../../../shared/domain/money";
import { validateDateRange } from "../../../shared/domain/dates";
import type { CreditInput, CreditsState, PaymentInput } from "../domain/models";
import {
  assertCreditBalance,
  creditView,
  remainingAmount,
} from "../domain/credit";

export class CreditsService {
  constructor(
    private readonly repository: StateRepository<CreditsState>,
    private readonly runtime: Runtime,
  ) {}

  private validateBank(input: CreditInput) {
    if (!input.bankLoan) return;
    if (input.type !== "borrowed")
      throw new DomainError("VALIDATION", "Un crédit bancaire est un emprunt.");
    try {
      validateBankLoan(input.bankLoan, input.initialAmount, input.startDate);
      bankProjection(input.initialAmount, input.bankLoan);
    } catch (error) {
      throw new DomainError("VALIDATION", (error as Error).message);
    }
  }
  list(user: string) {
    return this.repository
      .read(user)
      .credits.map((c) => creditView(c, this.runtime.now()));
  }
  get(user: string, id: string) {
    return creditView(
      required(this.repository.read(user).credits.find((c) => c.id === id)),
      this.runtime.now(),
    );
  }

  create(user: string, input: CreditInput) {
    this.validateBank(input);
    if (
      input.bankLoan?.rateType === "revolving" &&
      input.initialAmount > input.bankLoan.creditLimit!
    )
      throw new DomainError("VALIDATION", "Plafond dépassé");
    validateDateRange(input.startDate, input.endDate);
    return this.repository.mutate(user, (state) => {
      const credit = {
        id: this.runtime.id(),
        contact: input.contact,
        initialAmountMinor: toMinor(input.initialAmount),
        type: input.type,
        bankLoan: input.bankLoan,
        startDate: input.startDate,
        endDate: input.endDate,
        payments: [],
      };
      state.credits.push(credit);
      return creditView(credit, this.runtime.now());
    });
  }

  update(user: string, id: string, input: Partial<CreditInput>) {
    return this.repository.mutate(user, (state) => {
      const credit = required(state.credits.find((c) => c.id === id));
      if (input.bankLoan !== undefined) credit.bankLoan = input.bankLoan;
      if (input.contact !== undefined) credit.contact = input.contact;
      if (input.type !== undefined) credit.type = input.type;
      if (input.startDate !== undefined) credit.startDate = input.startDate;
      if (input.endDate !== undefined) credit.endDate = input.endDate;
      if (input.initialAmount !== undefined)
        credit.initialAmountMinor = toMinor(input.initialAmount);
      validateDateRange(credit.startDate, credit.endDate);
      this.validateBank({
        ...credit,
        initialAmount: credit.initialAmountMinor / 100,
      });
      if (
        credit.bankLoan?.rateType === "revolving" &&
        remainingAmount(credit) > toMinor(credit.bankLoan.creditLimit!)
      )
        throw new DomainError("VALIDATION", "Plafond dépassé");
      assertCreditBalance(credit);
      return creditView(credit, this.runtime.now());
    });
  }

  remove(user: string, id: string) {
    this.repository.mutate(user, (state) => {
      required(state.credits.find((c) => c.id === id));
      state.credits = state.credits.filter((c) => c.id !== id);
    });
  }

  addPayment(user: string, id: string, input: PaymentInput) {
    return this.repository.mutate(user, (state) => {
      const credit = required(state.credits.find((c) => c.id === id));
      const amountMinor = toMinor(input.amount);
      validateDateRange(credit.startDate, input.date);
      const interest = toMinor(input.interest ?? 0, true);
      const insurance = toMinor(input.insurance ?? 0, true);
      if (
        (!credit.bankLoan && (interest || insurance)) ||
        interest + insurance > amountMinor
      )
        throw new DomainError("VALIDATION", "Répartition du paiement invalide");
      if (amountMinor - interest - insurance > remainingAmount(credit))
        throw new DomainError(
          "VALIDATION",
          "Le paiement dépasse le montant restant",
        );
      credit.payments.push({
        id: this.runtime.id(),
        amountMinor,
        date: input.date,
        note: input.note,
        interest: input.interest,
        insurance: input.insurance,
      });
      return creditView(credit, this.runtime.now());
    });
  }

  removePayment(user: string, id: string, paymentId: string) {
    this.repository.mutate(user, (state) => {
      const credit = required(state.credits.find((c) => c.id === id));
      required(credit.payments.find((p) => p.id === paymentId));
      credit.payments = credit.payments.filter((p) => p.id !== paymentId);
    });
  }
}
