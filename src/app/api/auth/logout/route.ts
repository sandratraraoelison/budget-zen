import { NextRequest, NextResponse } from "next/server";
import { isSameOrigin } from "@/features/auth/server/auth-handlers";
import { SESSION_COOKIE, sessionCookieOptions } from "@/features/auth/server/session";

export function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Origine de requête invalide." }, { status: 403 });
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
