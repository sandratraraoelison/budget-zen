import "reflect-metadata";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createApplication } from "../src/bootstrap";
import type { Environment } from "../src/config/environment";

interface Session {
  accessToken: string;
  user: { id: string; email: string; isDemo: boolean; passwordHash?: string };
}
interface Transaction {
  id: string;
  amount: number;
}
interface Summary {
  transactions: Transaction[];
  budgets: { id: string; current: number }[];
  balance: number;
  alerts: string[];
}
interface Credit {
  id: string;
  remainingAmount: number;
  initialAmount: number;
  payments: { id: string }[];
}
interface Project {
  id: string;
  currentFund: number;
  expenses: { id: string }[];
}
interface Analytics {
  totals: { revenue: number; expenses: number; profit: number };
  chart: unknown[];
}

let app: INestApplication;
let base: string;
let one: Session;
let two: Session;
const directory = mkdtempSync(join(tmpdir(), "budgetzen-api-"));
const environment: Environment = {
  port: 3001,
  host: "127.0.0.1",
  frontendOrigin: "http://localhost:3000",
  databasePath: join(directory, "test.sqlite"),
  jwtSecret: "test-secret-only-32-characters-minimum",
  tokenLifetime: 3600,
  swaggerEnabled: true,
  demoEnabled: true,
};

