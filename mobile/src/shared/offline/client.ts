import { notifyResourcesChanged } from "../application/resource-events";
import {
  ApiError,
  type HttpClient,
  type RequestOptions,
  type TokenStore,
} from "../api/client";
import type { JsonStore } from "./store";
import type { User, Session } from "../../features/auth/domain/auth";
import type {
  BudgetSummary,
  Transaction,
  TransactionInput,
} from "../../features/budget/domain/budget";
export interface OfflineStatus {
  offline: boolean;
  pending: number;
  failed: number;
  syncing: boolean;
  error: string;
}
interface Command {
  id: string;
  path: "transactions" | "settings";
  body: TransactionInput | { currency: string };
  error?: string;
}
interface AccountData {
  cache: Record<string, unknown>;
  outbox: Command[];
}
interface Identity {
  user: User;
  tokenHash: string;
}
const retryable = (error: unknown) =>
  error instanceof ApiError &&
  [0, 429, 500, 502, 503, 504].includes(error.status);
const emptySummary = (): BudgetSummary => ({
  balance: 0,
  totalIncome: 0,
  totalExpenses: 0,
  transactions: [],
  budgets: [],
});

export function createOfflineClient(
  network: HttpClient,
  tokens: TokenStore,
  store: JsonStore,
  server: string,
  uuid: () => string,
  fingerprint: (token: string) => Promise<string>,
) {
  const prefix = `server:${server.replace(/\/$/, "")}`;
  let connected = true;
  let status: OfflineStatus = {
    offline: false,
    pending: 0,
    failed: 0,
    syncing: false,
    error: "",
  };
  const listeners = new Set<() => void>();
  let queue: Promise<unknown> = Promise.resolve();
  const publish = (next: Partial<OfflineStatus>) => {
    status = { ...status, ...next };
    listeners.forEach((listener) => listener());
  };
  const serial = <T>(operation: () => Promise<T>): Promise<T> => {
    const task = queue.then(operation);
    queue = task.catch(() => {});
    return task;
  };
  async function owner() {
    const token = await tokens.read();
    const identity = await store.read<Identity>(`${prefix}:identity`);
    if (
      !token ||
      !identity ||
      identity.tokenHash !== (await fingerprint(token))
    )
      throw new ApiError(
        "Reconnectez-vous pour acceder aux donnees locales.",
        401,
      );
    return { key: `${prefix}:user:${identity.user.id}`, identity, token };
  }
  async function readAccount(key: string) {
    return (await store.read<AccountData>(key)) ?? { cache: {}, outbox: [] };
  }
  function publishData(data: AccountData) {
    publish({
      pending: data.outbox.length,
      failed: data.outbox.filter((c) => c.error).length,
      error: data.outbox.find((c) => c.error)?.error ?? "",
    });
  }
  async function flush(key: string, data: AccountData) {
    if (!connected || !data.outbox.length) return;
    publish({ syncing: true });
    try {
      for (const command of [...data.outbox]) {
        if (command.error) continue;
        try {
          const active = await owner();
          if (active.key !== key) return;
          const result = await network.request<
            Transaction | { currency: string }
          >(command.path, {
            expectedToken: active.token,
            method: command.path === "transactions" ? "POST" : "PATCH",
            body:
              command.path === "transactions"
                ? { ...command.body, clientId: command.id }
                : command.body,
          });
          const committed: AccountData = {
            cache: { ...data.cache },
            outbox: data.outbox.filter((c) => c.id !== command.id),
          };
          if (command.path === "transactions") {
            const summary =
              (data.cache["budget/summary"] as BudgetSummary | undefined) ??
              emptySummary();
            committed.cache["budget/summary"] = projectSummary(summary, [
              result as Transaction,
            ]);
          } else committed.cache.settings = result;
          // A crash before the atomic cache/outbox write replays the same clientId.
          await store.write(key, committed);
          data.cache = committed.cache;
          data.outbox = committed.outbox;
          publish({ offline: false });
        } catch (error) {
          if (retryable(error)) {
            if ((error as ApiError).status !== 429) connected = false;
            publish({ offline: true });
            break;
          }
          if (error instanceof ApiError && error.status === 401) throw error;
          if (!(error instanceof ApiError)) throw error;
          command.error = error.message;
          await store.write(key, data);
        }
      }
    } finally {
      publishData(data);
      publish({ syncing: false });
    }
  }
  async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    if (options.public) {
      const result = await network.request<T>(path, options);
      if (path === "auth/login" || path === "auth/register") {
        const session = result as Session;
        await store.write(`${prefix}:identity`, {
          user: session.user,
          tokenHash: await fingerprint(session.accessToken),
        });
        const key = `${prefix}:user:${session.user.id}`;
        const data = await readAccount(key);
        data.cache["auth/me"] = session.user;
        await store.write(key, data);
        publishData(data);
      }
      return result;
    }
    return serial(async () => {
      let account;
      try {
        account = await owner();
      } catch (error) {
        const token = await tokens.read();
        if (path !== "auth/me" || !token || !connected) throw error;
        const user = await network.request<User>("auth/me", options);
        await store.write(`${prefix}:identity`, {
          user,
          tokenHash: await fingerprint(token),
        });
        account = await owner();
        const bootstrap = await readAccount(account.key);
        bootstrap.cache["auth/me"] = user;
        await store.write(account.key, bootstrap);
      }
      const { key, identity, token } = account;
      const data = await readAccount(key);
      const method = options.method ?? "GET";
      if (
        (method === "POST" && path === "transactions") ||
        (method === "PATCH" && path === "settings")
      ) {
        const command: Command = {
          id: uuid(),
          path: path as Command["path"],
          body: options.body as Command["body"],
        };
        data.outbox.push(command);
        await store.write(key, data);
        publishData(data);
        // The durable local write is the acknowledgement. Sending happens without blocking the form.
        void synchronize().catch((error) =>
          publish({ error: (error as Error).message }),
        );
        return (
          path === "transactions"
            ? {
                ...(options.body as TransactionInput),
                id: command.id,
                syncStatus: "pending",
              }
            : options.body
        ) as T;
      }
      if (method !== "GET") {
        const result = await network.request<T>(path, options);
        notifyResourcesChanged();
        return result;
      }
      if (path === "auth/me") {
        // A previously authenticated account can open immediately without the network.
        if (connected)
          void serial(async () => {
            try {
              const verified = await network.request<User>("auth/me", {
                expectedToken: token,
              });
              const active = await owner();
              if (active.key !== key) return;
              const latest = await readAccount(key);
              latest.cache["auth/me"] = verified;
              await store.write(key, latest);
            } catch (error) {
              if (retryable(error)) publish({ offline: true });
            }
          });
        publishData(data);
        return (data.cache["auth/me"] ?? identity.user) as T;
      }
      await flush(key, data);
      let value: unknown =
        data.cache[path] ?? (path === "auth/me" ? identity.user : undefined);
      if (connected) {
        try {
          value = await network.request<T>(path, {
            ...options,
            expectedToken: token,
          });
          data.cache[path] = value;
          await store.write(key, data);
          publish({ offline: false });
        } catch (error) {
          if (options.signal?.aborted || !retryable(error)) throw error;
          if ((error as ApiError).status !== 429) connected = false;
          publish({ offline: true });
          if (value === undefined) throw error;
        }
      } else {
        publish({ offline: true });
        if (value === undefined)
          throw new ApiError(
            "Ces donnees ne sont pas encore disponibles hors ligne.",
            0,
          );
      }
      publishData(data);
      if (path === "budget/summary")
        value = projectSummary(
          value as BudgetSummary,
          data.outbox
            .filter((c) => c.path === "transactions" && !c.error)
            .map((c) => ({
              ...(c.body as TransactionInput),
              id: c.id,
              syncStatus: "pending" as const,
            })),
        );
      if (path === "settings") {
        const pending = data.outbox
          .filter((c) => c.path === "settings" && !c.error)
          .at(-1);
        if (pending) value = pending.body;
      }
      return value as T;
    });
  }
  async function synchronize() {
    return serial(async () => {
      const { key } = await owner();
      const data = await readAccount(key);
      await flush(key, data);
    });
  }
  return {
    request,
    synchronize,
    setConnected(value: boolean) {
      connected = value;
      if (!value) publish({ offline: true });
      if (value)
        void synchronize().catch((error) =>
          publish({ error: (error as Error).message }),
        );
    },
    getStatus: () => status,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async discardFailed() {
      return serial(async () => {
        const { key } = await owner();
        const data = await readAccount(key);
        data.outbox = data.outbox.filter((c) => !c.error);
        await store.write(key, data);
        publishData(data);
      });
    },
    async retry() {
      return serial(async () => {
        const { key } = await owner();
        const data = await readAccount(key);
        data.outbox.forEach((c) => {
          delete c.error;
        });
        await store.write(key, data);
        await flush(key, data);
      });
    },
  };
}
function projectSummary(
  summary: BudgetSummary,
  extra: Transaction[],
): BudgetSummary {
  const transactions = [...summary.transactions];
  for (const transaction of extra)
    if (!transactions.some((t) => t.id === transaction.id))
      transactions.unshift(transaction);
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Math.round(t.amount * 100), 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.round(t.amount * 100), 0);
  return {
    ...summary,
    transactions,
    totalIncome: income / 100,
    totalExpenses: expenses / 100,
    balance: (income - expenses + Math.round((summary.creditBalance ?? 0) * 100) - Math.round((summary.projectReserved ?? 0) * 100) - (summary.savingsGoals ?? []).reduce((sum, goal) => sum + Math.round(goal.current * 100), 0)) / 100,
    budgets: summary.budgets.map((b) => ({
      ...b,
      current:
        transactions
          .filter((t) => t.type === "expense" && t.category === b.category && (t.customCategoryName ?? "").toLowerCase() === (b.customCategoryName ?? "").toLowerCase())
          .reduce((sum, t) => sum + Math.round(t.amount * 100), 0) / 100,
    })),
  };
}
