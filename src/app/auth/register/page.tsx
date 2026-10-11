import { redirect } from "next/navigation";
import LandingPage from "@/features/auth/LandingPage";
import { getCurrentUser } from "@/features/auth/server/session";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <LandingPage initialMode="register" />;
}
