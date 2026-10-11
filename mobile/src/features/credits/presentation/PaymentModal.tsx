import { bankProjection } from "../domain/bank-loan";
import { repaymentAmount, repaymentPercent } from "../domain/repayment";
import { useRef, useState } from "react";
import { Modal, View } from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useServices } from "../../../composition/ServicesProvider";
import {
  Button,
  Choice,
  ErrorMessage,
  Field,
  Heading,
  Label,
  Screen,
} from "../../../shared/ui/components";
import DateField from "../../../shared/ui/DateField";
import NotificationHost from "../../../shared/ui/NotificationHost";
import {
  formatAmountInput,
  normalizeAmountInput,
} from "../../../shared/ui/amount-input";
import { calendarDate, today } from "../../../shared/domain/form-validation";
import { usePreferences } from "../../settings/PreferencesProvider";
import { useCurrency } from "../../settings/CurrencyProvider";
import type { Credit } from "../domain/credit";

export default function PaymentModal({
  credit,
  close,
  saved,
}: {
  credit: Credit;
  close(): void;
  saved(): void;
}) {
  const { credits } = useServices();
  const { colors, t, locale } = usePreferences();
  const { currency, formatMoney } = useCurrency();
  const [interest, setInterest] = useState("0");
  const [insurance, setInsurance] = useState("0");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const percent = repaymentPercent(credit.remainingAmount, Number(amount));
  function choose(value: number) {
    setAmount(repaymentAmount(credit.remainingAmount, value).toFixed(2));
  }
  async function save() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const value = Number(amount);
      if (
        !Number.isFinite(value) ||
        (value <= 0 &&
          !(
            credit.bankLoan &&
            value === 0 &&
            Number(interest) + Number(insurance) > 0
          )) ||
        value > credit.remainingAmount ||
        Math.abs(value * 100 - Math.round(value * 100)) > 0.00001
      )
        throw new Error(t("repaymentInvalid"));
      const paymentDate = calendarDate(date, t("date"))!;
      if (paymentDate < credit.startDate)
        throw new Error(t("invalidDateRange"));
      const interestValue = credit.bankLoan ? Number(interest) : 0;
      const insuranceValue = credit.bankLoan ? Number(insurance) : 0;
      if (
        !Number.isFinite(interestValue) ||
        !Number.isFinite(insuranceValue) ||
        interestValue < 0 ||
        insuranceValue < 0 ||
        interestValue !== Number(interestValue.toFixed(2)) ||
        insuranceValue !== Number(insuranceValue.toFixed(2))
      )
        throw new Error(t("repaymentInvalid"));
      await credits.pay(credit.id, {
        amount:
          (Math.round(value * 100) +
            Math.round(interestValue * 100) +
            Math.round(insuranceValue * 100)) /
          100,
        date: paymentDate,
        note,
        ...(credit.bankLoan
          ? { interest: interestValue, insurance: insuranceValue }
          : {}),
      });
      saved();
    } catch (error) {
      setError(error instanceof Error ? error.message : t("operationFailed"));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (!busy.current) close();
      }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Screen>
          <Heading title={t("repayment")} subtitle={credit.contact} />
          <Label>
            {t("remaining")} : {formatMoney(credit.remainingAmount)}
          </Label>
          <Label>
            {t("repaymentShare")} : {Math.round(percent)} %
          </Label>
          <Slider
            accessibilityLabel={t("repaymentShare")}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={percent}
            onValueChange={choose}
            disabled={pending}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.accent}
            style={{ height: 48 }}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[25, 50, 75, 100].map((value) => (
              <Choice
                key={value}
                title={`${value} %`}
                selected={Math.abs(percent - value) < 0.01}
                disabled={pending}
                onPress={() => choose(value)}
              />
            ))}
          </View>
          <Label muted>{t("repaymentFull")}</Label>
          <Field
            label={`${t(credit.bankLoan ? "bankCapitalPaid" : "amount")} (${currency})`}
            value={formatAmountInput(amount, locale)}
            keyboardType="decimal-pad"
            editable={!pending}
            onChangeText={(value) => setAmount(normalizeAmountInput(value))}
          />
          {credit.bankLoan && (
            <Button
              title={t("bankFillMonthly")}
              secondary
              disabled={pending}
              onPress={() => {
                const bank = credit.bankLoan!;
                const interest =
                  Math.round((credit.remainingAmount * bank.annualRate) / 12) /
                  100;
                const monthly = bankProjection(
                  credit.initialAmount,
                  bank,
                ).monthlyPayment;
                setAmount(
                  Math.min(
                    credit.remainingAmount,
                    Math.max(
                      0,
                      (Math.round(monthly * 100) -
                        Math.round(interest * 100) -
                        Math.round(bank.insuranceMonthly * 100)) /
                        100,
                    ),
                  ).toFixed(2),
                );
                setInterest(interest.toFixed(2));
                setInsurance(bank.insuranceMonthly.toFixed(2));
              }}
            />
          )}
          {credit.bankLoan && (
            <>
              <Field
                label={t("bankPaidInterest")}
                keyboardType="decimal-pad"
                value={formatAmountInput(interest, locale)}
                editable={!pending}
                onChangeText={(value) =>
                  setInterest(normalizeAmountInput(value))
                }
              />
              <Field
                label={t("bankPaidInsurance")}
                keyboardType="decimal-pad"
                value={formatAmountInput(insurance, locale)}
                editable={!pending}
                onChangeText={(value) =>
                  setInsurance(normalizeAmountInput(value))
                }
              />
              <Label>
                {t("bankPaidTotal")} :{" "}
                {formatMoney(
                  (Number(amount) || 0) +
                    (Number(interest) || 0) +
                    (Number(insurance) || 0),
                )}
              </Label>
            </>
          )}
          <DateField
            label={t("date")}
            value={date}
            onChange={setDate}
            minimum={credit.startDate}
            disabled={pending}
          />
          <Field
            label={t("repaymentNote")}
            value={note}
            onChangeText={setNote}
            maxLength={500}
            editable={!pending}
          />
          <ErrorMessage message={error} />
          <Button
            title={t("save")}
            pending={pending}
            onPress={() => void save()}
          />
          <Button
            title={t("cancel")}
            secondary
            disabled={pending}
            onPress={close}
          />
        </Screen>
        <NotificationHost inModal />
      </SafeAreaView>
    </Modal>
  );
}
