import type { HttpClient } from "../../../shared/api/client";
import type { Credit, CreditRepository } from "../domain/credit";
export const createCreditRepository = (http: HttpClient): CreditRepository => ({
  pay: (id, body) =>
    http.request(`credits/${encodeURIComponent(id)}/payments`, {
      method: "POST",
      body,
    }),
  update: (id, body) =>
    http.request(`credits/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),
  create: (body) => http.request("credits", { method: "POST", body }),
  list: (signal) => http.request<Credit[]>("credits", { signal }),
});
