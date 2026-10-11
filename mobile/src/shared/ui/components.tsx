import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { usePreferences } from "../../features/settings/PreferencesProvider";
export function Label({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  const { colors } = usePreferences();
  return (
    <Text
      style={{
        color: muted ? colors.muted : colors.text,
        fontSize: muted ? 14 : 16,
        lineHeight: 24,
      }}
    >
      {children}
    </Text>
  );
}
export function Card({ children }: { children: ReactNode }) {
  const { colors } = usePreferences();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 20,
        gap: 12,
      }}
    >
      {children}
    </View>
  );
}
export function Button({
  title,
  onPress,
  pending = false,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress(): void;
  pending?: boolean;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const { colors } = usePreferences();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || pending, busy: pending }}
      disabled={disabled || pending}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: secondary ? colors.card : "#115e59",
        borderWidth: 1,
        borderColor: secondary ? colors.border : "#115e59",
        borderRadius: 12,
        padding: 14,
        minHeight: 48,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        opacity: pressed || pending || disabled ? 0.6 : 1,
      })}
    >
      {pending && (
        <ActivityIndicator color={secondary ? colors.accent : "#fff"} />
      )}
      <Text
        style={{ color: secondary ? colors.text : "#fff", fontWeight: "600" }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors } = usePreferences();
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={{
          backgroundColor: colors.card,
          color: colors.text,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 14,
          minHeight: 48,
        }}
      />
    </View>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  const { colors } = usePreferences();
  return message ? (
    <Text
      accessibilityRole="alert"
      style={{ color: colors.danger, lineHeight: 22 }}
    >
      {message}
    </Text>
  ) : null;
}
export function Screen({ children }: { children: ReactNode }) {
  const { colors } = usePreferences();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function Loading() {
  const { colors, t } = usePreferences();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <ActivityIndicator size="large" color={colors.accent} />
      <Label>{t("loading")}</Label>
    </View>
  );
}
