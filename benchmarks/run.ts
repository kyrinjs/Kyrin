/**
 * Benchmark Runner Script
 *
 * ใช้ bombardier หรือ wrk สำหรับ benchmark
 *
 * วิธีติดตั้ง bombardier (Windows):
 *   scoop install bombardier
 *
 * วิธีติดตั้ง bombardier (Mac):
 *   brew install bombardier
 *
 * วิธีใช้งาน:
 *   1. รัน servers ทั้งหมดใน terminal แยก:
 *      bun run benchmarks/raw-bun.ts
 *      bun run benchmarks/elysia.ts
 *      bun run benchmarks/hono.ts
 *      bun run benchmarks/kyrin.ts
 *
 *   2. รัน benchmark script:
 *      bun run benchmarks/run.ts
 */

const DURATION = "10s";
const CONNECTIONS = 100;

const servers = [
  { name: "Raw Bun", port: 3001 },
  { name: "Elysia", port: 3002 },
  { name: "Hono", port: 3003 },
  { name: "Kyrin", port: 3004 },
];

const endpoints = [
  { name: "Plain Text", path: "/" },
  { name: "JSON", path: "/json" },
  { name: "Dynamic Route", path: "/users/123" },
];

async function runBenchmark(port: number, path: string): Promise<string> {
  const url = `http://localhost:${port}${path}`;
  const proc = Bun.spawn(
    [
      "bombardier",
      "-c",
      CONNECTIONS.toString(),
      "-d",
      DURATION,
      "--print",
      "r",
      "--format",
      "json",
      url,
    ],
    {
      stdout: "pipe",
      stderr: "pipe",
    }
  );

  const output = await new Response(proc.stdout).text();
  return output;
}

function parseResult(jsonOutput: string): { rps: number; latency: number } {
  try {
    const data = JSON.parse(jsonOutput);
    return {
      rps: Math.round(data.result.rps.mean),
      latency: Math.round(data.result.latency.mean / 1000), // μs to ms
    };
  } catch {
    return { rps: 0, latency: 0 };
  }
}

async function main() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║              Kyrin Framework Benchmark Suite                    ║"
  );
  console.log(
    "╠════════════════════════════════════════════════════════════════╣"
  );
  console.log(
    `║  Duration: ${DURATION}  |  Connections: ${CONNECTIONS}                          ║`
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  for (const endpoint of endpoints) {
    console.log(`\n📊 Testing: ${endpoint.name} (${endpoint.path})`);
    console.log("─".repeat(60));

    const results: { name: string; rps: number; latency: number }[] = [];

    for (const server of servers) {
      process.stdout.write(`   Testing ${server.name}...`);

      try {
        const output = await runBenchmark(server.port, endpoint.path);
        const result = parseResult(output);
        results.push({ name: server.name, ...result });
        console.log(` ${result.rps.toLocaleString()} req/s`);
      } catch (error) {
        console.log(" ❌ Error (server not running?)");
        results.push({ name: server.name, rps: 0, latency: 0 });
      }
    }

    // Sort by RPS
    results.sort((a, b) => b.rps - a.rps);

    console.log("\n   📈 Results (sorted by RPS):");
    results.forEach((r, i) => {
      const bar = "█".repeat(Math.round((r.rps / results[0].rps) * 30));
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
      console.log(
        `   ${medal} ${r.name.padEnd(10)} ${r.rps
          .toLocaleString()
          .padStart(8)} req/s ${bar}`
      );
    });
  }

  console.log("\n✅ Benchmark complete!");
}

main().catch(console.error);
