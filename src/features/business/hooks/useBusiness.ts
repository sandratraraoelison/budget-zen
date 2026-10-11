"use client";

import { useCallback } from "react";
import { useAccountResource } from "@/shared/application/useAccountResource";
import { accountRequest } from "@/shared/api/client";
import type {
  BusinessAnalytics,
  BusinessTransaction,
  TimeRange,
} from "../types";

export function useBusiness(timeRange: TimeRange) {
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const [transactions, analytics] = await Promise.all([
        accountRequest<BusinessTransaction[]>("business/transactions", {
          signal,
        }),
        accountRequest<BusinessAnalytics>(
          `business/analytics?timeRange=${timeRange}`,
          { signal },
        ),
      ]);
      return { transactions, analytics };
    },
    [timeRange],
  );
  const resource = useAccountResource(load);
  const transactions = resource.data?.transactions ?? [];
  const analytics = resource.data?.analytics ?? null;
  const { loading, error, pending } = resource;
  const mutate = async (path: string, init: RequestInit) => {
    await resource.mutate(async () => {
      await accountRequest(path, init);
    });
  };
  return {
    transactions,
    analytics,
    loading,
    error,
    pending,
    reload: resource.reload,
    addTransaction: (transaction: Omit<BusinessTransaction, "id">) =>
      mutate("business/transactions", {
        method: "POST",
        body: JSON.stringify(transaction),
      }),
    removeTransaction: (id: string) =>
      mutate(`business/transactions/${id}`, { method: "DELETE" }),
  };
}
