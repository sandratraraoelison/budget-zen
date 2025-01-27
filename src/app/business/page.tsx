"use client";

import { useState } from "react";
import BusinessStats from "@/components/BusinessStats";
import BusinessChart from "@/components/BusinessChart";
import BusinessTransactions from "@/components/BusinessTransactions";
import AddBusinessTransactionModal from "@/components/AddBusinessTransactionModal";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import Navigation from "@/components/Navigation";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;
  description: string;
}

export default function BusinessPage() {
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">(
    "month"
  );
  const [customTransactions, setCustomTransactions] = useState<Transaction[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTransaction = (newTransaction: Omit<Transaction, "id">) => {
    setCustomTransactions((prev) => [
      {
        ...newTransaction,
        id: Math.random().toString(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Analytiques Business</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary flex items-center gap-2"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Ajouter Transaction
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BusinessStats timeRange={timeRange} />

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tendances financières</h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="p-2 border rounded-lg"
                >
                  <option value="month">Mensuel</option>
                  <option value="quarter">Trimestriel</option>
                  <option value="year">Annuel</option>
                </select>
              </div>
              <BusinessChart timeRange={timeRange} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <BusinessTransactions transactions={customTransactions} />
        </div>

        <AddBusinessTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddTransaction}
        />
      </div>
    </div>
  );
}
