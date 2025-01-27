"use client";
import { getCategoryLabel, TransactionCategory } from "@/utils/categorization";

const categoryColors: Record<string, string> = {
  loyer: "bg-blue-100 text-blue-800",
  nourriture: "bg-green-100 text-green-800",
  transport: "bg-yellow-100 text-yellow-800",
  loisirs: "bg-purple-100 text-purple-800",
  santé: "bg-red-100 text-red-800",
  autre: "bg-gray-100 text-gray-800",
};

export function CategoryBadge({ category }: { category: TransactionCategory }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-sm ${getCategoryStyle(category)}`}
    >
      {getCategoryLabel(category)}
    </span>
  );
}

const getCategoryStyle = (category: TransactionCategory) => {
  const styles = {
    salaire: "bg-green-100 text-green-800",
    loyer: "bg-blue-100 text-blue-800",
    nourriture: "bg-orange-100 text-orange-800",
    transport: "bg-yellow-100 text-yellow-800",
    loisirs: "bg-purple-100 text-purple-800",
    santé: "bg-red-100 text-red-800",
    éducation: "bg-indigo-100 text-indigo-800",
    autres: "bg-gray-100 text-gray-800",
  };
  return styles[category];
};
