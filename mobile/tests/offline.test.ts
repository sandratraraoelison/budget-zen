import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ApiError,
  type HttpClient,
  type RequestOptions,
  type TokenStore,
} from "../src/shared/api/client";
import { createOfflineClient } from "../src/shared/offline/client";
import type { JsonStore } from "../src/shared/offline/store";
import type {
  BudgetSummary,
  Transaction,
} from "../src/features/budget/domain/budget";
const input = {
  amount: 12.5,
  date: "2026-10-11",
  description: "Food",
  category: "nourriture",
  type: "expense",
} as const;

test("a named Other category survives offline restart and replay", async () => {
  const f = fixture();
  let client = f.create();
  await f.login(client);
  await client.request("budget/summary");
  f.offline();
  client.setConnected(false);
  await client.request("transactions", {
    method: "POST",
    body: { ...input, category: "autres", customCategoryName: "Voyage" },
  });
  client = f.create();
  client.setConnected(false);
  const local = await client.request<BudgetSummary>("budget/summary");
  assert.equal(
    local.transactions.find((t) => t.syncStatus === "pending")
      ?.customCategoryName,
    "Voyage",
  );
  f.online();
  client.setConnected(true);
  await client.synchronize();
  await client.synchronize();
  assert.equal(f.remote.size, 1);
  assert.equal([...f.remote.values()][0].customCategoryName, "Voyage");
  assert.equal(client.getStatus().pending, 0);
});
function fixture() {
  const values = new Map<string, unknown>();
  const store: JsonStore = {
    async read<T>(key: string) {
      return structuredClone(values.get(key) ?? null) as T | null;
    },
    async write(key, value) {
      values.set(key, structuredClone(value));
    },
  };
  let token: string | null = "token-a";
  const tokens: TokenStore = {
    async read() {
      return token;
    },
    async write(next) {
      token = next;
    },
    async clear() {
      token = null;
    },
  };
  let count = 0;
  let reachable = true;
  let lostResponse = false;
  let reject = false;
  let unauthorized = false;
  const remote = new Map<string, Transaction>();
  const posts: string[] = [];
  const network: HttpClient = {
    async request<T>(path: string, options: RequestOptions = {}) {
      if (!reachable) throw new ApiError("No network", 0);
      if (unauthorized) {
        await tokens.clear();
        throw new ApiError("Expired", 401);
      }
      const user = {
        id: token === "token-b" ? "b" : "a",
        email: "user@example.com",
        name: "Test",
        isDemo: false,
        createdAt: "2026-10-11",
      };
      if (options.public) return { user, accessToken: token } as T;
      if (path === "auth/me") return user as T;
      if (path === "budget/summary")
        return {
          balance: 100,
          totalIncome: 100,
          totalExpenses: 0,
          transactions: [
            {
              id: "salary",
              amount: 100,
              date: "2026-10-11",
              description: "Salary",
              category: "salaire",
              type: "income",
            },
            ...remote.values(),
          ],
          budgets: [
            { id: "budget", category: "nourriture", limit: 50, current: 0 },
          ],
        } as T;
      if (path === "projects") return [{ id: "project" }] as T;
      if (path === "settings")
        return (options.body ?? { currency: "MGA" }) as T;
      if (path === "transactions") {
        const body = options.body as typeof input & { clientId: string };
        posts.push(body.clientId);
        if (reject) throw new ApiError("Invalid date", 400);
        let saved = remote.get(body.clientId);
        if (!saved) {
          saved = { ...body, id: `remote-${body.clientId}` };
          remote.set(body.clientId, saved);
        }
        if (lostResponse) {
          lostResponse = false;
          throw new ApiError("Response lost", 0);
        }
        return saved as T;
      }
      throw new Error(`Unexpected ${path}`);
    },
  };
  const create = () =>
    createOfflineClient(
      network,
      tokens,
      store,
      "http://server/api",
      () => `command-${++count}`,
      async (value) => `hash:${value}`,
    );
  const login = async (client: ReturnType<typeof create>, next = "token-a") => {
    await tokens.write(next);
    await client.request("auth/login", { public: true, method: "POST" });
  };
  return {
    create,
    login,
    store,
    tokens,
    posts,
    remote,
    offline: () => {
      reachable = false;
    },
    online: () => {
      reachable = true;
    },
    loseResponse: () => {
      lostResponse = true;
    },
    reject: () => {
      reject = true;
    },
    expire: () => {
      unauthorized = true;
    },
  };
}

