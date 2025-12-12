import type { Context } from "../context/context";

export interface KyrinConfig {
  port?: number;
  hostname?: string;
  development?: boolean;
}

/** Handler response types for auto-detection */
export type HandlerResponse = Response | object | string | null | void;

/** Route handler function */
export type Handler = (
  ctx: Context
) => HandlerResponse | Promise<HandlerResponse>;

export type LookupResult = { handler: Handler; params: Record<string, string> };

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";
