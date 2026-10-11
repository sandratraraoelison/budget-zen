export interface Payment {
  id: string;
  amountMinor: number;
  date: string;
  note?: string;
}
export interface Credit {
  id: string;
  contact: string;
  initialAmountMinor: number;
  type: "borrowed" | "lent";
  startDate: string;
  endDate?: string;
  payments: Payment[];
}
export interface CreditInput {
  contact: string;
  initialAmount: number;
  type: Credit["type"];
  startDate: string;
  endDate?: string;
}
export interface PaymentInput {
  amount: number;
  date: string;
  note?: string;
}
export interface CreditsState {
  credits: Credit[];
}
export const emptyCreditsState = (): CreditsState => ({ credits: [] });
