import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { getCurrentUser } from "@/features/auth/server/session";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BudgetZen",
  applicationName: "BudgetZen",
  icons: {
    icon: { url: "/budgetzen-icon.svg", type: "image/svg+xml" },
    shortcut: "/budgetzen-icon.svg",
  },
  description: "Gestion de budget intelligente",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers initialUser={user}>{children}</Providers>
      </body>
    </html>
  );
}
