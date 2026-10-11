"use client";

import {
  createContext,
  useContext,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useAccountCollection } from "@/shared/application/useAccountCollection";
import type { CollectionConfig } from "@/shared/api/collections";
import type { Credit } from "../types";

const config: CollectionConfig<Credit> = {
  path: "credits",
  body: (c) => ({
    contact: c.contact,
    initialAmount: c.initialAmount,
    type: c.type,
    startDate: c.startDate,
    ...(c.endDate ? { endDate: c.endDate } : {}),
  }),
  children: {
    path: "payments",
    items: (c) => c.payments,
    body: (p) => ({
      amount: p.amount,
      date: p.date,
      ...(p.note ? { note: p.note } : {}),
    }),
  },
};
const CreditsContext = createContext<{
  credits: Credit[];
  error: string;
  loading: boolean;
  pending: boolean;
  setCredits: (update: SetStateAction<Credit[]>) => Promise<void>;
} | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const resource = useAccountCollection(config);
  const credits = resource.items;
  const setCredits = resource.setItems;
  return (
    <CreditsContext.Provider
      value={{
        credits,
        setCredits,
        error: resource.error,
        loading: resource.loading,
        pending: resource.pending,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) throw new Error("CreditsProvider is required.");
  return context;
}
