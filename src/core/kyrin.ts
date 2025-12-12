/**
 * Kyrin Framework - Main Application Class
 * Minimal Web Framework for Bun
 */

import type {
  Handler,
  HandlerResponse,
  HttpMethod,
  KyrinConfig,
} from "./types";
import { Router } from "../router/router";
import { Context } from "../context/context";

/**
 * Kyrin Application
 * Main entry point for creating web applications
 *
 * @example
 * ```typescript
 * const app = new Kyrin();
 * app.get("/", () => ({ message: "Hello!" }));
 * app.listen(3000);
 * ```
 */
export class Kyrin {
  private router: Router;
  private config: KyrinConfig;

  constructor(config: KyrinConfig = {}) {
    this.router = new Router();
    this.config = {
      port: config.port ?? 3000,
      hostname: config.hostname ?? "localhost",
      development: config.development ?? false,
    };
  }

  // ==================== Route Methods ====================

  get(path: string, handler: Handler): this {
    this.router.get(path, handler);
    return this;
  }

  post(path: string, handler: Handler): this {
    this.router.post(path, handler);
    return this;
  }

  put(path: string, handler: Handler): this {
    this.router.put(path, handler);
    return this;
  }

  delete(path: string, handler: Handler): this {
    this.router.delete(path, handler);
    return this;
  }

  patch(path: string, handler: Handler): this {
    this.router.patch(path, handler);
    return this;
  }

  options(path: string, handler: Handler): this {
    this.router.options(path, handler);
    return this;
  }

  head(path: string, handler: Handler): this {
    this.router.head(path, handler);
    return this;
  }

  all(path: string, handler: Handler): this {
    this.router.all(path, handler);
    return this;
  }

  on(method: HttpMethod, path: string, handler: Handler): this {
    this.router.on(method, path, handler);
    return this;
  }

  // ==================== Route Groups ====================

  /**
   * Mount a router with a prefix
   * @param prefix - URL prefix for all routes in the router
   * @param router - Router instance containing routes
   *
   * @example
   * ```typescript
   * const userRouter = new Router();
   * userRouter.get("/", handler);      // GET /users
   * userRouter.get("/:id", handler);   // GET /users/:id
   *
   * app.route("/users", userRouter);
   * ```
   */
  route(prefix: string, router: Router): this {
    const routes = router.getRoutes();
    for (const route of routes) {
      this.on(route.method, `${prefix}${route.path}`, route.handler);
    }
    return this;
  }

  // ==================== Response Helpers ====================

  /**
   * Auto-detect response type and convert to Response
   * - Response → as-is
   * - object → JSON
   * - string → text/plain
   * - null/void → 204 No Content
   */
  private toResponse(result: HandlerResponse): Response {
    if (result instanceof Response) {
      return result;
    }
    if (typeof result === "string") {
      return new Response(result, {
        headers: { "Content-Type": "text/plain" },
      });
    }
    if (result === null || result === undefined) {
      return new Response(null, { status: 204 });
    }
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // ==================== Request Handler ====================

  private handleRequest(req: Request): Response | Promise<Response> {
    const method = req.method as HttpMethod;
    const url = req.url;

    // Fast path extraction (avoids new URL())
    const queryIndex = url.indexOf("?");
    const pathStart = url.indexOf("/", 8);
    const path =
      queryIndex === -1
        ? url.slice(pathStart)
        : url.slice(pathStart, queryIndex);

    const result = this.router.match(method, path);

    if (result) {
      const ctx = new Context(req, result.params);
      try {
        const handlerResult = result.handler(ctx);

        // Avoid async overhead for sync handlers
        if (handlerResult instanceof Promise) {
          return handlerResult.then((r) => this.toResponse(r));
        }
        return this.toResponse(handlerResult);
      } catch (error) {
        console.error("Handler Error:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }

  // ==================== Server ====================

  /**
   * Start the HTTP server
   * @param port - Port number (overrides config)
   */
  listen(port?: number): void {
    const finalPort = port ?? this.config.port!;
    const hostname = this.config.hostname!;

    Bun.serve({
      port: finalPort,
      hostname,
      development: this.config.development,
      fetch: (req) => this.handleRequest(req),
      error: (err) => {
        console.error("Server Error:", err);
        return new Response("Internal Server Error", { status: 500 });
      },
    });

    console.log(`🚀 Kyrin running at http://${hostname}:${finalPort}`);
  }
}
