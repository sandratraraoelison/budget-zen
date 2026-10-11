import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedAccountRoute } from "./account-routes";

test("category ordering is forwarded only with PATCH", () => {
  assert.equal(isAllowedAccountRoute("categories/order", "PATCH"), true);
  for (const method of ["GET", "POST", "DELETE"])
    assert.equal(isAllowedAccountRoute("categories/order", method), false);
  assert.equal(isAllowedAccountRoute("categories/unknown", "PATCH"), false);
});

test("base category removal is forwarded without opening arbitrary routes", () => {
  for (const category of [
    "salaire",
    "loyer",
    "nourriture",
    "transport",
    "santé",
    "loisirs",
    "éducation",
  ])
    assert.equal(
      isAllowedAccountRoute(`custom-categories/base:${category}`, "DELETE"),
      true,
    );
  for (const category of ["autres", "unknown", "../settings"])
    assert.equal(
      isAllowedAccountRoute(`custom-categories/base:${category}`, "DELETE"),
      false,
    );
  assert.equal(
    isAllowedAccountRoute("custom-categories/base:loyer", "PATCH"),
    false,
  );
  assert.equal(isAllowedAccountRoute("budget/summary", "GET"), true);
});
