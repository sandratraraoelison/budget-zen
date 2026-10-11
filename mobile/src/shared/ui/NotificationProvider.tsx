import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import type { OperationNotice } from "../application/notifying-client";

type Notice = Omit<OperationNotice, "kind"> & {
  kind: OperationNotice["kind"] | "synchronized";
  id: number;
};
type Input = Omit<Notice, "id">;
const Context = createContext<{
  notice: Notice | null;
  show: (notice: Input) => void;
  dismiss: () => void;
} | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [active, setActive] = useState(AppState.currentState === "active");
  const sequence = useRef(0);
  const show = useCallback((next: Input) => {
    setNotice({ ...next, id: ++sequence.current });
  }, []);
  const dismiss = useCallback(() => setNotice(null), []);
  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) =>
      setActive(state === "active"),
    );
    return () => listener.remove();
  }, []);
  useEffect(() => {
    if (!notice || notice.kind === "error" || !active) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [notice, active, dismiss]);
  return (
    <Context.Provider value={{ notice, show, dismiss }}>
      {children}
    </Context.Provider>
  );
}

export function useNotifications() {
  const context = useContext(Context);
  if (!context) throw new Error("NotificationProvider missing");
  return context;
}
