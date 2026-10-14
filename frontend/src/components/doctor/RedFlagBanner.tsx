import React from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";
import type { RedFlag } from "../../types/patient";

interface Props {
  flags: RedFlag[];
}

export function RedFlagBanner({ flags }: Props) {
  if (!flags || flags.length === 0) return null;

  return (
    <section
      aria-label="Red flag alerts"
      className="animate-rise overflow-hidden rounded-xl border-2 border-alert/60 bg-alert-soft shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-alert/25 bg-alert px-4 py-2.5 text-alert-foreground">
        <AlertTriangle className="size-4.5" strokeWidth={2.4} aria-hidden />
        <h2 className="text-sm font-bold tracking-tight">
          Clinical Red Flag Detected — Immediate Physician Triage Required
        </h2>
      </div>

      <ul className="divide-y divide-alert/20">
        {flags.map((f, i) => (
          <li key={i} className="px-4 py-3.5 space-y-1">
            <p className="text-sm font-bold text-foreground">{f.title}</p>
            <p className="text-xs sm:text-sm text-surface-foreground">
              <span className="font-semibold text-foreground">Triggered by:</span> {f.trigger}
            </p>
            <p className="text-xs sm:text-sm text-surface-foreground">
              <span className="font-semibold text-primary">Physician recommendation:</span> {f.recommendation}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
