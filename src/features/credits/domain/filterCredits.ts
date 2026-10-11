import type { Credit, CreditStatus } from "../types";
import { getCreditStatus } from "./credit";

export function filterCredits(
  credits: Credit[],
  search: string,
  status: CreditStatus | "all",
  today = new Date(),
) {
  return credits.filter((credit) => {
    if (!credit.contact.toLowerCase().includes(search.trim().toLowerCase()))
      return false;
    if (status === "all") return true;
    if (status === "unpaid") return credit.remainingAmount > 0;
    return getCreditStatus(credit, today) === status;
  });
}
