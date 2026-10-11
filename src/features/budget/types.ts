export interface FundingEntry {
  id: string;
  goalId: string;
  goalName: string;
  source: "savings" | "project";
  date: string;
  amount: number;
  reason: "deposit" | "withdrawal" | "adjustment" | "release" | "opening";
}
import type { TransactionCategory } from "./domain/categorization";
export interface SavingsGoal {
  history?: FundingEntry[];
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: Date;
}

export type { TransactionCategory } from "./domain/categorization";

export interface Transaction {
  customCategoryName?: string;
  customCategoryId?: string;
  id: string;
  amount: number;
  date: Date;
  description: string;
  category: TransactionCategory;
  type: "income" | "expense";
}

export interface CustomCategory {
  baseCategory?: string;
  hidden?: boolean;
  icon?: string;
  id: string;
  name: string;
  budget: number;
  spent: number;
  transactions: Transaction[];
  createdAt: Date;
}

export interface Budget {
  customCategoryName?: string;
  customCategoryId?: string;
  id: string;
  category: string;
  limit: number;
  current: number;
}

export interface AppState {
  projectReserved?: number;
  savingsReserved?: number;
  fundingHistory?: FundingEntry[];
  creditBalance?: number;
  categoryOrder?: string[];
  hiddenCategories?: string[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  alerts: string[];
  customCategories: CustomCategory[];
}

export interface BudgetContextType {
  saveSavingsGoal(goal: SavingsGoal, create?: boolean): Promise<void>;
  removeSavingsGoal(id: string): Promise<void>;
  contributeSavings(
    id: string,
    amount: number,
    direction: "add" | "withdraw",
  ): Promise<void>;
  reorderCategories: (ids: string[]) => Promise<void>;
  saveCategory: (category: CustomCategory, create?: boolean) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  state: AppState;
  error: string;
  loading: boolean;
  pending: boolean;
  reload: () => void;
  addTransaction: (transaction: Transaction) => Promise<void>;
  addBudget: (budget: Budget) => Promise<void>;
  addSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  getCategorySpending: (category: string) => number;
  resetDemoData: () => Promise<void>;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  customCategories: CustomCategory[];
  addCustomCategory: (name: string, budget: number) => Promise<void>;
  addCustomTransaction: (
    categoryId: string,
    transaction: Omit<Transaction, "id">,
  ) => Promise<void>;
  removeTransaction: (transactionId: string) => Promise<void>;
  removeBudget: (budgetId: string) => Promise<void>;
  updateBudget: (updatedBudget: Budget) => Promise<void>;
}
