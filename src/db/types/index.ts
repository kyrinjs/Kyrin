/**
 * Kyrin Database - Type Exports
 */

// Config types
export type {
  SQLiteConfig,
  SQLiteDatabaseConfig,
  PostgresDatabaseConfig,
  MySQLDatabaseConfig,
  DatabaseConfig,
  DatabaseType,
  NativeDatabase,
} from "./config";

// Result types
export type {
  RunResult,
  PreparedStatement,
  TransactionFn,
  NativeStatement,
} from "./result";

// Client interface
export type { DatabaseClient } from "./client";
