"use client";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;
  description: string;
}

export default function BusinessTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  // Initial static transactions
  const staticTransactions: Transaction[] = [
    {
      id: "1",
      type: "income",
      amount: 1500,
      date: "2024-03-15",
      category: "Vente produit",
      description: "lorem ipsum dolor sit amet",
    },
    {
      id: "2",
      type: "expense",
      amount: 450,
      date: "2024-03-14",
      category: "Fournitures",
      description: "lorem ipsum dolor sit amet",
    },
    {
      id: "3",
      type: "income",
      amount: 2300,
      date: "2024-03-13",
      category: "Service client",
      description: "lorem ipsum dolor sit amet",
    },
  ];

  // Merging static and dynamic transactions
  const allTransactions = [...transactions, ...staticTransactions];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Transactions récentes</h2>
      <div className="space-y-3">
        {allTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium">{transaction.category}</p>
              <p className="text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString("fr-FR")}
                {transaction.description && ` • ${transaction.description}`}
              </p>
            </div>
            <div
              className={`text-lg ${
                transaction.type === "income"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {transaction.amount.toFixed(2)}MGA
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
