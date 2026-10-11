import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const target = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(target)) {
  console.log("backend/.env existe déjà ; configuration conservée.");
} else {
  const template = readFileSync(
    new URL("../.env.example", import.meta.url),
    "utf8",
  );
  writeFileSync(
    target,
    template.replace(
      "replace-with-a-random-secret-at-least-32-characters",
      randomBytes(48).toString("base64url"),
    ),
    { flag: "wx", mode: 0o600 },
  );
  console.log("backend/.env créé avec un secret aléatoire.");
}
