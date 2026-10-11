import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { getCurrentUser } from "@/features/auth/server/session";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BudgetZen",
  description: "Gestion de budget intelligente",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers initialUser={user}>{children}</Providers>
      </body>
    </html>
  );
}
