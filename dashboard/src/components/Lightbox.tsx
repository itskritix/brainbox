import { useEffect } from "react";
import { X } from "lucide-react";

export function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black-a11 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Full size"
        className="max-h-full max-w-full rounded-lg border border-default object-contain shadow-3xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full border border-default bg-elevated p-2 text-muted transition hover:text-emphasis"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
