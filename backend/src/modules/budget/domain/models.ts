export const CATEGORIES = [
  "salaire",
  "loyer",
  "nourriture",
  "transport",
  "santé",
  "loisirs",
  "éducation",
  "autres",
] as const;
export type Category = (typeof CATEGORIES)[number];
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  amountMinor: number;
  date: string;
  description: string;
  category: Category;
  type: TransactionType;
}
export interface Budget {
  id: string;
  category: Category;
  limitMinor: number;
}
export interface SavingsGoal {
  id: string;
  name: string;
  targetMinor: number;
  currentMinor: number;
  deadline: string;
}
export interface CustomCategory {
  id: string;
  name: string;
  budgetMinor: number;
  transactions: Transaction[];
  createdAt: string;
}
export interface BudgetState {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  customCategories: CustomCategory[];
}
export const emptyBudgetState = (): BudgetState => ({
  transactions: [],
  budgets: [],
  savingsGoals: [],
  customCategories: [],
});

export interface TransactionInput {
  amount: number;
  date: string;
  description: string;
  category: Category;
  type: TransactionType;
}
export interface BudgetInput {
  category: Category;
  limit: number;
}
export interface GoalInput {
  name: string;
  target: number;
  current?: number;
  deadline: string;
}
export interface CustomCategoryInput {
  name: string;
  budget: number;
}
