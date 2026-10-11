"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { accountRequest } from "@/shared/api/client";
import { useLocale } from "./LocaleProvider";

const CurrencyContext = createContext<{
  currency: string;
  formatMoney: (amount: number) => string;
  changeCurrency: (currency: string) => Promise<void>;
  loading: boolean;
  error: string;
  pending: boolean;
  reload: () => void;
} | null>(null);

export function CurrencyProvider({
  children,
  initialCurrency = "MGA",
}: {
  children: ReactNode;
  initialCurrency?: string;
}) {
  const { locale } = useLocale();
  const [currency, setCurrency] = useState(initialCurrency);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    accountRequest<{ currency: string }>("settings", {
      signal: controller.signal,
    })
      .then((settings) => {
        if (!controller.signal.aborted) {
          setCurrency(settings.currency);
          setError("");
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [version]);
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "code",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [currency, locale],
  );
  const changeCurrency = async (next: string) => {
    setPending(true);
    try {
      const saved = await accountRequest<{ currency: string }>("settings", {
        method: "PATCH",
        body: JSON.stringify({ currency: next }),
      });
      setCurrency(saved.currency);
      setError("");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  };
  return (
    <CurrencyContext.Provider
      value={{
        currency,
        formatMoney: (amount) => formatter.format(amount),
        changeCurrency,
        loading,
        pending,
        error,
        reload: () => setVersion((v) => v + 1),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("CurrencyProvider is required.");
  return context;
}
