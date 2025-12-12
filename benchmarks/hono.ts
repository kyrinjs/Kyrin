/**
 * Benchmark: Hono
 * Port: 3003
 */

import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello World"));
app.get("/json", (c) => c.json({ message: "Hello World" }));
app.get("/users/:id", (c) => c.json({ id: c.req.param("id") }));

export default {
  port: 3003,
  fetch: app.fetch,
};

console.log("🔥 Hono running at http://localhost:3003");
