import type { HttpClient } from "../../../shared/api/client";
import type {
  BudgetRepository,
  BudgetSummary,
  Transaction,
} from "../domain/budget";
export const createBudgetRepository = (http: HttpClient): BudgetRepository => ({
  reorderCategories: ids => http.request("categories/order", { method: "PATCH", body: { ids } }),
  createCategory: (body) =>
    http.request("custom-categories", { method: "POST", body }),
  updateCategory: (id, body) =>
    http.request(`custom-categories/${id}`, { method: "PATCH", body }),
  removeCategory: (id) =>
    http.request(`custom-categories/${id}`, { method: "DELETE" }),
  addBudget: (body) => http.request("budgets", { method: "POST", body }),
  summary: (signal) =>
    http.request<BudgetSummary>("budget/summary", { signal }),
  addTransaction: (body) =>
    http.request<Transaction>("transactions", { method: "POST", body }),
});
