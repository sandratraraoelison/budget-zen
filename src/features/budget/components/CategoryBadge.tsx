"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { categoryIcon } from "../domain/category-icons";
import { useBudget } from "../context/BudgetProvider";
import {
  getCategoryLabel,
  TransactionCategory,
} from "@/features/budget/domain/categorization";

export function CategoryBadge({
  category,
  name,
}: {
  category: TransactionCategory;
  name?: string;
}) {
  const { t } = useLocale();
  const { state } = useBudget();
  const custom = state.customCategories.find((c) => c.name === name);
  return (
    <span
      className={`px-2 py-1 rounded-full text-sm ${getCategoryStyle(category)}`}
    >
      {name
        ? `${categoryIcon(custom?.icon)} ${name}`
        : t(getCategoryLabel(category))}
    </span>
  );
}

const getCategoryStyle = (category: TransactionCategory) => {
  const styles = {
    salaire:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    loyer: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    nourriture: "bg-orange-100 text-orange-800",
    transport: "bg-yellow-100 text-yellow-800",
    loisirs: "bg-purple-100 text-purple-800",
    santé: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    éducation: "bg-indigo-100 text-indigo-800",
    autres: "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-100",
  };
  return styles[category];
};
