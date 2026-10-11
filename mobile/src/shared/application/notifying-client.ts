import type { HttpClient, RequestOptions } from "../api/client";

export type OperationNotice = {
  kind: "created" | "updated" | "deleted" | "queued" | "error";
  message?: string;
};

/** Notify only user writes, after the offline client has durably accepted them. */
export function createNotifyingClient(
  client: HttpClient,
  notify: (notice: OperationNotice) => void,
  pending: () => number,
): HttpClient {
  return {
    async request<T>(path: string, options: RequestOptions = {}) {
      const method = (options.method ?? "GET").toUpperCase();
      const write =
        !options.public &&
        ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
        !path.startsWith("auth/");
      const before = pending();
      try {
        const result = await client.request<T>(path, options);
        if (write) {
          const queued =
            pending() > before ||
            (path === "settings" && method === "PATCH" && pending() > 0) ||
            (result &&
              typeof result === "object" &&
              "syncStatus" in result &&
              result.syncStatus === "pending");
          notify({
            kind: queued
              ? "queued"
              : method === "DELETE"
                ? "deleted"
                : method === "POST"
                  ? "created"
                  : "updated",
          });
        }
        return result;
      } catch (error) {
        if (write)
          notify({
            kind: "error",
            message: error instanceof Error ? error.message : undefined,
          });
        throw error;
      }
    },
  };
}
