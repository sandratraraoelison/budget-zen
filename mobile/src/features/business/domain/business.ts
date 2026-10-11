export interface BusinessAnalytics {
  totals: { revenue: number; expenses: number; profit: number };
}
export interface BusinessRepository {
  analytics(signal?: AbortSignal): Promise<BusinessAnalytics>;
}
