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
      (item) =>
        item.category === budget.category &&
        item.id !== budget.id &&
        (item.customCategoryName ?? "").toLowerCase() ===
          (budget.customCategoryName ?? "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase(),
    )
  ) {
    throw new Error("Un budget existe déjà pour cette catégorie.");
  }
}

export type BudgetAction =
  | { type: "category/order"; ids: string[] }
  | { type: "transaction/add"; transaction: Transaction }
  | { type: "transaction/remove"; id: string }
  | { type: "budget/add"; budget: Budget }
  | { type: "budget/update"; budget: Budget }
  | { type: "budget/remove"; id: string }
  | { type: "savings/add"; goal: SavingsGoal }
  | { type: "category/update"; category: CustomCategory }
  | { type: "category/remove"; id: string }
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
    case "category/order":
      next = { ...state, categoryOrder: [...action.ids] };
      break;
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
      toMinor(action.category.budget, true);
      if (!action.category.name.trim())
        throw new Error("Le nom est obligatoire.");
      next = {
        ...state,
        customCategories: [...state.customCategories, action.category],
      };
      break;
    case "category/update": {
      const category = action.category;
      if (!category.name.trim() || category.name.length > 100)
        throw new Error("Le nom est invalide.");
      if (
        state.customCategories.some(
          (c) =>
            c.id !== category.id &&
            c.name.toLowerCase() === category.name.trim().toLowerCase(),
        )
      )
        throw new Error("Cette categorie existe deja.");
      next = {
        ...state,
        customCategories: state.customCategories.map((c) =>
          c.id === category.id ? category : c,
        ),
        transactions: state.transactions.map((t) =>
          t.customCategoryId === category.id
            ? { ...t, customCategoryName: category.name }
            : t,
        ),
        budgets: state.budgets.map((b) =>
          b.customCategoryId === category.id
            ? { ...b, customCategoryName: category.name }
            : b,
        ),
      };
      break;
    }
    case "category/remove": {
      if (action.id.startsWith("base:")) {
        const base = action.id.slice(5);
        if (base === "autres")
          throw new Error("Autres est la categorie de repli.");
        next = {
          ...state,
          hiddenCategories: [...(state.hiddenCategories ?? []), base],
          budgets: state.budgets.filter((b) => b.category !== base),
          transactions: state.transactions.map((t) =>
            t.category === base ? { ...t, category: "autres" } : t,
          ),
        };
        break;
      }
      const category = state.customCategories.find((c) => c.id === action.id);
      next = {
        ...state,
        hiddenCategories: [
          ...(state.hiddenCategories ?? []),
          ...(category?.baseCategory ? [category.baseCategory] : []),
        ],
        customCategories: state.customCategories.filter(
          (c) => c.id !== action.id,
        ),
        budgets: state.budgets.filter((b) => b.customCategoryId !== action.id),
        transactions: [
          ...state.transactions.map((t) =>
            t.customCategoryId === action.id
              ? {
                  ...t,
                  category: "autres" as const,
                  customCategoryId: undefined,
                  customCategoryName: undefined,
                }
              : t,
          ),
          ...(category?.transactions
            .filter((t) => t.customCategoryId !== action.id)
            .map((t) => ({ ...t, category: "autres" as const })) ?? []),
        ],
      };
      break;
    }
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
  if (action.type === "category/add" && action.category.baseCategory) {
    const c = action.category;
    const map = <T extends { category: string }>(item: T) =>
      item.category === c.baseCategory
        ? {
            ...item,
            category: "autres",
            customCategoryName: c.name,
            customCategoryId: c.id,
          }
        : item;
    next = {
      ...next,
      hiddenCategories: [...(next.hiddenCategories ?? []), c.baseCategory!],
      transactions: next.transactions.map(map) as Transaction[],
      budgets: next.budgets.map(map),
    };
  }
  // Resolve named Other categories in the same reducer action as the ledger write.
  const named =
    action.type === "transaction/add"
      ? next.transactions[0]
      : action.type === "budget/add" || action.type === "budget/update"
        ? next.budgets.find((b) => b.id === action.budget.id)
        : undefined;
  if (named) {
    const name = (named.customCategoryName ?? "").trim().replace(/\s+/g, " ");
    if (name && (named.category !== "autres" || name.length > 100))
      throw new Error("Le nom de categorie est invalide.");
    if (name) {
      let category = next.customCategories.find(
        (c) =>
          c.name.trim().replace(/\s+/g, " ").toLowerCase() ===
          name.toLowerCase(),
      );
      if (!category) {
        category = {
          id: `custom:${name.toLowerCase()}`,
          name,
          budget: 0,
          spent: 0,
          transactions: [],
          createdAt: new Date(),
        };
        next = {
          ...next,
          customCategories: [...next.customCategories, category],
        };
      }
      const metadata = {
        customCategoryName: category.name,
        customCategoryId: category.id,
      };
      if (action.type === "transaction/add")
        next = {
          ...next,
          transactions: [
            { ...(named as Transaction), ...metadata },
            ...next.transactions.slice(1),
          ],
        };
      else
        next = {
          ...next,
          budgets: next.budgets.map((b) =>
            b.id === named.id ? { ...b, ...metadata } : b,
          ),
        };
    } else {
      const cleared = { ...named };
      delete cleared.customCategoryName;
      delete cleared.customCategoryId;
      if (action.type === "transaction/add")
        next = {
          ...next,
          transactions: [cleared as Transaction, ...next.transactions.slice(1)],
        };
      else
        next = {
          ...next,
          budgets: next.budgets.map((b) =>
            b.id === named.id
              ? {
                  ...b,
                  customCategoryName: undefined,
                  customCategoryId: undefined,
                }
              : b,
          ),
        };
    }
  }
  // Balances are projections of the ledger, never independently mutable values.
  getTransactionTotals(next.transactions);
  next = {
    ...next,
    budgets: next.budgets.map((budget) => ({
      ...budget,
      current: getCategorySpending(
        next.transactions,
        budget.category,
        budget.customCategoryName,
      ),
    })),
    customCategories: next.customCategories.map((category) => {
      const transactions = [
        ...category.transactions.filter(
          (t) => t.customCategoryId !== category.id,
        ),
        ...next.transactions.filter((t) => t.customCategoryId === category.id),
      ];
      return {
        ...category,
        transactions,
        spent: sumAmounts(
          transactions.filter((t) => t.type === "expense").map((t) => t.amount),
        ),
      };
    }),
  };
  return { ...next, alerts: generateAlerts(next) };
}
