"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/features/settings/LocaleProvider";
import {
  subscribeNotifications,
  type Notice,
} from "@/shared/notifications/notifications";

export default function NotificationHost() {
  const { language } = useLocale();
  const [notice, setNotice] = useState<(Notice & { id: number }) | null>(null);
  const [paused, setPaused] = useState(false);
  useEffect(
    () =>
      subscribeNotifications((next) => setNotice({ ...next, id: Date.now() })),
    [],
  );
  useEffect(() => {
    if (!notice || paused || notice.kind === "error") return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice, paused]);
  const english = language === "en";
  const translations: Record<string, string> = {
    "Modifications enregistrées.": "Changes saved.",
    "Devise mise à jour.": "Currency updated.",
    "Impossible de terminer l’opération.": "Unable to complete the operation.",
  };
  return (
    <div
      className="pointer-events-none fixed inset-x-4 top-4 z-[100] mx-auto max-w-md sm:left-auto sm:right-6 sm:w-96"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        role={notice?.kind === "error" ? "alert" : "status"}
        aria-live={notice?.kind === "error" ? "assertive" : "polite"}
        aria-atomic="true"
      >
        {notice && (
          <div
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl dark:bg-slate-900 ${notice.kind === "error" ? "border-red-300 dark:border-red-800" : "border-teal-300 dark:border-teal-800"}`}
          >
            <span
              aria-hidden="true"
              className={
                notice.kind === "error" ? "text-red-600" : "text-teal-600"
              }
            >
              {notice.kind === "error" ? "!" : "✓"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {notice.kind === "error"
                  ? english
                    ? "Operation failed"
                    : "Échec de l’opération"
                  : english
                    ? "Done"
                    : "C’est fait"}
              </p>
              <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">
                {english
                  ? (translations[notice.message] ?? notice.message)
                  : notice.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label={
                english ? "Dismiss notification" : "Fermer la notification"
              }
              className="rounded-lg px-2 text-xl text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
