"use client";

import { useEffect, useRef, useState } from "react";
import { accountRequest } from "@/shared/api/client";
import type {
  BusinessAnalytics,
  BusinessTransaction,
  TimeRange,
} from "../types";

export function useBusiness(timeRange: TimeRange) {
  const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      accountRequest<BusinessTransaction[]>("business/transactions", {
        signal: controller.signal,
      }),
      accountRequest<BusinessAnalytics>(
        `business/analytics?timeRange=${timeRange}`,
        { signal: controller.signal },
      ),
    ])
      .then(([transactions, analytics]) => {
        if (!controller.signal.aborted) {
          setTransactions(transactions);
          setAnalytics(analytics);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [timeRange, revision]);
  const mutate = async (path: string, init: RequestInit) => {
    if (busy.current) throw new Error("Une opération est déjà en cours.");
    busy.current = true;
    setPending(true);
    try {
      await accountRequest(path, init);
      setRevision((r) => r + 1);
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  return {
    transactions,
    analytics,
    loading,
    error,
    pending,
    reload: () => setRevision((r) => r + 1),
    addTransaction: (transaction: Omit<BusinessTransaction, "id">) =>
      mutate("business/transactions", {
        method: "POST",
        body: JSON.stringify(transaction),
      }),
    removeTransaction: (id: string) =>
      mutate(`business/transactions/${id}`, { method: "DELETE" }),
  };
}
