/**
 * Kyrin Framework - CORS Plugin
 * Cross-Origin Resource Sharing middleware
 */

import type { PluginFactory } from "../middleware/types";

export interface CorsOptions {
  /** Allowed origins */
  origin?: string | string[] | ((origin: string) => boolean);
  /** Allowed HTTP methods */
  methods?: string[];
  /** Allowed headers */
  allowedHeaders?: string[];
  /** Allow credentials */
  credentials?: boolean;
  /** Preflight cache duration (seconds) */
  maxAge?: number;
}

/**
 * CORS Plugin
 *
 * @example
 * app.use(cors());
 * app.use(cors({ origin: "https://example.com" }));
 * app.use(cors({ origin: ["https://a.com", "https://b.com"] }));
 */
export const cors: PluginFactory<CorsOptions> = (options = {}) => {
  const config = {
    origin: "*" as CorsOptions["origin"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
    ...options,
  };

  return {
    name: "cors",
    middleware: async (c, next) => {
      const requestOrigin = c.header("Origin") ?? "";

      // Determine allowed origin
      let allowOrigin = "*";
      if (typeof config.origin === "string") {
        allowOrigin = config.origin;
      } else if (Array.isArray(config.origin)) {
        allowOrigin = config.origin.includes(requestOrigin)
          ? requestOrigin
          : "";
      } else if (typeof config.origin === "function") {
        allowOrigin = config.origin(requestOrigin) ? requestOrigin : "";
      }

      // Set CORS headers
      c.set.headers["Access-Control-Allow-Origin"] = allowOrigin;
      c.set.headers["Access-Control-Allow-Methods"] =
        config.methods!.join(", ");
      c.set.headers["Access-Control-Allow-Headers"] =
        config.allowedHeaders!.join(", ");

      if (config.credentials) {
        c.set.headers["Access-Control-Allow-Credentials"] = "true";
      }

      // Handle preflight
      if (c.method === "OPTIONS") {
        c.set.headers["Access-Control-Max-Age"] = String(config.maxAge);
        return new Response(null, { status: 204, headers: c.set.headers });
      }

      await next();
    },
  };
};
