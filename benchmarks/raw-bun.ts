/**
 * Benchmark: Raw Bun (Baseline)
 * Port: 3001
 */

Bun.serve({
  port: 3001,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response("Hello World");
    }

    if (url.pathname === "/json") {
      return new Response(JSON.stringify({ message: "Hello World" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Dynamic route simulation
    if (url.pathname.startsWith("/users/")) {
      const id = url.pathname.slice(7);
      return new Response(JSON.stringify({ id }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("🟢 Raw Bun running at http://localhost:3001");
