import type { TransactionCategory } from "./domain/categorization";
export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: Date;
}

export type { TransactionCategory } from "./domain/categorization";

export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  description: string;
  category: TransactionCategory;
  type: "income" | "expense";
}

export interface CustomCategory {
  id: string;
  name: string;
  budget: number;
  spent: number;
  transactions: Transaction[];
  createdAt: Date;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  current: number;
}

export interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  alerts: string[];
  customCategories: CustomCategory[];
}

export interface BudgetContextType {
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
