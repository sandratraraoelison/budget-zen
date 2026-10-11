import { AppState } from "react-native";
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
    const refresh = () => {
      if (running || controller.signal.aborted) return;
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
        });
    };
    refresh();
    const timer = setInterval(() => {
      if (AppState.currentState === "active") refresh();
    }, 15000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      controller.abort();
      clearInterval(timer);
      subscription.remove();
    };
  }, [load, revision]);
  return { data, error, loading, reload };
}
