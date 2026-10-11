import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";
import { bankProjection, validateBankLoan, type BankLoan } from "./bank-loan";
const bank: BankLoan = {
  rateType: "fixed",
  annualRate: 12,
  termMonths: 12,
  firstPaymentDate: "2026-01-31",
  insuranceMonthly: 2,
  fees: 20,
};
test("bank projections amortize principal exactly and clamp end-of-month dates", () => {
  const result = bankProjection(1200, bank);
  assert.equal(result.schedule[1]?.date, "2026-02-28");
  assert.equal(result.schedule[2]?.date, "2026-03-31");
  assert.equal(result.schedule.at(-1)?.remaining, 0);
  assert.equal(
    result.schedule.reduce(
      (sum, row) => sum + Math.round(row.capital * 100),
      0,
    ),
    120000,
  );
  assert.ok(result.totalCost > 44);
  assert.equal(
    bankProjection(1200, { ...bank, annualRate: 0 }).monthlyPayment,
    102,
  );
  assert.throws(() =>
    validateBankLoan({ ...bank, termMonths: 0 }, 1200, "2026-01-01"),
  );
  assert.throws(() =>
    validateBankLoan(
      { ...bank, firstPaymentDate: "2026-02-30" },
      1200,
      "2026-01-01",
    ),
  );
  assert.throws(() =>
    validateBankLoan({ ...bank, rateType: "revolving" }, 1200, "2026-01-01"),
  );
});

test("bank projections stay identical across the independently built applications", () => {
  const web = readFileSync(
    "src/features/credits/domain/bank-loan.ts",
    "utf8",
  ).replace(/\r/g, "");
  assert.equal(
    readFileSync(
      "mobile/src/features/credits/domain/bank-loan.ts",
      "utf8",
    ).replace(/\r/g, ""),
    web,
  );
  assert.equal(
    readFileSync(
      "backend/src/modules/credits/domain/bank-loan.ts",
      "utf8",
    ).replace(/\r/g, ""),
    web,
  );
});
