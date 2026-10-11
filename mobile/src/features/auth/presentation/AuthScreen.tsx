import { useState } from "react";
import { Text, View } from "react-native";
import { useServices } from "../../../composition/ServicesProvider";
import {
  Button,
  Card,
  ErrorMessage,
  Field,
  Label,
  Screen,
} from "../../../shared/ui/components";
import { usePreferences } from "../../settings/PreferencesProvider";
import { validateCredentials, type AuthMode } from "../domain/auth";
export default function AuthScreen() {
  const { session } = useServices();
  const { t, colors } = usePreferences();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    if (pending) return;
    const input = { email, password, ...(mode === "register" ? { name } : {}) };
    const validation = validateCredentials(mode, input, confirmation);
    if (validation) {
      setError(validation);
      return;
    }
    setPending(true);
    setError("");
    try {
      await session.authenticate(mode, input);
    } catch (error) {
      setError((error as Error).message);
      setPending(false);
    }
  }
  return (
    <Screen>
      <Text
        style={{
          color: colors.accent,
          fontSize: 30,
          fontWeight: "800",
          marginTop: 32,
        }}
      >
        BudgetZen
      </Text>
      <Label>{t("welcome")}</Label>
      <Card>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["login", "register"] as const).map((next) => (
            <View key={next} style={{ flex: 1 }}>
              <Button
                title={t(next)}
                secondary={next !== mode}
                disabled={pending}
                onPress={() => {
                  setMode(next);
                  setError("");
                }}
              />
            </View>
          ))}
        </View>
        {mode === "register" && (
          <Field
            label={t("name")}
            value={name}
            onChangeText={setName}
            editable={!pending}
            autoComplete="name"
            maxLength={100}
          />
        )}
        <Field
          label={t("email")}
          value={email}
          onChangeText={setEmail}
          editable={!pending}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          maxLength={254}
        />
        <Field
          label={t("password")}
          value={password}
          onChangeText={setPassword}
          editable={!pending}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          maxLength={128}
        />
        {mode === "register" && (
          <Field
            label={t("confirmation")}
            value={confirmation}
            onChangeText={setConfirmation}
            editable={!pending}
            secureTextEntry
            autoComplete="new-password"
            maxLength={128}
          />
        )}
        <ErrorMessage message={error} />
        <Button
          title={pending ? t("loading") : t(mode)}
          pending={pending}
          onPress={() => void submit()}
        />
      </Card>
    </Screen>
  );
}
