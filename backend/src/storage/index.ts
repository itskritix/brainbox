import { env } from "../env.ts";
import { LocalStorage } from "./local.ts";
import { R2Storage } from "./r2.ts";

export type StorageDriver = "local" | "r2";

// Object storage for screenshots/audio. `presignGet` is intentionally absent —
// it lands in step 5 with the dashboard read routes.
export interface Storage {
  put(key: string, body: Uint8Array, contentType: string): Promise<void>;
}

let instance: Storage | null = null;

export function getStorage(): Storage {
  if (instance) return instance;
  instance = env.STORAGE_DRIVER === "r2" ? new R2Storage() : new LocalStorage();
  return instance;
}
