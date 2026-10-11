import type { HttpClient } from "../../../shared/api/client";
import type {
  BudgetRepository,
  BudgetSummary,
  Transaction,
} from "../domain/budget";
export const createBudgetRepository = (http: HttpClient): BudgetRepository => ({
  summary: (signal) =>
    http.request<BudgetSummary>("budget/summary", { signal }),
  addTransaction: (body) =>
    http.request<Transaction>("transactions", { method: "POST", body }),
});
