import type { BankLoan } from "./domain/bank-loan";
export type Payment = {
  id: string;
  amount: number;
  date: string;
  note?: string;
  interest?: number;
  insurance?: number;
};

export type CreditStatus = "paid" | "unpaid" | "expired" | "warning";

export type Credit = {
  id: string;
  contact: string;
  bankLoan?: BankLoan;
  initialAmount: number;
  remainingAmount: number;
  type: "borrowed" | "lent";
  startDate: string;
  endDate?: string;
  payments: Payment[];
  status?: CreditStatus;
};
