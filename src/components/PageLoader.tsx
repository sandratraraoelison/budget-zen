"use client";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "@/features/settings/LocaleProvider";
export default function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const search = useSearchParams();
  const { language } = useLocale();
  useEffect(() => setLoading(false), [pathname, search]);
  useEffect(() => {
    const start = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      )
        return;
      const target = new URL(link.href, window.location.href);
      if (
        target.origin === window.location.origin &&
        (target.pathname !== window.location.pathname ||
          target.search !== window.location.search)
      )
        setLoading(true);
    };
    document.addEventListener("click", start, true);
    return () => document.removeEventListener("click", start, true);
  }, []);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 15000);
    return () => clearTimeout(timer);
  }, [loading]);
  if (!loading) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[90]"
    >
      <div className="h-1 animate-pulse bg-teal-600" />
      <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700"
        />
        {language === "fr" ? "Chargement de la page…" : "Loading page…"}
      </div>
    </div>
  );
}
