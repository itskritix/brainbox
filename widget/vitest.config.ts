import { defineConfig } from "vitest/config";

// Standalone from vite.config.ts (which is the IIFE lib build): the lib functions
// read DOM/window/navigator, so unit tests run under jsdom.
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
