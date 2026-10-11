import { creditCashBalance } from "../src/modules/credits/domain/credit";
import { bankProjection } from "../src/modules/credits/domain/bank-loan";
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
import { remainingAmount } from "../src/modules/credits/domain/credit";
import { sumMinor } from "../src/shared/domain/money";
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

test("borrowed funds increase and lent funds reduce available funds and follow payments, edits and deletion", () => {
  const repository = new MemoryRepository(emptyCreditsState);
  const credits = new CreditsService(repository, runtime());
  const budget = new BudgetService(
    new MemoryRepository(emptyBudgetState),
    runtime(),
    (user) =>
      sumMinor(
        repository
          .read(user)
          .credits.map(
            (c) => (c.type === "borrowed" ? 1 : -1) * remainingAmount(c),
          ),
      ),
  );
  budget.addTransaction("user", { ...expense, amount: 1000, type: "income" });
  const borrowed = credits.create("user", {
    contact: "Alex",
    initialAmount: 300,
    type: "borrowed",
    startDate: "2026-10-11",
  });
  credits.create("user", {
    contact: "Sam",
    initialAmount: 200,
    type: "lent",
    startDate: "2026-10-11",
  });
  assert.equal(budget.summary("user").balance, 1100);
  assert.equal(budget.summary("user").totalIncome, 1000);
  assert.equal(budget.summary("user").totalExpenses, 0);
  assert.equal(budget.summary("other").creditBalance, 0);
  credits.addPayment("user", borrowed.id, { amount: 100, date: "2026-10-11" });
  assert.equal(budget.summary("user").balance, 1000);
  credits.update("user", borrowed.id, { initialAmount: 400 });
  assert.equal(budget.summary("user").balance, 1100);
  credits.remove("user", borrowed.id);
  assert.equal(budget.summary("user").balance, 800);
});

test("named Other categories are reused without double counting and empty names fall back", () => {
  const service = new BudgetService(
    new MemoryRepository(emptyBudgetState),
    runtime(),
  );
  service.addBudget("user", { category: "autres", limit: 1000 });
  service.addBudget("user", {
    category: "autres",
    limit: 1000,
    customCategoryName: "  Voyage   famille ",
  });
  const input = {
    ...expense,
    category: "autres" as const,
    customCategoryName: "voyage famille",
    clientId: "offline-one",
  };
  const saved = service.addTransaction("user", input);
  assert.equal(saved.customCategoryName, "Voyage famille");
  assert.equal(service.addTransaction("user", input).id, saved.id);
  service.addTransaction("user", {
    ...expense,
    category: "autres",
    customCategoryName: "  ",
  });
  const summary = service.summary("user");
  assert.equal(summary.customCategories.length, 1);
  assert.equal(summary.transactions.length, 2);
  assert.equal(summary.totalExpenses, 240);
  assert.deepEqual(
    summary.budgets.map((b) => b.current),
    [120, 120],
  );
  assert.equal(summary.customCategories[0]!.spent, 120);
  assert.deepEqual(summary.alerts, []);
  assert.equal(service.summary("other-user").customCategories.length, 0);
  assert.throws(
    () =>
      service.addTransaction("user", {
        ...input,
        customCategoryName: "Animaux",
      }),
    DomainError,
  );
  assert.throws(
    () =>
      service.addBudget("user", {
        category: "autres",
        limit: 10,
        customCategoryName: "VOYAGE FAMILLE",
      }),
    DomainError,
  );
  service.removeCategoryTransaction("user", saved.customCategoryId!, saved.id);
  assert.equal(service.summary("user").budgets[1]!.current, 0);
  assert.equal(service.summary("user").totalExpenses, 120);
});

