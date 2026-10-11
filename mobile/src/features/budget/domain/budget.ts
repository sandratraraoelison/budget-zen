export const categories = [
  "salaire",
  "loyer",
  "nourriture",
  "transport",
  "santé",
  "loisirs",
  "éducation",
  "autres",
] as const;
export interface TransactionInput {
  type: "income" | "expense";
  amount: number;
  date: string;
  category: (typeof categories)[number];
  description: string;
}
export interface Transaction extends TransactionInput {
  syncStatus?: "pending";
  id: string;
}
export interface BudgetSummary {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: Transaction[];
  budgets: { id: string; category: string; limit: number; current: number }[];
}
export interface BudgetRepository {
  summary(signal?: AbortSignal): Promise<BudgetSummary>;
  addTransaction(input: TransactionInput): Promise<Transaction>;
}
export function parseAmount(input: string): number {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized))
    throw new Error(
      "Saisissez un montant positif avec deux décimales maximum.",
    );
  const amount = Number(normalized);
  if (amount <= 0 || !Number.isSafeInteger(Math.round(amount * 100)))
    throw new Error("Le montant est invalide.");
  return amount;
}
