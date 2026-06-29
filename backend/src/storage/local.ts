import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { Storage } from "./index.ts";

// Dev driver: writes under backend/.storage/ (gitignored). Same key scheme as
// R2, so step 5's read logic is driver-agnostic.
const BASE = join(import.meta.dirname, "../../.storage");

export class LocalStorage implements Storage {
  async put(key: string, body: Uint8Array, _contentType: string): Promise<void> {
    const full = join(BASE, key);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, body);
  }
}
