"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MagnifyingGlass } from "react-loader-spinner";

export default function Navigation() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    window.addEventListener("beforeunload", handleStart);
    window.addEventListener("load", handleComplete);

    return () => {
      window.removeEventListener("beforeunload", handleStart);
      window.removeEventListener("load", handleComplete);
    };
  }, []);

  return (
    <nav className="bg-white shadow-lg mb-4 relative">
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute top-full left-0 w-full h-1 bg-gray-200">
          <div className="h-full bg-primary animate-loading-bar"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="text-xl font-bold text-primary">
            <Link
              href="/dashboard"
              onClick={() => setIsLoading(true)}
              className="hover:text-primary-dark transition-colors"
            >
              BudgetZen 💰
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/projets"
              onClick={() => setIsLoading(true)}
              className={`${
                pathname === "/projets"
                  ? "text-primary font-medium"
                  : "text-gray-700 hover:text-primary"
              } transition-colors`}
            >
              Projets
            </Link>
            <Link
              href="/business"
              onClick={() => setIsLoading(true)}
              className={`${
                pathname === "/business"
                  ? "text-primary font-medium"
                  : "text-gray-700 hover:text-primary"
              } transition-colors`}
            >
              Business
            </Link>
            <Link
              href="/credit"
              onClick={() => setIsLoading(true)}
              className={`${
                pathname === "/credit"
                  ? "text-primary font-medium"
                  : "text-gray-700 hover:text-primary"
              } transition-colors`}
            >
              Crédit
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay de chargement */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <MagnifyingGlass
            visible={true}
            height="80"
            width="80"
            ariaLabel="magnifying-glass-loading"
            wrapperStyle={{}}
            wrapperClass="magnifying-glass-wrapper"
            glassColor="#c0efff"
            color="#e15b64"
          />
        </div>
      )}
    </nav>
  );
}
