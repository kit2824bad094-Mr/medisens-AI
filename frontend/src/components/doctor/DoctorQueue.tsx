import React, { useState } from "react";
import { Clock, Eye, EyeOff, Users, AlertTriangle, CheckCircle, Search, ArrowRight } from "lucide-react";
import type { PatientRecord } from "../../types/patient";
import { UrgencyBadge } from "./UrgencyBadge";
import { cn } from "../../utils/formatters";

interface Props {
  patients: PatientRecord[];
  selectedPatientId?: string;
  onSelectPatient: (patientId: string) => void;
  onToggleViewed?: (patientId: string, currentViewed: boolean) => void;
}

const ORDER = { "red-flag": 0, priority: 1, normal: 2 } as const;

export function DoctorQueue({
  patients,
  selectedPatientId,
  onSelectPatient,
  onToggleViewed,
}: Props) {
  const [filter, setFilter] = useState<"all" | "waiting" | "red-flag" | "reviewed">("all");
  const [search, setSearch] = useState("");

  const sortedPatients = [...patients].sort(
    (a, b) => ORDER[a.urgency] - ORDER[b.urgency]
  );

  const filteredPatients = sortedPatients.filter((p) => {
    if (filter === "waiting" && p.reviewed) return false;
    if (filter === "reviewed" && !p.reviewed) return false;
    if (filter === "red-flag" && p.urgency !== "red-flag") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.patientInfo.name.toLowerCase().includes(q);
      const matchId = p.patientInfo.id.toLowerCase().includes(q);
      const matchComplaint = (p.aiSummary?.chiefComplaint || "").toLowerCase().includes(q);
      return matchName || matchId || matchComplaint;
    }
    return true;
  });

  const redFlagsCount = patients.filter((r) => r.urgency === "red-flag").length;
  const waitingCount = patients.filter((r) => !r.reviewed).length;
  const reviewedCount = patients.filter((r) => r.reviewed).length;

  return (
    <div className="space-y-5 animate-rise">
      {/* Header and stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Clinical Patient Queue
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            Triaged by clinical urgency · AI pre-consultation summaries
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="rounded-xl border border-border bg-card px-3.5 py-2 shadow-panel">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5" aria-hidden /> Waiting
            </span>
            <span className="text-base sm:text-lg font-bold text-foreground">{waitingCount}</span>
          </div>

          <div
            className={cn(
              "rounded-xl border border-border bg-card px-3.5 py-2 shadow-panel",
              redFlagsCount > 0 && "border-alert/50 bg-alert-soft"
            )}
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="size-3.5 text-alert" aria-hidden /> Red Flags
            </span>
            <span className={cn("text-base sm:text-lg font-bold", redFlagsCount > 0 ? "text-alert" : "text-foreground")}>
              {redFlagsCount}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card px-3.5 py-2 shadow-panel">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="size-3.5 text-ok" aria-hidden /> Reviewed
            </span>
            <span className="text-base sm:text-lg font-bold text-foreground">{reviewedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by patient name, ID, or symptoms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-1.5 rounded-xl border border-border bg-card p-1">
          {[
            { id: "all", label: "All" },
            { id: "waiting", label: "Waiting" },
            { id: "red-flag", label: "Red Flags" },
            { id: "reviewed", label: "Reviewed" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id as any)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer",
                filter === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Patients queue list */}
      <ul className="space-y-2.5">
        {filteredPatients.length === 0 ? (
          <li className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            No patients match the selected filter.
          </li>
        ) : (
          filteredPatients.map((r) => {
            const isSelected = selectedPatientId === r.patientInfo.id;
            return (
              <li
                key={r.patientInfo.id}
                className={cn(
                  "group flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/50 shadow-sm cursor-pointer",
                  isSelected ? "border-primary ring-2 ring-primary/20 bg-primary-soft/10" : "border-border",
                  r.urgency === "red-flag" && "border-alert/50 bg-alert-soft/20",
                  r.reviewed && "opacity-75"
                )}
                onClick={() => onSelectPatient(r.patientInfo.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-foreground text-base">
                      {r.patientInfo.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {r.patientInfo.age} {r.patientInfo.sex ? r.patientInfo.sex[0] : ""} · {r.patientInfo.id}
                    </span>
                    <UrgencyBadge urgency={r.urgency} />
                  </div>

                  <p className="mt-1 text-sm text-foreground/90 font-medium line-clamp-1">
                    {r.aiSummary?.oneLiner || r.aiSummary?.chiefComplaint || "Intake completed"}
                  </p>

                  <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-muted-foreground" />
                      Arrived {r.arrivedAt}
                    </span>
                    <span>Lang: {r.patientInfo.language}</span>
                    {r.reports && r.reports.length > 0 && (
                      <span className="text-primary font-medium">
                        {r.reports.length} report(s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {onToggleViewed && (
                    <button
                      type="button"
                      onClick={() => onToggleViewed(r.patientInfo.id, r.viewed)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                        r.viewed
                          ? "border-ok/30 bg-ok-soft text-ok hover:bg-ok/20"
                          : "border-warn/35 bg-warn-soft text-warn-foreground hover:bg-warn/20"
                      )}
                    >
                      {r.viewed ? (
                        <>
                          <Eye className="size-3.5" /> Viewed
                        </>
                      ) : (
                        <>
                          <EyeOff className="size-3.5" /> Unread
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectPatient(r.patientInfo.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                    aria-label="Open patient details"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
