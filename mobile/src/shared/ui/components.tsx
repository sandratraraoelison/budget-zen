import { useState, type ReactNode, type ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  RefreshControl,
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
export function Card({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  const { colors } = usePreferences();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 24,
        padding: compact ? 16 : 20,
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
  icon,
}: {
  title: string;
  onPress(): void;
  pending?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  icon?: ComponentProps<typeof Ionicons>["name"];
}) {
  const { colors } = usePreferences();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || pending, busy: pending }}
      disabled={disabled || pending}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: secondary ? colors.soft : colors.primary,
        borderWidth: 1,
        borderColor: secondary ? colors.border : colors.primary,
        borderRadius: 16,
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
      {!pending && icon && (
        <Ionicons
          name={icon}
          size={18}
          color={secondary ? colors.accent : "#fff"}
        />
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
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        selectionColor={colors.accent}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={{
          backgroundColor: colors.soft,
          color: colors.text,
          borderWidth: 1,
          borderColor: focused ? colors.accent : colors.border,
          borderRadius: 16,
          padding: 14,
          minHeight: 48,
          fontSize: 16,
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
      style={{
        color: colors.danger,
        lineHeight: 22,
        padding: 14,
        backgroundColor: colors.soft,
        borderRadius: 16,
      }}
    >
      {message}
    </Text>
  ) : null;
}
export function Screen({
  children,
  onRefresh,
  refreshing = false,
}: {
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const { colors } = usePreferences();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
              progressBackgroundColor={colors.card}
            />
          ) : undefined
        }
        contentContainerStyle={{
          padding: 20,
          gap: 20,
          paddingBottom: 32,
          width: "100%",
          maxWidth: 720,
          alignSelf: "center",
        }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Heading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const { colors } = usePreferences();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          accessibilityRole="header"
          style={{
            fontSize: 20,
            fontWeight: "700",
            letterSpacing: -0.4,
            color: colors.text,
          }}
        >
          {title}
        </Text>
        {subtitle && <Label muted>{subtitle}</Label>}
      </View>
      {action}
    </View>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress(): void;
}) {
  const { colors } = usePreferences();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        height: 44,
        width: 44,
        borderRadius: 14,
        backgroundColor: colors.soft,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={icon} size={21} color={colors.accent} />
    </Pressable>
  );
}

export function ActionTile({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress(): void;
}) {
  const { colors } = usePreferences();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 88,
        padding: 12,
        borderRadius: 20,
        backgroundColor: colors.card,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={icon} size={23} color={colors.accent} />
      <Text
        style={{
          color: colors.text,
          fontSize: 13,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function EmptyState({
  title,
  description,
  icon = "folder-open-outline",
}: {
  title: string;
  description?: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
}) {
  const { colors } = usePreferences();
  return (
    <View
      style={{
        alignItems: "center",
        gap: 10,
        paddingVertical: 20,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          height: 48,
          width: 48,
          borderRadius: 16,
          backgroundColor: colors.accentSoft,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name={icon} size={24} color={colors.accent} />
      </View>
      <Text
        style={{
          color: colors.text,
          fontWeight: "600",
          textAlign: "center",
          fontSize: 15,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            color: colors.muted,
            lineHeight: 22,
            textAlign: "center",
            fontSize: 14,
          }}
        >
          {description}
        </Text>
      )}
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const { colors } = usePreferences();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(Math.max(0, Math.min(100, value * 100))),
      }}
      style={{
        height: 6,
        backgroundColor: colors.soft,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: 6,
          width: `${Math.max(0, Math.min(100, value * 100))}%`,
          backgroundColor: value > 1 ? colors.danger : colors.accent,
          borderRadius: 3,
        }}
      />
    </View>
  );
}

export function Choice({
  title,
  selected,
  onPress,
  disabled = false,
}: {
  title: string;
  selected: boolean;
  onPress(): void;
  disabled?: boolean;
}) {
  const { colors } = usePreferences();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: selected ? colors.accentSoft : colors.card,
        justifyContent: "center",
        alignItems: "center",
        opacity: pressed || disabled ? 0.6 : 1,
      })}
    >
      <Text
        style={{
          color: selected ? colors.accent : colors.muted,
          fontWeight: selected ? "700" : "500",
          fontSize: 14,
        }}
      >
        {title}
      </Text>
    </Pressable>
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
