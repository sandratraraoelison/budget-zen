import type { AppState, Budget, CustomCategory, SavingsGoal, Transaction } from "../types";
import { createDemoState } from "../data/demo";
import { generateAlerts } from "./alerts";
import { autoCategorize } from "./categorization";

export type BudgetAction =
  | { type: "transaction/add"; transaction: Transaction }
  | { type: "transaction/remove"; id: string }
  | { type: "budget/add"; budget: Budget }
  | { type: "budget/update"; budget: Budget }
  | { type: "budget/remove"; id: string }
  | { type: "savings/add"; goal: SavingsGoal }
  | { type: "category/add"; category: CustomCategory }
  | { type: "category/transaction"; categoryId: string; transaction: Transaction }
  | { type: "reset" };

// All mutations finish by calculating alerts from the resulting state.
export function budgetReducer(state: AppState, action: BudgetAction): AppState {
  let next: AppState;
  switch (action.type) {
    case "transaction/add": {
      const transaction = { ...action.transaction,
        category: action.transaction.category || autoCategorize(action.transaction.description) };
      next = { ...state, transactions: [transaction, ...state.transactions],
        budgets: state.budgets.map(budget => budget.category === transaction.category && transaction.type === "expense"
          ? { ...budget, current: budget.current + transaction.amount } : budget) };
      break;
    }
    case "transaction/remove": {
      const transaction = state.transactions.find(item => item.id === action.id);
      next = { ...state, transactions: state.transactions.filter(item => item.id !== action.id),
        budgets: state.budgets.map(budget => transaction?.category === budget.category && transaction.type === "expense"
          ? { ...budget, current: Math.max(0, budget.current - transaction.amount) } : budget) };
      break;
    }
    case "budget/add": next = { ...state, budgets: [...state.budgets, action.budget] }; break;
    case "budget/update": next = { ...state, budgets: state.budgets.map(budget => budget.id === action.budget.id ? action.budget : budget) }; break;
    case "budget/remove": next = { ...state, budgets: state.budgets.filter(budget => budget.id !== action.id) }; break;
    case "savings/add": next = { ...state, savingsGoals: [...state.savingsGoals, action.goal] }; break;
    case "category/add": next = { ...state, customCategories: [...state.customCategories, action.category] }; break;
    case "category/transaction": next = { ...state, customCategories: state.customCategories.map(category =>
      category.id === action.categoryId ? { ...category, spent: category.spent + action.transaction.amount,
        transactions: [...category.transactions, action.transaction] } : category) }; break;
    case "reset": return createDemoState();
  }
  return { ...next, alerts: generateAlerts(next) };
}
