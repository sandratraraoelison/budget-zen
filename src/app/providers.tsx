"use client";

import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { BudgetProvider } from "@/features/budget/context/BudgetProvider";
import PageLoader from "@/components/PageLoader";

export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider><BudgetProvider>
    <Suspense fallback={null}><PageLoader /></Suspense>
    {children}
  </BudgetProvider></AuthProvider>;
}
