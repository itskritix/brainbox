import { webmFixDuration } from "webm-fix-duration";

const MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function pickMime(): string {
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

/** Whether the browser supports screen capture (false on most mobile). */
export function canScreenRecord(): boolean {
  return typeof navigator.mediaDevices?.getDisplayMedia === "function";
}

export interface Recording {
  stop: () => Promise<Blob>;
}

/** Record the screen (video) + microphone (audio) into one file. `onAutoStop`
 *  fires when the recording ends by itself — the max-duration timer elapsed or
 *  the user hit the browser's "Stop sharing" — so the caller finalizes via stop(). */
export async function startScreenRecording(
  onAutoStop: () => void,
  maxMs = 60_000,
): Promise<Recording> {
  const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });

  let mic: MediaStream | undefined;
  try {
    mic = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    // mic denied/unavailable — record the screen without narration
  }

  const stream = new MediaStream([
    ...display.getVideoTracks(),
    ...(mic ? mic.getAudioTracks() : []),
  ]);

  const preferred = pickMime();
  // Cap the bitrate so a full 60s clip stays well under the 50MB limit
  // (2.5 Mbps × 60s ≈ 19MB) — avoids recording then rejecting an oversized file.
  const rec = new MediaRecorder(stream, {
    ...(preferred ? { mimeType: preferred } : {}),
    videoBitsPerSecond: 2_500_000,
  });
  // The container the browser actually negotiated (Chromium → webm, Safari → mp4),
  // without the codec suffix. Never hardcode webm — Safari writes mp4.
  const mime = (rec.mimeType || "video/webm").split(";")[0];

  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  rec.start();
  const startedAt = performance.now();

  const cleanup = () => {
    display.getTracks().forEach((t) => t.stop());
    mic?.getTracks().forEach((t) => t.stop());
  };

  let settling = false;
  const fireAutoStop = () => {
    if (settling) return;
    settling = true;
    onAutoStop();
  };
  const timer = setTimeout(fireAutoStop, maxMs);
  display.getVideoTracks()[0]?.addEventListener("ended", fireAutoStop);

  const build = async (): Promise<Blob> => {
    cleanup();
    const raw = new Blob(chunks, { type: mime });
    // Chromium's MediaRecorder omits webm duration metadata → players can't seek
    // and show no length. Inject it from the elapsed record time.
    if (mime === "video/webm") {
      try {
        return await webmFixDuration(raw, performance.now() - startedAt, mime);
      } catch {
        return raw; // keep the original if the fix fails
      }
    }
    return raw;
  };

  return {
    stop: () =>
      new Promise<Blob>((resolve) => {
        clearTimeout(timer);
        settling = true;
        if (rec.state === "inactive") {
          void build().then(resolve);
          return;
        }
        rec.onstop = () => void build().then(resolve);
        rec.stop();
      }),
  };
}
