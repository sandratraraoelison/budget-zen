import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createHttpClient } from "../shared/api/client";
import { tokenStore } from "../shared/storage/token-store";
import { createAuthRepository } from "../features/auth/infrastructure/auth-repository";
import { createBudgetRepository } from "../features/budget/infrastructure/budget-repository";
import { createProjectRepository } from "../features/projects/infrastructure/project-repository";
import { createCreditRepository } from "../features/credits/infrastructure/credit-repository";
import { createBusinessRepository } from "../features/business/infrastructure/business-repository";
import { useSession } from "../features/auth/application/useSession";
function useServicesState() {
  const [services] = useState(() => {
    let expire = () => {};
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
    const http = createHttpClient(baseUrl, tokenStore, () => expire());
    return {
      http,
      auth: createAuthRepository(http),
      budget: createBudgetRepository(http),
      projects: createProjectRepository(http),
      credits: createCreditRepository(http),
      business: createBusinessRepository(http),
      onExpired: (callback: () => void) => {
        expire = callback;
      },
    };
  });
  const session = useSession(services.auth, tokenStore);
  useEffect(() => {
    services.onExpired(session.expire);
  }, [services, session.expire]);
  return { ...services, session };
}
const Context = createContext<ReturnType<typeof useServicesState> | null>(null);
export function ServicesProvider({ children }: { children: ReactNode }) {
  const value = useServicesState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useServices() {
  const value = useContext(Context);
  if (!value) throw new Error("ServicesProvider missing");
  return value;
}
