import * as SQLite from "expo-sqlite";

const DB_NAME = "renewal-radar.db";

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get the database instance, creating it if necessary.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await runMigrations(db);
  }
  return db;
}

/**
 * Run database migrations. Uses a simple version-based approach.
 */
async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  // Create the user_version table if it doesn't exist
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const currentVersion = await getCurrentVersion(database);

  if (currentVersion < 1) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        category TEXT NOT NULL,
        billing_cycle TEXT NOT NULL,
        custom_cycle_days INTEGER,
        next_renewal_date TEXT NOT NULL,
        cancellation_notice_days INTEGER NOT NULL DEFAULT 30,
        notes TEXT,
        url TEXT,
        is_canceled INTEGER NOT NULL DEFAULT 0,
        canceled_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX idx_subscriptions_category ON subscriptions(category);
      CREATE INDEX idx_subscriptions_next_renewal ON subscriptions(next_renewal_date);
      CREATE INDEX idx_subscriptions_is_canceled ON subscriptions(is_canceled);
    `);

    await setVersion(database, 1);
  }

  if (currentVersion < 2) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Default settings
    await database.runAsync(
      "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      "cancellationReminderDays",
      "3",
    );
    await database.runAsync(
      "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      "preRenewalReminderDays",
      "7",
    );

    await setVersion(database, 2);
  }
}

async function getCurrentVersion(database: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const row = await database.getFirstAsync<{ version: number }>(
      "SELECT COALESCE(MAX(version), 0) as version FROM _migrations",
    );
    return row?.version ?? 0;
  } catch {
    return 0;
  }
}

async function setVersion(database: SQLite.SQLiteDatabase, version: number): Promise<void> {
  await database.runAsync(
    "INSERT INTO _migrations (version, applied_at) VALUES (?, ?)",
    version,
    new Date().toISOString(),
  );
}

/**
 * Reset the database (for testing/dev only).
 */
export async function resetDatabase(): Promise<void> {
  if (db) {
    db = null;
  }
  await SQLite.deleteDatabaseAsync(DB_NAME);
}
