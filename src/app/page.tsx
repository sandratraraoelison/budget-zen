import { redirect } from "next/navigation";
import LandingPage from "@/features/auth/LandingPage";
import { getCurrentUser } from "@/features/auth/server/session";

export default async function Home() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <LandingPage />;
}
