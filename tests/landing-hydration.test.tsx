import { test } from "node:test";
import assert from "node:assert/strict";
import { act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import LandingPage from "../src/features/auth/LandingPage";
import { AuthProvider } from "../src/features/auth/context/AuthProvider";

for (const mode of ["register", "login"] as const) {
  test(`the ${mode} landing hydrates its SVG icons and keeps the form interactive`, async () => {
    const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {} };
    const view = <AppRouterContext.Provider value={router}>
      <AuthProvider initialUser={null}><LandingPage initialMode={mode} /></AuthProvider>
    </AppRouterContext.Provider>;
    // Render without browser globals, then parse and hydrate the real server markup.
    const html = renderToString(view);
    const dom = new JSDOM(`<div id="root">${html}</div>`, { url: "http://localhost:3000" });
    const original = Object.getOwnPropertyDescriptors(globalThis);
    const globals = { window: dom.window, self: dom.window, document: dom.window.document, navigator: dom.window.navigator,
      HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true };
    for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, value });
    const errors: unknown[] = [];
    let root: Root | undefined;
    try {
      const container = dom.window.document.getElementById("root")!;
      const iconsBefore = Array.from(container.querySelectorAll("svg"), svg => svg.outerHTML);
      assert.ok(iconsBefore.length >= 10);
      await act(async () => { root = hydrateRoot(container, view, { onRecoverableError: error => errors.push(error) }); });
      assert.deepEqual(errors, []);
      assert.deepEqual(Array.from(container.querySelectorAll("svg"), svg => svg.outerHTML), iconsBefore);
      const toggle = container.querySelector<HTMLButtonElement>('button[aria-label="Afficher le mot de passe"]')!;
      await act(async () => { toggle.click(); });
      assert.equal(container.querySelector<HTMLInputElement>('[name="password"]')!.type, "text");
      assert.ok(container.querySelector(".lucide-eye-off"));
      const tab = Array.from(container.querySelectorAll("button")).find(button => button.textContent === (mode === "register" ? "Connexion" : "Inscription"))!;
      await act(async () => { tab.click(); });
      assert.equal(!!container.querySelector('[name="confirmation"]'), mode === "login");
      assert.deepEqual(errors, []);
    } finally {
      if (root) await act(async () => root!.unmount());
      dom.window.close();
      for (const key of Object.keys(globals)) {
        if (original[key]) Object.defineProperty(globalThis, key, original[key]);
        else Reflect.deleteProperty(globalThis, key);
      }
    }
  });
}
