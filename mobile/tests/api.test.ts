import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ApiError,
  createHttpClient,
  type TokenStore,
} from "../src/shared/api/client";
test("protected calls use Bearer auth and expired sessions are cleared", async () => {
  let token: string | null = "secret";
  let expired = false;
  const store: TokenStore = {
    read: async () => token,
    write: async (value) => {
      token = value;
    },
    clear: async () => {
      token = null;
    },
  };
  const fetcher: typeof fetch = async (url, options) => {
    assert.equal(url, "http://localhost:3001/api/v1/budget/summary");
    assert.equal(
      (options?.headers as Record<string, string>).Authorization,
      "Bearer secret",
    );
    return new Response(JSON.stringify({ message: "Expired" }), {
      status: 401,
    });
  };
  const http = createHttpClient(
    "http://localhost:3001/api/v1/",
    store,
    () => {
      expired = true;
    },
    fetcher,
  );
  await assert.rejects(
    http.request("budget/summary"),
    (error: unknown) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(token, null);
  assert.equal(expired, true);
});
test("login does not send a previous account token", async () => {
  const store: TokenStore = {
    read: async () => {
      throw new Error("must not read");
    },
    write: async () => {},
    clear: async () => {},
  };
  const http = createHttpClient(
    "http://localhost/api/v1",
    store,
    () => {},
    async (_url, options) => {
      assert.equal(
        (options?.headers as Record<string, string>).Authorization,
        undefined,
      );
      return new Response(JSON.stringify({ accessToken: "new" }));
    },
  );
  assert.deepEqual(
    await http.request("auth/login", {
      public: true,
      method: "POST",
      body: {},
    }),
    { accessToken: "new" },
  );
});
