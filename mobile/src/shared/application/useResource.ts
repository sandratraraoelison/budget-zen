import { AppState } from "react-native";
import { subscribeResourceChanges } from "./resource-events";
import { useCallback, useEffect, useState } from "react";
export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => {
    setLoading(true);
    setError("");
    setRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let running = false;
    let refreshRequested = false;
    const refresh = () => {
      if (controller.signal.aborted) return;
      if (running) {
        refreshRequested = true;
        return;
      }
      running = true;
      load(controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) {
            setData(result);
            setError("");
          }
        })
        .catch((error) => {
          if (!controller.signal.aborted) setError(error.message);
        })
        .finally(() => {
          running = false;
          if (!controller.signal.aborted) setLoading(false);
          if (refreshRequested && !controller.signal.aborted) {
            refreshRequested = false;
            refresh();
          }
        });
    };
    refresh();
    const unsubscribe = subscribeResourceChanges(refresh);
    const timer = setInterval(() => {
      if (AppState.currentState === "active") refresh();
    }, 15000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      unsubscribe();
      controller.abort();
      clearInterval(timer);
      subscription.remove();
    };
  }, [load, revision]);
  return { data, error, loading, reload };
}
