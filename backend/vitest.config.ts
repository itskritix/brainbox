import { defineConfig } from "vitest/config";

import { testEnv } from "./test/env.ts";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    // Injected into process.env in the worker BEFORE app/env.ts/db import.
    env: testEnv,
    // One shared test DB → run files serially and truncate between tests.
    fileParallelism: false,
    globalSetup: ["./test/global-setup.ts"],
    setupFiles: ["./test/setup.ts"],
  },
});
