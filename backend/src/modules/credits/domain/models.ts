import type { BankLoan } from "./bank-loan";
export interface Payment {
  id: string;
  amountMinor: number;
  date: string;
  note?: string;
  interest?: number;
  insurance?: number;
}
export interface Credit {
  id: string;
  contact: string;
  bankLoan?: BankLoan;
  initialAmountMinor: number;
  type: "borrowed" | "lent";
  startDate: string;
  endDate?: string;
  payments: Payment[];
}
export interface CreditInput {
  contact: string;
  bankLoan?: BankLoan;
  initialAmount: number;
  type: Credit["type"];
  startDate: string;
  endDate?: string;
}
export interface PaymentInput {
  amount: number;
  date: string;
  note?: string;
  interest?: number;
  insurance?: number;
}
export interface CreditsState {
  credits: Credit[];
}
export const emptyCreditsState = (): CreditsState => ({ credits: [] });