test("named category updates preserve ledger links and invalid names leave no partial writes", () => {
  const service = new BudgetService(
    new MemoryRepository(emptyBudgetState),
    runtime(),
  );
  const saved = service.addTransaction("user", {
    ...expense,
    category: "autres",
    customCategoryName: "Voyage",
  });
  const budget = service.addBudget("user", {
    category: "autres",
    limit: 1000,
    customCategoryName: "Voyage",
  });
  service.updateCategory("user", saved.customCategoryId!, { name: "Vacances" });
  assert.equal(
    service.summary("user").transactions[0]!.customCategoryName,
    "Vacances",
  );
  assert.equal(service.summary("user").budgets[0]!.current, 120);
  service.updateTransaction("user", saved.id, { category: "nourriture" });
  service.updateBudget("user", budget.id, { category: "nourriture" });
  assert.equal(service.summary("user").budgets[0]!.current, 120);
  assert.equal(
    service.summary("user").transactions[0]!.customCategoryName,
    undefined,
  );
  assert.throws(
    () =>
      service.addTransaction("user", {
        ...expense,
        customCategoryName: "Invalid",
      }),
    DomainError,
  );
  assert.equal(service.summary("user").transactions.length, 1);
});

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

test("credit deadline statuses respect UTC calendar boundaries", () => {
  const service = new CreditsService(
    new MemoryRepository(emptyCreditsState),
    runtime(),
  );
  const input = {
    contact: "Alex",
    initialAmount: 100,
    type: "lent",
    startDate: "2026-10-01",
  } as const;
  assert.equal(
    service.create("user", { ...input, endDate: "2026-10-10" }).status,
    "expired",
  );
  assert.equal(
    service.create("user", { ...input, endDate: "2026-10-11" }).status,
    "warning",
  );
  assert.equal(
    service.create("user", { ...input, endDate: "2026-10-18" }).status,
    "warning",
  );
  assert.equal(
    service.create("user", { ...input, endDate: "2026-10-19" }).status,
    "unpaid",
  );
});

test("money rejects tiny amounts and aggregate overflow without poisoning persisted state", () => {
  assert.throws(() => toMinor(1e-9), DomainError);
  assert.throws(() => toMinor(1e-9, true), DomainError);
  assert.throws(() => toMinor(1.0000000001), DomainError);
  assert.equal(toMinor(19.99), 1999);
  const service = new BudgetService(
    new MemoryRepository(emptyBudgetState),
    runtime(),
  );
  service.addTransaction("user", { ...expense, amount: 50000000000000 });
  assert.throws(
    () =>
      service.addTransaction("user", { ...expense, amount: 50000000000000 }),
    DomainError,
  );
  assert.equal(service.summary("user").transactions.length, 1);
});

test("offline command receipts are idempotent, scoped per user and survive deletion", () => {
  const repository = new MemoryRepository(emptyBudgetState);
  let service = new BudgetService(repository, runtime());
  const command = { ...expense, clientId: "client-command" };
  const first = service.addTransaction("one", command);
  service = new BudgetService(repository, runtime());
  assert.equal(service.addTransaction("one", command).id, first.id);
  assert.equal(service.summary("one").transactions.length, 1);
  assert.throws(
    () => service.addTransaction("one", { ...command, amount: 999 }),
    DomainError,
  );
  assert.equal(service.summary("one").totalExpenses, expense.amount);
  service.removeTransaction("one", first.id);
  assert.equal(service.addTransaction("one", command).id, first.id);
  assert.equal(service.summary("one").transactions.length, 0);
  service.addTransaction("two", command);
  assert.equal(service.summary("two").transactions.length, 1);
});

