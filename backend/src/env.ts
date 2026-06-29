function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value) console.warn(`[env] ${name} not set — using fallback`);
  return value ?? fallback;
}

// AUTH_SECRET + DATABASE_URL are infra and must be present to boot.
// GOOGLE_* are optional so the server can boot for inspection before the OAuth
// client exists; Google sign-in obviously won't work until they're set.
export const env = {
  AUTH_SECRET: required("AUTH_SECRET"),
  DATABASE_URL: required("DATABASE_URL"),
  GOOGLE_ID: optional("GOOGLE_ID", ""),
  GOOGLE_SECRET: optional("GOOGLE_SECRET", ""),
  AUTH_URL: process.env.AUTH_URL ?? "http://localhost:8787/api/auth",
  DASHBOARD_ORIGIN: process.env.DASHBOARD_ORIGIN ?? "http://localhost:5173",
  PORT: Number(process.env.PORT ?? 8787),

  // Object storage. "local" writes to backend/.storage/ (dev); "r2" uses
  // Cloudflare R2. R2_* are only needed when STORAGE_DRIVER=r2.
  STORAGE_DRIVER: process.env.STORAGE_DRIVER ?? "local",
  R2_ENDPOINT: process.env.R2_ENDPOINT ?? "",
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ?? "",
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ?? "",
  R2_BUCKET: process.env.R2_BUCKET ?? "",

  // Upload caps (bytes): screenshot 5MB, audio 10MB.
  MAX_SCREENSHOT_BYTES: Number(process.env.MAX_SCREENSHOT_BYTES ?? 5 * 1024 * 1024),
  MAX_AUDIO_BYTES: Number(process.env.MAX_AUDIO_BYTES ?? 10 * 1024 * 1024),
} as const;
