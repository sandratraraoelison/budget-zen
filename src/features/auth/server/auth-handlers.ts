import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginSchema, registerSchema, userSchema, type AuthMode } from "../types";
import { backendUrl, SESSION_COOKIE, sessionCookieOptions } from "./session";

export function isSameOrigin(request: NextRequest) {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    // Next can normalize nextUrl's hostname to localhost. Compare the actual
    // incoming Host header so local IPs and deployed domains work correctly.
    const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? request.nextUrl.protocol.replace(":", "");
    return origin.host === request.headers.get("host") &&
      ["http", "https"].includes(protocol) && origin.protocol === `${protocol}:`;
  } catch { return false; }
}

export async function authenticate(request: NextRequest, mode: AuthMode) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Origine de requête invalide." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ message: "Format de requête invalide." }, { status: 415 });
  }
  let input: unknown;
  try {
    const body = await request.text();
    if (body.length > 4096) return NextResponse.json({ message: "Requête trop volumineuse." }, { status: 413 });
    input = JSON.parse(body);
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }
  const parsed = (mode === "login" ? loginSchema : registerSchema).safeParse(input);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Vérifiez les champs du formulaire." }, { status: 400 });

  try {
    const upstream = await fetch(backendUrl(`auth/${mode}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) {
      const messages: Record<number, string> = {
        400: "Vérifiez les informations saisies.",
        401: "Adresse email ou mot de passe incorrect.",
        409: "Cette adresse email est déjà utilisée. Connectez-vous à votre compte.",
        429: "Trop de tentatives. Patientez une minute avant de réessayer.",
      };
      return NextResponse.json({ message: messages[upstream.status] ?? "Le service est temporairement indisponible. Réessayez dans un instant." },
        { status: messages[upstream.status] ? upstream.status : 502 });
    }
    const session = z.object({ accessToken: z.string().min(1), user: userSchema }).parse(await upstream.json());
    const claims = z.object({ exp: z.number().int() }).parse(JSON.parse(Buffer.from(session.accessToken.split(".")[1], "base64url").toString()));
    const maxAge = Math.max(0, claims.exp - Math.floor(Date.now() / 1000));
    const response = NextResponse.json({ user: session.user }, { status: mode === "register" ? 201 : 200 });
    response.cookies.set(SESSION_COOKIE, session.accessToken, { ...sessionCookieOptions, maxAge });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.json({ message: "Connexion au serveur impossible. Veuillez réessayer dans un instant." }, { status: 503 });
  }
}
