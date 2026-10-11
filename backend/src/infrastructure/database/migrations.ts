// Append migrations; never edit a version that may already be deployed.
export const migrations = [
  {
    version: 1,
    sql: `
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        is_demo INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE TABLE feature_states (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        feature TEXT NOT NULL,
        payload TEXT NOT NULL CHECK(json_valid(payload)),
        PRIMARY KEY (user_id, feature)
      );
    `,
  },
] as const;
