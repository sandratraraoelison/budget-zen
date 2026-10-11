export type BusinessTransactionInput = {
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;
  description: string;
};
export interface BusinessAnalytics {
  totals: { revenue: number; expenses: number; profit: number };
}
export interface BusinessRepository {
  create(input: BusinessTransactionInput): Promise<unknown>;
  analytics(signal?: AbortSignal): Promise<BusinessAnalytics>;
}
