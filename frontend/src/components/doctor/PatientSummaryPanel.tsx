import React from "react";
import { ClipboardList, Info, Activity } from "lucide-react";
import type { AiSummary } from "../../types/patient";

interface Props {
  summary: AiSummary;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border/70 px-4 py-3 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:pt-0.5">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-foreground">{children}</dd>
    </div>
  );
}

export function PatientSummaryPanel({ summary }: Props) {
  return (
    <section aria-label="AI clinical summary" className="overflow-hidden rounded-xl border border-border bg-card shadow-panel">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <ClipboardList className="size-4 text-primary" strokeWidth={2.2} aria-hidden />
          AI-Assisted Clinical Summary — for Physician Review
        </h2>
        <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Model confidence {(summary.confidence * 100).toFixed(0)}%
        </span>
      </header>

      <dl>
        <Row label="Chief Complaint">
          <span className="font-semibold text-foreground">{summary.chiefComplaint}</span>
        </Row>

        <Row label="Associated Symptoms">
          <div className="flex flex-wrap gap-1.5">
            {summary.associatedSymptoms && summary.associatedSymptoms.length > 0 ? (
              summary.associatedSymptoms.map((s) => (
                <span key={s} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground italic">None reported</span>
            )}
          </div>
        </Row>

        <Row label="Duration">{summary.duration || "Not specified"}</Row>

        <Row label="Past Medical History">
          {summary.pastHistory && summary.pastHistory.length > 0
            ? summary.pastHistory.join(" · ")
            : "No known past medical history volunteered"}
        </Row>

        <Row label="Current Medications">
          {summary.currentMedication && summary.currentMedication.length > 0
            ? summary.currentMedication.join(" · ")
            : "No regular medications reported"}
        </Row>

        {summary.measurements && summary.measurements.length > 0 && (
          <Row label="Recorded Measurements">
            <div className="flex flex-wrap gap-2">
              {summary.measurements.map((m, i) => {
                const isUnavailable = m.includes("Not Available");
                return (
                  <span
                    key={i}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                      isUnavailable
                        ? "border-muted bg-muted/30 text-muted-foreground"
                        : "border-primary/30 bg-primary-soft text-primary font-semibold"
                    }`}
                  >
                    {m}
                  </span>
                );
              })}
            </div>
          </Row>
        )}
      </dl>

      <p className="flex items-start gap-2 border-t border-border bg-surface px-4 py-2.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
        Generated from patient-reported answers and uploaded clinic documents. Clinical screening support only — not an autonomous diagnostic device.
      </p>
    </section>
  );
}
