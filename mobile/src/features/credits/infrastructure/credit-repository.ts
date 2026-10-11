import type { HttpClient } from "../../../shared/api/client";
import type { Credit, CreditRepository } from "../domain/credit";
export const createCreditRepository = (http: HttpClient): CreditRepository => ({
  list: (signal) => http.request<Credit[]>("credits", { signal }),
});
