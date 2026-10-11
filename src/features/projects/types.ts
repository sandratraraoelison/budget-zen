import type { FundingEntry } from "../budget/types";
export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
};

export type Project = {
  history?: FundingEntry[];
  id: string;
  name: string;
  initialFund: number;
  savedFund?: number;
  currentFund: number;
  status: "en-cours" | "achevée";
  expenses: Expense[];
  startDate?: string;
  targetDate?: string | null;
};
