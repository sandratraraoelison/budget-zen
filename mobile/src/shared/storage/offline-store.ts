import * as SQLite from "expo-sqlite";
import type { JsonStore } from "../offline/store";
let database: Promise<SQLite.SQLiteDatabase> | undefined;
function open() {
  return (database ??= (async () => {
    const db = await SQLite.openDatabaseAsync("budgetzen-offline.db");
    await db.execAsync(
      "PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS offline_data (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);",
    );
    return db;
  })());
}
export const offlineStore: JsonStore = {
  async read<T>(key: string) {
    const row = await (
      await open()
    ).getFirstAsync<{ value: string }>(
      "SELECT value FROM offline_data WHERE key = ?",
      key,
    );
    return row ? (JSON.parse(row.value) as T) : null;
  },
  async write(key: string, value: unknown) {
    await (
      await open()
    ).runAsync(
      "INSERT INTO offline_data (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      key,
      JSON.stringify(value),
    );
  },
};
