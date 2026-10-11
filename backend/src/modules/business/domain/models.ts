export type TimeRange = "month" | "quarter" | "year";
export interface BusinessTransaction {
  id: string;
  type: "income" | "expense";
  amountMinor: number;
  date: string;
  category: string;
  description: string;
}
export interface BusinessInput {
  type: BusinessTransaction["type"];
  amount: number;
  date: string;
  category: string;
  description: string;
}
export interface BusinessState {
  transactions: BusinessTransaction[];
}
export const emptyBusinessState = (): BusinessState => ({ transactions: [] });
