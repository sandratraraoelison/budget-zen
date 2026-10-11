import { test } from "node:test";
import assert from "node:assert/strict";
import { budgetReducer } from "./reducer";
import { createDemoState } from "../data/demo";
import { getTransactionTotals } from "./selectors";
import { autoCategorize } from "./categorization";
import type { AppState, Transaction } from "../types";
import { spendingForecast } from "./forecast";

const transaction: Transaction = {
  id: "expense",
  amount: 120,
  date: new Date("2024-03-01"),
  description: "Courses",
  category: "nourriture",
  type: "expense",
};
const initial = (): AppState => ({
  transactions: [],
  budgets: [{ id: "budget", category: "nourriture", limit: 100, current: 0 }],
  savingsGoals: [],
  alerts: [],
  customCategories: [],
});

test("adding and removing an expense updates both spending and alerts", () => {
  const state = initial();
  const added = budgetReducer(state, { type: "transaction/add", transaction });
  assert.equal(added.budgets[0].current, 120);
  assert.equal(added.alerts.length, 2);
  const removed = budgetReducer(added, {
    type: "transaction/remove",
    id: transaction.id,
  });
  assert.equal(removed.budgets[0].current, 0);
  assert.deepEqual(removed.alerts, []);
  assert.equal(state.transactions.length, 0);
});

test("updating or removing a budget clears obsolete alerts", () => {
  const added = budgetReducer(initial(), {
    type: "transaction/add",
    transaction,
  });
  const updated = budgetReducer(added, {
    type: "budget/update",
    budget: { ...added.budgets[0], limit: 1000 },
  });
  assert.deepEqual(updated.alerts, []);
  assert.deepEqual(
    budgetReducer(added, { type: "budget/remove", id: "budget" }).alerts,
    [],
  );
});

test("income does not consume the category budget", () => {
  const state = budgetReducer(initial(), {
    type: "transaction/add",
    transaction: { ...transaction, type: "income" },
  });
  assert.equal(state.budgets[0].current, 0);
  assert.deepEqual(getTransactionTotals(state.transactions), {
    totalIncome: 120,
    totalExpenses: 0,
    balance: 120,
  });
});

test("project expenses generate alerts from their updated total", () => {
  const state = budgetReducer(initial(), {
    type: "category/add",
    category: {
      id: "project",
      name: "Voyage",
      budget: 100,
      spent: 0,
      transactions: [],
      createdAt: new Date(),
    },
  });
  const updated = budgetReducer(state, {
    type: "category/transaction",
    categoryId: "project",
    transaction,
  });
  assert.equal(updated.customCategories[0].spent, 120);
  assert.ok(updated.alerts.some((alert) => alert.includes("Voyage")));
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

test("creating or changing a budget after recording expenses derives its current spending", () => {
  const state = budgetReducer(
    { ...initial(), budgets: [] },
    { type: "transaction/add", transaction },
  );
  const added = budgetReducer(state, {
    type: "budget/add",
    budget: { id: "b", category: "nourriture", limit: 200, current: 999 },
  });
  assert.equal(added.budgets[0].current, 120);
  assert.throws(() =>
    budgetReducer(added, {
      type: "budget/add",
      budget: { id: "other", category: "nourriture", limit: 100, current: 0 },
    }),
  );
  const moved = budgetReducer(added, {
    type: "budget/update",
    budget: { ...added.budgets[0], category: "transport" },
  });
  assert.equal(moved.budgets[0].current, 0);
});

test("invalid transactions and budget limits leave the original state intact", () => {
  const state = initial();
  for (const amount of [-10, 0, 0.001, NaN, Infinity])
    assert.throws(() =>
      budgetReducer(state, {
        type: "transaction/add",
        transaction: { ...transaction, amount },
      }),
    );
  assert.throws(() =>
    budgetReducer(state, {
      type: "budget/update",
      budget: { ...state.budgets[0], limit: 0 },
    }),
  );
  assert.deepEqual(state, initial());
});

test("custom category income does not consume its expense allowance", () => {
  const state = budgetReducer(initial(), {
    type: "category/add",
    category: {
      id: "project",
      name: "Voyage",
      budget: 100,
      spent: 99,
      transactions: [],
      createdAt: new Date(),
    },
  });
  const updated = budgetReducer(state, {
    type: "category/transaction",
    categoryId: "project",
    transaction: { ...transaction, type: "income" },
  });
  assert.equal(updated.customCategories[0].spent, 0);
});

test("forecasts separate years, include empty months and never invent growth", () => {
  const data = spendingForecast(
    [
      { ...transaction, amount: 12, date: new Date("2025-10-01") },
      { ...transaction, amount: 12, date: new Date("2026-01-01") },
      { ...transaction, amount: 999, date: new Date("2026-10-01") },
    ],
    new Date("2026-10-11"),
  );
  assert.equal(data[0].amount, 2);
  assert.equal(data[0].month, "2026-10");
  assert.equal(data[5].month, "2027-03");
  assert.ok(data.every((point) => point.amount === 2));
  assert.deepEqual(spendingForecast([], new Date("2026-10-11")), []);
});
