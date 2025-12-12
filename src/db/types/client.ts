/**
 * Kyrin Database - Client Interface
 */

import type { RunResult, PreparedStatement, TransactionFn } from "./result";

/** Database client interface - all clients must implement this */
export interface DatabaseClient {
  query<T = unknown>(sql: string, params?: any[]): T[];
  queryOne<T = unknown>(sql: string, params?: any[]): T | null;
  exec(sql: string): void;
  run(sql: string, params?: any[]): RunResult;
  prepare<T = unknown>(sql: string): PreparedStatement<T>;
  transaction<T>(fn: TransactionFn<T>): T;
  close(): void;
}
