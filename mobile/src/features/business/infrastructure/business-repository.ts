import type { HttpClient } from "../../../shared/api/client";
import type { BusinessAnalytics, BusinessRepository } from "../domain/business";
export const createBusinessRepository = (
  http: HttpClient,
): BusinessRepository => ({
  analytics: (signal) =>
    http.request<BusinessAnalytics>("business/analytics?timeRange=month", {
      signal,
    }),
});
