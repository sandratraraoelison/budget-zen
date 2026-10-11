import type {
  AppState,
  Budget,
  CustomCategory,
  SavingsGoal,
  Transaction,
} from "../types";
import { createDemoState } from "../data/demo";
import { generateAlerts } from "./alerts";
import { autoCategorize } from "./categorization";
import { TRANSACTION_CATEGORIES } from "./categorization";
import { getCategorySpending, getTransactionTotals } from "./selectors";
import { sumAmounts, toMinor } from "../../../shared/domain/money";

function validateTransaction(transaction: Transaction) {
  toMinor(transaction.amount);
  if (!Number.isFinite(transaction.date.getTime()))
    throw new Error("La date est invalide.");
  if (!["income", "expense"].includes(transaction.type))
    throw new Error("Le type de transaction est invalide.");
}

function validateBudget(state: AppState, budget: Budget) {
  toMinor(budget.limit);
  if (
    !TRANSACTION_CATEGORIES.includes(budget.category as Transaction["category"])
  )
    throw new Error("Choisissez une catégorie valide.");
  if (
    state.budgets.some(
      (item) => item.category === budget.category && item.id !== budget.id,
    )
  ) {
    throw new Error("Un budget existe déjà pour cette catégorie.");
  }
}

export type BudgetAction =
  | { type: "transaction/add"; transaction: Transaction }
  | { type: "transaction/remove"; id: string }
  | { type: "budget/add"; budget: Budget }
  | { type: "budget/update"; budget: Budget }
  | { type: "budget/remove"; id: string }
  | { type: "savings/add"; goal: SavingsGoal }
  | { type: "category/add"; category: CustomCategory }
  | {
      type: "category/transaction";
      categoryId: string;
      transaction: Transaction;
    }
  | { type: "reset" };

// All mutations finish by calculating alerts from the resulting state.
export function budgetReducer(state: AppState, action: BudgetAction): AppState {
  let next: AppState;
  switch (action.type) {
    case "transaction/add": {
      validateTransaction(action.transaction);
      if (state.transactions.some((t) => t.id === action.transaction.id))
        throw new Error("Cette transaction existe déjà.");
      const transaction = {
        ...action.transaction,
        category:
          action.transaction.category ||
          autoCategorize(action.transaction.description),
      };
      if (!TRANSACTION_CATEGORIES.includes(transaction.category))
        throw new Error("Choisissez une catégorie valide.");
      next = { ...state, transactions: [transaction, ...state.transactions] };
      break;
    }
    case "transaction/remove": {
      next = {
        ...state,
        transactions: state.transactions.filter(
          (item) => item.id !== action.id,
        ),
      };
      break;
    }
    case "budget/add":
      validateBudget(state, action.budget);
      if (state.budgets.some((b) => b.id === action.budget.id))
        throw new Error("Ce budget existe déjà.");
      next = { ...state, budgets: [...state.budgets, action.budget] };
      break;
    case "budget/update":
      validateBudget(state, action.budget);
      next = {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.budget.id ? action.budget : budget,
        ),
      };
      break;
    case "budget/remove":
      next = {
        ...state,
        budgets: state.budgets.filter((budget) => budget.id !== action.id),
      };
      break;
    case "savings/add":
      toMinor(action.goal.target);
      toMinor(action.goal.current, true);
      if (
        !action.goal.name.trim() ||
        !Number.isFinite(action.goal.deadline.getTime())
      )
        throw new Error("L’objectif est invalide.");
      next = { ...state, savingsGoals: [...state.savingsGoals, action.goal] };
      break;
    case "category/add":
      toMinor(action.category.budget);
      if (!action.category.name.trim())
        throw new Error("Le nom est obligatoire.");
      next = {
        ...state,
        customCategories: [...state.customCategories, action.category],
      };
      break;
    case "category/transaction":
      validateTransaction(action.transaction);
      if (!state.customCategories.some((c) => c.id === action.categoryId))
        throw new Error("Le projet est introuvable.");
      next = {
        ...state,
        customCategories: state.customCategories.map((category) =>
          category.id === action.categoryId
            ? {
                ...category,
                transactions: [...category.transactions, action.transaction],
              }
            : category,
        ),
      };
      break;
    case "reset":
      return createDemoState();
  }
  // Balances are projections of the ledger, never independently mutable values.
  getTransactionTotals(next.transactions);
  next = {
    ...next,
    budgets: next.budgets.map((budget) => ({
      ...budget,
      current: getCategorySpending(next.transactions, budget.category),
    })),
    customCategories: next.customCategories.map((category) => ({
      ...category,
      spent: sumAmounts(
        category.transactions
          .filter((t) => t.type === "expense")
          .map((t) => t.amount),
      ),
    })),
  };
  return { ...next, alerts: generateAlerts(next) };
}
