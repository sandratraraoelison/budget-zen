import { isAllowedAccountRoute } from "@/shared/domain/account-routes";
import { NextRequest, NextResponse } from "next/server";
import { backendUrl, SESSION_COOKIE } from "@/features/auth/server/session";
import { isSameOrigin } from "@/features/auth/server/auth-handlers";

export const dynamic = "force-dynamic";

async function forward(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const path = params.path.join("/");
  if (!isAllowedAccountRoute(path, request.method))
    return NextResponse.json(
      { message: "Route introuvable." },
      { status: 404 },
    );
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token)
    return NextResponse.json(
      { message: "Connectez-vous pour continuer." },
      { status: 401 },
    );
  const mutation = request.method !== "GET";
  if (mutation && !isSameOrigin(request))
    return NextResponse.json({ message: "Origine invalide." }, { status: 403 });
  let body: string | undefined;
  if (mutation && request.method !== "DELETE") {
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return NextResponse.json(
        { message: "Format invalide." },
        { status: 415 },
      );
    body = await request.text();
    if (body.length > 8192)
      return NextResponse.json(
        { message: "Requête trop volumineuse." },
        { status: 413 },
      );
    try {
      JSON.parse(body);
    } catch {
      return NextResponse.json(
        { message: "Requête invalide." },
        { status: 400 },
      );
    }
  }
  try {
    const response = await fetch(
      backendUrl(`${path}${request.nextUrl.search}`),
      {
        method: request.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) {
      const messages: Record<number, string> = {
        400: "Vérifiez le montant, la devise, les dates et les champs obligatoires.",
        401: "Votre session a expiré. Reconnectez-vous.",
        404: "Cet élément n’existe plus.",
        409: "Cette opération est incompatible avec les données existantes.",
        429: "Trop de requêtes. Patientez une minute.",
      };
      return NextResponse.json(
        {
          message:
            messages[response.status] ??
            "Le service est temporairement indisponible.",
        },
        { status: messages[response.status] ? response.status : 502 },
      );
    }
    return new NextResponse(
      response.status === 204 ? null : await response.text(),
      {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { message: "Connexion au serveur impossible. Réessayez." },
      { status: 503 },
    );
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
