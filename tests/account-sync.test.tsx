import { test } from "node:test";
import assert from "node:assert/strict";
import { act, useCallback } from "react";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { useAccountResource } from "../src/shared/application/useAccountResource";
import { saveCollectionChanges } from "../src/shared/api/collections";

test("queued writes use current server state and an older refresh cannot overwrite them", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost",
    pretendToBeVisual: true,
  });
  const descriptors = Object.getOwnPropertyDescriptors(globalThis);
  const globals = {
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const [key, value] of Object.entries(globals))
    Object.defineProperty(globalThis, key, { value, configurable: true });
  let root: Root | undefined;
  let server = 0;
  let holdRead = false;
  let stale: ((value: number) => void) | undefined;
  let resource: ReturnType<typeof useAccountResource<number>>;
  function Harness() {
    const load = useCallback(async () => {
      if (holdRead) {
        holdRead = false;
        return new Promise<number>((resolve) => {
          stale = resolve;
        });
      }
      return server;
    }, []);
    resource = useAccountResource(load);
    return <span>{resource.data}</span>;
  }
  try {
    await act(async () => {
      root = createRoot(dom.window.document.getElementById("root")!);
      root.render(<Harness />);
    });
    assert.equal(resource!.data, 0);
    await act(async () => {
      holdRead = true;
      resource!.reload();
    });
    await act(async () => {
      await Promise.all([
        resource!.mutate(async (previous) => {
          server = previous + 1;
        }),
        resource!.mutate(async (previous) => {
          server = previous + 1;
        }),
      ]);
    });
    assert.equal(resource!.data, 2);
    await act(async () => {
      stale!(0);
    });
    assert.equal(resource!.data, 2);
    await act(async () => {
      await assert.rejects(
        resource!.mutate(async () => {
          throw new Error("Write failed");
        }),
        /Write failed/,
      );
    });
    assert.equal(resource!.data, 2);
    assert.equal(resource!.error, "Write failed");
    server = 3;
    await act(async () => {
      dom.window.dispatchEvent(new dom.window.Event("focus"));
    });
    assert.equal(resource!.data, 3);
    assert.equal(resource!.error, "");
  } finally {
    if (root) await act(async () => root!.unmount());
    dom.window.close();
    for (const key of Object.keys(globals)) {
      if (descriptors[key])
        Object.defineProperty(globalThis, key, descriptors[key]);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});

test("collection saves send only changed records and use server IDs for child writes", async () => {
  const original = globalThis.fetch;
  const requests: { path: string; method: string; body: unknown }[] = [];
  globalThis.fetch = async (url, init) => {
    requests.push({
      path: String(url),
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    return new Response(JSON.stringify({ id: "server-id" }), { status: 201 });
  };
  const config = {
    path: "projects",
    body: (p: {
      id: string;
      name: string;
      expenses: { id: string; amount: number }[];
    }) => ({ name: p.name }),
    children: {
      path: "expenses",
      items: (p: { expenses: { id: string; amount: number }[] }) => p.expenses,
      body: (e: { id: string } & Record<string, unknown>) => ({
        amount: e.amount,
      }),
    },
  };
  try {
    const unchanged = { id: "existing", name: "Existing", expenses: [] };
    await saveCollectionChanges(
      config,
      [unchanged],
      [
        unchanged,
        {
          id: "local-id",
          name: "New",
          expenses: [{ id: "child-local", amount: 100 }],
        },
      ],
    );
    assert.deepEqual(requests, [
      { path: "/api/account/projects", method: "POST", body: { name: "New" } },
      {
        path: "/api/account/projects/server-id/expenses",
        method: "POST",
        body: { amount: 100 },
      },
    ]);
  } finally {
    globalThis.fetch = original;
  }
});

test("patches exclude unchanged fields so another device's updates are preserved", async () => {
  const original = globalThis.fetch;
  let body: unknown;
  globalThis.fetch = async (_url, init) => {
    body = JSON.parse(String(init?.body));
    return new Response("{}", { status: 200 });
  };
  try {
    const config = {
      path: "projects",
      body: (p: { id: string; name: string; initialFund: number }) => ({
        name: p.name,
        initialFund: p.initialFund,
      }),
    };
    await saveCollectionChanges(
      config,
      [{ id: "existing", name: "Name", initialFund: 100 }],
      [{ id: "existing", name: "Name", initialFund: 200 }],
    );
    assert.deepEqual(body, { initialFund: 200 });
  } finally {
    globalThis.fetch = original;
  }
});
