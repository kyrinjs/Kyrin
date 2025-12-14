/**
 * Kyrin Framework - Middleware Compose
 * Onion model execution for middleware chain
 */

import type { MiddlewareHandler } from "./types";
import type { Context } from "../context/context";

/**
 * Compose multiple middleware into single function
 *
 * Execution order:
 * mw1 before → mw2 before → handler → mw2 after → mw1 after
 */
export function compose(middlewares: MiddlewareHandler[]) {
  return async function (
    c: Context,
    handler: () => Promise<Response>
  ): Promise<Response | undefined> {
    let index = -1;
    let response: Response | undefined;

    async function dispatch(i: number): Promise<void> {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;

      if (i === middlewares.length) {
        response = await handler();
        return;
      }

      const fn = middlewares[i];
      if (fn) {
        const result = await fn(c, () => dispatch(i + 1));
        if (result instanceof Response) response = result;
      }
    }

    await dispatch(0);
    return response;
  };
}
