import { DomainError } from "../../../shared/domain/errors";
import { fromMinor, sumMinor } from "../../../shared/domain/money";
import type { Project } from "./models";

export function availableFund(project: Project) {
  return (
    project.initialFundMinor -
    sumMinor(project.expenses.map((e) => e.amountMinor))
  );
}
export function assertProjectFund(project: Project) {
  if (availableFund(project) < 0)
    throw new DomainError(
      "VALIDATION",
      "Les dépenses dépassent les fonds du projet",
    );
}
export function projectView({
  initialFundMinor,
  expenses,
  ...project
}: Project) {
  return {
    ...project,
    initialFund: fromMinor(initialFundMinor),
    currentFund: fromMinor(
      availableFund({ ...project, initialFundMinor, expenses }),
    ),
    expenses: expenses.map(({ amountMinor, ...expense }) => ({
      ...expense,
      amount: fromMinor(amountMinor),
    })),
  };
}
