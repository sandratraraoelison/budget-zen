import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount } from "../src/features/budget/domain/budget";
import { validateCredentials } from "../src/features/auth/domain/auth";
test("amounts accept French decimals but reject ambiguous and unsafe values", () => {
  assert.equal(parseAmount("12,34"), 12.34);
  for (const value of [
    "0",
    "-1",
    "1.234",
    "Infinity",
    "1e3",
    "9007199254740992",
    "12 euros",
  ])
    assert.throws(() => parseAmount(value));
});
test("registration validates name and password confirmation before calling the API", () => {
  const input = {
    email: "user@example.com",
    name: "Alex",
    password: "long-password-123",
  };
  assert.equal(validateCredentials("register", input, input.password), null);
  assert.ok(validateCredentials("register", input, "different"));
  assert.ok(
    validateCredentials("register", { ...input, name: " " }, input.password),
  );
  assert.equal(validateCredentials("login", input), null);
});
