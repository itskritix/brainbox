import { afterEach, describe, expect, it, vi } from "vitest";

const transcribeMock = vi.hoisted(() => vi.fn());
vi.mock("ai", () => ({ transcribe: transcribeMock }));

// env.ts snapshots process.env at import — stub vars, then re-import fresh.
async function load(vars: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(vars)) vi.stubEnv(key, value);
  return import("./transcription.ts");
}

afterEach(() => {
  vi.unstubAllEnvs();
  transcribeMock.mockReset();
});

describe("transcriptionEnabled", () => {
  it("is false when TRANSCRIPTION_PROVIDER is unset", async () => {
    const { transcriptionEnabled } = await load({});
    expect(transcriptionEnabled()).toBe(false);
  });

  it("is true when a provider is set", async () => {
    const { transcriptionEnabled } = await load({
      TRANSCRIPTION_PROVIDER: "groq",
      GROQ_API_KEY: "gk_test",
    });
    expect(transcriptionEnabled()).toBe(true);
  });
});

describe("transcribeAudio", () => {
  const audio = new Uint8Array([1, 2, 3]);

  it("rejects an unknown provider", async () => {
    const { transcribeAudio } = await load({ TRANSCRIPTION_PROVIDER: "nope" });
    await expect(transcribeAudio(audio)).rejects.toThrow(/Unknown TRANSCRIPTION_PROVIDER/);
  });

  it("rejects when the provider's API key is missing", async () => {
    const { transcribeAudio } = await load({ TRANSCRIPTION_PROVIDER: "groq" });
    await expect(transcribeAudio(audio)).rejects.toThrow(/requires GROQ_API_KEY/);
  });

  it("transcribes via groq with the default model", async () => {
    transcribeMock.mockResolvedValue({ text: "hello world" });
    const { transcribeAudio } = await load({
      TRANSCRIPTION_PROVIDER: "groq",
      GROQ_API_KEY: "gk_test",
    });

    await expect(transcribeAudio(audio)).resolves.toBe("hello world");

    const call = transcribeMock.mock.calls[0]![0] as { model: { modelId: string }; audio: Uint8Array };
    expect(call.model.modelId).toBe("whisper-large-v3-turbo");
    expect(call.audio).toBe(audio);
  });

  it("transcribes via openai with the default model", async () => {
    transcribeMock.mockResolvedValue({ text: "hi" });
    const { transcribeAudio } = await load({
      TRANSCRIPTION_PROVIDER: "openai",
      OPENAI_API_KEY: "sk_test",
    });

    await expect(transcribeAudio(audio)).resolves.toBe("hi");
    const call = transcribeMock.mock.calls[0]![0] as { model: { modelId: string } };
    expect(call.model.modelId).toBe("gpt-4o-mini-transcribe");
  });

  it("honors a TRANSCRIPTION_MODEL override", async () => {
    transcribeMock.mockResolvedValue({ text: "hi" });
    const { transcribeAudio } = await load({
      TRANSCRIPTION_PROVIDER: "groq",
      TRANSCRIPTION_MODEL: "whisper-large-v3",
      GROQ_API_KEY: "gk_test",
    });

    await transcribeAudio(audio);
    const call = transcribeMock.mock.calls[0]![0] as { model: { modelId: string } };
    expect(call.model.modelId).toBe("whisper-large-v3");
  });
});
