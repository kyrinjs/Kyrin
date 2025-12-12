/**
 * Kyrin Framework - Database Factory
 * Unified database with config object and connection string support
 */

import { SQLiteClient } from "./clients/sqlite";
import { QueryBuilder } from "./query-builder";
import type { DatabaseConfig, DatabaseClient } from "./types";

// ==================== Connection String Parser ====================

function parseConnectionString(connectionString: string): DatabaseConfig {
  if (connectionString.startsWith("sqlite:")) {
    const path = connectionString.slice(7);
    return {
      type: "sqlite",
      filename: path === ":memory:" ? ":memory:" : path || ":memory:",
    };
  }

  if (
    connectionString.startsWith("postgres://") ||
    connectionString.startsWith("postgresql://")
  ) {
    const url = new URL(connectionString);
    return {
      type: "postgres",
      host: url.hostname || "localhost",
      port: url.port ? parseInt(url.port) : 5432,
      database: url.pathname.slice(1) || undefined,
      username: url.username || undefined,
      password: url.password || undefined,
      ssl: url.searchParams.get("ssl") === "true",
    };
  }

  if (connectionString.startsWith("mysql://")) {
    const url = new URL(connectionString);
    return {
      type: "mysql",
      host: url.hostname || "localhost",
      port: url.port ? parseInt(url.port) : 3306,
      database: url.pathname.slice(1) || undefined,
      username: url.username || undefined,
      password: url.password || undefined,
      ssl: url.searchParams.get("ssl") === "true",
    };
  }

  throw new Error(
    `Unsupported connection string: ${connectionString}. Use sqlite:, postgres://, mysql://`
  );
}

// ==================== Database Class ====================

/**
 * Unified Database class
 * @example
 * ```typescript
 * const db = new Database({ type: "sqlite", filename: "./data.db" });
 * db.sql`SELECT * FROM users WHERE id = ${id}`.first();
 * ```
 */
export class Database implements DatabaseClient {
  private client: SQLiteClient;

  constructor(config: DatabaseConfig) {
    switch (config.type) {
      case "sqlite":
        this.client = new SQLiteClient(config);
        break;
      case "postgres":
        throw new Error("PostgreSQL support coming soon.");
      case "mysql":
        throw new Error("MySQL support coming soon.");
      default:
        throw new Error(`Unsupported database type: ${(config as any).type}`);
    }
  }

  query<T = unknown>(sql: string, params?: any[]): T[] {
    return this.client.query<T>(sql, params);
  }

  queryOne<T = unknown>(sql: string, params?: any[]): T | null {
    return this.client.queryOne<T>(sql, params);
  }

  exec(sql: string): void {
    this.client.exec(sql);
  }

  run(sql: string, params?: any[]) {
    return this.client.run(sql, params);
  }

  prepare<T = unknown>(sql: string) {
    return this.client.prepare<T>(sql);
  }

  transaction<T>(fn: () => T): T {
    return this.client.transaction(fn);
  }

  sql<T = unknown>(
    strings: TemplateStringsArray | string,
    ...values: any[]
  ): QueryBuilder<T> {
    return this.client.sql<T>(strings, ...values);
  }

  close(): void {
    this.client.close();
  }
}

// ==================== Factory Function ====================

/**
 * Create database from connection string
 * @example
 * ```typescript
 * const db = database("sqlite:./data.db");
 * const db = database("sqlite::memory:");
 * ```
 */
export function database(connectionString: string): Database {
  return new Database(parseConnectionString(connectionString));
}
