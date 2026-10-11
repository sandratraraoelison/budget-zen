import { test } from "node:test";
import assert from "node:assert/strict";
import { SqliteDatabase } from "../src/infrastructure/database/sqlite-database";
import { SqliteStateRepository } from "../src/infrastructure/database/sqlite-state-repository";
import { SqliteUserRepository } from "../src/modules/auth/infrastructure/sqlite-user.repository";
import { DomainError } from "../src/shared/domain/errors";

test("SQLite enforces ownership, unique emails and atomic rollback", () => {
  const database = new SqliteDatabase(":memory:");
  try {
    const users = new SqliteUserRepository(database);
    users.create({
      id: "one",
      email: "one@example.com",
      name: "One",
      passwordHash: "hash",
      isDemo: false,
      createdAt: new Date().toISOString(),
    });
    assert.throws(
      () =>
        users.create({
          id: "two",
          email: "one@example.com",
          name: "Two",
          passwordHash: "hash",
          isDemo: false,
          createdAt: new Date().toISOString(),
        }),
      DomainError,
    );
    const repository = new SqliteStateRepository(database, "test", () => ({
      values: [] as number[],
    }));
    assert.throws(() =>
      repository.mutate("unknown-user", (state) => state.values.push(1)),
    );
    assert.deepEqual(repository.read("unknown-user"), { values: [] });
    repository.mutate("one", (state) => state.values.push(1));
    const detached = repository.read("one");
    detached.values.push(2);
    assert.deepEqual(repository.read("one"), { values: [1] });
    assert.throws(() =>
      repository.mutate("one", (state) => {
        state.values.push(3);
        throw new Error("failure");
      }),
    );
    assert.deepEqual(repository.read("one"), { values: [1] });
    database.connection.prepare("DELETE FROM users WHERE id = ?").run("one");
    assert.deepEqual(repository.read("one"), { values: [] });
  } finally {
    database.onApplicationShutdown();
  }
});
