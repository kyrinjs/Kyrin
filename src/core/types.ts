import type { Context } from "@/context";

export interface KyrinConfig {
  port?: number;
  hostname?: string;
  development?: boolean;
}

export type Handler = (ctx: Context) => Response | Promise<Response>;
