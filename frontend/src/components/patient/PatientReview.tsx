import React from "react";
import { CheckCircle2, User, FileText, Activity, ArrowLeft, Send } from "lucide-react";
import type { PatientInfo, ReportDoc, SymptomEntry } from "../../types/patient";
import { Button } from "../common/Button";

interface Props {
  patientInfo: PatientInfo;
  answers: SymptomEntry[];
  reports: ReportDoc[];
  onConfirm: () => void;
  onBack: () => void;
  submitting?: boolean;
}

export function PatientReview({
  patientInfo,
  answers,
  reports,
  onConfirm,
  onBack,
  submitting = false,
}: Props) {
  return (
    <div className="animate-rise space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-clinical">
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <CheckCircle2 className="size-4" aria-hidden />
          Step 4: Clinical Review
        </div>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">Review your intake details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please check the information below before sending it to the physician.
        </p>
      </div>

      {/* Patient info block */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground mb-2">
          <User className="size-3.5" /> Patient Details
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
          <div>
            <span className="text-xs text-muted-foreground block">Name</span>
            <span className="font-semibold text-foreground">{patientInfo.name}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Age</span>
            <span className="font-semibold text-foreground">{patientInfo.age} yrs</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Gender</span>
            <span className="font-semibold text-foreground">{patientInfo.sex}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Preferred Language</span>
            <span className="font-semibold text-foreground">{patientInfo.language}</span>
          </div>
        </div>
      </div>

      {/* Q&A section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>Reported Symptoms & Answers ({answers.length})</span>
        </h3>
        <div className="divide-y divide-border/60 rounded-xl border border-border bg-card">
          {answers.map((a, i) => (
            <div key={i} className="p-3.5 text-sm space-y-1">
              <p className="text-xs text-muted-foreground font-medium">{a.question}</p>
              <p className="font-semibold text-foreground">{a.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded reports */}
      {reports.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <span>Uploaded Reports ({reports.length})</span>
          </h3>
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-sm">
                <div>
                  <span className="font-medium text-foreground">{r.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">({r.kind})</span>
                </div>
                <span className="text-xs font-semibold text-ok bg-ok-soft border border-ok/25 px-2 py-0.5 rounded-full">
                  {r.fields.length} fields read
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <Button variant="outline" size="md" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="size-4 mr-1" />
          Back to Edit
        </Button>

        <Button size="lg" onClick={onConfirm} loading={submitting} className="min-w-48">
          <Send className="size-4 mr-1" />
          Confirm & Send to Doctor
        </Button>
      </div>
    </div>
  );
}
