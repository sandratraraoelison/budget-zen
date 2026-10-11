import { fundingView, type FundingMovement } from "../../../shared/domain/funding";
import { DomainError } from "../../../shared/domain/errors";
import { fromMinor, sumMinor } from "../../../shared/domain/money";
import type { Project } from "./models";

export function availableFund(project: Project) {
  return (
    (project.savedFundMinor ?? project.initialFundMinor) -
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
  savedFundMinor,
  expenses,
  ...project
}: Project, history: FundingMovement[] = []) {
  return {
    ...project,
    history: history.filter((e) => e.goalId === project.id).map(fundingView),
    initialFund: fromMinor(initialFundMinor),
    savedFund: fromMinor(savedFundMinor ?? initialFundMinor),
    currentFund: fromMinor(
      availableFund({ ...project, initialFundMinor, savedFundMinor, expenses }),
    ),
    expenses: expenses.map(({ amountMinor, ...expense }) => ({
      ...expense,
      amount: fromMinor(amountMinor),
    })),
  };
}
