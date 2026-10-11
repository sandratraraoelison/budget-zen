import type { BusinessTransaction } from "../domain/business";
import CreationModal from "../../../shared/ui/CreationModal";
import { useServices } from "../../../composition/ServicesProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
import { parseAmount } from "../../budget/domain/budget";
import {
  calendarDate,
  requiredText,
  today,
} from "../../../shared/domain/form-validation";
type Props = {
  close(): void;
  saved(): void;
  transaction?: BusinessTransaction;
};
export default function NewBusinessTransactionModal(props: Props) {
  const { business } = useServices();
  const { t } = usePreferences();
  return (
    <CreationModal
      {...props}
      title={t(props.transaction ? "businessEdit" : "newBusinessTransaction")}
      fields={[
        {
          key: "type",
          label: t("transactionType"),
          initial: props.transaction?.type ?? "income",
          options: [
            { value: "income", label: t("income") },
            { value: "expense", label: t("expenses") },
          ],
        },
        {
          key: "amount",
          label: t("amount"),
          amount: true,
          initial: props.transaction ? String(props.transaction.amount) : "",
        },
        {
          key: "category",
          label: t("category"),
          initial: props.transaction?.category ?? "",
          maxLength: 100,
        },
        {
          key: "description",
          initial: props.transaction?.description ?? "",
          label: t("transactionDescription"),
          maxLength: 500,
        },
        {
          key: "date",
          label: t("date"),
          initial: props.transaction?.date.slice(0, 10) ?? today(),
          date: true,
        },
      ]}
      submit={(values) =>
        (props.transaction
          ? (input: import("../domain/business").BusinessTransactionInput) =>
              business.update(props.transaction!.id, input)
          : business.create)({
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
