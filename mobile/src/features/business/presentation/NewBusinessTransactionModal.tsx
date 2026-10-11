import CreationModal from "../../../shared/ui/CreationModal";
import { useServices } from "../../../composition/ServicesProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
import { parseAmount } from "../../budget/domain/budget";
import {
  calendarDate,
  requiredText,
  today,
} from "../../../shared/domain/form-validation";
type Props = { close(): void; saved(): void };
export default function NewBusinessTransactionModal(props: Props) {
  const { business } = useServices();
  const { t } = usePreferences();
  return (
    <CreationModal
      {...props}
      title={t("newBusinessTransaction")}
      fields={[
        {
          key: "type",
          label: t("transactionType"),
          options: [
            { value: "income", label: t("income") },
            { value: "expense", label: t("expenses") },
          ],
        },
        { key: "amount", label: t("amount"), amount: true },
        { key: "category", label: t("category") },
        {
          key: "description",
          label: t("transactionDescription"),
          maxLength: 500,
        },
        { key: "date", label: t("date"), initial: today(), date: true },
      ]}
      submit={(values) =>
        business.create({
          type: values.type === "income" ? "income" : "expense",
          amount: parseAmount(values.amount),
          category: requiredText(values.category, t("category")),
          description: requiredText(
            values.description,
            t("transactionDescription"),
            500,
          ),
          date: calendarDate(values.date, t("date"))!,
        })
      }
    />
  );
}