test("offline snapshots and transactions survive restart and synchronize once", async () => {
  const f = fixture();
  let client = f.create();
  await f.login(client);
  await client.request("budget/summary");
  await client.request("projects");
  f.offline();
  client.setConnected(false);
  const local = await client.request<Transaction>("transactions", {
    method: "POST",
    body: input,
  });
  assert.equal(local.syncStatus, "pending");
  let summary = await client.request<BudgetSummary>("budget/summary");
  assert.equal(summary.balance, 87.5);
  assert.equal(summary.budgets[0].current, 12.5);
  client = f.create();
  client.setConnected(false);
  assert.equal((await client.request<{ id: string }>("auth/me")).id, "a");
  assert.equal((await client.request<unknown[]>("projects")).length, 1);
  summary = await client.request<BudgetSummary>("budget/summary");
  assert.equal(
    summary.transactions.filter((t) => t.syncStatus === "pending").length,
    1,
  );
  f.online();
  client.setConnected(true);
  await client.synchronize();
  summary = await client.request<BudgetSummary>("budget/summary");
  assert.equal(f.remote.size, 1);
  assert.equal(client.getStatus().pending, 0);
  assert.equal(
    summary.transactions.filter((t) => t.syncStatus === "pending").length,
    0,
  );
});

test("a lost server acknowledgement replays the identical command ID", async () => {
  const f = fixture();
  const client = f.create();
  await f.login(client);
  await client.request("budget/summary");
  f.loseResponse();
  await client.request("transactions", { method: "POST", body: input });
  await client.synchronize();
  client.setConnected(true);
  await client.synchronize();
  assert.equal(f.remote.size, 1);
  assert.ok(f.posts.length >= 2);
  assert.equal(new Set(f.posts).size, 1);
  assert.equal(client.getStatus().pending, 0);
});

test("queued changes stay isolated by account and unavailable snapshots are not invented", async () => {
  const f = fixture();
  const client = f.create();
  await f.login(client);
  await client.request("budget/summary");
  f.offline();
  client.setConnected(false);
  await client.request("transactions", { method: "POST", body: input });
  await f.tokens.clear();
  await assert.rejects(
    client.request("budget/summary"),
    (e) => e instanceof ApiError && e.status === 401,
  );
  f.online();
  await f.login(client, "token-b");
  client.setConnected(true);
  await client.synchronize();
  assert.equal(f.remote.size, 0);
  client.setConnected(false);
  await assert.rejects(
    client.request("budget/summary"),
    /pas encore disponibles/,
  );
  await f.login(client, "token-a");
  client.setConnected(true);
  await client.synchronize();
  assert.equal(f.remote.size, 1);
});

test("rejected changes are retained visibly until explicitly discarded", async () => {
  const f = fixture();
  const client = f.create();
  await f.login(client);
  await client.request("budget/summary");
  f.reject();
  await client.request("transactions", { method: "POST", body: input });
  await client.synchronize();
  assert.equal(client.getStatus().failed, 1);
  assert.equal(client.getStatus().pending, 1);
  assert.equal(client.getStatus().error, "Invalid date");
  const summary = await client.request<BudgetSummary>("budget/summary");
  assert.equal(
    summary.transactions.some((t) => t.syncStatus === "pending"),
    false,
  );
  await client.discardFailed();
  assert.equal(client.getStatus().pending, 0);
});

test("401 responses cannot fall back to cached financial data", async () => {
  const f = fixture();
  const client = f.create();
  await f.login(client);
  await client.request("budget/summary");
  f.expire();
  await assert.rejects(
    client.request("budget/summary"),
    (e) => e instanceof ApiError && e.status === 401,
  );
  assert.equal(await f.tokens.read(), null);
});
