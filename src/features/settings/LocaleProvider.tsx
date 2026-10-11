"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { english } from "./translations/en";

export type Language = "fr" | "en";
export function translate(message: string, language: Language, values: Record<string, string | number> = {}): string {
  const translated = language === "fr" ? message : english[message] ?? message;
  return translated.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}

const LocaleContext = createContext({
  language: "fr" as Language,
  locale: "fr-FR",
  changeLanguage: (_language: Language) => {},
  t: (message: string, values?: Record<string, string | number>) => translate(message, "fr", values),
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("budgetzen-language");
      if (saved === "en" || saved === "fr") setLanguage(saved);
    } catch { /* Browser storage can be unavailable. */ }
    const sync = (event: StorageEvent) => {
      if (event.key === "budgetzen-language") setLanguage(event.newValue === "en" ? "en" : "fr");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  function changeLanguage(next: Language) {
    setLanguage(next);
    try { localStorage.setItem("budgetzen-language", next); } catch { /* Keep the in-memory preference. */ }
  }
  return <LocaleContext.Provider value={{ language, locale: language === "fr" ? "fr-FR" : "en-US", changeLanguage, t: (message, values) => translate(message, language, values) }}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }
