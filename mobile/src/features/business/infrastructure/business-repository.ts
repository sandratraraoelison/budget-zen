import type { HttpClient } from "../../../shared/api/client";
import type {
  BusinessAnalytics,
  BusinessRepository,
  BusinessTransaction,
} from "../domain/business";
export const createBusinessRepository = (
  http: HttpClient,
): BusinessRepository => ({
  create: (body) =>
    http.request("business/transactions", { method: "POST", body }),
  list: (signal) =>
    http.request<BusinessTransaction[]>("business/transactions", { signal }),
  update: (id, body) =>
    http.request(`business/transactions/${id}`, { method: "PATCH", body }),
  remove: (id) =>
    http.request(`business/transactions/${id}`, { method: "DELETE" }),
  analytics: (signal, period) =>
    http.request<BusinessAnalytics>(
      `business/analytics?timeRange=${period?.timeRange ?? "month"}${period?.date ? `&date=${encodeURIComponent(period.date)}` : ""}`,
      {
        signal,
      },
    ),
});
