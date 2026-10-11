import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import * as Network from "expo-network";
import * as Crypto from "expo-crypto";
import { useNotifications } from "../shared/ui/NotificationProvider";
import {
  createNotifyingClient,
  type OperationNotice,
} from "../shared/application/notifying-client";
import { createOfflineClient } from "../shared/offline/client";
import { offlineStore } from "../shared/storage/offline-store";
import { createHttpClient } from "../shared/api/client";
import { tokenStore } from "../shared/storage/token-store";
import { createAuthRepository } from "../features/auth/infrastructure/auth-repository";
import { createBudgetRepository } from "../features/budget/infrastructure/budget-repository";
import { createProjectRepository } from "../features/projects/infrastructure/project-repository";
import { createCreditRepository } from "../features/credits/infrastructure/credit-repository";
import { createBusinessRepository } from "../features/business/infrastructure/business-repository";
import { useSession } from "../features/auth/application/useSession";
function useServicesState() {
  const { show } = useNotifications();
  const [services] = useState(() => {
    let expire = () => {};
    let showNotice: (notice: OperationNotice) => void = () => {};
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
    const network = createHttpClient(baseUrl, tokenStore, () => expire());
    const http = createOfflineClient(
      network,
      tokenStore,
      offlineStore,
      baseUrl,
      Crypto.randomUUID,
      (token) =>
        Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, token),
    );
    const commands = createNotifyingClient(
      http,
      (notice) => showNotice(notice),
      () => http.getStatus().pending,
    );
    return {
      http: { ...http, request: commands.request },
      auth: createAuthRepository(commands),
      budget: createBudgetRepository(commands),
      projects: createProjectRepository(commands),
      credits: createCreditRepository(commands),
      business: createBusinessRepository(commands),
      onNotice: (callback: (notice: OperationNotice) => void) => {
        showNotice = callback;
      },
      onExpired: (callback: () => void) => {
        expire = callback;
      },
    };
  });
  useEffect(() => {
    services.onNotice(show);
    return () => services.onNotice(() => {});
  }, [services, show]);
  useEffect(() => {
    const connected = (state: Network.NetworkState) =>
      services.http.setConnected(state.isConnected !== false);
    void Network.getNetworkStateAsync()
      .then(connected)
      .catch(() => {});
    const subscription = Network.addNetworkStateListener(connected);
    const resume = () => {
      if (AppState.currentState === "active")
        void Network.getNetworkStateAsync()
          .then(connected)
          .catch(() => {});
    };
    const foreground = AppState.addEventListener("change", resume);
    const timer = setInterval(resume, 15000);
    return () => {
      subscription.remove();
      foreground.remove();
      clearInterval(timer);
    };
  }, [services]);
  const sync = useSyncExternalStore(
    services.http.subscribe,
    services.http.getStatus,
    services.http.getStatus,
  );
  const waitingForConnection = useRef(false);
  const previousSync = useRef(sync);
  const reportedSyncError = useRef("");
  useEffect(() => {
    const previous = previousSync.current;
    previousSync.current = sync;
    if (sync.offline && sync.pending > 0) waitingForConnection.current = true;
    if (
      waitingForConnection.current &&
      previous.syncing &&
      !sync.offline &&
      !sync.syncing &&
      sync.pending === 0 &&
      sync.failed === 0
    ) {
      waitingForConnection.current = false;
      show({ kind: "synchronized" });
    }
    if (
      sync.failed > 0 &&
      sync.error &&
      sync.error !== reportedSyncError.current
    ) {
      reportedSyncError.current = sync.error;
      show({ kind: "error", message: sync.error });
    }
    if (sync.pending === 0) {
      waitingForConnection.current = false;
      reportedSyncError.current = "";
    }
  }, [sync, show]);
  const session = useSession(services.auth, tokenStore);
  useEffect(() => {
    services.onExpired(session.expire);
  }, [services, session.expire]);
  return { ...services, session, sync };
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
