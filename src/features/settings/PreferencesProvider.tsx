"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "./LocaleProvider";

export default function PreferencesProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="budgetzen-theme" disableTransitionOnChange>
    <LocaleProvider>{children}</LocaleProvider>
  </ThemeProvider>;
}
