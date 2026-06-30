import { useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { startRecording, type Recorder } from "../lib/audio.ts";

export function AudioRecorder({ onChange }: { onChange: (b: Blob | null) => void }) {
  const [rec, setRec] = useState<Recorder | null>(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [err, setErr] = useState("");

  const start = async () => {
    setErr("");
    try {
      setRec(await startRecording());
    } catch {
      setErr("Mic unavailable");
    }
  };

  const stop = async () => {
    if (!rec) return;
    const blob = await rec.stop();
    setRec(null);
    setHasAudio(true);
    onChange(blob);
  };

  const clear = () => {
    setHasAudio(false);
    onChange(null);
  };

  if (err) return <p className="text-xs text-error">{err}</p>;

  if (hasAudio)
    return (
      <button onClick={clear} className="flex items-center gap-2 text-xs text-muted hover:text-emphasis">
        <Trash2 className="h-3.5 w-3.5" /> Voice note attached · remove
      </button>
    );

  return rec ? (
    <button onClick={stop} className="flex items-center gap-2 text-xs text-error">
      <Square className="h-3.5 w-3.5" /> Stop recording
    </button>
  ) : (
    <button onClick={start} className="flex items-center gap-2 text-xs text-muted hover:text-emphasis">
      <Mic className="h-3.5 w-3.5" /> Record a voice note
    </button>
  );
}
