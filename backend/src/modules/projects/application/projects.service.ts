import type {
  Runtime,
  StateRepository,
} from "../../../shared/application/state-repository";
import { DomainError, required } from "../../../shared/domain/errors";
import { toMinor } from "../../../shared/domain/money";
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
    return this.repository.read(user).projects.map(projectView);
  }
  get(user: string, id: string) {
    return projectView(
      required(this.repository.read(user).projects.find((p) => p.id === id)),
    );
  }

  create(user: string, input: ProjectInput) {
    if (input.startDate) validateDateRange(input.startDate);
    return this.repository.mutate(user, (state) => {
      const project = {
        id: this.runtime.id(),
        name: input.name,
        initialFundMinor: toMinor(input.initialFund, true),
        status: "en-cours" as const,
        expenses: [],
        startDate: input.startDate,
      };
      state.projects.push(project);
      return projectView(project);
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
      if (input.initialFund !== undefined)
        project.initialFundMinor = toMinor(input.initialFund, true);
      assertProjectFund(project);
      return projectView(project);
    });
  }

  remove(user: string, id: string) {
    this.repository.mutate(user, (state) => {
      required(state.projects.find((p) => p.id === id));
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
      return projectView(project);
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