test("category deletion moves used transactions to Other without changing totals", () => {
  const service = new BudgetService(
    new MemoryRepository(emptyBudgetState),
    runtime(),
  );
  const saved = service.addTransaction("user", {
    ...expense,
    category: "autres",
    customCategoryName: "Animaux",
  });
  service.addBudget("user", {
    category: "autres",
    customCategoryName: "Animaux",
    limit: 1000,
  });
  service.updateCategory("user", saved.customCategoryId!, {
    name: "Pets",
    icon: "paw",
  });
  assert.equal(service.summary("user").customCategories[0]!.icon, "paw");
  service.removeCategory("user", saved.customCategoryId!);
  const summary = service.summary("user");
  assert.equal(summary.transactions.length, 1);
  assert.equal(summary.transactions[0]!.customCategoryName, undefined);
  assert.equal(summary.transactions[0]!.category, "autres");
  assert.equal(summary.totalExpenses, 120);
  assert.equal(summary.budgets.length, 0);
  assert.equal(summary.customCategories.length, 0);
});
test("base category customization preserves transaction identity and deletion hides the choice", () => {
  const service = new BudgetService(
    new MemoryRepository(emptyBudgetState),
    runtime(),
  );
  const saved = service.addTransaction("user", expense);
  const category = service.addCategory("user", {
    name: "Courses",
    budget: 0,
    icon: "food",
    baseCategory: "nourriture",
  });
  assert.equal(service.summary("user").transactions[0]!.id, saved.id);
  assert.equal(
    service.summary("user").transactions[0]!.customCategoryId,
    category.id,
  );
  service.removeCategory("user", category.id);
  assert.ok(service.summary("user").hiddenCategories.includes("nourriture"));
  assert.equal(service.summary("user").totalExpenses, 120);
  service.removeCategory("user", "base:loyer");
  assert.ok(service.summary("user").hiddenCategories.includes("loyer"));
  assert.throws(
    () => service.removeCategory("user", "base:autres"),
    DomainError,
  );
});

test("category order persists per account and rejects missing or foreign categories atomically", () => {
  const service = new BudgetService(
    new MemoryRepository(emptyBudgetState),
    runtime(),
  );
  const category = service.addCategory("user", {
    name: "Animaux",
    budget: 0,
    icon: "paw",
  });
  const ids = [
    "salaire",
    "loyer",
    "nourriture",
    "transport",
    "sant\u00e9",
    "loisirs",
    "\u00e9ducation",
    "autres",
  ].map((c) => `base:${c}`);
  const order = [category.id, ...ids.reverse()];
  service.reorderCategories("user", order);
  assert.deepEqual(service.summary("user").categoryOrder, order);
  assert.deepEqual(service.summary("another").categoryOrder, []);
  assert.throws(
    () => service.reorderCategories("user", order.slice(1)),
    DomainError,
  );
  assert.throws(() => service.reorderCategories("another", order), DomainError);
  assert.deepEqual(service.summary("user").categoryOrder, order);
});

test("bank loan repayments separate principal from costs and preserve account isolation", () => {
  const repository = new MemoryRepository(emptyCreditsState);
  const service = new CreditsService(repository, runtime());
  const bankLoan = {
    rateType: "fixed" as const,
    annualRate: 12,
    termMonths: 12,
    firstPaymentDate: "2026-11-11",
    insuranceMonthly: 2,
    fees: 20,
  };
  const loan = service.create("one", {
    contact: "Bank",
    initialAmount: 1000,
    type: "borrowed",
    startDate: "2026-10-11",
    bankLoan,
  });
  assert.equal(creditCashBalance(repository.read("one").credits[0]!), 98000);
  const paid = service.addPayment("one", loan.id, {
    amount: 112,
    interest: 10,
    insurance: 2,
    date: "2026-11-11",
  });
  assert.equal(paid.remainingAmount, 900);
  assert.equal(creditCashBalance(repository.read("one").credits[0]!), 86800);
  assert.throws(() =>
    service.addPayment("one", loan.id, {
      amount: 10,
      interest: 11,
      date: "2026-11-11",
    }),
  );
  assert.throws(() =>
    service.addPayment("two", loan.id, { amount: 10, date: "2026-11-11" }),
  );
  assert.equal(service.list("two").length, 0);
  service.removePayment("one", loan.id, paid.payments[0]!.id);
  assert.equal(service.get("one", loan.id).remainingAmount, 1000);
  assert.equal(
    bankProjection(1200, { ...bankLoan, annualRate: 0 }).monthlyPayment,
    102,
  );
});
test("revolving credit allows new draws after repayments but enforces the outstanding limit", () => {
  const repository = new MemoryRepository(emptyCreditsState);
  const service = new CreditsService(repository, runtime());
  const bankLoan = {
    rateType: "revolving" as const,
    annualRate: 15,
    termMonths: 12,
    firstPaymentDate: "2026-11-11",
    insuranceMonthly: 0,
    fees: 0,
    creditLimit: 1000,
  };
  const loan = service.create("one", {
    contact: "Bank",
    initialAmount: 1000,
    type: "borrowed",
    startDate: "2026-10-11",
    bankLoan,
  });
  service.addPayment("one", loan.id, { amount: 500, date: "2026-11-11" });
  assert.equal(
    service.update("one", loan.id, { initialAmount: 1500 }).remainingAmount,
    1000,
  );
  assert.throws(() => service.update("one", loan.id, { initialAmount: 1501 }));
  assert.equal(service.get("one", loan.id).remainingAmount, 1000);
  assert.throws(() =>
    service.create("one", {
      contact: "Bank",
      initialAmount: 1001,
      type: "borrowed",
      startDate: "2026-10-11",
      bankLoan,
    }),
  );
});

