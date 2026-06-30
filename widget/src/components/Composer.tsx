import { useState } from "react";
import { Send, X } from "lucide-react";
import { AudioRecorder } from "./AudioRecorder.tsx";
import { posClass, type Position } from "../lib/position.ts";

export function Composer({
  screenshotUrl,
  position,
  onCancel,
  onSubmit,
}: {
  screenshotUrl: string;
  position: Position;
  onCancel: () => void;
  onSubmit: (text: string, audio: Blob | null) => void;
}) {
  const [text, setText] = useState("");
  const [audio, setAudio] = useState<Blob | null>(null);

  return (
    <div
      className={`fixed ${posClass(position)} z-[2147483647] w-80 rounded-2xl border border-default bg-elevated p-4 shadow-3xl`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-emphasis">Send feedback</span>
        <button onClick={onCancel} aria-label="Close" className="text-muted hover:text-emphasis">
          <X className="h-4 w-4" />
        </button>
      </div>

      <img
        src={screenshotUrl}
        alt="Captured screenshot"
        className="mb-3 max-h-40 w-full rounded-lg border border-default object-cover object-top"
      />

      <textarea
        value={text}
        maxLength={10000}
        onChange={(e) => setText(e.target.value)}
        placeholder="What went wrong?"
        className="mb-3 h-20 w-full resize-none rounded-lg border border-default bg-background p-2 text-sm text-default outline-none placeholder:text-placeholder"
      />

      <AudioRecorder onChange={setAudio} />

      <button
        onClick={() => onSubmit(text, audio)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2 text-sm font-medium text-on-brand shadow-button hover:bg-brand-hover"
      >
        <Send className="h-4 w-4" /> Send
      </button>
    </div>
  );
}
