import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
    // Isolate each test file in its own worker so vi.mock() calls in one
    // test file cannot leak into another.
    pool: "forks",
    isolate: true,
  },
});
