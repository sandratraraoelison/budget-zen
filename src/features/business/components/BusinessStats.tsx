"use client";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

interface BusinessStat {
  title: string;
  value: string;
  change: number;
  isPositive: boolean;
  icon: React.ElementType;
}

export default function BusinessStats({ timeRange }: { timeRange: string }) {
  const stats: BusinessStat[] = [
    {
      title: "Chiffre d'affaires",
      value: "45 230Ar",
      change: 12.5,
      isPositive: true,
      icon: ArrowUpIcon,
    },
    {
      title: "Dépenses",
      value: "23 450Ar",
      change: -4.2,
      isPositive: false,
      icon: ArrowDownIcon,
    },
    {
      title: "Bénéfice net",
      value: "21 780Ar",
      change: 8.3,
      isPositive: true,
      icon: ArrowUpIcon,
    },
  ];

  return (
    <div className="space-y-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{stat.title}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
            <div
              className={`p-3 rounded-full ${
                stat.isPositive ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <stat.icon
                className={`w-6 h-6 ${
                  stat.isPositive ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm ${
                stat.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.change > 0 ? "+" : ""}
              {stat.change}%
            </span>
            <span className="text-gray-500 text-sm ml-2">
              vs période précédente
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
