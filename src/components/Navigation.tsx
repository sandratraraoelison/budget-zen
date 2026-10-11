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
    <header className="mb-4 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-teal-800"
        >
          <Leaf size={23} aria-hidden="true" />
          BudgetZen
        </Link>
        <nav
          aria-label="Navigation principale"
          className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${pathname === href ? "bg-teal-50 text-teal-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <CurrencySelector />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
