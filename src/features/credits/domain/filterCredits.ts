import type { Credit, CreditStatus } from "../types";

export function filterCredits(credits: Credit[], search: string, status: CreditStatus | "all", today = new Date()) {
  return credits.filter(credit => {
    if (!credit.contact.toLowerCase().includes(search.toLowerCase())) return false;
    if (status === "all") return true;
    if (status === "paid") return credit.remainingAmount === 0;
    if (status === "unpaid") return credit.remainingAmount > 0;
    if (!credit.endDate) return false;
    const endDate = new Date(credit.endDate);
    if (status === "expired") return endDate < today;
    const days = Math.ceil((endDate.getTime() - today.getTime()) / 86400000);
    return days >= 0 && days <= 7;
  });
}
