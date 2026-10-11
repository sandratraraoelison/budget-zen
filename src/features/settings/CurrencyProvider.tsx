"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { notify } from "@/shared/notifications/notifications";
import { accountRequest } from "@/shared/api/client";
import { useLocale } from "./LocaleProvider";

const CurrencyContext = createContext<{
  currency: string;
  formatMoney: (amount: number) => string;
  formatNumber: (amount: number) => string;
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
  useEffect(() => {
    const resume = () => { if (document.visibilityState === "visible") setVersion(v => v + 1); };
    const timer = window.setInterval(resume, 15000);
    window.addEventListener("focus", resume);
    return () => { clearInterval(timer); window.removeEventListener("focus", resume); };
  }, []);
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "code",
        useGrouping: true,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [currency, locale],
  );
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { useGrouping: true, maximumFractionDigits: 2 }),
    [locale],
  );
  const changeCurrency = async (next: string) => {
    setPending(true);
    try {
      const saved = await accountRequest<{ currency: string }>("settings", {
        method: "PATCH",
        body: JSON.stringify({ currency: next }),
      });
      setCurrency(saved.currency);
      notify("Devise mise à jour.");
      setError("");
    } catch (error) {
      setError((error as Error).message);
      notify((error as Error).message, "error");
    } finally {
      setPending(false);
    }
  };
  return (
    <CurrencyContext.Provider
      value={{
        currency,
        formatMoney: (amount) => formatter.format(amount),
        formatNumber: (amount) => numberFormatter.format(amount),
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
