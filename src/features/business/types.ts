export type TimeRange = "month" | "quarter" | "year";

type BusinessTotals = { revenue: number; expenses: number; profit: number };
export interface BusinessAnalytics {
  transactionCount: number;
  margin: number | null;
  expenseCategories: { category: string; amount: number; share: number }[];
  timeRange: TimeRange;
  from: string;
  toExclusive: string;
  totals: BusinessTotals;
  previous: BusinessTotals;
  change: {
    revenue: number | null;
    expenses: number | null;
    profit: number | null;
  };
  chart: { date: string; revenue: number; expenses: number }[];
}

export interface BusinessTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;
  description: string;
}
