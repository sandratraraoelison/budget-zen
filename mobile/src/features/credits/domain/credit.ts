export interface Credit {
  id: string;
  contact: string;
  type: "borrowed" | "lent";
  initialAmount: number;
  remainingAmount: number;
}
export interface CreditRepository {
  list(signal?: AbortSignal): Promise<Credit[]>;
}
