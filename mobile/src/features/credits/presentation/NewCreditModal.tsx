import { validateBankLoan } from "../domain/bank-loan";
import type { Credit } from "../domain/credit";
import CreationModal from "../../../shared/ui/CreationModal";
import { useServices } from "../../../composition/ServicesProvider";
import { usePreferences } from "../../settings/PreferencesProvider";
import { parseAmount } from "../../budget/domain/budget";
import {
  calendarDate,
  requiredText,
  today,
} from "../../../shared/domain/form-validation";
type Props = { close(): void; saved(): void; credit?: Credit };
export default function NewCreditModal(props: Props) {
  const { credits } = useServices();
  const { t } = usePreferences();
  return (
    <CreationModal
      {...props}
      title={t(props.credit ? "bankEdit" : "newCredit")}
      fields={[
        ...(props.credit?.bankLoan
          ? []
          : [
              {
                key: "type",
                label: t("creditType"),
                initial: "borrowed",
                options: [
                  { value: "bank", label: t("bankCredit") },
                  { value: "borrowed", label: t("borrowed") },
                  { value: "lent", label: t("lent") },
                ],
              },
            ]),
        { key: "contact", label: t("contact"), initial: props.credit?.contact },
        {
          key: "initialAmount",
          label: t("amount"),
          amount: true,
          initial: props.credit
            ? String(props.credit.initialAmount)
            : undefined,
        },
        {
          key: "startDate",
          label: t("startDate"),
          initial: props.credit?.startDate ?? today(),
          date: true,
        },
        {
          key: "endDate",
          initial: props.credit?.endDate,
          label: t("endDate"),
          date: true,
          optional: true,
          minimumField: "startDate",
        },
        ...[
          {
            key: "rateType",
            label: t("bankRateType"),
            initial: props.credit?.bankLoan?.rateType ?? "fixed",
            options: [
              { value: "fixed", label: t("bankFixed") },
              { value: "variable", label: t("bankVariable") },
              { value: "revolving", label: t("bankRevolving") },
            ],
          },
          {
            key: "annualRate",
            label: t("bankAnnualRate"),
            initial: String(props.credit?.bankLoan?.annualRate ?? 0),
            amount: true,
          },
          {
            key: "termMonths",
            label: t("bankTerm"),
            initial: String(props.credit?.bankLoan?.termMonths ?? 12),
            amount: true,
          },
          {
            key: "firstPaymentDate",
            label: t("bankFirstDate"),
            initial: props.credit?.bankLoan?.firstPaymentDate ?? today(),
            date: true,
            minimumField: "startDate",
          },
          {
            key: "insuranceMonthly",
            label: t("bankInsurance"),
            initial: String(props.credit?.bankLoan?.insuranceMonthly ?? 0),
            amount: true,
          },
          {
            key: "fees",
            label: t("bankFees"),
            initial: String(props.credit?.bankLoan?.fees ?? 0),
            amount: true,
          },
          {
            key: "reference",
            label: t("bankReference"),
            initial: props.credit?.bankLoan?.reference ?? "",
          },
        ].map((field) => ({
          ...field,
          ...(props.credit?.bankLoan
            ? {}
            : { showWhen: { field: "type", value: "bank" } }),
        })),
        {
          key: "creditLimit",
          label: t("bankLimit"),
          initial: props.credit?.bankLoan?.creditLimit
            ? String(props.credit.bankLoan.creditLimit)
            : "",
          amount: true,
          showWhen: { field: "rateType", value: "revolving" },
        },
      ]}
      submit={(values) => {
        const startDate = calendarDate(values.startDate, t("startDate"))!;
        const endDate = calendarDate(values.endDate, t("endDate"), true);
        if (endDate && endDate < startDate)
          throw new Error(t("invalidDateRange"));
        const bank = values.type === "bank" || !!props.credit?.bankLoan;
        const bankLoan = bank
          ? {
              rateType: values.rateType as "fixed" | "variable" | "revolving",
              annualRate: Number(values.annualRate),
              termMonths: Number(values.termMonths),
              firstPaymentDate: calendarDate(
                values.firstPaymentDate,
                t("bankFirstDate"),
              )!,
              insuranceMonthly: Number(values.insuranceMonthly),
              fees: Number(values.fees),
              reference: values.reference,
              ...(values.rateType === "revolving"
                ? { creditLimit: Number(values.creditLimit) }
                : {}),
            }
          : undefined;
        if (bankLoan)
          validateBankLoan(
            bankLoan,
            parseAmount(values.initialAmount),
            startDate,
          );
        const input = {
          ...(bankLoan ? { bankLoan } : {}),
          contact: requiredText(values.contact, t("contact")),
          initialAmount: parseAmount(values.initialAmount),
          type:
            values.type === "lent" ? ("lent" as const) : ("borrowed" as const),
          startDate,
          ...(endDate ? { endDate } : {}),
        };
        return props.credit
          ? credits.update(props.credit.id, input)
          : credits.create(input);
      }}
    />
  );
}
