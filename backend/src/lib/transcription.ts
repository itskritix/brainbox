import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { transcribe } from "ai";
import type { TranscriptionModel } from "ai";

import { env } from "../env.ts";

// Provider registry: adding a provider = one entry here + its API key in
// env.ts. Model ids are per-provider defaults, overridable via
// TRANSCRIPTION_MODEL. The AI SDK detects the audio format (webm/mp3/ogg/…)
// from the file signature, so raw bytes are enough.
const PROVIDERS: Record<string, () => TranscriptionModel> = {
  groq: () =>
    createGroq({ apiKey: requireKey("GROQ_API_KEY", env.GROQ_API_KEY) }).transcription(
      env.TRANSCRIPTION_MODEL || "whisper-large-v3-turbo",
    ),
  openai: () =>
    createOpenAI({ apiKey: requireKey("OPENAI_API_KEY", env.OPENAI_API_KEY) }).transcription(
      env.TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe",
    ),
};

function requireKey(name: string, value: string): string {
  if (!value) {
    throw new Error(`TRANSCRIPTION_PROVIDER=${env.TRANSCRIPTION_PROVIDER} requires ${name}`);
  }
  return value;
}

export function transcriptionEnabled(): boolean {
  return env.TRANSCRIPTION_PROVIDER !== "";
}

/** Speech-to-text. Also takes video containers (webm/mp4) - whisper
 *  transcribes the audio track. */
export async function transcribeAudio(audio: Uint8Array): Promise<string> {
  const factory = PROVIDERS[env.TRANSCRIPTION_PROVIDER];
  if (!factory) {
    throw new Error(
      `Unknown TRANSCRIPTION_PROVIDER "${env.TRANSCRIPTION_PROVIDER}" — expected one of: ${Object.keys(PROVIDERS).join(", ")}`,
    );
  }
  const { text } = await transcribe({ model: factory(), audio });
  return text;
}
