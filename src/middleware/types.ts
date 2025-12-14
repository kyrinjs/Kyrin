/**
 * Kyrin Framework - Middleware Types
 * Types for middleware, hooks, and plugins
 */

import type { Context } from "../context/context";

/**
 * Middleware Handler (Onion Model)
 * Code before next() = beforeHandle
 * Code after next() = afterHandle
 */
export type MiddlewareHandler = (
  c: Context,
  next: () => Promise<void>
) => void | Response | Promise<void | Response>;

/**
 * Hook Handler (simpler than middleware)
 * Runs before request or after response
 * Return Response to stop the request
 */
export type HookHandler = (
  c: Context
) => void | Response | Promise<void | Response>;

/**
 * Plugin definition
 */
export type KyrinPlugin = {
  name: string;
  middleware?: MiddlewareHandler;
  onRequest?: HookHandler;
  onResponse?: HookHandler;
};

/**
 * Plugin factory function
 */
export type PluginFactory<T = unknown> = (options?: T) => KyrinPlugin;
