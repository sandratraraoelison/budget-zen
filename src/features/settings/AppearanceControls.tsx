"use client";
import HydratedIcon from "@/components/ui/HydratedIcon";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, type Language } from "./LocaleProvider";

export default function AppearanceControls() {
  const { resolvedTheme, setTheme } = useTheme();
  const { language, changeLanguage, t } = useLocale();
  return <div className="flex shrink-0 items-center gap-2">
    <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={t("Changer le thème clair/sombre")} title={t("Changer le thème clair/sombre")}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-950">
      <HydratedIcon icon={Moon} size={18} className="dark:hidden" aria-hidden="true" />
      <HydratedIcon icon={Sun} size={18} className="hidden dark:block" aria-hidden="true" />
    </button>
    <select value={language} onChange={event => changeLanguage(event.target.value as Language)} aria-label={t("Langue de l’application")}
      className="h-10 rounded-xl border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <option value="fr" lang="fr">FR</option><option value="en" lang="en">EN</option>
    </select>
  </div>;
}
