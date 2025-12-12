/**
 * Kyrin Framework - Basic HTTP Server
 */

import type { KyrinConfig } from "./types";
import { Context } from "@/context";

export class KyrinServer {
  private options: KyrinConfig;

  constructor(options: KyrinConfig = {}) {
    this.options = {
      port: options.port || 3000,
      hostname: options.hostname || "localhost",
      development: options.development || false,
    };
  }

  //ฟังก์ชันสำหรับเริ่มรัน Server
  public start() {
    const server = Bun.serve({
      port: this.options.port,
      hostname: this.options.hostname,
      development: this.options.development,

      //ฟังก์ชันจัดการ Request ที่เข้ามา
      fetch: async (req) => {
        const c = new Context(req);

        if (c.path === "/") {
          return c.text("Hello Kyrin Framework");
        }

        return new Response("Not Found", {
          status: 404,
        });
      },
      //จัดการ Error กรณี Server พัง
      error: async (err) => {
        console.error(err);
        return new Response("Internal Server Error", {
          status: 500,
        });
      },
    });
    console.log(
      `Kyrin Server running at http://${this.options.hostname}:${this.options.port}`
    );
    return server;
  }
}