test("project target dates support future plans and validate edits atomically", () => {
  const service = new ProjectsService(
    new MemoryRepository(emptyProjectsState),
    runtime(),
  );
  const project = service.create("one", {
    name: "Vacation",
    initialFund: 1000,
    startDate: "2026-11-01",
    targetDate: "2026-12-15",
  });
  assert.equal(project.targetDate, "2026-12-15");
  assert.throws(() =>
    service.update("one", project.id, { targetDate: "2026-10-15" }),
  );
  assert.throws(() =>
    service.update("one", project.id, { startDate: "2026-12-16" }),
  );
  assert.equal(service.get("one", project.id).targetDate, "2026-12-15");
  assert.equal(
    service.update("one", project.id, { targetDate: null }).targetDate,
    null,
  );
  assert.throws(() =>
    service.create("one", {
      name: "Invalid",
      initialFund: 0,
      targetDate: "2026-02-30",
    }),
  );
});

test("savings contributions and withdrawals use current server amounts atomically", () => {
  const service = new BudgetService(
    new MemoryRepository(emptyBudgetState),
    runtime(),
  );
  const goal = service.addGoal("one", {
    name: "Vacation",
    target: 100,
    deadline: "2026-12-15",
  });
  service.contributeGoal("one", goal.id, { amount: 0.1, direction: "add" });
  assert.equal(
    service.contributeGoal("one", goal.id, { amount: 0.2, direction: "add" })
      .current,
    0.3,
  );
  assert.throws(() =>
    service.contributeGoal("one", goal.id, {
      amount: 1,
      direction: "withdraw",
    }),
  );
  assert.throws(() =>
    service.contributeGoal("two", goal.id, { amount: 1, direction: "add" }),
  );
  assert.equal(
    service.contributeGoal("one", goal.id, {
      amount: 0.3,
      direction: "withdraw",
    }).current,
    0,
  );
  assert.equal(service.summary("one").balance, 0);
});

test("project funding starts empty and contributions are separate from expenses and targets", () => {
  const service = new ProjectsService(
    new MemoryRepository(emptyProjectsState),
    runtime(),
  );
  const project = service.create("one", {
    name: "Vacation",
    initialFund: 1000,
    savedFund: 0,
  });
  assert.equal(project.currentFund, 0);
  assert.throws(() =>
    service.addExpense("one", project.id, {
      description: "Ticket",
      amount: 10,
      date: "2026-10-11",
      category: "transport",
    }),
  );
  assert.equal(
    service.contribute("one", project.id, { amount: 200, direction: "add" })
      .savedFund,
    200,
  );
  const spent = service.addExpense("one", project.id, {
    description: "Ticket",
    amount: 50,
    date: "2026-10-11",
    category: "transport",
  });
  assert.equal(spent.savedFund, 200);
  assert.equal(spent.currentFund, 150);
  assert.throws(() =>
    service.contribute("one", project.id, {
      amount: 151,
      direction: "withdraw",
    }),
  );
  assert.equal(
    service.contribute("one", project.id, {
      amount: 150,
      direction: "withdraw",
    }).currentFund,
    0,
  );
  assert.equal(service.get("one", project.id).initialFund, 1000);
  assert.throws(() =>
    service.contribute("two", project.id, { amount: 10, direction: "add" }),
  );
});
