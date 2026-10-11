"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useMemo } from "react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown, Globe2, LoaderCircle } from "lucide-react";
import { useCurrency } from "./CurrencyProvider";

export default function CurrencySelector() {
  const { t, language } = useLocale();
  const { currency, changeCurrency, loading, pending, error, reload } =
    useCurrency();
  const currencies = useMemo(() => {
    const names = new Intl.DisplayNames([language], { type: "currency" });
    return Intl.supportedValuesOf("currency").map((code) => ({
      code,
      name: names.of(code) ?? code,
    }));
  }, [language]);
  return (
    <div className="relative">
      <Listbox
        value={currency}
        disabled={loading || pending}
        onChange={(next: string) => {
          if (
            next !== currency &&
            window.confirm(
              t("Changer la devise du compte ? Les montants existants restent identiques, sans conversion."),
            )
          )
            void changeCurrency(next);
        }}
      >
        <Listbox.Button
          aria-label={t("Devise du compte : {currency}", { currency })}
          title={t("Changer la devise du compte")}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-teal-800 dark:hover:bg-teal-950"
        >
          {pending || loading ? (
            <LoaderCircle
              size={15}
              className="animate-spin text-slate-400 dark:text-slate-400"
              aria-hidden="true"
            />
          ) : (
            <Globe2 size={15} className="text-slate-400 dark:text-slate-400" aria-hidden="true" />
          )}
          {currency}
          <ChevronDown
            size={14}
            className="text-slate-400 dark:text-slate-400"
            aria-hidden="true"
          />
        </Listbox.Button>
        <Listbox.Options
          anchor={{ to: "bottom end", gap: 8, padding: 16 }}
          className="z-50 max-h-72 w-64 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900"
        >
          {currencies.map(({ code, name }) => (
            <Listbox.Option
              key={code}
              value={code}
              className={({ active }) =>
                `flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active ? "bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-300" : "text-slate-700 dark:text-slate-100"}`
              }
            >
              {({ selected }) => (
                <>
                  <span className="w-9 shrink-0 font-semibold">{code}</span>
                  <span className="min-w-0 flex-1 break-words">{name}</span>
                  {selected && (
                    <Check
                      size={16}
                      className="shrink-0 text-teal-700 dark:text-teal-300"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
      {error && (
        <p
          role="alert"
          className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {t(error)}{" "}
          <button onClick={reload} className="underline">{t("Réessayer")}</button>
        </p>
      )}
    </div>
  );
}