async function request<T = Record<string, unknown>>(
  path: string,
  method = "GET",
  body?: unknown,
  token?: string,
  expected = 200,
): Promise<T> {
  const response = await fetch(`${base}/api/v1/${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  assert.equal(response.status, expected, `${method} ${path}: ${text}`);
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

before(async () => {
  app = await createApplication(environment, false);
  await app.listen(0, "127.0.0.1");
  base = await app.getUrl();
  one = await request<Session>(
    "auth/register",
    "POST",
    { email: "one@example.com", name: "One", password: "correct-password-123" },
    undefined,
    201,
  );
  two = await request<Session>(
    "auth/register",
    "POST",
    { email: "two@example.com", name: "Two", password: "correct-password-123" },
    undefined,
    201,
  );
});
after(async () => {
  if (app) await app.close();
  assert.equal(dirname(directory), tmpdir());
  rmSync(directory, { recursive: true, force: true });
});

test("account currency is validated, persisted and isolated by user", async () => {
  await request("settings", "GET", undefined, undefined, 401);
  assert.equal(
    (await request("settings", "GET", undefined, one.accessToken)).currency,
    "MGA",
  );
  await request("settings", "PATCH", { currency: "EUR" }, one.accessToken);
  assert.equal(
    (await request("settings", "GET", undefined, one.accessToken)).currency,
    "EUR",
  );
  assert.equal(
    (await request("settings", "GET", undefined, two.accessToken)).currency,
    "MGA",
  );
  for (const currency of ["XXX", "eur", "", null, 42])
    await request("settings", "PATCH", { currency }, one.accessToken, 400);
  await request(
    "settings",
    "PATCH",
    { currency: "USD", ignored: true },
    one.accessToken,
    400,
  );
  assert.equal(
    (await request("settings", "GET", undefined, one.accessToken)).currency,
    "EUR",
  );
});

test("authentication verifies passwords and never returns password hashes", async () => {
  assert.equal(one.user.passwordHash, undefined);
  const login = await request<Session>("auth/login", "POST", {
    email: "ONE@example.com",
    password: "correct-password-123",
  });
  assert.equal(login.user.id, one.user.id);
  await request(
    "auth/login",
    "POST",
    { email: "one@example.com", password: "incorrect-password" },
    undefined,
    401,
  );
  await request(
    "auth/register",
    "POST",
    {
      email: "one@example.com",
      name: "Other",
      password: "correct-password-123",
    },
    undefined,
    409,
  );
  const me = await request<{ id: string }>(
    "auth/me",
    "GET",
    undefined,
    login.accessToken,
  );
  assert.equal(me.id, one.user.id);
});

test("protected routes reject missing, forged and expired sessions", async () => {
  await request("transactions", "GET", undefined, undefined, 401);
  await request("projects", "GET", undefined, "forged", 401);
  const expired = app
    .get(JwtService)
    .sign({ sub: one.user.id }, { expiresIn: -1 });
  await request("credits", "GET", undefined, expired, 401);
});

test("HTTP validation rejects unknown fields, null, negative amounts, precision and invalid dates", async () => {
  const input = {
    amount: 10,
    date: "2026-10-11",
    description: "Courses",
    category: "nourriture",
    type: "expense",
  };
  for (const override of [
    { amount: -1 },
    { amount: 0.001 },
    { amount: "10" },
    { amount: null },
    { date: "2026-02-30" },
    { category: "unknown" },
    { userId: two.user.id },
  ]) {
    await request(
      "transactions",
      "POST",
      { ...input, ...override },
      one.accessToken,
      400,
    );
  }
  await request("transactions/not-a-uuid", "PATCH", {}, one.accessToken, 400);
});

test("transactions, budgets and summaries are consistent and user scoped", async () => {
  const budget = await request<{ id: string }>(
    "budgets",
    "POST",
    { category: "nourriture", limit: 100 },
    one.accessToken,
    201,
  );
  await request(
    "budgets",
    "POST",
    { category: "nourriture", limit: 100 },
    one.accessToken,
    409,
  );
  const transaction = await request<Transaction>(
    "transactions",
    "POST",
    {
      amount: 120,
      date: "2026-10-11",
      description: "Courses",
      category: "nourriture",
      type: "expense",
    },
    one.accessToken,
    201,
  );
  const summary = await request<Summary>(
    "budget/summary",
    "GET",
    undefined,
    one.accessToken,
  );
  assert.equal(summary.budgets[0]?.current, 120);
  assert.equal(summary.balance, -120);
  assert.ok(summary.alerts.length > 0);
  assert.deepEqual(
    await request("transactions", "GET", undefined, two.accessToken),
    [],
  );
  await request(
    `transactions/${transaction.id}`,
    "PATCH",
    { amount: 1 },
    two.accessToken,
    404,
  );
  await request(
    `transactions/${transaction.id}`,
    "PATCH",
    { amount: null },
    one.accessToken,
    400,
  );
  await request(
    `transactions/${transaction.id}`,
    "DELETE",
    undefined,
    two.accessToken,
    404,
  );
  await request(
    `transactions/${transaction.id}`,
    "DELETE",
    undefined,
    one.accessToken,
    204,
  );
  const updated = await request<Summary>(
    "budget/summary",
    "GET",
    undefined,
    one.accessToken,
  );
  assert.equal(updated.budgets[0]?.current, 0);
  assert.deepEqual(updated.alerts, []);
  await request(
    `budgets/${budget.id}`,
    "PATCH",
    { limit: 300 },
    one.accessToken,
  );
  await request(
    `budgets/${budget.id}`,
    "DELETE",
    undefined,
    one.accessToken,
    204,
  );
});

test("savings goals and custom categories persist and project transactions stay separate", async () => {
  const goal = await request<{ id: string; current: number }>(
    "savings-goals",
    "POST",
    { name: "Vacances", target: 1000, deadline: "2027-06-01" },
    one.accessToken,
    201,
  );
  assert.equal(goal.current, 0);
  await request(
    `savings-goals/${goal.id}`,
    "PATCH",
    { current: 300 },
    one.accessToken,
  );
  const category = await request<{ id: string }>(
    "custom-categories",
    "POST",
    { name: "Voyage", budget: 100 },
    one.accessToken,
    201,
  );
  const transaction = await request<Transaction>(
    `custom-categories/${category.id}/transactions`,
    "POST",
    {
      amount: 95,
      date: "2026-10-11",
      description: "Billet",
      category: "transport",
      type: "expense",
    },
    one.accessToken,
    201,
  );
  assert.deepEqual(
    await request("transactions", "GET", undefined, one.accessToken),
    [],
  );
  await request(
    `custom-categories/${category.id}/transactions/${transaction.id}`,
    "DELETE",
    undefined,
    one.accessToken,
    204,
  );
  await request(
    `custom-categories/${category.id}`,
    "PATCH",
    { budget: 200 },
    one.accessToken,
  );
  await request(
    `custom-categories/${category.id}`,
    "DELETE",
    undefined,
    one.accessToken,
    204,
  );
  await request(
    `savings-goals/${goal.id}`,
    "DELETE",
    undefined,
    one.accessToken,
    204,
  );
});

test("credit overpayments and invalid edits leave persisted data untouched", async () => {
  const credit = await request<Credit>(
    "credits",
    "POST",
    {
      contact: "Alex",
      initialAmount: 100,
      type: "lent",
      startDate: "2026-10-01",
    },
    one.accessToken,
    201,
  );
  await request(
    `credits/${credit.id}/payments`,
    "POST",
    { amount: 40, date: "2026-10-11" },
    one.accessToken,
    201,
  );
  await request(
    `credits/${credit.id}/payments`,
    "POST",
    { amount: 61, date: "2026-10-11" },
    one.accessToken,
    400,
  );
  await request(
    `credits/${credit.id}`,
    "PATCH",
    { contact: "Should roll back", initialAmount: 20 },
    one.accessToken,
    400,
  );
  const saved = await request<Credit & { contact: string }>(
    `credits/${credit.id}`,
    "GET",
    undefined,
    one.accessToken,
  );
  assert.equal(saved.remainingAmount, 60);
  assert.equal(saved.contact, "Alex");
  assert.equal(saved.payments.length, 1);
  await request(`credits/${credit.id}`, "GET", undefined, two.accessToken, 404);
  await request(
    `credits/${credit.id}/payments`,
    "POST",
    { amount: 1, date: "2026-10-11" },
    two.accessToken,
    404,
  );
  await request(
    `credits/${credit.id}/payments/${saved.payments[0]!.id}`,
    "DELETE",
    undefined,
    one.accessToken,
    204,
  );
  assert.equal(
    (
      await request<Credit>(
        `credits/${credit.id}`,
        "GET",
        undefined,
        one.accessToken,
      )
    ).remainingAmount,
    100,
  );
});

test("projects validate funds, dates and completion before recording expenses", async () => {
  const project = await request<Project>(
    "projects",
    "POST",
    { name: "Maison", initialFund: 100, startDate: "2026-10-01" },
    one.accessToken,
    201,
  );
  await request(
    `projects/${project.id}/expenses`,
    "POST",
    {
      description: "Matériaux",
      amount: 101,
      date: "2026-10-11",
      category: "construction",
    },
    one.accessToken,
    400,
  );
  const spent = await request<Project>(
    `projects/${project.id}/expenses`,
    "POST",
    {
      description: "Matériaux",
      amount: 40,
      date: "2026-10-11",
      category: "construction",
    },
    one.accessToken,
    201,
  );
  assert.equal(spent.currentFund, 60);
  await request(
    `projects/${project.id}`,
    "PATCH",
    { initialFund: 30 },
    one.accessToken,
    400,
  );
  await request(
    `projects/${project.id}`,
    "GET",
    undefined,
    two.accessToken,
    404,
  );
  await request(
    `projects/${project.id}`,
    "PATCH",
    { status: "achevée" },
    one.accessToken,
  );
  await request(
    `projects/${project.id}/expenses`,
    "POST",
    {
      description: "Autre",
      amount: 1,
      date: "2026-10-11",
      category: "construction",
    },
    one.accessToken,
    409,
  );
  await request(
    `projects/${project.id}/expenses/${spent.expenses[0]!.id}`,
    "DELETE",
    undefined,
    one.accessToken,
    204,
  );
  assert.equal(
    (
      await request<Project>(
        `projects/${project.id}`,
        "GET",
        undefined,
        one.accessToken,
      )
    ).currentFund,
    100,
  );
});

test("business analytics replace static figures with period-specific persisted transactions", async () => {
  const income = await request<Transaction>(
    "business/transactions",
    "POST",
    {
      type: "income",
      amount: 100,
      date: "2026-10-11",
      category: "Vente",
      description: "Facture",
    },
    one.accessToken,
    201,
  );
  await request(
    "business/transactions",
    "POST",
    {
      type: "expense",
      amount: 30,
      date: "2026-10-11",
      category: "Fournitures",
      description: "Papier",
    },
    one.accessToken,
    201,
  );
  const analytics = await request<Analytics>(
    "business/analytics?timeRange=month&date=2026-10-11",
    "GET",
    undefined,
    one.accessToken,
  );
  assert.deepEqual(analytics.totals, {
    revenue: 100,
    expenses: 30,
    profit: 70,
  });
  assert.equal(analytics.chart.length, 31);
  await request(
    "business/analytics?timeRange=invalid",
    "GET",
    undefined,
    one.accessToken,
    400,
  );
  await request(
    `business/transactions/${income.id}`,
    "DELETE",
    undefined,
    two.accessToken,
    404,
  );
});

test("Swagger describes request DTOs and health works without a session", async () => {
  assert.deepEqual(await request("health"), { status: "ok" });
  const response = await fetch(`${base}/api/docs-json`);
  assert.equal(response.status, 200);
  const doc = (await response.json()) as {
    paths: Record<string, unknown>;
    components: { schemas: Record<string, unknown> };
  };
  assert.ok(doc.paths["/api/v1/credits/{id}/payments"]);
  assert.ok(doc.components.schemas["CreditDto"]);
});

test("data and authentication survive closing and reopening the server", async () => {
  const credit = (
    await request<Credit[]>("credits", "GET", undefined, one.accessToken)
  )[0]!;
  await app.close();
  app = await createApplication(environment, false);
  await app.listen(0, "127.0.0.1");
  base = await app.getUrl();
  assert.equal(
    (await request("settings", "GET", undefined, one.accessToken)).currency,
    "EUR",
  );
  assert.equal(
    (
      await request<Credit>(
        `credits/${credit.id}`,
        "GET",
        undefined,
        one.accessToken,
      )
    ).remainingAmount,
    100,
  );
  assert.equal(
    (await request<Credit[]>("credits", "GET", undefined, two.accessToken))
      .length,
    0,
  );
});

test("demo sessions are distinct and cannot see existing users' data", async () => {
  const demo = await request<Session>(
    "auth/demo",
    "POST",
    undefined,
    undefined,
    201,
  );
  assert.equal(demo.user.isDemo, true);
  assert.notEqual(demo.user.id, one.user.id);
  assert.deepEqual(
    await request("credits", "GET", undefined, demo.accessToken),
    [],
  );
});

test("concurrent payments cannot spend the same remaining credit twice", async () => {
  const credit = await request<Credit>(
    "credits",
    "POST",
    {
      contact: "Concurrent",
      initialAmount: 100,
      type: "lent",
      startDate: "2026-10-01",
    },
    one.accessToken,
    201,
  );
  const pay = () =>
    fetch(`${base}/api/v1/credits/${credit.id}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${one.accessToken}`,
      },
      body: JSON.stringify({ amount: 60, date: "2026-10-11" }),
    });
  const responses = await Promise.all([pay(), pay()]);
  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [201, 400],
  );
  for (const response of responses) await response.text();
  assert.equal(
    (
      await request<Credit>(
        `credits/${credit.id}`,
        "GET",
        undefined,
        one.accessToken,
      )
    ).remainingAmount,
    40,
  );
});

test("login attempts are rate limited", async () => {
  for (let attempt = 0; attempt < 10; attempt++) {
    await request(
      "auth/login",
      "POST",
      { email: "unknown@example.com", password: "incorrect-password" },
      undefined,
      401,
    );
  }
  await request(
    "auth/login",
    "POST",
    { email: "unknown@example.com", password: "incorrect-password" },
    undefined,
    429,
  );
});

test("offline client IDs are validated and repeated POSTs persist a single transaction", async () => {
  const clientId = "2d3b0d2e-56bc-4f46-bb1f-2c903ad63939";
  const body = {
    clientId,
    amount: 5.75,
    date: "2026-10-11",
    category: "autres",
    type: "expense",
    description: "Offline replay",
  };
  const first = await request<Transaction>(
    "transactions",
    "POST",
    body,
    one.accessToken,
    201,
  );
  const replay = await request<Transaction>(
    "transactions",
    "POST",
    body,
    one.accessToken,
    201,
  );
  assert.equal(first.id, replay.id);
  const summary = await request<Summary>(
    "budget/summary",
    "GET",
    undefined,
    one.accessToken,
  );
  assert.equal(summary.transactions.filter((t) => t.id === first.id).length, 1);
  await request(
    "transactions",
    "POST",
    { ...body, amount: 6 },
    one.accessToken,
    409,
  );
  await request(
    "transactions",
    "POST",
    { ...body, clientId: "invalid" },
    one.accessToken,
    400,
  );
  await request(
    `transactions/${first.id}`,
    "DELETE",
    undefined,
    one.accessToken,
    204,
  );
  await request("transactions", "POST", body, one.accessToken, 201);
  const afterDeletion = await request<Summary>(
    "budget/summary",
    "GET",
    undefined,
    one.accessToken,
  );
  assert.equal(
    afterDeletion.transactions.some((t) => t.id === first.id),
    false,
  );
});
