import { test } from "node:test";
import assert from "node:assert/strict";
import { budgetReducer } from "./reducer";
import { createDemoState } from "../data/demo";
import { getTransactionTotals } from "./selectors";
import { autoCategorize } from "./categorization";
import type { AppState, Transaction } from "../types";

const transaction: Transaction = { id: "expense", amount: 120, date: new Date("2024-03-01"),
  description: "Courses", category: "nourriture", type: "expense" };
const initial = (): AppState => ({ transactions: [], budgets: [{ id: "budget", category: "nourriture", limit: 100, current: 0 }],
  savingsGoals: [], alerts: [], customCategories: [] });

test("adding and removing an expense updates both spending and alerts", () => {
  const state = initial();
  const added = budgetReducer(state, { type: "transaction/add", transaction });
  assert.equal(added.budgets[0].current, 120);
  assert.equal(added.alerts.length, 2);
  const removed = budgetReducer(added, { type: "transaction/remove", id: transaction.id });
  assert.equal(removed.budgets[0].current, 0);
  assert.deepEqual(removed.alerts, []);
  assert.equal(state.transactions.length, 0);
});

test("updating or removing a budget clears obsolete alerts", () => {
  const added = budgetReducer(initial(), { type: "transaction/add", transaction });
  const updated = budgetReducer(added, { type: "budget/update", budget: { ...added.budgets[0], limit: 1000 } });
  assert.deepEqual(updated.alerts, []);
  assert.deepEqual(budgetReducer(added, { type: "budget/remove", id: "budget" }).alerts, []);
});

test("income does not consume the category budget", () => {
  const state = budgetReducer(initial(), { type: "transaction/add", transaction: { ...transaction, type: "income" } });
  assert.equal(state.budgets[0].current, 0);
  assert.deepEqual(getTransactionTotals(state.transactions), { totalIncome: 120, totalExpenses: 0, balance: 120 });
});

test("project expenses generate alerts from their updated total", () => {
  const state = budgetReducer(initial(), { type: "category/add", category: { id: "project", name: "Voyage", budget: 100,
    spent: 0, transactions: [], createdAt: new Date() } });
  const updated = budgetReducer(state, { type: "category/transaction", categoryId: "project", transaction });
  assert.equal(updated.customCategories[0].spent, 120);
  assert.ok(updated.alerts.some(alert => alert.includes("Voyage")));
});

test("demo state instances and resets do not share mutable arrays", () => {
  const state = createDemoState();
  state.transactions.pop();
  assert.equal(createDemoState().transactions.length, 2);
  assert.equal(budgetReducer(state, { type: "reset" }).transactions.length, 2);
});

test("automatic categorization always returns a supported category", () => {
  assert.equal(autoCategorize("courses"), "nourriture");
  assert.equal(autoCategorize("inconnu"), "autres");
});
