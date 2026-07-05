import { useState } from "react";
import type { TriggerMode, WidgetPosition, WidgetTheme } from "@brainbox/shared";

import { MANUAL_TRIGGER_EXAMPLE } from "../lib/snippet";
import { CopyButton } from "./CopyButton";
import { InstallSnippet } from "./InstallSnippet";

function SegmentRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm text-default">{label}</span>
      <div className="flex rounded-lg border border-default bg-subtle p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors " +
              (opt.value === value
                ? "bg-elevated text-emphasis shadow-button"
                : "text-muted hover:text-default")
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Snippet builder: pick theme/trigger/position, the install tag updates live.
 *  Nothing persists - the choices only shape the copied snippet. */
export function SnippetConfigurator({ projectKey }: { projectKey: string }) {
  const [theme, setTheme] = useState<WidgetTheme>("dark");
  const [trigger, setTrigger] = useState<TriggerMode>("floating");
  const [position, setPosition] = useState<WidgetPosition>("bottom-right");

  const manual = trigger === "manual";

  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-xl border border-default bg-elevated px-4 py-3.5">
        <SegmentRow
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "auto", label: "Auto" },
          ]}
        />
        <SegmentRow
          label="Open with"
          value={trigger}
          onChange={setTrigger}
          options={[
            { value: "floating", label: "Floating button" },
            { value: "manual", label: "Your own button" },
          ]}
        />
        {!manual && (
          <SegmentRow
            label="Position"
            value={position}
            onChange={setPosition}
            options={[
              { value: "bottom-right", label: "Bottom right" },
              { value: "bottom-left", label: "Bottom left" },
              { value: "top-right", label: "Top right" },
              { value: "top-left", label: "Top left" },
            ]}
          />
        )}
      </div>

      <InstallSnippet
        projectKey={projectKey}
        options={manual ? { theme, trigger } : { theme, trigger, position }}
      />

      {manual && (
        <div className="overflow-hidden rounded-xl border border-default bg-subtle">
          <div className="flex items-center justify-between border-b border-default px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              your app
            </span>
            <CopyButton text={MANUAL_TRIGGER_EXAMPLE} label="Copy example" />
          </div>
          <code className="block overflow-x-auto whitespace-pre-wrap break-all p-3 font-mono text-xs leading-relaxed text-default">
            {MANUAL_TRIGGER_EXAMPLE}
          </code>
          <p className="border-t border-default px-3 py-2 text-xs text-muted">
            Any element with <code className="font-mono">data-brainbox-trigger</code> opens the
            widget - or call <code className="font-mono">window.Brainbox.open()</code> from your
            code.
          </p>
        </div>
      )}
    </div>
  );
}
