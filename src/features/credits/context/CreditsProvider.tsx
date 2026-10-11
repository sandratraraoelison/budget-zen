"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Credit } from "../types";

const CreditsContext = createContext<{
  credits: Credit[];
  setCredits: Dispatch<SetStateAction<Credit[]>>;
} | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<Credit[]>([]);
  return (
    <CreditsContext.Provider value={{ credits, setCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) throw new Error("CreditsProvider is required.");
  return context;
}
