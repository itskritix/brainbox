import { afterEach, describe, expect, it, vi } from "vitest";
import type { FeedbackPayload } from "@brainbox/shared";
import { submitFeedback } from "./submit.ts";

const payload: FeedbackPayload = {
  projectKey: "pk_x",
  region: { x: 0, y: 0, width: 1, height: 1 },
  metadata: {
    url: "u",
    title: "t",
    viewport: { width: 1, height: 1 },
    devicePixelRatio: 1,
    userAgent: "x",
    language: "en",
    timezone: "UTC",
    consoleErrors: [],
  },
};

const png = () => new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" });

afterEach(() => vi.unstubAllGlobals());

describe("submitFeedback", () => {
  it("posts json + screenshot and returns the id on 201", async () => {
    let body: FormData | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        body = init.body as FormData;
        return new Response(JSON.stringify({ id: "abc" }), { status: 201 });
      }),
    );

    const id = await submitFeedback({ endpoint: "http://x/ingest", payload, screenshot: png() });

    expect(id).toBe("abc");
    expect(body?.get("json")).toBe(JSON.stringify(payload));
    expect(body?.get("screenshot")).toBeInstanceOf(File);
    expect(body?.get("audio")).toBeNull();
  });

  it("includes the audio part only when provided", async () => {
    let body: FormData | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        body = init.body as FormData;
        return new Response(JSON.stringify({ id: "a" }), { status: 201 });
      }),
    );

    await submitFeedback({
      endpoint: "e",
      payload,
      screenshot: png(),
      audio: new Blob([new Uint8Array([9])], { type: "audio/webm" }),
    });

    expect(body?.get("audio")).toBeInstanceOf(File);
  });

  it("throws the server error message on a non-2xx JSON response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "Unknown project key" }), { status: 401 })),
    );
    await expect(
      submitFeedback({ endpoint: "e", payload, screenshot: png() }),
    ).rejects.toThrow("Unknown project key");
  });

  it("throws a status-coded message when the error body isn't JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 413 })));
    await expect(
      submitFeedback({ endpoint: "e", payload, screenshot: png() }),
    ).rejects.toThrow("413");
  });
});
