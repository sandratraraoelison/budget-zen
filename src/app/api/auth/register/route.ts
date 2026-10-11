import { NextRequest } from "next/server";
import { authenticate } from "@/features/auth/server/auth-handlers";

export function POST(request: NextRequest) { return authenticate(request, "register"); }
