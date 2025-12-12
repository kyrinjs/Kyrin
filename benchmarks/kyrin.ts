/**
 * Benchmark: Kyrin
 * Port: 3004
 */

import { Kyrin } from "../src/core/kyrin";

const app = new Kyrin();

app.get("/", () => "Hello World");
app.get("/json", () => ({ message: "Hello World" }));
app.get("/users/:id", (c) => ({ id: c.param("id") }));

app.listen(3004);

console.log("⚡ Kyrin running at http://localhost:3004");
