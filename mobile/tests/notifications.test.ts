import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createNotifyingClient,
  type OperationNotice,
} from "../src/shared/application/notifying-client";
import type { HttpClient } from "../src/shared/api/client";

test("offline acceptance reports queued rather than server success", async () => {
  const notices: OperationNotice[] = [];
  const client = createNotifyingClient(
    { request: async <T>() => ({ syncStatus: "pending" }) as T },
    (notice) => notices.push(notice),
    () => 1,
  );
  await client.request("transactions", { method: "POST", body: {} });
  assert.deepEqual(notices, [{ kind: "queued" }]);
});

test("refresh and authentication are silent, writes report their result", async () => {
  const notices: OperationNotice[] = [];
  const transport: HttpClient = { request: async <T>() => undefined as T };
  const client = createNotifyingClient(
    transport,
    (notice) => notices.push(notice),
    () => 0,
  );
  await client.request("budget/summary");
  await client.request("auth/login", { public: true, method: "POST" });
  await client.request("projects/1", { method: "PATCH" });
  await client.request("projects/1", { method: "DELETE" });
  assert.deepEqual(notices, [{ kind: "updated" }, { kind: "deleted" }]);
});

test("a rejected write reports an error and preserves the caller's rejection", async () => {
  const failure = new Error("Server rejected the change");
  const notices: OperationNotice[] = [];
  const client = createNotifyingClient(
    {
      request: async () => {
        throw failure;
      },
    },
    (notice) => notices.push(notice),
    () => 0,
  );
  await assert.rejects(
    client.request("settings", { method: "PATCH" }),
    (error) => error === failure,
  );
  assert.deepEqual(notices, [{ kind: "error", message: failure.message }]);
});
