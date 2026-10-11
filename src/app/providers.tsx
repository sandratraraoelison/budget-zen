"use client";

import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import type { AuthUser } from "@/features/auth/types";
import NotificationHost from "@/components/ui/NotificationHost";
import PageLoader from "@/components/PageLoader";
import PreferencesProvider from "@/features/settings/PreferencesProvider";

export default function Providers({ children, initialUser }: { children: ReactNode; initialUser: AuthUser | null }) {
  return <PreferencesProvider><AuthProvider initialUser={initialUser}>
    <Suspense fallback={null}><PageLoader /></Suspense>
    <NotificationHost />
    {children}
  </AuthProvider></PreferencesProvider>;
}
