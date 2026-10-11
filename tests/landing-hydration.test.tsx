import { test } from "node:test";
import assert from "node:assert/strict";
import { act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import LandingPage from "../src/features/auth/LandingPage";
import { AuthProvider } from "../src/features/auth/context/AuthProvider";
import PreferencesProvider from "../src/features/settings/PreferencesProvider";

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

test("saved language and theme hydrate safely and remain switchable", async () => {
  const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {} };
  const view = <AppRouterContext.Provider value={router}><PreferencesProvider>
    <AuthProvider initialUser={null}><LandingPage /></AuthProvider>
  </PreferencesProvider></AppRouterContext.Provider>;
  const html = renderToString(view);
  const dom = new JSDOM(`<html lang="fr"><body><div id="root">${html}</div></body></html>`, {
    url: "http://localhost:3000", runScripts: "dangerously",
    beforeParse(window) {
      window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} }) as unknown as MediaQueryList;
      window.localStorage.setItem("budgetzen-language", "en");
      window.localStorage.setItem("budgetzen-theme", "dark");
    },
  });
  const original = Object.getOwnPropertyDescriptors(globalThis);
  const globals = { window: dom.window, self: dom.window, document: dom.window.document, navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement, localStorage: dom.window.localStorage, getComputedStyle: dom.window.getComputedStyle.bind(dom.window), IS_REACT_ACT_ENVIRONMENT: true };
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, value });
  const errors: unknown[] = [];
  let root: Root | undefined;
  try {
    const container = dom.window.document.getElementById("root")!;
    await act(async () => { root = hydrateRoot(container, view, { onRecoverableError: error => errors.push(error) }); });
    assert.deepEqual(errors, []);
    assert.equal(dom.window.document.documentElement.lang, "en");
    assert.ok(container.textContent?.includes("Create my account"));
    assert.ok(dom.window.document.documentElement.classList.contains("dark"));
    // The test imports next-themes in SSR mode; synchronize its client state
    // through the same storage event used when another browser tab changes theme.
    await act(async () => { dom.window.dispatchEvent(new dom.window.StorageEvent("storage", { key: "budgetzen-theme", newValue: "dark" })); });
    const theme = container.querySelector<HTMLButtonElement>('[aria-label="Switch light/dark theme"]')!;
    await act(async () => { theme.click(); });
    assert.ok(dom.window.document.documentElement.classList.contains("light"));
    assert.equal(dom.window.localStorage.getItem("budgetzen-theme"), "light");
    const language = container.querySelector<HTMLSelectElement>('[aria-label="Application language"]')!;
    await act(async () => { language.value = "fr"; language.dispatchEvent(new dom.window.Event("change", { bubbles: true })); });
    assert.equal(dom.window.document.documentElement.lang, "fr");
    assert.equal(dom.window.localStorage.getItem("budgetzen-language"), "fr");
    assert.ok(container.textContent?.includes("Créer mon compte"));
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
