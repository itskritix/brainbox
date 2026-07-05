// Copies the built widget IIFE into public/ so the landing page serves it
// same-origin at /widget.js. If you rebuild the widget mid-session, re-run
// this script (or restart `pnpm dev`) - Vite serves public/ straight from disk.
import { copyFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

const src = fileURLToPath(new URL("../../widget/dist/widget.js", import.meta.url))
const dest = fileURLToPath(new URL("../public/widget.js", import.meta.url))

if (!existsSync(src)) {
  console.error("widget/dist/widget.js not found - run: pnpm -F @brainbox/widget build")
  process.exit(1)
}
copyFileSync(src, dest)
