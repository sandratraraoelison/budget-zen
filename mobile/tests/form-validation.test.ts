import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calendarDate,
  requiredText,
} from "../src/shared/domain/form-validation";

test("creation dates reject calendar rollover and accept an omitted optional deadline", () => {
  assert.throws(() => calendarDate("2026-02-29", "Date"));
  assert.throws(() => calendarDate("2026-04-31", "Date"));
  assert.throws(() => calendarDate("2026-13-01", "Date"));
  assert.equal(calendarDate("2028-02-29", "Date"), "2028-02-29");
  assert.equal(calendarDate("", "Deadline", true), undefined);
  assert.throws(() => calendarDate("", "Date"));
});

test("creation names reject whitespace and length overflow before sending a request", () => {
  assert.throws(() => requiredText("   ", "Name"));
  assert.throws(() => requiredText("a".repeat(101), "Name"));
  assert.equal(requiredText("  Maison  ", "Name"), "Maison");
});
