"use client";

import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-white shadow-lg mb-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="text-xl font-bold text-primary">
            {" "}
            <Link href="/dashboard">BudgetZen 💰</Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/projets"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Projets
            </Link>
            <Link
              href="/business"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Business
            </Link>
            <Link
              href="/credit"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Crédit
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
