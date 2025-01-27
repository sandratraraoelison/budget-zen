import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { BudgetProvider } from "@/context/BudgetProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BudgetZen",
  description: "Gestion de budget intelligente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <BudgetProvider>{children}</BudgetProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
