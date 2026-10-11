import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/session";
import { BudgetProvider } from "@/features/budget/context/BudgetProvider";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return <BudgetProvider key={user.id} isDemo={user.isDemo}>{children}</BudgetProvider>;
}
