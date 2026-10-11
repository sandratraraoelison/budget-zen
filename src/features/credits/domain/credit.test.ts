import { test } from "node:test";
import assert from "node:assert/strict";
import type { Credit } from "../types";
import { getCreditStatus, reconcileCredit, recordPayment } from "./credit";
import { filterCredits } from "./filterCredits";

const credit = (): Credit => ({
  id: "credit",
  contact: "Client",
  type: "lent",
  initialAmount: 0.3,
  remainingAmount: 0.3,
  startDate: "2026-10-01",
  endDate: "2026-10-11",
  payments: [],
});

test("successive decimal payments settle a credit exactly", () => {
  const partial = recordPayment(credit(), {
    id: "one",
    amount: 0.1,
    date: "2026-10-05",
  });
  const paid = recordPayment(partial, {
    id: "two",
    amount: 0.2,
    date: "2026-10-06",
  });
  assert.equal(paid.remainingAmount, 0);
  assert.equal(getCreditStatus(paid, new Date("2026-11-01")), "paid");
  assert.deepEqual(
    filterCredits([paid], "", "expired", new Date("2026-11-01")),
    [],
  );
  assert.throws(() =>
    recordPayment(paid, { id: "three", amount: 0.01, date: "2026-10-07" }),
  );
});

test("credit edits preserve payments and reject an initial amount below paid amounts", () => {
  const partial = recordPayment(credit(), {
    id: "one",
    amount: 0.2,
    date: "2026-10-05",
  });
  assert.throws(() => reconcileCredit({ ...partial, initialAmount: 0.1 }));
  assert.throws(() => reconcileCredit({ ...partial, startDate: "2026-10-06" }));
  assert.throws(() => reconcileCredit({ ...partial, endDate: "2026-09-30" }));
  assert.equal(
    reconcileCredit({ ...partial, initialAmount: 0.5, remainingAmount: 900 })
      .remainingAmount,
    0.3,
  );
  assert.throws(() =>
    recordPayment(partial, { id: "two", amount: 0.01, date: "2026-09-30" }),
  );
});

test("an unpaid credit due today is a warning until the next UTC calendar day", () => {
  assert.equal(
    getCreditStatus(credit(), new Date("2026-10-11T23:59:59Z")),
    "warning",
  );
  assert.equal(
    getCreditStatus(credit(), new Date("2026-10-12T00:00:00Z")),
    "expired",
  );
  assert.equal(getCreditStatus(credit(), new Date("2026-10-04")), "warning");
  assert.equal(getCreditStatus(credit(), new Date("2026-10-03")), "unpaid");
});
