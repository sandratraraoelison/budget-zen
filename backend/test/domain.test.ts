import { test } from "node:test";
import assert from "node:assert/strict";
import type {
  Runtime,
  StateRepository,
} from "../src/shared/application/state-repository";
import { DomainError } from "../src/shared/domain/errors";
import { fromMinor, toMinor } from "../src/shared/domain/money";
import { BudgetService } from "../src/modules/budget/application/budget.service";
import {
  emptyBudgetState,
  type BudgetState,
} from "../src/modules/budget/domain/models";
import { CreditsService } from "../src/modules/credits/application/credits.service";
import { emptyCreditsState } from "../src/modules/credits/domain/models";
import { ProjectsService } from "../src/modules/projects/application/projects.service";
import { emptyProjectsState } from "../src/modules/projects/domain/models";
import { BusinessService } from "../src/modules/business/application/business.service";
import { emptyBusinessState } from "../src/modules/business/domain/models";

class MemoryRepository<State> implements StateRepository<State> {
  private values = new Map<string, State>();
  constructor(private readonly empty: () => State) {}
  read(user: string): State {
    return structuredClone(this.values.get(user) ?? this.empty());
  }
  mutate<Result>(user: string, change: (state: State) => Result): Result {
    const state = this.read(user);
    const result = change(state);
    this.values.set(user, structuredClone(state));
    return result;
  }
}

function runtime(): Runtime {
  let count = 0;
  return {
    id: () => `id-${++count}`,
    now: () => new Date("2026-10-11T12:00:00Z"),
  };
}
const expense = {
  amount: 120,
  date: "2026-10-11",
  description: "Courses",
  category: "nourriture",
  type: "expense",
} as const;

test("money is exact in minor units and rejects excess precision or overflow", () => {
  assert.equal(fromMinor(toMinor(0.1) + toMinor(0.2)), 0.3);
  for (const amount of [0, -1, 0.001, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => toMinor(amount), DomainError);
  }
  assert.equal(toMinor(0, true), 0);
});

test("budgets derive spending from transactions including expenses recorded before budget creation", () => {
  const service = new BudgetService(
    new MemoryRepository(emptyBudgetState),
    runtime(),
  );
  const transaction = service.addTransaction("user", expense);
  const budget = service.addBudget("user", {
    category: "nourriture",
    limit: 100,
  });
  assert.equal(budget.current, 120);
  assert.ok(service.summary("user").alerts.length > 0);
  service.updateBudget("user", budget.id, { limit: 1000 });
  assert.deepEqual(service.summary("user").alerts, []);
  service.updateTransaction("user", transaction.id, { amount: 250 });
  assert.equal(service.summary("user").budgets[0]?.current, 250);
  service.removeTransaction("user", transaction.id);
  assert.equal(service.summary("user").budgets[0]?.current, 0);
});

test("duplicate category budgets are rejected atomically and users are isolated", () => {
  const repository = new MemoryRepository<BudgetState>(emptyBudgetState);
  const service = new BudgetService(repository, runtime());
  service.addBudget("one", { category: "nourriture", limit: 100 });
  assert.throws(
    () => service.addBudget("one", { category: "nourriture", limit: 200 }),
    DomainError,
  );
  assert.equal(service.summary("one").budgets.length, 1);
  assert.equal(service.summary("two").budgets.length, 0);
});

test("custom category income does not consume the expense budget", () => {
  const service = new BudgetService(
    new MemoryRepository(emptyBudgetState),
    runtime(),
  );
  const category = service.addCategory("user", { name: "Voyage", budget: 100 });
  service.addCategoryTransaction("user", category.id, {
    ...expense,
    type: "income",
  });
  assert.equal(service.summary("user").customCategories[0]?.spent, 0);
  const transaction = service.addCategoryTransaction(
    "user",
    category.id,
    expense,
  );
  assert.equal(service.summary("user").customCategories[0]?.spent, 120);
  service.removeCategoryTransaction("user", category.id, transaction.id);
  assert.equal(service.summary("user").customCategories[0]?.spent, 0);
});

