import type { Project, Expense } from "../types";
import {
  subtractAmounts,
  sumAmounts,
  toMinor,
} from "../../../shared/domain/money";
import { calendarDay, validateDateRange } from "../../../shared/domain/dates";

export function reconcileProject(project: Project): Project {
  if (!project.name.trim())
    throw new Error("Le nom du projet est obligatoire.");
  toMinor(project.initialFund, true);
  toMinor(project.savedFund ?? project.initialFund, true);
  if (project.startDate)
    validateDateRange(project.startDate, project.targetDate ?? undefined);
  else if (project.targetDate) calendarDay(project.targetDate);
  const start = project.startDate ? calendarDay(project.startDate) : null;
  project.expenses.forEach((expense) => {
    toMinor(expense.amount);
    if (!expense.description.trim() || !expense.category.trim())
      throw new Error("Complétez la description et la catégorie.");
    const date = calendarDay(expense.date);
    if (start !== null && date < start)
      throw new Error("Une dépense ne peut pas précéder le projet.");
  });
  const currentFund = subtractAmounts(
    project.savedFund ?? project.initialFund,
    sumAmounts(project.expenses.map((e) => e.amount)),
  );
  if (currentFund < 0)
    throw new Error("Le budget du projet est insuffisant pour ces dépenses.");
  return { ...project, name: project.name.trim(), currentFund };
}

export function recordExpense(project: Project, expense: Expense): Project {
  if (project.status !== "en-cours")
    throw new Error("Remettez le projet en cours avant d’ajouter une dépense.");
  if (project.expenses.some((e) => e.id === expense.id))
    throw new Error("Cette dépense existe déjà.");
  return reconcileProject({
    ...project,
    expenses: [...project.expenses, expense],
  });
}

export function projectProgress(project: Project): number {
  return project.initialFund <= 0
    ? 0
    : Math.min(
        100,
        Math.max(
          0,
          ((project.savedFund ?? project.initialFund) / project.initialFund) *
            100,
        ),
      );
}
