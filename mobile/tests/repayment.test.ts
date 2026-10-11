import assert from "node:assert/strict";
import { test } from "node:test";
import {
  repaymentAmount,
  repaymentPercent,
} from "../src/features/credits/domain/repayment";
test("full and partial repayments round to minor units without exceeding the outstanding balance", () => {
  assert.equal(repaymentAmount(123.45, 100), 123.45);
  assert.equal(repaymentAmount(123.45, 25), 30.86);
  assert.equal(repaymentAmount(0.01, 25), 0);
  assert.equal(repaymentAmount(0.01, 100), 0.01);
  assert.equal(repaymentAmount(100, 0), 0);
  assert.equal(repaymentPercent(0, 0), 0);
  assert.equal(repaymentPercent(50, 100), 100);
  assert.equal(repaymentPercent(100, 25), 25);
  assert.throws(() => repaymentAmount(100, 101));
  assert.throws(() => repaymentAmount(100, NaN));
});
