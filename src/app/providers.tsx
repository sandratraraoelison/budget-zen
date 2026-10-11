"use client";

import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import type { AuthUser } from "@/features/auth/types";
import PageLoader from "@/components/PageLoader";

export default function Providers({ children, initialUser }: { children: ReactNode; initialUser: AuthUser | null }) {
  return <AuthProvider initialUser={initialUser}>
    <Suspense fallback={null}><PageLoader /></Suspense>
    {children}
  </AuthProvider>;
}
