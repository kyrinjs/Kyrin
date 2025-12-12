/**
 * Kyrin Database - Query Builder
 * Chainable query builder for minimal SQL API
 */

import type { RunResult } from "./types";
import type { SQLiteClient } from "./clients/sqlite";

/**
 * Chainable query builder for minimal API
 * @example
 * ```typescript
 * db.sql`SELECT * FROM users WHERE age > ${18}`.all();
 * db.sql`SELECT * FROM users WHERE id = ${id}`.first();
 * db.sql`INSERT INTO users (name) VALUES (${name})`.run();
 * ```
 */
export class QueryBuilder<T = unknown> {
  constructor(
    readonly client: SQLiteClient,
    readonly sqlQuery: string,
    readonly params: any[]
  ) {}

  /** Get all matching rows */
  all(): T[] {
    return this.client.query<T>(this.sqlQuery, this.params);
  }

  /** Get first matching row */
  first(): T | null {
    return this.client.queryOne<T>(this.sqlQuery, this.params);
  }

  /** Execute and return result info (for INSERT/UPDATE/DELETE) */
  run(): RunResult {
    return this.client.run(this.sqlQuery, this.params);
  }
}
