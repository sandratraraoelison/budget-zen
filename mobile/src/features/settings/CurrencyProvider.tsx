import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useServices } from "../../composition/ServicesProvider";
import { useResource } from "../../shared/application/useResource";
import { usePreferences } from "./PreferencesProvider";
function useCurrencyState() {
  const { http } = useServices();
  const { locale } = usePreferences();
  const load = useCallback(
    (signal: AbortSignal) =>
      http.request<{ currency: string }>("settings", { signal }),
    [http],
  );
  const resource = useResource(load);
  const currency = resource.data?.currency ?? "MGA";
  async function changeCurrency(next: string) {
    await http.request("settings", {
      method: "PATCH",
      body: { currency: next.trim().toUpperCase() },
    });
    resource.reload();
  }
  const formatMoney = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  return { ...resource, currency, changeCurrency, formatMoney };
}
const Context = createContext<ReturnType<typeof useCurrencyState> | null>(null);
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const value = useCurrencyState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCurrency() {
  const value = useContext(Context);
  if (!value) throw new Error("CurrencyProvider missing");
  return value;
}
