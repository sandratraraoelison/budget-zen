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
export default function NewProjectModal(props: Props) {
  const { projects } = useServices();
  const { t } = usePreferences();
  return (
    <CreationModal
      {...props}
      title={t("newProject")}
      fields={[
        { key: "name", label: t("projectName") },
        {
          key: "initialFund",
          label: t("initialFund"),
          amount: true,
          initial: "0",
        },
        {
          key: "startDate",
          label: t("startDate"),
          initial: today(),
          date: true,
        },
      ]}
      submit={(values) =>
        projects.create({
          name: requiredText(values.name, t("projectName")),
          initialFund: /^0+(?:[.,]0{1,2})?$/.test(values.initialFund.trim())
            ? 0
            : parseAmount(values.initialFund),
          startDate: calendarDate(values.startDate, t("startDate")),
        })
      }
    />
  );
}
