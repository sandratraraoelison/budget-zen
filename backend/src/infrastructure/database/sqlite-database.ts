import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { migrations } from "./migrations";

export class SqliteDatabase {
  readonly connection: DatabaseSync;

  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.connection = new DatabaseSync(path);
    this.connection.exec(
      "PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;",
    );
    this.migrate();
  }

  transaction<Result>(work: () => Result): Result {
    this.connection.exec("BEGIN IMMEDIATE");
    try {
      const result = work();
      this.connection.exec("COMMIT");
      return result;
    } catch (error) {
      this.connection.exec("ROLLBACK");
      throw error;
    }
  }

  onApplicationShutdown() {
    this.connection.close();
  }

  private migrate() {
    this.connection.exec(
      "CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)",
    );
    for (const migration of migrations) {
      this.transaction(() => {
        const applied = this.connection
          .prepare("SELECT version FROM schema_migrations WHERE version = ?")
          .get(migration.version);
        if (applied) return;
        this.connection.exec(migration.sql);
        this.connection
          .prepare("INSERT INTO schema_migrations(version) VALUES (?)")
          .run(migration.version);
      });
    }
  }
}
