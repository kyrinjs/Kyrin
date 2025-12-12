/**
 * Kyrin Framework - Main Entry Point
 * Minimal Web Framework for Bun
 */

import type {
  Handler,
  HandlerResponse,
  HttpMethod,
  KyrinConfig,
} from "./types";
import { Router } from "@/router/router";
import { Context } from "@/context";

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

  // ==================== Routing Methods ====================

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

  // ==================== Auto Response Detection ====================

  /**
   * Convert handler result to Response automatically
   * - Response → return as-is
   * - object → JSON response
   * - string → text response
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
    // object → JSON
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // ==================== Request Handler ====================

  private async handleRequest(req: Request): Promise<Response> {
    const method = req.method as HttpMethod;
    const url = req.url;

    /**
     * @optimize_from_1st_benchmark
     * แทนที่จะ parse URL ทั้งหมด แค่หา path จาก string
     */
    const pathEnd = url.indexOf("?");
    const path =
      pathEnd === -1
        ? url.slice(url.indexOf("/", 8))
        : url.slice(url.indexOf("/", 8), pathEnd);
    const result = this.router.match(method, path);

    if (result) {
      const ctx = new Context(req, result.params);
      try {
        /**
         * @optimize_from_1st_benchmark
         * นำ await ออกจาก try-catch เพื่อให้ไม่ต้องรอ handler ที่ไม่ส่ง response
         */
        const handlerResult = result.handler(ctx);
        if (handlerResult instanceof Promise) {
          return this.toResponse(await handlerResult);
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

    // console.log(`🚀 Kyrin running at http://${hostname}:${finalPort}`);
  }
}
