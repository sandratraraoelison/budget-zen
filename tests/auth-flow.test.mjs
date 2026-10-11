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
    assert.ok((await dashboard.text()).includes("Nouvelle Transaction"));
    const home = await fetch(base, { headers: { Cookie: cookie }, redirect: "manual" });
    await home.text();
    assert.equal(home.headers.get("location"), "/dashboard");
    const duplicate = await post("register", input);
    assert.equal(duplicate.status, 409);
    await duplicate.text();
    const invalid = await post("login", { email: input.email, password: "incorrect-password" });
    assert.equal(invalid.status, 401);
    assert.ok((await invalid.json()).message.includes("incorrect"));
    const login = await post("login", { email: input.email, password: input.password });
    assert.equal(login.status, 200);
    await login.text();
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
