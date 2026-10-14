import React, { useState } from "react";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  FileText,
  MessagesSquare,
  NotebookPen,
  ShieldCheck,
  Stethoscope,
  Clock,
  User,
} from "lucide-react";
import type { PatientRecord } from "../../types/patient";
import { PatientSummaryPanel } from "./PatientSummaryPanel";
import { RedFlagBanner } from "./RedFlagBanner";
import { HealthTimeline } from "./HealthTimeline";
import { ReportViewer } from "./ReportViewer";
import { UrgencyBadge } from "./UrgencyBadge";
import { Button } from "../common/Button";
import { cn } from "../../utils/formatters";

interface Props {
  patient: PatientRecord;
  onBack?: () => void;
  onUpdatePatient: (id: string, patch: Partial<PatientRecord>) => void;
}

export function DoctorDashboard({ patient, onBack, onUpdatePatient }: Props) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "timeline" | "reports">("summary");
  const [note, setNote] = useState(patient.doctorNotes || "");
  const [savingNote, setSavingNote] = useState(false);

  const handleSaveNote = () => {
    setSavingNote(true);
    onUpdatePatient(patient.patientInfo.id, {
      doctorNotes: note,
      reviewed: true,
    });
    setTimeout(() => setSavingNote(false), 600);
  };

  const handleToggleReviewed = () => {
    onUpdatePatient(patient.patientInfo.id, {
      reviewed: !patient.reviewed,
    });
  };

  const handleToggleViewed = () => {
    onUpdatePatient(patient.patientInfo.id, {
      viewed: !patient.viewed,
    });
  };

  return (
    <div className="space-y-6 animate-rise">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4 mr-1" /> Back to Queue
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Viewed status toggle */}
          <button
            type="button"
            onClick={handleToggleViewed}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              patient.viewed
                ? "border-ok/30 bg-ok-soft text-ok hover:bg-ok/20"
                : "border-warn/35 bg-warn-soft text-warn-foreground hover:bg-warn/20"
            )}
          >
            {patient.viewed ? (
              <>
                <Eye className="size-3.5" /> Viewed
              </>
            ) : (
              <>
                <EyeOff className="size-3.5" /> Mark Viewed
              </>
            )}
          </button>

          {/* Reviewed status toggle */}
          <Button
            size="sm"
            variant={patient.reviewed ? "outline" : "default"}
            onClick={handleToggleReviewed}
            className={patient.reviewed ? "border-ok text-ok bg-ok-soft/30 hover:bg-ok-soft" : ""}
          >
            <Check className="size-4 mr-1" />
            {patient.reviewed ? "Reviewed & Signed Off" : "Mark as Reviewed"}
          </Button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-clinical">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {patient.patientInfo.name}
              </h1>
              <UrgencyBadge urgency={patient.urgency} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground pt-1">
              <span>{patient.patientInfo.age} yrs · {patient.patientInfo.sex}</span>
              <span>ID: {patient.patientInfo.id}</span>
              {patient.patientInfo.abhaId && <span>ABHA: {patient.patientInfo.abhaId}</span>}
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> Arrived: {patient.arrivedAt}
              </span>
              <span>Language: {patient.patientInfo.language}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground block">
              AI One-Liner
            </span>
            <p className="mt-1 text-sm font-medium text-foreground max-w-md">
              {patient.aiSummary?.oneLiner || "Self-reported intake completed."}
            </p>
          </div>
        </div>
      </div>

      {/* Red flag triage alert if applicable */}
      {patient.redFlags && patient.redFlags.length > 0 && (
        <RedFlagBanner flags={patient.redFlags} />
      )}

      {/* Clinical views navigation tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: "summary", label: "Clinical Summary" },
          { id: "timeline", label: "Health Timeline" },
          { id: "reports", label: `Uploaded Reports (${patient.reports?.length || 0})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as any)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer",
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: Summary Panel */}
      {activeTab === "summary" && patient.aiSummary && (
        <PatientSummaryPanel summary={patient.aiSummary} />
      )}

      {/* TAB CONTENT 2: Health Timeline */}
      {activeTab === "timeline" && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-panel">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
            <Stethoscope className="size-4" /> Longitudinal Medical History
          </div>
          <HealthTimeline events={patient.timelineEvents || []} />
        </section>
      )}

      {/* TAB CONTENT 3: Uploaded Reports */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {!patient.reports || patient.reports.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
              No reports or lab results uploaded by the patient.
            </div>
          ) : (
            patient.reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-border bg-card p-5 shadow-panel">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-base">{report.title}</h3>
                  <span className="text-xs text-muted-foreground">{report.kind} · {report.uploadedAt}</span>
                </div>
                <ReportViewer report={report} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Full intake dialogue transcript (Collapsible) */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-panel">
        <button
          type="button"
          onClick={() => setShowTranscript(!showTranscript)}
          className="flex w-full items-center justify-between text-left font-semibold text-sm text-foreground cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MessagesSquare className="size-4 text-primary" />
            <span>Full Kiosk Dialogue Transcript ({patient.symptoms?.length || 0} interactions)</span>
          </div>
          <span className="text-xs text-primary font-medium">
            {showTranscript ? "Hide Transcript" : "Show Full Transcript"}
          </span>
        </button>

        {showTranscript && (
          <div className="mt-4 divide-y divide-border/60 border-t border-border pt-3 space-y-3">
            {patient.symptoms && patient.symptoms.length > 0 ? (
              patient.symptoms.map((s, i) => (
                <div key={i} className="pt-2 text-sm space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">Assistant [{s.at || "Kiosk"}]:</span> {s.question}
                  </p>
                  <p className="font-medium text-foreground pl-3 border-l-2 border-primary/40">
                    {s.answer}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No transcript recorded.</p>
            )}
          </div>
        )}
      </section>

      {/* Doctor Clinical Notes Form */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-panel space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <NotebookPen className="size-4" /> Doctor Clinical Notes & Instructions
        </div>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter clinician impressions, ordered investigations, or prescriptions..."
          className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSaveNote} loading={savingNote}>
            Save Clinical Note
          </Button>
        </div>
      </section>
    </div>
  );
}
