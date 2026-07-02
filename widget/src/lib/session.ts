import { record } from "rrweb";
import { startRecording, type Recorder } from "./audio.ts";

export interface SessionCapture {
  session: Blob;
  audio: Blob | null;
}

export interface SessionRecording {
  stop: () => Promise<SessionCapture>;
  micActive: () => boolean;
}

/** rrweb DOM recording works wherever MutationObserver exists (universal). */
export function canSessionRecord(): boolean {
  return typeof MutationObserver === "function";
}

/** Record the host app's DOM as an rrweb session — captures only this page.
 *  Private by default: input values are masked before anything leaves the
 *  browser; customers can add `.rr-block` / `.rr-mask` / `.rr-ignore`.
 *  Voice narration via the mic is best-effort: the user may deny the prompt
 *  (or dismiss it) and the DOM recording carries on without audio.
 *  `onAutoStop` fires at the max-duration cap so the caller finalizes via stop(). */
export function startSessionRecording(onAutoStop: () => void, maxMs = 60_000): SessionRecording {
  const events: unknown[] = [];

  const stopFn = record({
    emit(event) {
      events.push(event);
    },
    // privacy: never let typed values (passwords, emails, PII) leave as plaintext
    maskAllInputs: true,
    maskInputOptions: { password: true, email: true, tel: true },
    blockClass: "rr-block",
    ignoreClass: "rr-ignore",
    maskTextClass: "rr-mask",
    recordCanvas: false,
    collectFonts: false,
  });

  let mic: Recorder | null = null;
  let stopped = false;
  const micReady = startRecording()
    .then((r) => {
      // permission granted after Stop was already pressed — release the mic
      if (stopped) void r.stop();
      else mic = r;
    })
    .catch(() => {
      /* denied or no mic — session recording continues without voice */
    });

  let settling = false;
  const fire = () => {
    if (settling) return;
    settling = true;
    onAutoStop();
  };
  const timer = setTimeout(fire, maxMs);

  return {
    micActive: () => mic !== null,
    stop: async () => {
      clearTimeout(timer);
      settling = true;
      stopped = true;
      stopFn?.();
      // don't block the upload on a permission dialog the user never answered
      await Promise.race([micReady, new Promise((r) => setTimeout(r, 150))]);
      const audio = mic ? await mic.stop() : null;
      return { session: await gzipJson(JSON.stringify({ v: 1, events })), audio };
    },
  };
}

/** Gzip the event log so the upload stays small (rrweb JSON compresses ~10x). */
async function gzipJson(json: string): Promise<Blob> {
  const raw = new Blob([json], { type: "application/json" });
  if (typeof CompressionStream === "undefined") return raw;
  const stream = raw.stream().pipeThrough(new CompressionStream("gzip"));
  const compressed = await new Response(stream).blob();
  return new Blob([compressed], { type: "application/gzip" });
}
