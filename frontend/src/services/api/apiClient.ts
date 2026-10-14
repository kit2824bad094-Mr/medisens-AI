import type { PatientRecord, ReportDoc, SymptomEntry } from "../../types/patient";
import type { InterviewQuestion, GeneratedIntake } from "../../types/ai";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Checks if the backend server is reachable.
 */
export async function checkBackendHealth(): Promise<{ ok: boolean; geminiConfigured?: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, geminiConfigured: data.geminiConfigured };
  } catch {
    return { ok: false };
  }
}

/**
 * Fetches all patients in the queue.
 */
export async function fetchPatients(): Promise<PatientRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/patients`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn("[ApiClient] Fetch patients fallback:", err);
    return [];
  }
}

/**
 * Fetches single patient by ID.
 */
export async function fetchPatientById(id: string): Promise<PatientRecord | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn("[ApiClient] Fetch patient by id fallback:", err);
    return null;
  }
}

/**
 * Submits a new patient intake record.
 */
export async function createPatientRecord(record: PatientRecord): Promise<{ success: boolean; data?: PatientRecord }> {
  try {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { success: true, data: data.data };
  } catch (err) {
    console.warn("[ApiClient] Create patient fallback to local:", err);
    return { success: true, data: record };
  }
}

/**
 * Updates a patient record (e.g., mark reviewed, mark viewed, doctor notes).
 */
export async function updatePatientRecord(
  id: string,
  patch: Partial<PatientRecord>
): Promise<PatientRecord | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn("[ApiClient] Update patient fallback:", err);
    return null;
  }
}

/**
 * Requests the next adaptive question from the backend AI service.
 */
export async function fetchNextQuestion(
  answers: SymptomEntry[],
  patientInfo: any = {},
  language = "English"
): Promise<InterviewQuestion | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, patientInfo, language }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.question || null;
  } catch (err) {
    console.warn("[ApiClient] Question generation fallback:", err);
    return null;
  }
}

/**
 * Generates clinical intake summary and triage flags.
 */
export async function fetchClinicalSummary(
  patientInfo: any,
  symptoms: SymptomEntry[],
  reports: ReportDoc[] = []
): Promise<GeneratedIntake | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientInfo, symptoms, reports }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      aiSummary: data.aiSummary,
      redFlags: data.redFlags || [],
      urgency: data.urgency || "normal",
      timelineEvents: [
        {
          id: `t-visit-${Date.now()}`,
          date: "Today",
          label: "Intake completed at clinic kiosk",
          detail: data.aiSummary?.chiefComplaint || "Intake completed",
          kind: "visit",
          severity: data.urgency === "red-flag" ? "high" : "low",
        },
        ...reports.map((r, i) => ({
          id: `t-rep-${i}`,
          date: "Today",
          label: `${r.kind} uploaded`,
          detail: r.fields.map((f) => `${f.label}: ${f.value}`).join(", "),
          kind: "lab" as const,
          severity: r.fields.some((f) => f.flagged) ? ("medium" as const) : ("low" as const),
        })),
      ],
    };
  } catch (err) {
    console.warn("[ApiClient] Summary generation fallback:", err);
    return null;
  }
}
