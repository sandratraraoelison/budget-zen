import { accountRequest } from "@/shared/api/client";
import type { AppState, Transaction } from "../types";
import type { BudgetAction } from "../domain/reducer";
function parseDate(value: unknown): Date {
  const text = String(value);
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text);
}
function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function transactionBody({
  id: _id,
  customCategoryId: _categoryId,
  date,
  ...input
}: Transaction) {
  return { ...input, date: dateString(date) };
}
export async function loadBudget(signal?: AbortSignal): Promise<AppState> {
  const data = await accountRequest<AppState>("budget/summary", { signal });
  return {
    ...data,
    transactions: data.transactions.map((t) => ({
      ...t,
      date: parseDate(t.date),
    })),
    savingsGoals: data.savingsGoals.map((g) => ({
      ...g,
      deadline: parseDate(g.deadline),
    })),
    customCategories: data.customCategories.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      transactions: c.transactions.map((t) => ({
        ...t,
        date: parseDate(t.date),
      })),
    })),
  };
}
export async function saveAction(action: BudgetAction) {
  let path: string;
  let method = "POST";
  let body: unknown;
  switch (action.type) {
    case "transaction/add":
      path = "transactions";
      body = transactionBody(action.transaction);
      break;
    case "transaction/remove":
      path = `transactions/${action.id}`;
      method = "DELETE";
      break;
    case "budget/add":
      path = "budgets";
      body = {
        category: action.budget.category,
        limit: action.budget.limit,
        customCategoryName: action.budget.customCategoryName,
      };
      break;
    case "budget/update":
      path = `budgets/${action.budget.id}`;
      method = "PATCH";
      body = {
        category: action.budget.category,
        limit: action.budget.limit,
        customCategoryName: action.budget.customCategoryName,
      };
      break;
    case "budget/remove":
      path = `budgets/${action.id}`;
      method = "DELETE";
      break;
    case "savings/add":
      path = "savings-goals";
      body = {
        name: action.goal.name,
        target: action.goal.target,
        current: action.goal.current,
        deadline: dateString(action.goal.deadline),
      };
      break;
    case "category/order":
      path = "categories/order"; method = "PATCH"; body = { ids: action.ids }; break;
    case "category/remove":
      path = `custom-categories/${action.id}`;
      method = "DELETE";
      break;
    case "category/update":
      path = `custom-categories/${action.category.id}`;
      method = "PATCH";
      body = { name: action.category.name, icon: action.category.icon };
      break;
    case "category/add":
      path = "custom-categories";
      body = {
        name: action.category.name,
        budget: action.category.budget,
        icon: action.category.icon,
        baseCategory: action.category.baseCategory,
      };
      break;
    case "category/transaction":
      path = `custom-categories/${action.categoryId}/transactions`;
      body = transactionBody(action.transaction);
      break;
    case "reset":
      return;
  }
  await accountRequest(path, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
