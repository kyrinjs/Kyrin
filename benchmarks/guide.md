สร้าง Benchmark Suite เสร็จแล้วครับ! 🚀

📁 ไฟล์ที่สร้าง
benchmarks/
├── raw-bun.ts # Port 3001 - Baseline
├── elysia.ts # Port 3002
├── hono.ts # Port 3003
├── kyrin.ts # Port 3004
└── run.ts # Benchmark runner
📦 ติดตั้ง Dependencies
bash
bun add elysia hono --dev
🔧 ติดตั้ง Bombardier (benchmark tool)
Windows (scoop):

bash
scoop install bombardier
Mac:

bash
brew install bombardier
🏃 วิธีรัน Benchmark

1. เปิด 4 terminals รัน servers:

bash

# Terminal 1

bun run benchmarks/raw-bun.ts

# Terminal 2

bun run benchmarks/elysia.ts

# Terminal 3

bun run benchmarks/hono.ts

# Terminal 4

bun run benchmarks/kyrin.ts 2. รัน benchmark:

bash
bun run benchmarks/run.ts
📊 หรือ Test แบบ Manual
bash

# ทดสอบแต่ละ endpoint

bombardier -c 100 -d 10s http://localhost:3004/
bombardier -c 100 -d 10s http://localhost:3004/json
bombardier -c 100 -d 10s http://localhost:3004/users/123
ลองติดตั้ง dependencies แล้วรันดูได้เลยครับ!
