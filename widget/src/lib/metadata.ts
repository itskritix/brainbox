import type { CapturedMetadata, Identity } from "@brainbox/shared";

const MAX_ERRORS = 20;
const consoleErrors: string[] = [];
let identity: Identity | undefined;

export function setIdentity(next: Identity): void {
  identity = next;
}

/** Patch console.error + global error hooks into a rolling buffer. Call once at init. */
export function installCapture(): void {
  const original = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    push(args.map(stringify).join(" "));
    original(...args);
  };
  window.addEventListener("error", (e) => push(e.message));
  window.addEventListener("unhandledrejection", (e) =>
    push(`Unhandled rejection: ${stringify(e.reason)}`),
  );
}

/** Snapshot of the host page at submit time. */
export function captureMetadata(selector?: string): CapturedMetadata {
  return {
    url: location.href,
    title: document.title,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    devicePixelRatio: window.devicePixelRatio,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    selector,
    consoleErrors: [...consoleErrors],
    identity,
  };
}

function push(msg: string): void {
  consoleErrors.push(msg);
  while (consoleErrors.length > MAX_ERRORS) consoleErrors.shift();
}

function stringify(v: unknown): string {
  if (typeof v === "string") return v;
  if (v instanceof Error) return v.stack ?? v.message;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
