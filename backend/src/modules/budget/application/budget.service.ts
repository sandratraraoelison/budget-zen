import type {
  Runtime,
  StateRepository,
} from "../../../shared/application/state-repository";
import { DomainError, required } from "../../../shared/domain/errors";
import { toMinor } from "../../../shared/domain/money";
import { validateDateRange } from "../../../shared/domain/dates";
import {
  CATEGORIES,
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

  reorderCategories(userId: string, ids: string[]) {
    return this.repository.mutate(userId, (state) => {
      const hidden = state.customCategories.flatMap((c) =>
        c.baseCategory ? [c.baseCategory] : [],
      );
      const available = [
        ...CATEGORIES.filter((c) => !hidden.includes(c)).map(
          (c) => `base:${c}`,
        ),
        ...state.customCategories.filter((c) => !c.hidden).map((c) => c.id),
      ];
      if (
        ids.length !== available.length ||
        new Set(ids).size !== ids.length ||
        ids.some((id) => !available.includes(id))
      )
        throw new DomainError(
          "CONFLICT",
          "La liste des categories a change. Actualisez avant de reordonner.",
        );
      state.categoryOrder = [...ids];
      return ids;
    });
  }
  summary(userId: string) {
    return budgetSummary(this.repository.read(userId));
  }

  addTransaction(userId: string, input: TransactionInput) {
    const transaction = this.transaction(input);
    return this.repository.mutate(userId, (state) => {
      if (input.clientId) {
        const receipt = state.syncReceipts?.find(
          (r) => r.clientId === input.clientId,
        );
        if (receipt) {
          const previous = receipt.transaction;
          if (
            [
              "amountMinor",
              "date",
              "description",
              "category",
              "type",
              "customCategoryName",
            ].some(
              (field) =>
                (field === "customCategoryName"
                  ? String(previous.customCategoryName ?? "").toLowerCase()
                  : previous[field as keyof Transaction]) !==
                (field === "customCategoryName"
                  ? String(transaction.customCategoryName ?? "").toLowerCase()
                  : transaction[field as keyof Transaction]),
            )
          )
            throw new DomainError(
              "CONFLICT",
              "Identifiant de synchronisation deja utilise.",
            );
          return transactionView(receipt.transaction);
        }
        Object.assign(
          transaction,
          this.categoryMetadata(
            state,
            input.category,
            input.customCategoryName,
          ),
        );
        (state.syncReceipts ??= []).push({
          clientId: input.clientId,
          transaction,
        });
      }
      Object.assign(
        transaction,
        this.categoryMetadata(state, input.category, input.customCategoryName),
      );
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
        {
          ...transactionView(previous),
          ...input,
          customCategoryName:
            input.customCategoryName ??
            (input.category !== undefined && input.category !== "autres"
              ? undefined
              : previous.customCategoryName),
        },
        id,
      );
      Object.assign(
        next,
        this.categoryMetadata(state, next.category, next.customCategoryName),
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
      this.uniqueCategory(
        state,
        input.category,
        undefined,
        input.customCategoryName,
      );
      const budget = {
        id: this.runtime.id(),
        category: input.category,
        limitMinor: toMinor(input.limit),
        ...this.categoryMetadata(
          state,
          input.category,
          input.customCategoryName,
        ),
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
        this.uniqueCategory(
          state,
          input.category,
          id,
          input.customCategoryName ??
            (input.category === "autres"
              ? budget.customCategoryName
              : undefined),
        );
        budget.category = input.category;
      }
      const name =
        input.customCategoryName !== undefined
          ? input.customCategoryName
          : budget.category === "autres"
            ? budget.customCategoryName
            : undefined;
      this.uniqueCategory(state, budget.category, id, name);
      delete budget.customCategoryName;
      delete budget.customCategoryId;
      Object.assign(
        budget,
        this.categoryMetadata(state, budget.category, name),
      );
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
      if (
        state.customCategories.some(
          (c) =>
            !c.hidden &&
            c.name.toLowerCase() === input.name.trim().toLowerCase(),
        )
      )
        throw new DomainError("CONFLICT", "Cette categorie existe deja.");
      if (
        input.baseCategory &&
        (input.baseCategory === "autres" ||
          state.customCategories.some(
            (c) => c.baseCategory === input.baseCategory,
          ))
      )
        throw new DomainError("CONFLICT", "Categorie deja modifiee.");
      if (!this.categoryName("autres", input.name))
        throw new DomainError("VALIDATION", "Le nom est obligatoire.");
      const category = {
        baseCategory: input.baseCategory,
        id: this.runtime.id(),
        name: this.categoryName("autres", input.name),
        icon: input.icon ?? "tag",
        budgetMinor: toMinor(input.budget, true),
        transactions: [],
        createdAt: this.runtime.now().toISOString(),
      };
      state.customCategories.push(category);
      if (input.baseCategory && state.categoryOrder)
        state.categoryOrder = state.categoryOrder.map((id) =>
          id === `base:${input.baseCategory}` ? category.id : id,
        );
      if (input.baseCategory) {
        for (const item of [...state.transactions, ...state.budgets]) {
          if (item.category === input.baseCategory) {
            item.category = "autres";
            item.customCategoryName = category.name;
            item.customCategoryId = category.id;
          }
        }
      }
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
      if (input.name !== undefined) {
        const name = this.categoryName("autres", input.name);
        if (!name)
          throw new DomainError(
            "VALIDATION",
            "Le nom de categorie est requis.",
          );
        if (
          state.customCategories.some(
            (c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase(),
          )
        )
          throw new DomainError("CONFLICT", "Cette categorie existe deja.");
        category.name = name;
        for (const item of [...state.transactions, ...state.budgets]) {
          if (item.customCategoryId === id) item.customCategoryName = name;
        }
      }
      if (input.icon !== undefined) category.icon = input.icon;
      if (input.budget !== undefined)
        category.budgetMinor = toMinor(input.budget, true);
      return required(
        budgetSummary(state).customCategories.find((c) => c.id === id),
      );
    });
  }

  removeCategory(userId: string, id: string) {
    this.repository.mutate(userId, (state) => {
      if (id.startsWith("base:")) {
        const base = id.slice(5);
        if (
          base === "autres" ||
          !CATEGORIES.includes(base as (typeof CATEGORIES)[number])
        )
          throw new DomainError("VALIDATION", "Categorie invalide.");
        if (state.customCategories.some((c) => c.baseCategory === base))
          throw new DomainError("CONFLICT", "Categorie deja modifiee.");
        state.transactions = state.transactions.map((t) =>
          t.category === base ? { ...t, category: "autres" } : t,
        );
        state.budgets = state.budgets.filter((b) => b.category !== base);
        state.customCategories.push({
          id: this.runtime.id(),
          baseCategory: base,
          hidden: true,
          name: base,
          budgetMinor: 0,
          transactions: [],
          createdAt: this.runtime.now().toISOString(),
        });
        return;
      }
      required(state.customCategories.find((c) => c.id === id));
      const removed = required(state.customCategories.find((c) => c.id === id));
      for (const transaction of state.transactions) {
        if (transaction.customCategoryId === id) {
          delete transaction.customCategoryId;
          delete transaction.customCategoryName;
          transaction.category = "autres";
        }
      }
      state.transactions.push(
        ...removed.transactions.map((t) => ({
          ...t,
          category: "autres" as const,
          customCategoryId: undefined,
          customCategoryName: undefined,
        })),
      );
      state.budgets = state.budgets.filter((b) => b.customCategoryId !== id);
      if (removed.baseCategory) {
        removed.hidden = true;
        removed.transactions = [];
      } else
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
      const linked = state.transactions.find(
        (t) => t.id === id && t.customCategoryId === categoryId,
      );
      if (linked) {
        state.transactions = state.transactions.filter((t) => t.id !== id);
        return;
      }
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
      ...(this.categoryName(input.category, input.customCategoryName)
        ? {
            customCategoryName: this.categoryName(
              input.category,
              input.customCategoryName,
            ),
          }
        : {}),
    };
  }

  private categoryName(category: string, name?: string) {
    const normalized = (name ?? "").trim().replace(/\s+/g, " ");
    if (normalized && (category !== "autres" || normalized.length > 100))
      throw new DomainError("VALIDATION", "Le nom de categorie est invalide.");
    return normalized;
  }
  private categoryMetadata(
    state: BudgetState,
    category: string,
    name?: string,
  ) {
    const normalized = this.categoryName(category, name);
    if (!normalized) return {};
    let custom = state.customCategories.find(
      (c) =>
        !c.hidden &&
        c.name.trim().replace(/\s+/g, " ").toLowerCase() ===
          normalized.toLowerCase(),
    );
    if (!custom) {
      custom = {
        id: this.runtime.id(),
        name: normalized,
        budgetMinor: 0,
        transactions: [],
        createdAt: this.runtime.now().toISOString(),
      };
      state.customCategories.push(custom);
    }
    return { customCategoryName: custom.name, customCategoryId: custom.id };
  }

  private uniqueCategory(
    state: BudgetState,
    category: string,
    exceptId?: string,
    name?: string,
  ) {
    if (
      state.budgets.some(
        (b) =>
          b.category === category &&
          b.id !== exceptId &&
          (b.customCategoryName ?? "").toLowerCase() ===
            this.categoryName(category, name).toLowerCase(),
      )
    ) {
      throw new DomainError(
        "CONFLICT",
        "Un budget existe déjà pour cette catégorie",
      );
    }
  }
}
