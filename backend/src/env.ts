function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value) console.warn(`[env] ${name} not set - using fallback`);
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

  // Public base URL of this API - used to build local file URLs (STORAGE_DRIVER=local).
  PUBLIC_API_URL: process.env.PUBLIC_API_URL ?? "http://localhost:8787",

  // Object storage. "local" writes to backend/.storage/ (dev); "r2" uses
  // Cloudflare R2. R2_* are only needed when STORAGE_DRIVER=r2.
  STORAGE_DRIVER: process.env.STORAGE_DRIVER ?? "local",
  R2_ENDPOINT: process.env.R2_ENDPOINT ?? "",
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ?? "",
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ?? "",
  R2_BUCKET: process.env.R2_BUCKET ?? "",

  // Voice-note transcription (Vercel AI SDK). Unset provider = transcription
  // off. TRANSCRIPTION_MODEL overrides the provider's default model; only the
  // selected provider's API key is needed.
  TRANSCRIPTION_PROVIDER: process.env.TRANSCRIPTION_PROVIDER ?? "",
  TRANSCRIPTION_MODEL: process.env.TRANSCRIPTION_MODEL ?? "",
  GROQ_API_KEY: process.env.GROQ_API_KEY ?? "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",

  // Upload caps (bytes): screenshot 5MB, audio 10MB, screen recording 50MB.
  MAX_SCREENSHOT_BYTES: Number(process.env.MAX_SCREENSHOT_BYTES ?? 5 * 1024 * 1024),
  MAX_AUDIO_BYTES: Number(process.env.MAX_AUDIO_BYTES ?? 10 * 1024 * 1024),
  MAX_VIDEO_BYTES: Number(process.env.MAX_VIDEO_BYTES ?? 50 * 1024 * 1024),
  // Session replay (gzipped rrweb events) - 15MB.
  MAX_SESSION_BYTES: Number(process.env.MAX_SESSION_BYTES ?? 15 * 1024 * 1024),
} as const;
