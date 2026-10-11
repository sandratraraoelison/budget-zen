export const categories = [
  "salaire",
  "loyer",
  "nourriture",
  "transport",
  "santé",
  "loisirs",
  "éducation",
  "autres",
] as const;
export interface TransactionInput {
  customCategoryName?: string;
  customCategoryId?: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  category: (typeof categories)[number];
  description: string;
}
export interface Transaction extends TransactionInput {
  syncStatus?: "pending";
  id: string;
}
export interface BudgetSummary {
  creditBalance?: number;
  categoryOrder?: string[];
  hiddenCategories?: string[];
  customCategories?: {
    id: string;
    name: string;
    icon?: string;
    baseCategory?: string;
  }[];
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: Transaction[];
  budgets: {
    id: string;
    customCategoryName?: string;
    customCategoryId?: string;
    category: TransactionInput["category"];
    limit: number;
    current: number;
  }[];
}
export interface BudgetRepository {
  reorderCategories(ids: string[]): Promise<unknown>;
  createCategory(input: {
    name: string;
    icon: string;
    budget: number;
    baseCategory?: string;
  }): Promise<{ id: string }>;
  updateCategory(
    id: string,
    input: { name: string; icon: string },
  ): Promise<unknown>;
  removeCategory(id: string): Promise<unknown>;
  addBudget(input: {
    customCategoryName?: string;
    customCategoryId?: string;
    category: TransactionInput["category"];
    limit: number;
  }): Promise<unknown>;
  summary(signal?: AbortSignal): Promise<BudgetSummary>;
  addTransaction(input: TransactionInput): Promise<Transaction>;
}
export function parseAmount(input: string): number {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized))
    throw new Error(
      "Saisissez un montant positif avec deux décimales maximum.",
    );
  const amount = Number(normalized);
  if (amount <= 0 || !Number.isSafeInteger(Math.round(amount * 100)))
    throw new Error("Le montant est invalide.");
  return amount;
}

export function customCategoryNames(summary?: BudgetSummary | null): string[] {
  const names = new Map<string, string>();
  for (const name of [
    ...(summary?.customCategories ?? []).map((c) => c.name),
    ...(summary?.transactions ?? []).map((t) => t.customCategoryName),
    ...(summary?.budgets ?? []).map((b) => b.customCategoryName),
  ]) {
    const normalized = name?.trim().replace(/\s+/g, " ");
    if (normalized && !names.has(normalized.toLowerCase()))
      names.set(normalized.toLowerCase(), normalized);
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b));
}

export function orderedCategoryChoices(summary?: BudgetSummary | null) {
  const rank = (id: string) => {
    const n = summary?.categoryOrder?.indexOf(id) ?? -1;
    return n < 0 ? 10000 : n;
  };
  return [
    ...categories
      .filter((c) => !summary?.hiddenCategories?.includes(c))
      .map((c) => ({
        id: `base:${c}`,
        value: c as string,
        name: c,
        custom: false,
      })),
    ...customCategoryNames(summary).map((name) => ({
      id:
        summary?.customCategories?.find((c) => c.name === name)?.id ??
        `pending:${name}`,
      value: `custom:${name}`,
      name,
      custom: true,
    })),
  ].sort((a, b) => rank(a.id) - rank(b.id));
}
