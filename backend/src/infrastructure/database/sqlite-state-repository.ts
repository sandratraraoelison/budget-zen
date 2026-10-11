import type { StateRepository } from "../../shared/application/state-repository";
import { SqliteDatabase } from "./sqlite-database";

export class SqliteStateRepository<State> implements StateRepository<State> {
  constructor(
    private readonly database: SqliteDatabase,
    private readonly feature: string,
    private readonly empty: () => State,
  ) {}

  read(userId: string): State {
    const row = this.database.connection
      .prepare(
        "SELECT payload FROM feature_states WHERE user_id = ? AND feature = ?",
      )
      .get(userId, this.feature);
    return row ? (JSON.parse(row.payload as string) as State) : this.empty();
  }

  mutate<Result>(userId: string, change: (state: State) => Result): Result {
    return this.database.transaction(() => {
      const state = this.read(userId);
      const result = change(state);
      this.database.connection
        .prepare(
          `INSERT INTO feature_states (user_id, feature, payload) VALUES (?, ?, ?)
        ON CONFLICT(user_id, feature) DO UPDATE SET payload = excluded.payload`,
        )
        .run(userId, this.feature, JSON.stringify(state));
      return result;
    });
  }
}
