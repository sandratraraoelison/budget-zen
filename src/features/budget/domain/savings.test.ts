import { test } from "node:test";
import assert from "node:assert/strict";
import { savingsPlan } from "./savings";
test("savings planning respects calendar deadlines and rounds the suggested pace upward", () => {
  const goal = { target: 100, current: 0, deadline: "2026-12-15" };
  const plan = savingsPlan(goal, "2026-10-11");
  assert.equal(plan.days, 65);
  assert.equal(plan.monthly, 33.34);
  assert.equal(plan.remaining, 100);
  assert.equal(
    savingsPlan({ ...goal, current: 110 }, "2026-12-16").achieved,
    true,
  );
  assert.equal(savingsPlan(goal, "2026-12-15").monthly, undefined);
  assert.equal(savingsPlan(goal, "2026-12-16").days, -1);
});
