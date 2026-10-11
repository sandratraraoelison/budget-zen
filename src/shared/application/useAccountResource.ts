"use client";
import { notify } from "../notifications/notifications";
import { useCallback, useEffect, useRef, useState } from "react";

/** Serialize writes and avoid applying a refresh started before a write. */
export function useAccountResource<T>(
  load: (signal?: AbortSignal) => Promise<T>,
  enabled = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(enabled);
  const [pending, setPending] = useState(false);
  const current = useRef<T | null>(null);
  const queue = useRef(Promise.resolve());
  const busy = useRef(0);
  const generation = useRef(0);
  const mounted = useRef(false);
  const epoch = useRef(0);
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled || busy.current) return;
      const version = generation.current;
      try {
        const result = await load(signal);
        if (
          mounted.current &&
          !signal?.aborted &&
          version === generation.current &&
          !busy.current
        ) {
          current.current = result;
          setData(result);
          setError("");
        }
      } catch (error) {
        if (
          mounted.current &&
          !signal?.aborted &&
          version === generation.current
        )
          setError((error as Error).message);
      } finally {
        if (mounted.current && !signal?.aborted) setLoading(false);
      }
    },
    [load, enabled],
  );
  useEffect(() => {
    const lifecycle = epoch;
    const refreshGeneration = generation;
    mounted.current = true;
    current.current = null;
    setData(null);
    setLoading(enabled);
    const controller = new AbortController();
    void refresh(controller.signal);
    const resume = () => {
      if (document.visibilityState === "visible")
        void refresh(controller.signal);
    };
    const timer = window.setInterval(resume, 15000);
    window.addEventListener("focus", resume);
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      mounted.current = false;
      lifecycle.current++;
      refreshGeneration.current++;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", resume);
      window.removeEventListener("online", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [refresh, enabled]);
  const mutate = (operation: (previous: T) => Promise<void>) => {
    const version = epoch.current;
    busy.current++;
    setPending(true);
    const task = queue.current.then(async () => {
      if (!mounted.current || version !== epoch.current) return;
      if (current.current === null)
        throw new Error("Attendez le chargement des donnees.");
      generation.current++;
      try {
        await operation(current.current);
      } finally {
        const result = await load();
        if (mounted.current && version === epoch.current) {
          current.current = result;
          setData(result);
        }
      }
      if (mounted.current) {
        setError("");
        notify("Modifications enregistrées.");
      }
    });
    queue.current = task
      .catch((error) => {
        if (mounted.current) {
          setError(error.message);
          notify(error.message || "Impossible de terminer l’opération.", "error");
        }
      })
      .finally(() => {
        busy.current--;
        if (mounted.current) setPending(busy.current > 0);
      });
    return task;
  };
  return {
    data,
    error,
    loading,
    pending,
    mutate,
    reload: () => void refresh(),
  };
}
