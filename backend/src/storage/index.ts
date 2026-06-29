import { env } from "../env.ts";
import { LocalStorage } from "./local.ts";
import { R2Storage } from "./r2.ts";

export type StorageDriver = "local" | "r2";

// Object storage for screenshots/audio.
export interface Storage {
  put(key: string, body: Uint8Array, contentType: string): Promise<void>;
  // A URL the dashboard can use to fetch the object. R2 → a short-lived
  // presigned URL; local → a cookie-gated /api/files route.
  presignGet(key: string): Promise<string>;
}

let instance: Storage | null = null;

export function getStorage(): Storage {
  if (instance) return instance;
  instance = env.STORAGE_DRIVER === "r2" ? new R2Storage() : new LocalStorage();
  return instance;
}
