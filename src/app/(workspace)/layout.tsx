import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/session";
import { BudgetProvider } from "@/features/budget/context/BudgetProvider";
import { CurrencyProvider } from "@/features/settings/CurrencyProvider";
import { getAccountCurrency } from "@/features/settings/server/currency";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const currency = await getAccountCurrency();
  return (
    <CurrencyProvider key={user.id} initialCurrency={currency}>
      <BudgetProvider isDemo={user.isDemo}>{children}</BudgetProvider>
    </CurrencyProvider>
  );
}
