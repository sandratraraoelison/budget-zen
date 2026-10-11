export type Payment = {
  id: string;
  amount: number;
  date: string;
  note?: string;
};

export type CreditStatus = "paid" | "unpaid" | "expired" | "warning";

export type Credit = {
  id: string;
  contact: string;
  initialAmount: number;
  remainingAmount: number;
  type: "borrowed" | "lent";
  startDate: string;
  endDate?: string;
  payments: Payment[];
  status?: CreditStatus;
};