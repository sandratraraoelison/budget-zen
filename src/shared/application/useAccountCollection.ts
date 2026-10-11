"use client";
import { useCallback, type SetStateAction } from "react";
import { accountRequest } from "../api/client";
import {
  saveCollectionChanges,
  type Entity,
  type CollectionConfig,
} from "../api/collections";
import { useAccountResource } from "./useAccountResource";
export function useAccountCollection<T extends Entity>(
  config: CollectionConfig<T>,
) {
  const load = useCallback(
    (signal?: AbortSignal) => accountRequest<T[]>(config.path, { signal }),
    [config.path],
  );
  const resource = useAccountResource(load);
  const setItems = (update: SetStateAction<T[]>) => {
    const snapshot = resource.data;
    const task = resource.mutate(async () => {
      if (!snapshot) throw new Error("Attendez le chargement des donnees.");
      const next = typeof update === "function" ? update(snapshot) : update;
      await saveCollectionChanges(config, snapshot, next);
    });
    // Legacy Dispatch callers do not await; errors remain visible in the resource.
    void task.catch(() => {});
    return task;
  };
  return { ...resource, items: resource.data ?? [], setItems };
}
