export type CreditInput = {
  contact: string;
  initialAmount: number;
  type: "borrowed" | "lent";
  startDate: string;
  endDate?: string;
};
export interface Credit {
  id: string;
  contact: string;
  type: "borrowed" | "lent";
  initialAmount: number;
  remainingAmount: number;
}
export interface CreditRepository {
  create(input: CreditInput): Promise<unknown>;
  list(signal?: AbortSignal): Promise<Credit[]>;
}
