export type BusinessTransactionInput = {
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;
  description: string;
};
export type BusinessTimeRange = "month" | "quarter" | "year";
export interface BusinessTransaction extends BusinessTransactionInput {
  id: string;
}
export interface BusinessAnalytics {
  timeRange: BusinessTimeRange;
  from: string;
  toExclusive: string;
  margin: number | null;
  transactionCount: number;
  expenseCategories: { category: string; amount: number; share: number }[];
  change: {
    revenue: number | null;
    expenses: number | null;
    profit: number | null;
  };
  chart: { date: string; revenue: number; expenses: number }[];
  totals: { revenue: number; expenses: number; profit: number };
}
export interface BusinessRepository {
  create(input: BusinessTransactionInput): Promise<unknown>;
  list(signal?: AbortSignal): Promise<BusinessTransaction[]>;
  update(id: string, input: BusinessTransactionInput): Promise<unknown>;
  remove(id: string): Promise<unknown>;
  analytics(
    signal?: AbortSignal,
    period?: { timeRange: BusinessTimeRange; date: string },
  ): Promise<BusinessAnalytics>;
}
