import DateField from "./DateField";
import { useRef, useState } from "react";
import { Modal, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePreferences } from "../../features/settings/PreferencesProvider";
import { useCurrency } from "../../features/settings/CurrencyProvider";
import {
  Button,
  Choice,
  ErrorMessage,
  Field,
  Heading,
  Label,
  Screen,
} from "./components";
import { formatAmountInput, normalizeAmountInput } from "./amount-input";
import NotificationHost from "./NotificationHost";

export interface CreationField {
  showWhen?: { field: string; value: string };
  key: string;
  label: string;
  amount?: boolean;
  date?: boolean;
  optional?: boolean;
  minimumField?: string;
  initial?: string;
  maxLength?: number;
  options?: { value: string; label: string }[];
}
export default function CreationModal({
  title,
  fields,
  submit,
  close,
  saved,
}: {
  title: string;
  fields: CreationField[];
  submit: (values: Record<string, string>) => Promise<unknown>;
  close: () => void;
  saved: () => void;
}) {
  const { colors, t, locale } = usePreferences();
  const { currency } = useCurrency();
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map((field) => [
        field.key,
        field.initial ?? field.options?.[0]?.value ?? "",
      ]),
    ),
  );
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState("");
  async function save() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      await submit(values);
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
          <Heading title={title} />
          {fields.filter(field => !field.showWhen || values[field.showWhen.field] === field.showWhen.value).map((field) =>
            field.options ? (
              <View key={field.key} style={{ gap: 8 }}>
                <Label>{field.label}</Label>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {field.options.map((option) => (
                    <Choice
                      key={option.value}
                      title={option.label}
                      selected={values[field.key] === option.value}
                      onPress={() => {
                        if (!busy.current)
                          setValues((previous) => ({
                            ...previous,
                            [field.key]: option.value,
                          }));
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : field.date ? (
              <DateField
                key={field.key}
                label={field.label}
                value={values[field.key]}
                onChange={(value) =>
                  setValues((previous) => ({ ...previous, [field.key]: value }))
                }
                disabled={pending}
                optional={field.optional}
                minimum={
                  field.minimumField ? values[field.minimumField] : undefined
                }
              />
            ) : (
              <Field
                key={field.key}
                label={
                  field.amount ? `${field.label} (${currency})` : field.label
                }
                value={
                  field.amount
                    ? formatAmountInput(values[field.key], locale)
                    : values[field.key]
                }
                onChangeText={(value) =>
                  setValues((previous) => ({
                    ...previous,
                    [field.key]: field.amount
                      ? normalizeAmountInput(value)
                      : value,
                  }))
                }
                editable={!pending}
                keyboardType={field.amount ? "decimal-pad" : "default"}
                maxLength={field.maxLength ?? (field.amount ? 24 : 100)}
              />
            ),
          )}
          <ErrorMessage message={error} />
          <Button
            title={t("save")}
            icon="checkmark-outline"
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
