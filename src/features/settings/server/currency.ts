import "server-only";
import { cookies } from "next/headers";
import { backendUrl, SESSION_COOKIE } from "@/features/auth/server/session";

export async function getAccountCurrency(): Promise<string> {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const response = await fetch(backendUrl("settings"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) {
      const settings = await response.json();
      if (Intl.supportedValuesOf("currency").includes(settings.currency))
        return settings.currency;
    }
  } catch {
    /* The client retries and presents the failure in the selector. */
  }
  return "MGA";
}
