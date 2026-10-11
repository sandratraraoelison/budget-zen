import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Field, Label } from "../../../shared/ui/components";
import { usePreferences } from "../PreferencesProvider";
import { currencyOptions } from "../domain/currencies";
export default function CurrencyPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange(value: string): void;
  disabled?: boolean;
}) {
  const { t, colors, language } = usePreferences();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const options = useMemo(() => currencyOptions(language, value), [language, value]);
  const selected = options.find((option) => option.code === value);
  return (
    <View style={{ gap: 8 }}>
      <Label>{t("currency")}</Label>
      <Button
        title={`${value} \u2014 ${selected?.name ?? value}`}
        secondary
        disabled={disabled}
        onPress={() => {
          setSearch("");
          setOpen(true);
        }}
      />
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: colors.background,
            padding: 20,
            gap: 16,
          }}
        >
          <Label>{t("currency")}</Label>
          <Field
            label={
              language === "fr" ? "Rechercher une devise" : "Search currencies"
            }
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          <FlatList
            data={options.filter((option) =>
              `${option.code} ${option.name}`
                .toLowerCase()
                .includes(search.trim().toLowerCase()),
            )}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: item.code === value }}
                onPress={() => {
                  onChange(item.code);
                  setOpen(false);
                }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor:
                    item.code === value ? colors.accentSoft : colors.background,
                }}
              >
                <Text style={{ color: colors.text }}>
                  {item.code}
                  {" \u2014 "}
                  {item.name}
                  {item.code === value ? " \u2713" : ""}
                </Text>
              </Pressable>
            )}
          />
          <Button
            title={t("cancel")}
            secondary
            onPress={() => setOpen(false)}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
