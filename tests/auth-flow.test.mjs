import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = fileURLToPath(new URL("../", import.meta.url));

async function freePort() {
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise((resolve, reject) => socket.close(error => error ? reject(error) : resolve()));
  return port;
}

function start(args, cwd, environment) {
  const child = spawn(process.execPath, args, { cwd, windowsHide: true, env: { ...process.env, ...environment }, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  child.stdout.on("data", chunk => { logs += String(chunk); });
  child.stderr.on("data", chunk => { logs += String(chunk); });
  const exited = once(child, "exit");
  return { child, logs: () => logs, stop: async () => { if (child.exitCode === null) child.kill(); await exited; } };
}

async function ready(server, url) {
  for (let attempt = 0; attempt < 100; attempt++) {
    assert.equal(server.child.exitCode, null, server.logs());
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      await response.text();
      if (response.ok) return;
    } catch { /* Retry during startup. */ }
    await delay(100);
  }
  assert.fail(server.logs());
}

test("landing, registration, secure session, login, protected pages and logout work together", { timeout: 90000 }, async () => {
  const backendPort = await freePort();
  let frontPort = await freePort();
  while (frontPort === backendPort) frontPort = await freePort();
  const base = `http://127.0.0.1:${frontPort}`;
  const directory = mkdtempSync(join(tmpdir(), "budgetzen-auth-"));
  let backend;
  let frontend;
  try {
    backend = start(["dist/main.js"], join(root, "backend"), {
      PORT: String(backendPort), HOST: "127.0.0.1", DATABASE_PATH: join(directory, "auth.sqlite"),
      JWT_SECRET: "test-secret-only-32-characters-minimum", JWT_EXPIRES_IN_SECONDS: "3600",
      FRONTEND_ORIGIN: base, SWAGGER_ENABLED: "false", DEMO_ENABLED: "false",
    });
    await ready(backend, `http://127.0.0.1:${backendPort}/api/v1/health`);
    frontend = start(["node_modules/next/dist/bin/next", "start", "--port", String(frontPort), "--hostname", "127.0.0.1"], root, {
      NEXT_BUILD_DIR: process.env.NEXT_BUILD_DIR ?? ".next", BACKEND_API_URL: `http://127.0.0.1:${backendPort}/api/v1`,
    });
    await ready(frontend, base);
    const landing = await (await fetch(base)).text();
    assert.ok(landing.includes("Votre argent,"));
    assert.ok(landing.includes("Créer mon compte"));
    assert.ok(landing.includes('name="confirmation"'));
    const loginPage = await (await fetch(`${base}/auth/login`)).text();
    assert.ok(loginPage.includes("Heureux de vous revoir."));
    for (const route of ["dashboard", "projets", "credit", "business"]) {
      const response = await fetch(`${base}/${route}`, { redirect: "manual" });
      await response.text();
      assert.equal(response.status, 307);
      assert.equal(response.headers.get("location"), "/auth/login");
    }
    const post = (path, body, cookie, origin = base) => fetch(`${base}/api/auth/${path}`, {
      method: "POST", headers: { "Content-Type": "application/json", Origin: origin, ...(cookie ? { Cookie: cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const input = { name: "Test", email: "landing@example.com", password: "correct-password-123" };
    const crossOrigin = await post("register", input, undefined, "https://other.example.com");
    assert.equal(crossOrigin.status, 403);
    await crossOrigin.text();
    const registered = await post("register", input);
    const registeredBody = await registered.json();
    assert.equal(registered.status, 201, JSON.stringify(registeredBody));
    assert.equal(registeredBody.user.email, input.email);
    assert.equal(registeredBody.accessToken, undefined);
    const setCookie = registered.headers.get("set-cookie");
    assert.ok(setCookie.includes("HttpOnly"));
    assert.ok(setCookie.includes("Secure"));
    assert.ok(setCookie.includes("SameSite=lax"));
    const cookie = setCookie.split(";")[0];
    const dashboard = await fetch(`${base}/dashboard`, { headers: { Cookie: cookie } });
    assert.equal(dashboard.status, 200);
    const dashboardHtml = await dashboard.text();
    assert.ok(dashboardHtml.includes("Ajouter une transaction"));
    assert.ok(!dashboardHtml.includes('id="transaction-amount"'));
    const home = await fetch(base, { headers: { Cookie: cookie }, redirect: "manual" });
    await home.text();
    assert.equal(home.headers.get("location"), "/dashboard");
    const account = (path, method = "GET", body, session = cookie, origin = base) => fetch(`${base}/api/account/${path}`, {
      method, headers: { "Content-Type": "application/json", Origin: origin, ...(session ? { Cookie: session } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    // The mobile bearer API and the web cookie BFF must use the same account data.
    const mobileLogin = await fetch(`http://127.0.0.1:${backendPort}/api/v1/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: input.email, password: input.password }),
    });
    assert.equal(mobileLogin.status, 200);
    const mobileSession = await mobileLogin.json();
    const mobile = (path, method = "GET", body, token = mobileSession.accessToken) => fetch(`http://127.0.0.1:${backendPort}/api/v1/${path}`, {
      method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: body === undefined ? undefined : JSON.stringify(body),
    });
    const webIncome = await account("transactions", "POST", { amount: 2000000, date: "2026-10-11", description: "Salary", category: "salaire", type: "income" });
    assert.equal(webIncome.status, 201);
    const income = await webIncome.json();
    assert.equal((await (await mobile("budget/summary")).json()).balance, 2000000);
    const phoneExpense = await mobile("transactions", "POST", { amount: 1200.50, date: "2026-10-11", description: "Food", category: "nourriture", type: "expense" });
    assert.equal(phoneExpense.status, 201);
    const expense = await phoneExpense.json();
    const synced = await (await account("budget/summary")).json();
    assert.equal(synced.balance, 1998799.50);
    assert.ok(synced.transactions.some(t => t.id === expense.id));
    const budgetResponse = await account("budgets", "POST", { category: "nourriture", limit: 5000 });
    assert.equal(budgetResponse.status, 201);
    const syncedBudget = await budgetResponse.json();
    assert.equal((await (await mobile("budgets")).json())[0].current, 1200.50);
    const editBudget = await account(`budgets/${syncedBudget.id}`, "PATCH", { limit: 6000 });
    assert.equal(editBudget.status, 200); await editBudget.text();
    assert.equal((await (await mobile("budgets")).json())[0].limit, 6000);
    const projectResponse = await account("projects", "POST", { name: "Synced project", initialFund: 10000 });
    assert.equal(projectResponse.status, 201);
    const project = await projectResponse.json();
    const projectExpense = await account(`projects/${project.id}/expenses`, "POST", { description: "Materials", amount: 1500, date: "2026-10-11", category: "other" });
    assert.equal(projectExpense.status, 201); await projectExpense.text();
    assert.equal((await (await mobile(`projects/${project.id}`)).json()).currentFund, 8500);
    const creditResponse = await account("credits", "POST", { contact: "Test", initialAmount: 2000, type: "lent", startDate: "2026-10-11" });
    assert.equal(creditResponse.status, 201);
    const credit = await creditResponse.json();
    const paymentResponse = await account(`credits/${credit.id}/payments`, "POST", { amount: 500, date: "2026-10-11", note: "Repayment" });
    assert.equal(paymentResponse.status, 201);
    const payment = await paymentResponse.json();
    assert.equal((await (await mobile(`credits/${credit.id}`)).json()).remainingAmount, 1500);
    const paymentDelete = await account(`credits/${credit.id}/payments/${payment.payments.at(-1).id}`, "DELETE");
    assert.equal(paymentDelete.status, 204);
    assert.equal((await (await mobile(`credits/${credit.id}`)).json()).remainingAmount, 2000);
    const isolatedRegister = await post("register", { ...input, email: "isolated@example.com" });
    assert.equal(isolatedRegister.status, 201); await isolatedRegister.text();
    const isolatedCookie = isolatedRegister.headers.get("set-cookie").split(";")[0];
    assert.deepEqual((await (await account("budget/summary", "GET", undefined, isolatedCookie)).json()).transactions, []);
    const forbiddenProject = await account(`projects/${project.id}`, "PATCH", { name: "Forbidden" }, isolatedCookie);
    assert.equal(forbiddenProject.status, 404); await forbiddenProject.text();
    const crossOriginWrite = await account("transactions", "POST", { amount: 10 }, cookie, "https://other.example.com");
    assert.equal(crossOriginWrite.status, 403); await crossOriginWrite.text();
    assert.equal((await account(`transactions/${income.id}`, "DELETE")).status, 204);
    assert.equal((await mobile(`transactions/${expense.id}`, "DELETE")).status, 204);
    assert.deepEqual((await (await account("budget/summary")).json()).transactions, []);
    const settings = await account("settings");
    assert.equal(settings.status, 200);
    assert.equal((await settings.json()).currency, "MGA");
    const currencyChange = await account("settings", "PATCH", { currency: "EUR" });
    assert.equal(currencyChange.status, 200);
    assert.equal((await currencyChange.json()).currency, "EUR");
    assert.equal((await (await account("settings")).json()).currency, "EUR");
    const euroDashboard = await (await fetch(`${base}/dashboard`, { headers: { Cookie: cookie } })).text();
    assert.ok(euroDashboard.includes('aria-label="Devise du compte : EUR"'));
    const denied = await account("settings", "PATCH", { currency: "USD" }, cookie, "https://other.example.com");
    assert.equal(denied.status, 403); await denied.text();
    const anonymous = await account("settings", "GET", undefined, "");
    assert.equal(anonymous.status, 401); await anonymous.text();
    const invalidCurrency = await account("settings", "PATCH", { currency: "XXX" });
    assert.equal(invalidCurrency.status, 400); await invalidCurrency.text();
    const transaction = await account("business/transactions", "POST", {
      type: "income", amount: 0.3, date: "2026-10-11", category: "Vente produit", description: "Test réel",
    });
    assert.equal(transaction.status, 201);
    const saved = await transaction.json();
    assert.equal(saved.amount, 0.3);
    const listed = await (await account("business/transactions")).json();
    assert.equal(listed.length, 1); assert.equal(listed[0].id, saved.id);
    const analytics = await (await account("business/analytics?timeRange=month&date=2026-10-11")).json();
    assert.equal(analytics.totals.revenue, 0.3); assert.equal(analytics.totals.profit, 0.3);
    assert.equal(analytics.chart.length, 31);
    const invalidAmount = await account("business/transactions", "POST", { ...listed[0], id: undefined, amount: -1 });
    assert.equal(invalidAmount.status, 400); await invalidAmount.text();
    const removed = await account(`business/transactions/${saved.id}`, "DELETE");
    assert.equal(removed.status, 204);
    assert.deepEqual(await (await account("business/transactions")).json(), []);
    const escape = await account("auth/me");
    assert.equal(escape.status, 404); await escape.text();
    const duplicate = await post("register", input);
    assert.equal(duplicate.status, 409);
    await duplicate.text();
    const invalid = await post("login", { email: input.email, password: "incorrect-password" });
    assert.equal(invalid.status, 401);
    assert.ok((await invalid.json()).message.includes("incorrect"));
    const login = await post("login", { email: input.email, password: input.password });
    assert.equal(login.status, 200);
    await login.text();
    const loginCookie = login.headers.get("set-cookie").split(";")[0];
    assert.equal((await (await account("settings", "GET", undefined, loginCookie)).json()).currency, "EUR");
    const logout = await post("logout", undefined, cookie);
    assert.equal(logout.status, 204);
    assert.ok(logout.headers.get("set-cookie").includes("Max-Age=0"));
    const stale = await fetch(`${base}/dashboard`, { headers: { Cookie: "budgetzen_session=invalid" }, redirect: "manual" });
    await stale.text();
    assert.equal(stale.headers.get("location"), "/auth/login");
    await backend.stop();
    const unavailable = await post("login", { email: input.email, password: input.password });
    assert.equal(unavailable.status, 503);
    assert.ok((await unavailable.json()).message.includes("serveur"));
  } finally {
    if (frontend) await frontend.stop();
    if (backend) await backend.stop();
    assert.equal(dirname(directory), tmpdir());
    rmSync(directory, { recursive: true, force: true });
  }
});
