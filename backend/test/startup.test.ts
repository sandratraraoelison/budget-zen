import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

test("compiled executable starts from environment configuration and serves health", async () => {
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const address = socket.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    socket.close((error) => (error ? reject(error) : resolve())),
  );
  const directory = mkdtempSync(join(tmpdir(), "budgetzen-startup-"));
  const child = spawn(process.execPath, ["dist/main.js"], {
    cwd: process.cwd(),
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      PORT: String(port),
      HOST: "127.0.0.1",
      DATABASE_PATH: join(directory, "test.sqlite"),
      FRONTEND_ORIGIN: "http://localhost:3000",
      JWT_SECRET: "test-secret-only-32-characters-minimum",
      JWT_EXPIRES_IN_SECONDS: "3600",
      DEMO_ENABLED: "false",
      SWAGGER_ENABLED: "false",
    },
  });
  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += String(chunk);
  });
  child.stderr.on("data", (chunk) => {
    logs += String(chunk);
  });
  const exited = once(child, "exit");
  try {
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      assert.equal(child.exitCode, null, logs);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/v1/health`, {
          signal: AbortSignal.timeout(1000),
        });
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { status: "ok" });
        ready = true;
        break;
      } catch {
        await delay(100);
      }
    }
    assert.ok(ready, logs);
  } finally {
    if (child.exitCode === null) child.kill();
    await exited;
    assert.equal(dirname(directory), tmpdir());
    rmSync(directory, { recursive: true, force: true });
  }
});
