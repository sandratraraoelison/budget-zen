import type {
  Runtime,
  StateRepository,
} from "../../../shared/application/state-repository";
import { DomainError, required } from "../../../shared/domain/errors";
import { toMinor } from "../../../shared/domain/money";
import { validateDateRange } from "../../../shared/domain/dates";
import type {
  BudgetInput,
  BudgetState,
  CustomCategoryInput,
  GoalInput,
  Transaction,
  TransactionInput,
} from "../domain/models";
import { budgetSummary, transactionView } from "../domain/projections";

export class BudgetService {
  constructor(
    private readonly repository: StateRepository<BudgetState>,
    private readonly runtime: Runtime,
  ) {}

  summary(userId: string) {
    return budgetSummary(this.repository.read(userId));
  }

  addTransaction(userId: string, input: TransactionInput) {
    const transaction = this.transaction(input);
    return this.repository.mutate(userId, (state) => {
      state.transactions.unshift(transaction);
      budgetSummary(state);
      return transactionView(transaction);
    });
  }

  updateTransaction(
    userId: string,
    id: string,
    input: Partial<TransactionInput>,
  ) {
    return this.repository.mutate(userId, (state) => {
      const previous = required(state.transactions.find((t) => t.id === id));
      const next = this.transaction(
        { ...transactionView(previous), ...input },
        id,
      );
      state.transactions = state.transactions.map((t) =>
        t.id === id ? next : t,
      );
      budgetSummary(state);
      return transactionView(next);
    });
  }

  removeTransaction(userId: string, id: string) {
    this.repository.mutate(userId, (state) => {
      required(state.transactions.find((t) => t.id === id));
      state.transactions = state.transactions.filter((t) => t.id !== id);
    });
  }

  addBudget(userId: string, input: BudgetInput) {
    return this.repository.mutate(userId, (state) => {
      this.uniqueCategory(state, input.category);
      const budget = {
        id: this.runtime.id(),
        category: input.category,
        limitMinor: toMinor(input.limit),
      };
      state.budgets.push(budget);
      return required(
        budgetSummary(state).budgets.find((b) => b.id === budget.id),
      );
    });
  }

  updateBudget(userId: string, id: string, input: Partial<BudgetInput>) {
    return this.repository.mutate(userId, (state) => {
      const budget = required(state.budgets.find((b) => b.id === id));
      if (input.category !== undefined) {
        this.uniqueCategory(state, input.category, id);
        budget.category = input.category;
      }
      if (input.limit !== undefined) budget.limitMinor = toMinor(input.limit);
      return required(budgetSummary(state).budgets.find((b) => b.id === id));
    });
  }

  removeBudget(userId: string, id: string) {
    this.repository.mutate(userId, (state) => {
      required(state.budgets.find((b) => b.id === id));
      state.budgets = state.budgets.filter((b) => b.id !== id);
    });
  }

  addGoal(userId: string, input: GoalInput) {
    return this.repository.mutate(userId, (state) => {
      validateDateRange(input.deadline);
      const goal = {
        id: this.runtime.id(),
        name: input.name,
        targetMinor: toMinor(input.target),
        currentMinor: toMinor(input.current ?? 0, true),
        deadline: input.deadline,
      };
      state.savingsGoals.push(goal);
      return required(
        budgetSummary(state).savingsGoals.find((g) => g.id === goal.id),
      );
    });
  }

  updateGoal(userId: string, id: string, input: Partial<GoalInput>) {
    return this.repository.mutate(userId, (state) => {
      const goal = required(state.savingsGoals.find((g) => g.id === id));
      if (input.name !== undefined) goal.name = input.name;
      if (input.target !== undefined) goal.targetMinor = toMinor(input.target);
      if (input.current !== undefined)
        goal.currentMinor = toMinor(input.current, true);
      if (input.deadline !== undefined) {
        validateDateRange(input.deadline);
        goal.deadline = input.deadline;
      }
      return required(
        budgetSummary(state).savingsGoals.find((g) => g.id === id),
      );
    });
  }

  removeGoal(userId: string, id: string) {
    this.repository.mutate(userId, (state) => {
      required(state.savingsGoals.find((g) => g.id === id));
      state.savingsGoals = state.savingsGoals.filter((g) => g.id !== id);
    });
  }

  addCategory(userId: string, input: CustomCategoryInput) {
    return this.repository.mutate(userId, (state) => {
      const category = {
        id: this.runtime.id(),
        name: input.name,
        budgetMinor: toMinor(input.budget),
        transactions: [],
        createdAt: this.runtime.now().toISOString(),
      };
      state.customCategories.push(category);
      return required(
        budgetSummary(state).customCategories.find((c) => c.id === category.id),
      );
    });
  }

  updateCategory(
    userId: string,
    id: string,
    input: Partial<CustomCategoryInput>,
  ) {
    return this.repository.mutate(userId, (state) => {
      const category = required(
        state.customCategories.find((c) => c.id === id),
      );
      if (input.name !== undefined) category.name = input.name;
      if (input.budget !== undefined)
        category.budgetMinor = toMinor(input.budget);
      return required(
        budgetSummary(state).customCategories.find((c) => c.id === id),
      );
    });
  }

  removeCategory(userId: string, id: string) {
    this.repository.mutate(userId, (state) => {
      required(state.customCategories.find((c) => c.id === id));
      state.customCategories = state.customCategories.filter(
        (c) => c.id !== id,
      );
    });
  }

  addCategoryTransaction(
    userId: string,
    categoryId: string,
    input: TransactionInput,
  ) {
    return this.repository.mutate(userId, (state) => {
      const category = required(
        state.customCategories.find((c) => c.id === categoryId),
      );
      const transaction = this.transaction(input);
      category.transactions.push(transaction);
      budgetSummary(state);
      return transactionView(transaction);
    });
  }

  removeCategoryTransaction(userId: string, categoryId: string, id: string) {
    this.repository.mutate(userId, (state) => {
      const category = required(
        state.customCategories.find((c) => c.id === categoryId),
      );
      required(category.transactions.find((t) => t.id === id));
      category.transactions = category.transactions.filter((t) => t.id !== id);
    });
  }

  private transaction(
    input: TransactionInput,
    id = this.runtime.id(),
  ): Transaction {
    validateDateRange(input.date);
    return {
      id,
      amountMinor: toMinor(input.amount),
      date: input.date,
      description: input.description,
      category: input.category,
      type: input.type,
    };
  }

  private uniqueCategory(
    state: BudgetState,
    category: string,
    exceptId?: string,
  ) {
    if (
      state.budgets.some((b) => b.category === category && b.id !== exceptId)
    ) {
      throw new DomainError(
        "CONFLICT",
        "Un budget existe déjà pour cette catégorie",
      );
    }
  }
}
