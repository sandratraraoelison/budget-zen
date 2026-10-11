"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import PageLoading from "./PageLoading";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Account pages use browser preferences, charts and locale-sensitive formatting.
// Start with the same loading markup on the server and during hydration.
export default function WorkspaceReady({ children }: { children: ReactNode }) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return ready ? children : <PageLoading />;
}
