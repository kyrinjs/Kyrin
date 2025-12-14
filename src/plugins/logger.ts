/**
 * Kyrin Framework - Logger Plugin
 * Logging middleware for server startup and request/response
 */

import type { PluginFactory } from "../middleware/types";

export interface LoggerOptions {
  /** Enable request logging */
  logRequests?: boolean;
  /** Enable response logging */
  logResponses?: boolean;
  /** Custom prefix for logs */
  prefix?: string;
}

/**
 * Helper function to get formatted timestamp
 */
const getTimestamp = (): string => new Date().toISOString();

/**
 * Helper function to format log messages
 */
const formatLog = (prefix: string, timestamp: string, message: string): string =>
  `${prefix} ${timestamp} ${message}`;

/**
 * Logger Plugin
 *
 * @example
 * app.use(logger());
 * app.use(logger({ logRequests: true, logResponses: true }));
 */
export const logger: PluginFactory<LoggerOptions> = (options = {}) => {
  const config = {
    logRequests: true,
    logResponses: false,
    prefix: "[Kyrin]",
    ...options,
  };

  return {
    name: "logger",
    onRequest: config.logRequests
      ? (c) => {
          const log = formatLog(
            config.prefix,
            getTimestamp(),
            `${c.method} ${c.path}`
          );
          console.log(log);
        }
      : undefined,
    onResponse: config.logResponses
      ? (c) => {
          const log = formatLog(
            config.prefix,
            getTimestamp(),
            `Response sent for ${c.method} ${c.path}`
          );
          console.log(log);
        }
      : undefined,
  };
};
