import { openingFunding, recordFunding } from "../../../shared/domain/funding";
import type {
  Runtime,
  StateRepository,
} from "../../../shared/application/state-repository";
import { DomainError, required } from "../../../shared/domain/errors";
import { sumMinor, toMinor } from "../../../shared/domain/money";
import { validateDateRange } from "../../../shared/domain/dates";
import type {
  ExpenseInput,
  ProjectInput,
  ProjectsState,
  UpdateProjectInput,
} from "../domain/models";
import { assertProjectFund, projectView } from "../domain/project";

export class ProjectsService {
  constructor(
    private readonly repository: StateRepository<ProjectsState>,
    private readonly runtime: Runtime,
  ) {}

  list(user: string) {
    const state = this.repository.read(user);
    return state.projects.map((project) => projectView(project, state.fundingHistory));
  }
  get(user: string, id: string) {
    const state = this.repository.read(user);
    return projectView(required(state.projects.find((p) => p.id === id)), state.fundingHistory);
  }

  create(user: string, input: ProjectInput) {
    if (input.startDate)
      validateDateRange(input.startDate, input.targetDate ?? undefined);
    else if (input.targetDate) validateDateRange(input.targetDate);
    return this.repository.mutate(user, (state) => {
      const project = {
        id: this.runtime.id(),
        name: input.name,
        initialFundMinor: toMinor(input.initialFund, true),
        savedFundMinor:
          input.savedFund === undefined
            ? undefined
            : toMinor(input.savedFund, true),
        status: "en-cours" as const,
        expenses: [],
        startDate: input.startDate,
        targetDate: input.targetDate,
      };
      state.projects.push(project);
      recordFunding(state, this.runtime, project, "project", project.savedFundMinor ?? 0, "deposit");
      return projectView(project, state.fundingHistory);
    });
  }

  update(user: string, id: string, input: UpdateProjectInput) {
    return this.repository.mutate(user, (state) => {
      const project = required(state.projects.find((p) => p.id === id));
      if (input.name !== undefined) project.name = input.name;
      if (input.status !== undefined) project.status = input.status;
      if (input.startDate !== undefined) {
        validateDateRange(input.startDate);
        for (const expense of project.expenses)
          validateDateRange(input.startDate, expense.date);
        project.startDate = input.startDate;
      }
      if (input.targetDate !== undefined) project.targetDate = input.targetDate;
      if (project.startDate)
        validateDateRange(project.startDate, project.targetDate ?? undefined);
      else if (project.targetDate) validateDateRange(project.targetDate);
      if (input.savedFund !== undefined) {
        openingFunding(state, this.runtime, project, "project", project.savedFundMinor ?? 0);
        const saved = toMinor(input.savedFund, true);
        recordFunding(state, this.runtime, project, "project", saved - (project.savedFundMinor ?? 0), "adjustment");
        project.savedFundMinor = saved;
      }
      if (input.initialFund !== undefined)
        project.initialFundMinor = toMinor(input.initialFund, true);
      assertProjectFund(project);
      return projectView(project, state.fundingHistory);
    });
  }

  contribute(
    user: string,
    id: string,
    input: { amount: number; direction: "add" | "withdraw" },
  ) {
    return this.repository.mutate(user, (state) => {
      const project = required(
        state.projects.find((project) => project.id === id),
      );
      if (project.status !== "en-cours")
        throw new DomainError(
          "CONFLICT",
          "Réouvrez le projet pour modifier sa cagnotte.",
        );
      const next =
        (project.savedFundMinor ?? project.initialFundMinor) +
        (input.direction === "add" ? 1 : -1) * toMinor(input.amount);
      if (!Number.isSafeInteger(next) || next < 0)
        throw new DomainError("VALIDATION", "Montant de cagnotte invalide.");
      openingFunding(state, this.runtime, project, "project", project.savedFundMinor ?? 0);
      recordFunding(state, this.runtime, project, "project", next - (project.savedFundMinor ?? 0), input.direction === "add" ? "deposit" : "withdrawal");
      project.savedFundMinor = next;
      assertProjectFund(project);
      return projectView(project, state.fundingHistory);
    });
  }

  remove(user: string, id: string) {
    this.repository.mutate(user, (state) => {
      const project = required(state.projects.find((p) => p.id === id));
      if (project.savedFundMinor !== undefined) {
        const spent = sumMinor(project.expenses.map((e) => e.amountMinor));
        openingFunding(state, this.runtime, project, "project", project.savedFundMinor);
        recordFunding(state, this.runtime, project, "project", -(project.savedFundMinor - spent), "release");
        state.spentDeletedProjectsMinor = sumMinor([state.spentDeletedProjectsMinor ?? 0, spent]);
      }
      state.projects = state.projects.filter((p) => p.id !== id);
    });
  }

  addExpense(user: string, id: string, input: ExpenseInput) {
    return this.repository.mutate(user, (state) => {
      const project = required(state.projects.find((p) => p.id === id));
      if (project.status === "achevée")
        throw new DomainError(
          "CONFLICT",
          "Réouvrir le projet avant de saisir une dépense",
        );
      validateDateRange(project.startDate ?? input.date, input.date);
      project.expenses.push({
        id: this.runtime.id(),
        description: input.description,
        amountMinor: toMinor(input.amount),
        date: input.date,
        category: input.category,
      });
      assertProjectFund(project);
      return projectView(project, state.fundingHistory);
    });
  }

  removeExpense(user: string, id: string, expenseId: string) {
    this.repository.mutate(user, (state) => {
      const project = required(state.projects.find((p) => p.id === id));
      required(project.expenses.find((e) => e.id === expenseId));
      project.expenses = project.expenses.filter((e) => e.id !== expenseId);
    });
  }
}
