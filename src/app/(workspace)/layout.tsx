import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/session";
import { BudgetProvider } from "@/features/budget/context/BudgetProvider";
import { CurrencyProvider } from "@/features/settings/CurrencyProvider";
import { getAccountCurrency } from "@/features/settings/server/currency";
import { CreditsProvider } from "@/features/credits/context/CreditsProvider";
import WorkspaceReady from "@/components/ui/WorkspaceReady";

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
      <CreditsProvider>
        <BudgetProvider isDemo={user.isDemo}><WorkspaceReady>{children}</WorkspaceReady></BudgetProvider>
      </CreditsProvider>
    </CurrencyProvider>
  );
}
