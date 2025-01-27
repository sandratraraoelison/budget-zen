export type Payment = {
    id: string;
    amount: number;
    date: string;
    note?: string;
  };
  
  export type Credit = {
    id: string;
    type: "borrowed" | "lent";
    contact: string;
    initialAmount: number;
    remainingAmount: number;
    startDate: string;
    endDate?: string;
    payments: Payment[];
  };