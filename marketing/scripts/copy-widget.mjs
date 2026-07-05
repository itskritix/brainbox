// Copies the built widget IIFE into public/ so the landing page serves it
// same-origin at /widget.js. If you rebuild the widget mid-session, re-run
// this script (or restart `pnpm dev`) - Vite serves public/ straight from disk.
import { execSync } from "node:child_process"
import { copyFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../..", import.meta.url))
const src = fileURLToPath(new URL("../../widget/dist/widget.js", import.meta.url))
const dest = fileURLToPath(new URL("../public/widget.js", import.meta.url))

if (!existsSync(src)) {
  // Standalone-package builds (Vercel, fresh clones) haven't built the widget yet.
  console.log("widget/dist/widget.js not found - building @brainbox/widget first")
  execSync("pnpm -F @brainbox/widget build", { cwd: root, stdio: "inherit" })
}
if (!existsSync(src)) {
  console.error("widget build did not produce widget/dist/widget.js")
  process.exit(1)
}
copyFileSync(src, dest)
