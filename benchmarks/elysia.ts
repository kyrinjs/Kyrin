/**
 * Benchmark: Elysia
 * Port: 3002
 */

import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => "Hello World")
  .get("/json", () => ({ message: "Hello World" }))
  .get("/users/:id", ({ params }) => ({ id: params.id }))
  .listen(3002);

console.log("🦊 Elysia running at http://localhost:3002");
