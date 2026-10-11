"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";
import AccountMenu from "@/features/auth/components/AccountMenu";
import CurrencySelector from "@/features/settings/CurrencySelector";

const links = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/projets", label: "Projets" },
  { href: "/business", label: "Business" },
  { href: "/credit", label: "Cr\u00e9dits" },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <header className="border-b border-slate-200 bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-lg focus:bg-white focus:p-3"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-teal-800"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50">
            <Leaf size={21} aria-hidden="true" />
          </span>
          BudgetZen
        </Link>
        <nav
          aria-label="Navigation principale"
          className="order-3 flex w-full gap-1 overflow-x-auto lg:order-none lg:w-auto"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === href ? "bg-teal-50 text-teal-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <CurrencySelector />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
