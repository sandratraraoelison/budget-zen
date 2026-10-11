export type TimeRange = "month" | "quarter" | "year";

export interface BusinessTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;
  description: string;
}
