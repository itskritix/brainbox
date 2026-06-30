import type { FeedbackPayload } from "@brainbox/shared";

export interface SubmitInput {
  endpoint: string;
  payload: FeedbackPayload;
  screenshot: Blob;
  audio?: Blob;
}

/** Build the multipart body and POST to /ingest. Returns the new issue id. */
export async function submitFeedback({
  endpoint,
  payload,
  screenshot,
  audio,
}: SubmitInput): Promise<string> {
  const fd = new FormData();
  fd.append("json", JSON.stringify(payload));
  fd.append("screenshot", screenshot, "screenshot.png");
  if (audio) fd.append("audio", audio, "voice.webm");

  const res = await fetch(endpoint, { method: "POST", body: fd, mode: "cors" });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  const data: { id?: string } = await res.json();
  if (!data.id) throw new Error("Malformed response");
  return data.id;
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const data: { error?: string } = await res.json();
    if (data.error) return data.error;
  } catch {
    /* non-JSON error body */
  }
  return `Upload failed (${res.status})`;
}
