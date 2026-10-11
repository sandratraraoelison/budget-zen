"use client";

import { useMemo } from "react";
import { useCurrency } from "./CurrencyProvider";

export default function CurrencySelector() {
  const { currency, changeCurrency, loading, pending, error, reload } =
    useCurrency();
  const currencies = useMemo(() => {
    const names = new Intl.DisplayNames(["fr"], { type: "currency" });
    return Intl.supportedValuesOf("currency").map((code) => ({
      code,
      name: names.of(code) ?? code,
    }));
  }, []);
  return (
    <div className="max-w-56">
      <label className="text-xs text-slate-500" htmlFor="account-currency">
        Devise du compte
      </label>
      <select
        id="account-currency"
        value={currency}
        disabled={loading || pending}
        onChange={(event) => {
          if (
            window.confirm(
              "Changer la devise du compte ? Les montants existants restent identiques, sans conversion.",
            )
          )
            void changeCurrency(event.target.value);
        }}
        className="block w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
      >
        {currencies.map(({ code, name }) => (
          <option key={code} value={code}>
            {code} — {name}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}{" "}
          <button onClick={reload} className="underline">
            Réessayer
          </button>
        </p>
      )}
    </div>
  );
}
