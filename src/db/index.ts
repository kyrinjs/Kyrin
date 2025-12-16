/**
 * Kyrin Database Module
 */

// Unified Database
export { Database, database } from "./database";
export type { SyncOptions } from "./database";

// Clients
export { SQLiteClient } from "./clients/sqlite";

// Query Builder
export { QueryBuilder } from "./query-builder";

// Types
export type {
  SQLiteConfig,
  DatabaseConfig,
  DatabaseClient,
  DatabaseType,
  RunResult,
  PreparedStatement,
  TransactionFn,
} from "./types";
