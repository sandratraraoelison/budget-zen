import { test } from "node:test";
import assert from "node:assert/strict";
import { sumAmounts, subtractAmounts, toMinor } from "./money";
import { calendarDay } from "./dates";

test("monetary arithmetic keeps decimal repayments and balances exact", () => {
  assert.equal(sumAmounts([0.1, 0.2]), 0.3);
  assert.equal(subtractAmounts(0.3, 0.1), 0.2);
  assert.equal(subtractAmounts(0.1, 0.3), -0.2);
  for (const value of [NaN, Infinity, -1, 0, 0.001, Number.MAX_SAFE_INTEGER])
    assert.throws(() => toMinor(value));
  assert.equal(toMinor(0, true), 0);
  assert.throws(() => sumAmounts([90071992547409, 10]));
});

test("calendar validation rejects impossible dates, including non-leap February", () => {
  assert.equal(calendarDay("2024-02-29"), Date.UTC(2024, 1, 29));
  for (const date of ["2025-02-29", "2026-02-30", "2026-13-01", "", "invalid"])
    assert.throws(() => calendarDay(date));
});
