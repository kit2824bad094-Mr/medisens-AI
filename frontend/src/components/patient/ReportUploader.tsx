import React, { useRef, useState } from "react";
import { Camera, Check, FileText, Loader2, UploadCloud, AlertCircle } from "lucide-react";
import { uploadAndExtractReport } from "../../services/ocr/reportOCR";
import type { ReportDoc } from "../../types/patient";
import { Button } from "../common/Button";
import { ReportViewer } from "../doctor/ReportViewer";
import { cn } from "../../utils/formatters";

interface Props {
  reports: ReportDoc[];
  onExtracted: (report: ReportDoc) => void;
}

export function ReportUploader({ reports, onExtracted }: Props) {
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [justDone, setJustDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: File[]) {
    setError(null);
    for (const file of fileList) {
      setProcessing(file.name);
      try {
        const report = await uploadAndExtractReport(file);
        onExtracted(report);
        setJustDone(report.id);
        setTimeout(() => setJustDone(null), 2500);
      } catch (err: any) {
        setError(err.message || "Failed to parse document. Please try a clearer image.");
      } finally {
        setProcessing(null);
      }
    }
  }

  const handleSimulatedReport = async (kind: "lab" | "rx") => {
    setProcessing(kind === "lab" ? "Blood-Profile-Scan.jpg" : "Prescription-Note.jpg");
    try {
      // Simulate file upload with mock blob
      const dummyFile = new File(
        ["dummy content"],
        kind === "lab" ? "Lab report - Glucose & HbA1c.jpg" : "Doctor Prescription - Rx.jpg",
        { type: "image/jpeg" }
      );
      const report = await uploadAndExtractReport(dummyFile);
      onExtracted(report);
      setJustDone(report.id);
      setTimeout(() => setJustDone(null), 2500);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-5 animate-rise">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length) void handleFiles(files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed bg-card p-6 sm:p-8 text-center transition-colors",
          dragging ? "border-primary bg-primary-soft/50" : "border-border"
        )}
      >
        <UploadCloud className="mx-auto size-10 text-primary" strokeWidth={1.8} aria-hidden />
        <h3 className="mt-3 text-lg font-semibold text-foreground">Upload Prescriptions or Lab Reports</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Drag and drop files here, take a photo with your device camera, or use sample clinical records.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button size="md" onClick={() => inputRef.current?.click()} disabled={!!processing}>
            <FileText className="size-4" aria-hidden /> Choose file
          </Button>

          <Button
            size="md"
            variant="outline"
            disabled={!!processing}
            onClick={() => handleSimulatedReport("lab")}
          >
            <Camera className="size-4" aria-hidden /> Sample Lab Report
          </Button>

          <Button
            size="md"
            variant="outline"
            disabled={!!processing}
            onClick={() => handleSimulatedReport("rx")}
          >
            Sample Prescription
          </Button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) void handleFiles(files);
            e.target.value = "";
          }}
        />
      </div>

      {processing && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-soft/40 px-4 py-3">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
          <p className="text-sm font-medium text-foreground">
            Reading & running OCR on <span className="font-semibold text-primary">{processing}</span> — extracting clinical fields…
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-alert/40 bg-alert-soft p-4 text-sm text-alert">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {reports.length === 0 && !processing ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
          No medical reports uploaded yet. This step is optional — you can proceed without uploading.
        </p>
      ) : (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-tight text-foreground">Uploaded Documents ({reports.length})</h4>
          {reports.map((r) => (
            <div key={r.id} className="animate-rise rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-panel">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.kind} · Uploaded {r.uploadedAt} · {r.fields.length} parameters extracted
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok-soft px-3 py-1 text-xs font-semibold text-ok",
                    justDone === r.id && "animate-rise ring-2 ring-ok/30"
                  )}
                >
                  <Check className="size-3.5" strokeWidth={2.6} aria-hidden /> Extracted
                </span>
              </div>
              <ReportViewer report={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
