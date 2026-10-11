import { resolve } from "node:path";
import { config } from "dotenv";

export interface Environment {
  port: number;
  host: string;
  frontendOrigin: string;
  databasePath: string;
  jwtSecret: string;
  tokenLifetime: number;
  swaggerEnabled: boolean;
  demoEnabled: boolean;
}

export function loadEnvironment(): Environment {
  config({ quiet: true });
  const jwtSecret = process.env.JWT_SECRET ?? "";
  if (jwtSecret.length < 32 || jwtSecret.startsWith("replace-with-")) {
    throw new Error(
      "JWT_SECRET doit être une valeur aléatoire de 32 caractères minimum (backend/.env).",
    );
  }
  const port = Number(process.env.PORT ?? 3001);
  const tokenLifetime = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 3600);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT invalide");
  if (
    !Number.isInteger(tokenLifetime) ||
    tokenLifetime < 60 ||
    tokenLifetime > 86400
  )
    throw new Error(
      "JWT_EXPIRES_IN_SECONDS doit être compris entre 60 et 86400",
    );
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
  const origin = new URL(frontendOrigin);
  if (
    !["http:", "https:"].includes(origin.protocol) ||
    origin.origin !== frontendOrigin
  )
    throw new Error("FRONTEND_ORIGIN doit être une origine HTTP(S)");
  for (const name of ["SWAGGER_ENABLED", "DEMO_ENABLED"]) {
    if (process.env[name] && !["true", "false"].includes(process.env[name]!))
      throw new Error(`${name} doit être true ou false`);
  }
  return {
    port,
    host: process.env.HOST ?? "127.0.0.1",
    frontendOrigin,
    databasePath: resolve(
      process.env.DATABASE_PATH ?? "./data/budgetzen.sqlite",
    ),
    jwtSecret,
    tokenLifetime,
    swaggerEnabled: process.env.SWAGGER_ENABLED !== "false",
    demoEnabled: process.env.DEMO_ENABLED === "true",
  };
}
