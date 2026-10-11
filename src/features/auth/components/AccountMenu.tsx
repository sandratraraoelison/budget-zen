"use client";
import { useLocale } from "@/features/settings/LocaleProvider";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "@headlessui/react";
import { ChevronDown, LogOut, LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthProvider";

export default function AccountMenu() {
  const { t } = useLocale();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setPending(true);
    setError("");
    try {
      await logout();
      router.replace("/");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t("Déconnexion impossible."),
      );
    } finally {
      setPending(false);
    }
  }

  const name = user?.name.trim() || t("Mon compte");
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <div className="relative shrink-0">
      <Menu>
        <Menu.Button
          aria-label={`Ouvrir le menu du compte de ${name}`}
          title={name}
          className="flex h-10 items-center gap-2 rounded-xl px-1.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-950"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="hidden max-w-24 truncate font-medium xl:block">
            {name.split(/\s+/)[0]}
          </span>
          <ChevronDown
            size={14}
            className="text-slate-400 dark:text-slate-400"
            aria-hidden="true"
          />
        </Menu.Button>
        <Menu.Items
          anchor={{ to: "bottom end", gap: 8, padding: 16 }}
          className="z-50 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="border-b border-slate-100 px-3 py-3 dark:border-slate-700">
            <p className="break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
              {name}
            </p>
            <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-300">
              {user?.email}
            </p>
          </div>
          <Menu.Item disabled={pending}>
            {({ active }) => (
              <button
                type="button"
                onClick={signOut}
                disabled={pending}
                className={`mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 disabled:opacity-50  dark:text-red-300${active ? "bg-red-50 dark:bg-red-950" : ""}`}
              >
                {pending ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <LogOut size={16} aria-hidden="true" />
                )}
                {pending ? t("Déconnexion en cours…") : t("Déconnexion")}
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
      {error && (
        <p
          role="alert"
          className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {t(error)}
        </p>
      )}
    </div>
  );
}
