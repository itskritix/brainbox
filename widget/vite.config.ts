import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Library build: a single self-contained IIFE (`widget.js`) with React + the
// screenshot lib bundled and CSS inlined (imported `?inline` in embed.ts), so the
// host page only ever loads one file via the <script> snippet.
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // Vite doesn't inject process.env.NODE_ENV in lib builds; React needs it.
  define: command === "build" ? { "process.env.NODE_ENV": JSON.stringify("production") } : {},
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/embed.ts", import.meta.url)),
      name: "Brainbox",
      formats: ["iife"],
      fileName: () => "widget.js",
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
}));
