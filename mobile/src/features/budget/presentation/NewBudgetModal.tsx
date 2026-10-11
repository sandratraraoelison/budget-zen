import CreationModal from "../../../shared/ui/CreationModal";
import { useServices } from "../../../composition/ServicesProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
import {
  orderedCategoryChoices,
  type BudgetSummary,
  parseAmount,
  type TransactionInput,
} from "../domain/budget";
export default function NewBudgetModal(props: {
  close(): void;
  saved(): void;
  summary?: BudgetSummary | null;
}) {
  const { budget } = useServices();
  const { t } = usePreferences();
  return (
    <CreationModal
      {...props}
      title={t("newBudget")}
      fields={[
        {
          key: "category",
          label: t("category"),
          options: orderedCategoryChoices(props.summary)
            .filter(
              (option) =>
                option.value === "autres" ||
                !props.summary?.budgets.some((b) =>
                  option.custom
                    ? b.customCategoryName?.toLowerCase() ===
                      option.name.toLowerCase()
                    : b.category === option.value,
                ),
            )
            .map((option) => ({
              value: option.value,
              label: option.custom
                ? option.name
                : t(option.name as TransactionInput["category"]),
            })),
        },
        {
          key: "customCategoryName",
          label: t("categoryNameOptional"),
          maxLength: 100,
          showWhen: { field: "category", value: "autres" },
        },
        { key: "limit", label: t("budgetLimit"), amount: true },
      ]}
      submit={(values) =>
        budget.addBudget({
          category: (values.category.startsWith("custom:")
            ? "autres"
            : values.category) as TransactionInput["category"],
          limit: parseAmount(values.limit),
          ...(values.category.startsWith("custom:")
            ? { customCategoryName: values.category.slice(7) }
            : {}),
          ...(values.category === "autres" && values.customCategoryName.trim()
            ? {
                customCategoryName: values.customCategoryName
                  .trim()
                  .replace(/\s+/g, " "),
              }
            : {}),
        })
      }
    />
  );
}
