/**
 * Kyrin Framework
 * High-performance minimal web framework for Bun
 *
 * @example
 * ```typescript
 * import { Kyrin, Router } from "kyrin";
 *
 * const app = new Kyrin();
 * app.get("/", () => ({ message: "Hello!" }));
 * app.listen(3000);
 * ```
 */

// Core
export { Kyrin } from "./core/kyrin";
export type {
  Handler,
  HandlerResponse,
  HttpMethod,
  KyrinConfig,
  LookupResult,
} from "./core/types";

// Router
export { Router } from "./router/router";

// Context
export { Context } from "./context/context";
