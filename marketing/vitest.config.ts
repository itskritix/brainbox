import { defineConfig } from "vitest/config";

// Standalone from vite.config.ts: the lib helpers read DOM/window, so unit
// tests run under jsdom.
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
