import { record } from "rrweb";

export interface SessionRecording {
  stop: () => Promise<Blob>;
}

/** rrweb DOM recording works wherever MutationObserver exists (universal). */
export function canSessionRecord(): boolean {
  return typeof MutationObserver === "function";
}

/** Record the host app's DOM as an rrweb session — NO permission prompt, captures
 *  only this page. Private by default: input values are masked before anything
 *  leaves the browser; customers can add `.rr-block` / `.rr-mask` / `.rr-ignore`.
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

  let settling = false;
  const fire = () => {
    if (settling) return;
    settling = true;
    onAutoStop();
  };
  const timer = setTimeout(fire, maxMs);

  return {
    stop: async () => {
      clearTimeout(timer);
      settling = true;
      stopFn?.();
      return gzipJson(JSON.stringify({ v: 1, events }));
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
