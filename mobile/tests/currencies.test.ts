import { test } from "node:test";
import assert from "node:assert/strict";
import { currencyOptions } from "../src/features/settings/domain/currencies";

test("currency choices work without optional Intl APIs and preserve the current code", () => {
  const displayNames = Object.getOwnPropertyDescriptor(Intl, "DisplayNames");
  const supportedValues = Object.getOwnPropertyDescriptor(Intl, "supportedValuesOf");
  try {
    Object.defineProperty(Intl, "DisplayNames", { value: undefined, configurable: true });
    Object.defineProperty(Intl, "supportedValuesOf", { value: undefined, configurable: true });
    const fr = currencyOptions("fr", "MGA");
    const en = currencyOptions("en", "MGA");
    assert.ok(fr.length > 100);
    assert.equal(new Set(fr.map(option => option.code)).size, fr.length);
    assert.ok(fr.find(option => option.code === "MGA")?.name.includes("ariary"));
    assert.notEqual(fr.find(option => option.code === "USD")?.name, en.find(option => option.code === "USD")?.name);
    assert.equal(currencyOptions("fr", "ZZZ")[0].code, "ZZZ");
  } finally {
    if (displayNames) Object.defineProperty(Intl, "DisplayNames", displayNames);
    if (supportedValues) Object.defineProperty(Intl, "supportedValuesOf", supportedValues);
  }
});
