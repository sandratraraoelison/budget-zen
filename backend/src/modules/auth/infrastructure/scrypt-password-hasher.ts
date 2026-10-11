import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { PasswordHasher } from "../application/ports";

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 64, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
}

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string) {
    const salt = randomBytes(16).toString("hex");
    return `scrypt:${salt}:${(await derive(password, salt)).toString("hex")}`;
  }

  async verify(password: string, encoded: string) {
    const [algorithm, salt, hash] = encoded.split(":");
    const validFormat =
      algorithm === "scrypt" &&
      !!salt &&
      !!hash &&
      /^[a-f0-9]{128}$/.test(hash);
    const actual = await derive(
      password,
      validFormat ? salt : "invalid-user-constant-salt",
    );
    const expected = validFormat ? Buffer.from(hash, "hex") : Buffer.alloc(64);
    return timingSafeEqual(actual, expected) && validFormat;
  }
}
