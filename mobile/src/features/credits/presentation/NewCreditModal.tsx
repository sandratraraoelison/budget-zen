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
export default function NewCreditModal(props: Props) {
  const { credits } = useServices();
  const { t } = usePreferences();
  return (
    <CreationModal
      {...props}
      title={t("newCredit")}
      fields={[
        {
          key: "type",
          label: t("creditType"),
          options: [
            { value: "borrowed", label: t("borrowed") },
            { value: "lent", label: t("lent") },
          ],
        },
        { key: "contact", label: t("contact") },
        { key: "initialAmount", label: t("amount"), amount: true },
        {
          key: "startDate",
          label: t("startDate"),
          initial: today(),
          date: true,
        },
        {
          key: "endDate",
          label: t("endDate"),
          date: true,
          optional: true,
          minimumField: "startDate",
        },
      ]}
      submit={(values) => {
        const startDate = calendarDate(values.startDate, t("startDate"))!;
        const endDate = calendarDate(values.endDate, t("endDate"), true);
        if (endDate && endDate < startDate)
          throw new Error(t("invalidDateRange"));
        return credits.create({
          contact: requiredText(values.contact, t("contact")),
          initialAmount: parseAmount(values.initialAmount),
          type: values.type === "lent" ? "lent" : "borrowed",
          startDate,
          ...(endDate ? { endDate } : {}),
        });
      }}
    />
  );
}
