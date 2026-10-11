import type { BankLoan } from "./bank-loan";
export type CreditInput = {
  contact: string;
  bankLoan?: BankLoan;
  initialAmount: number;
  type: "borrowed" | "lent";
  startDate: string;
  endDate?: string;
};
export interface Credit {
  id: string;
  contact: string;
  bankLoan?: BankLoan;
  type: "borrowed" | "lent";
  initialAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate?: string;
}
export interface CreditRepository {
  pay(
    id: string,
    input: {
      amount: number;
      date: string;
      note?: string;
      interest?: number;
      insurance?: number;
    },
  ): Promise<unknown>;
  update(id: string, input: Partial<CreditInput>): Promise<unknown>;
  create(input: CreditInput): Promise<unknown>;
  list(signal?: AbortSignal): Promise<Credit[]>;
}
