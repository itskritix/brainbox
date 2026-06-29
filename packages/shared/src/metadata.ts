/** Who filed the feedback. Supplied by the customer via `Brainbox.identify()`. */
export interface Identity {
  id?: string;
  email?: string;
}

/** Context auto-captured from the host page at submit time. */
export interface CapturedMetadata {
  url: string;
  title: string;
  viewport: { width: number; height: number };
  devicePixelRatio: number;
  userAgent: string;
  language: string;
  timezone: string;
  /** CSS selector under the highlighted region (mirrors Region.selector). */
  selector?: string;
  /** Rolling buffer of recent console errors / uncaught exceptions. */
  consoleErrors: string[];
  identity?: Identity;
}
