import type { AppState } from "../types";
import { TRANSACTION_CATEGORIES, getCategoryLabel } from "./categorization";
import { categoryIcon } from "./category-icons";
export function categoryOptions(
  state: AppState,
  translate: (text: string) => string,
) {
  const rank = (id: string) => {
    const n = state.categoryOrder?.indexOf(id) ?? -1;
    return n < 0 ? 10000 : n;
  };
  return [
    ...TRANSACTION_CATEGORIES.filter(
      (c) => !state.hiddenCategories?.includes(c),
    ).map((c) => ({
      id: `base:${c}`,
      value: c as string,
      label: translate(getCategoryLabel(c)),
    })),
    ...state.customCategories.map((c) => ({
      id: c.id,
      value: `custom:${c.name}`,
      label: `${categoryIcon(c.icon)} ${c.name}`,
    })),
  ].sort((a, b) => rank(a.id) - rank(b.id));
}
