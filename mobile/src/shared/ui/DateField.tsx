import { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { usePreferences } from "../../features/settings/PreferencesProvider";
import { Button, Label } from "./components";

function parseDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) ? date : undefined;
}
function serialize(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export default function DateField({
  label,
  value,
  onChange,
  disabled = false,
  optional = false,
  minimum,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  optional?: boolean;
  minimum?: string;
}) {
  const { colors, dark, locale, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Date());
  const minimumDate = parseDate(minimum);
  const selected = parseDate(value);
  useEffect(
    () => () => {
      if (Platform.OS === "android") void DateTimePickerAndroid.dismiss("date");
    },
    [],
  );
  function choose() {
    if (disabled) return;
    const current = selected ?? new Date();
    const initial =
      minimumDate && current < minimumDate ? minimumDate : current;
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: initial,
        mode: "date",
        minimumDate,
        positiveButton: { label: t("save") },
        negativeButton: { label: t("cancel") },
        onValueChange: (_event, date) => onChange(serialize(date)),
      });
    } else {
      setDraft(initial);
      setOpen(true);
    }
  }
  return (
    <View style={{ gap: 8 }}>
      <Label>{label}</Label>
      <Pressable
        onPress={choose}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected ? selected.toLocaleDateString(locale) : t("chooseDate")}`}
        style={({ pressed }) => ({
          minHeight: 48,
          padding: 14,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: open ? colors.accent : colors.border,
          backgroundColor: colors.soft,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        })}
      >
        <Ionicons name="calendar-outline" color={colors.accent} size={21} />
        <Text
          style={{
            color: selected ? colors.text : colors.muted,
            fontSize: 16,
            flex: 1,
          }}
        >
          {selected ? selected.toLocaleDateString(locale) : t("chooseDate")}
        </Text>
      </Pressable>
      {optional && value && (
        <Pressable
          onPress={() => {
            setOpen(false);
            onChange("");
          }}
          disabled={disabled}
          accessibilityRole="button"
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text style={{ color: colors.accent }}>{t("clearDate")}</Text>
        </Pressable>
      )}
      {open && !disabled && Platform.OS === "ios" && (
        <View style={{ gap: 10 }}>
          <DateTimePicker
            value={draft}
            mode="date"
            display="spinner"
            locale={locale}
            themeVariant={dark ? "dark" : "light"}
            minimumDate={minimumDate}
            onValueChange={(_event, date) => setDraft(date)}
          />
          <Button
            title={t("save")}
            onPress={() => {
              onChange(serialize(draft));
              setOpen(false);
            }}
          />
          <Button
            title={t("cancel")}
            secondary
            onPress={() => setOpen(false)}
          />
        </View>
      )}
    </View>
  );
}
