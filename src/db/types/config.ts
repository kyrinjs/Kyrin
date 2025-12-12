/**
 * Kyrin Database - Configuration Types
 */

import type { Database } from "bun:sqlite";

// ==================== SQLite Config ====================

/** SQLite configuration options */
export interface SQLiteConfig {
  /** Path to database file (default: ":memory:") */
  filename?: string;
  /** Read-only mode (default: false) */
  readonly?: boolean;
  /** Create file if not exists (default: true) */
  create?: boolean;
  /** Enable WAL mode for performance (default: true) */
  wal?: boolean;
}

/** SQLite config with type discriminator */
export interface SQLiteDatabaseConfig extends SQLiteConfig {
  type: "sqlite";
}

// ==================== PostgreSQL Config (Future) ====================

export interface PostgresDatabaseConfig {
  type: "postgres";
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

// ==================== MySQL Config (Future) ====================

export interface MySQLDatabaseConfig {
  type: "mysql";
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

// ==================== Unified Config ====================

/** Supported database types */
export type DatabaseType = "sqlite" | "postgres" | "mysql";

/** Unified database configuration */
export type DatabaseConfig =
  | SQLiteDatabaseConfig
  | PostgresDatabaseConfig
  | MySQLDatabaseConfig;

// ==================== Internal Types ====================

export type NativeDatabase = Database;
