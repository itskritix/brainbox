import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  clean: true,
  // @brainbox/shared ships as TS source with no build output, so it must be
  // bundled in rather than left as an external runtime import.
  noExternal: ["@brainbox/shared"],
});
