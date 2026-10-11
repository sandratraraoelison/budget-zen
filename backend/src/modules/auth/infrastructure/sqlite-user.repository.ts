import type { UserRepository } from "../application/ports";
import type { User } from "../domain/user";
import { SqliteDatabase } from "../../../infrastructure/database/sqlite-database";
import { DomainError } from "../../../shared/domain/errors";

export class SqliteUserRepository implements UserRepository {
  constructor(private readonly database: SqliteDatabase) {}
  findByEmail(email: string) {
    return this.find("email", email);
  }
  findById(id: string) {
    return this.find("id", id);
  }

  create(user: User) {
    try {
      this.database.connection
        .prepare(
          "INSERT INTO users (id, email, name, password_hash, is_demo, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .run(
          user.id,
          user.email,
          user.name,
          user.passwordHash,
          Number(user.isDemo),
          user.createdAt,
        );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed: users.email")
      ) {
        throw new DomainError("CONFLICT", "Adresse email déjà utilisée");
      }
      throw error;
    }
  }

  private find(column: "id" | "email", value: string): User | undefined {
    const row = this.database.connection
      .prepare(`SELECT * FROM users WHERE ${column} = ?`)
      .get(value);
    if (!row) return undefined;
    return {
      id: row.id as string,
      email: row.email as string,
      name: row.name as string,
      passwordHash: row.password_hash as string,
      isDemo: row.is_demo === 1,
      createdAt: row.created_at as string,
    };
  }
}