test("credit payments and edits cannot produce a negative remaining balance", () => {
  const service = new CreditsService(
    new MemoryRepository(emptyCreditsState),
    runtime(),
  );
  const credit = service.create("user", {
    contact: "Alex",
    initialAmount: 0.3,
    type: "lent",
    startDate: "2026-10-01",
  });
  service.addPayment("user", credit.id, { amount: 0.1, date: "2026-10-11" });
  assert.equal(service.get("user", credit.id).remainingAmount, 0.2);
  assert.throws(
    () =>
      service.addPayment("user", credit.id, {
        amount: 0.21,
        date: "2026-10-11",
      }),
    DomainError,
  );
  assert.throws(
    () => service.update("user", credit.id, { initialAmount: 0.05 }),
    DomainError,
  );
  const paid = service.addPayment("user", credit.id, {
    amount: 0.2,
    date: "2026-10-11",
  });
  assert.equal(paid.remainingAmount, 0);
  assert.equal(paid.status, "paid");
  service.removePayment("user", credit.id, paid.payments[0]!.id);
  assert.equal(service.get("user", credit.id).remainingAmount, 0.1);
});

test("credit dates are validated and paid credits do not show overdue status", () => {
  const service = new CreditsService(
    new MemoryRepository(emptyCreditsState),
    runtime(),
  );
  assert.throws(
    () =>
      service.create("user", {
        contact: "Alex",
        initialAmount: 100,
        type: "lent",
        startDate: "2026-10-11",
        endDate: "2026-10-01",
      }),
    DomainError,
  );
  const credit = service.create("user", {
    contact: "Alex",
    initialAmount: 100,
    type: "lent",
    startDate: "2026-10-01",
    endDate: "2026-10-09",
  });
  assert.equal(credit.status, "expired");
  assert.throws(
    () =>
      service.addPayment("user", credit.id, {
        amount: 100,
        date: "2026-09-01",
      }),
    DomainError,
  );
  assert.equal(
    service.addPayment("user", credit.id, { amount: 100, date: "2026-10-10" })
      .status,
    "paid",
  );
});

test("project fund changes preserve spent amounts and invalid expenses roll back", () => {
  const service = new ProjectsService(
    new MemoryRepository(emptyProjectsState),
    runtime(),
  );
  const project = service.create("user", {
    name: "Maison",
    initialFund: 100,
    startDate: "2026-10-01",
  });
  const spent = service.addExpense("user", project.id, {
    description: "Matériaux",
    amount: 30,
    date: "2026-10-11",
    category: "construction",
  });
  assert.equal(spent.currentFund, 70);
  assert.throws(
    () =>
      service.addExpense("user", project.id, {
        description: "Matériaux",
        amount: 71,
        date: "2026-10-11",
        category: "construction",
      }),
    DomainError,
  );
  assert.throws(
    () => service.update("user", project.id, { initialFund: 20 }),
    DomainError,
  );
  assert.equal(
    service.update("user", project.id, { initialFund: 120 }).currentFund,
    90,
  );
  service.update("user", project.id, { status: "achevée" });
  assert.throws(
    () =>
      service.addExpense("user", project.id, {
        description: "Matériaux",
        amount: 1,
        date: "2026-10-11",
        category: "construction",
      }),
    DomainError,
  );
  service.removeExpense("user", project.id, spent.expenses[0]!.id);
  assert.equal(service.get("user", project.id).currentFund, 120);
});

test("business analytics use real transactions and calendar periods across years", () => {
  const service = new BusinessService(
    new MemoryRepository(emptyBusinessState),
    runtime(),
  );
  const transaction = {
    type: "income",
    amount: 100,
    category: "Vente",
    description: "Facture",
  } as const;
  service.create("user", { ...transaction, date: "2025-12-31T23:59:59Z" });
  service.create("user", { ...transaction, amount: 200, date: "2026-01-01" });
  service.create("user", { ...transaction, amount: 900, date: "2026-04-01" });
  const monthly = service.analytics("user", "month", "2026-01-11");
  assert.equal(monthly.totals.revenue, 200);
  assert.equal(monthly.previous.revenue, 100);
  assert.equal(monthly.change.revenue, 100);
  assert.equal(monthly.chart.length, 31);
  const quarterly = service.analytics("user", "quarter", "2026-03-11");
  assert.equal(quarterly.totals.revenue, 200);
  assert.equal(quarterly.chart.length, 3);
  assert.equal(
    service.analytics("user", "year", "2026-01-01").totals.revenue,
    1100,
  );
});
