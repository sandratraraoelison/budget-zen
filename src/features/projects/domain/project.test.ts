import { test } from "node:test";
import assert from "node:assert/strict";
import type { Project } from "../types";
import { projectProgress, reconcileProject, recordExpense } from "./project";

const project = (): Project => ({
  id: "project",
  name: "Travaux",
  initialFund: 0.3,
  currentFund: 0.3,
  status: "en-cours",
  startDate: "2026-10-01",
  expenses: [],
});
const expense = {
  id: "one",
  description: "Matériel",
  category: "Autres",
  date: "2026-10-02",
  amount: 0.1,
};

test("project funds are derived exactly from expenses and cannot become negative", () => {
  const first = recordExpense(project(), expense);
  assert.equal(first.currentFund, 0.2);
  const second = recordExpense(first, { ...expense, id: "two", amount: 0.2 });
  assert.equal(second.currentFund, 0);
  assert.equal(projectProgress(second), 100);
  assert.throws(() => recordExpense(second, { ...expense, id: "three" }));
  assert.throws(() => reconcileProject({ ...first, initialFund: 0.09 }));
  assert.equal(
    reconcileProject({ ...first, currentFund: 999 }).currentFund,
    0.2,
  );
});

test("completed projects reject expenses; dates and zero-fund progress stay valid", () => {
  assert.throws(() =>
    recordExpense({ ...project(), status: "achevée" }, expense),
  );
  assert.throws(() =>
    recordExpense(project(), { ...expense, date: "2026-09-30" }),
  );
  assert.throws(() => recordExpense(project(), { ...expense, amount: -1 }));
  assert.equal(
    projectProgress({ ...project(), initialFund: 0, currentFund: 0 }),
    0,
  );
});
