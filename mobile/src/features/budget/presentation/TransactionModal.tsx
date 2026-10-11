import { useState } from "react";
import { Modal, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useServices } from "../../../composition/ServicesProvider";
import {
  Button,
  ErrorMessage,
  Field,
  Label,
  Screen,
} from "../../../shared/ui/components";
import { usePreferences } from "../../settings/PreferencesProvider";
import {
  categories,
  parseAmount,
  type TransactionInput,
} from "../domain/budget";
export default function TransactionModal({
  close,
  saved,
}: {
  close(): void;
  saved(): void;
}) {
  const { budget } = useServices();
  const { colors, t } = usePreferences();
  const [type, setType] = useState<TransactionInput["type"]>("expense");
  const [category, setCategory] =
    useState<TransactionInput["category"]>("autres");
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
        description: description.trim() || category,
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
          <Label>{t("transaction")}</Label>
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
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!pending}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {categories.map((value) => (
              <Button
                key={value}
                title={t(value)}
                secondary={category !== value}
                disabled={pending}
                onPress={() => setCategory(value)}
              />
            ))}
          </View>
          <Field
            label={t("date")}
            value={date}
            onChangeText={setDate}
            editable={!pending}
            maxLength={10}
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
      </SafeAreaView>
    </Modal>
  );
}
