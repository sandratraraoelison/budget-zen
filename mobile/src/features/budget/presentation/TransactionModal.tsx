import DateField from "../../../shared/ui/DateField";
import NotificationHost from "../../../shared/ui/NotificationHost";
import {
  formatAmountInput,
  normalizeAmountInput,
} from "../../../shared/ui/amount-input";
import { useState } from "react";
import { Modal, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useServices } from "../../../composition/ServicesProvider";
import {
  Button,
  Choice,
  Heading,
  ErrorMessage,
  Field,
  Screen,
} from "../../../shared/ui/components";
import { usePreferences } from "../../settings/PreferencesProvider";
import {
  orderedCategoryChoices,
  type BudgetSummary,
  parseAmount,
  type TransactionInput,
} from "../domain/budget";
export default function TransactionModal({
  close,
  saved,
  summary,
}: {
  summary?: BudgetSummary | null;
  close(): void;
  saved(): void;
}) {
  const { budget } = useServices();
  const { colors, t, locale } = usePreferences();
  const [type, setType] = useState<TransactionInput["type"]>("expense");
  const [category, setCategory] =
    useState<TransactionInput["category"]>("autres");
  const [customName, setCustomName] = useState("");
  const [selectedCustom, setSelectedCustom] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const today = new Date();
  const [date, setDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    if (pending) return;
    setError("");
    try {
      const value = parseAmount(amount);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date
      )
        throw new Error("Date invalide / Invalid date");
      setPending(true);
      await budget.addTransaction({
        type,
        category,
        amount: value,
        date,
        description:
          description.trim() ||
          (category === "autres" ? customName.trim() : "") ||
          category,
        ...(category === "autres" && customName.trim()
          ? { customCategoryName: customName.trim().replace(/\s+/g, " ") }
          : {}),
      });
      saved();
    } catch (error) {
      setError((error as Error).message);
      setPending(false);
    }
  }
  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (!pending) close();
      }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Screen>
          <Heading title={t("transaction")} subtitle={t("transactionHint")} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["expense", "income"] as const).map((value) => (
              <View key={value} style={{ flex: 1 }}>
                <Button
                  title={t(value === "income" ? "income" : "expenses")}
                  disabled={pending}
                  secondary={type !== value}
                  onPress={() => setType(value)}
                />
              </View>
            ))}
          </View>
          <Field
            label={t("amount")}
            value={formatAmountInput(amount, locale)}
            onChangeText={(text) => {
              const raw = normalizeAmountInput(text);
              if (/^\d*(\.\d*)?$/.test(raw)) setAmount(raw);
            }}
            keyboardType="decimal-pad"
            editable={!pending}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {orderedCategoryChoices(summary).map((option) => (
              <Choice
                key={option.id}
                title={
                  option.custom
                    ? option.name
                    : t(option.name as TransactionInput["category"])
                }
                selected={
                  option.custom
                    ? selectedCustom && customName === option.name
                    : category === option.value && !selectedCustom
                }
                disabled={pending}
                onPress={() => {
                  setCategory(
                    option.custom
                      ? "autres"
                      : (option.value as TransactionInput["category"]),
                  );
                  setCustomName(option.custom ? option.name : "");
                  setSelectedCustom(option.custom);
                }}
              />
            ))}
          </View>
          {category === "autres" && !selectedCustom && (
            <Field
              label={t("categoryNameOptional")}
              value={customName}
              onChangeText={setCustomName}
              editable={!pending}
              maxLength={100}
              placeholder={t("categoryNameHint")}
            />
          )}
          <DateField
            label={t("date")}
            value={date}
            onChange={setDate}
            disabled={pending}
          />
          <Field
            label={t("description")}
            value={description}
            onChangeText={setDescription}
            editable={!pending}
            maxLength={500}
          />
          <ErrorMessage message={error} />
          <Button
            title={t("save")}
            pending={pending}
            onPress={() => void submit()}
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
