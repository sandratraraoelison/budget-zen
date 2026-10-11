import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { userSchema } from "../types";

export const SESSION_COOKIE = "budgetzen_session";
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function backendUrl(path: string): string {
  const base = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3001/api/v1";
  return `${base.replace(/\/$/, "")}/${path}`;
}

export const getCurrentUser = cache(async () => {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const response = await fetch(backendUrl("auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const result = userSchema.safeParse(await response.json());
    return result.success ? result.data : null;
  } catch {
    return null;
  }
});
