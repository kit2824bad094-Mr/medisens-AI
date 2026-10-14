import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Hand,
  Keyboard,
  Languages,
  Mic,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { AdaptiveQuestionCard, ThinkingBubble } from "./AdaptiveQuestionCard";
import { VoiceCapture } from "./VoiceCapture";
import { ReportUploader } from "./ReportUploader";
import { PatientDetails } from "./PatientDetails";
import { MeasurementInput } from "./MeasurementInput";
import { PatientReview } from "./PatientReview";
import { Button } from "../common/Button";
import { fetchNextQuestion, fetchClinicalSummary, createPatientRecord } from "../../services/api/apiClient";
import type { PatientInfo, PatientRecord, ReportDoc, SymptomEntry } from "../../types/patient";
import type { InterviewQuestion } from "../../types/ai";
import { cn } from "../../utils/formatters";

type Step = "welcome" | "details" | "interview" | "reports" | "review" | "done";
const STEP_INDEX: Record<Step, number> = { welcome: 0, details: 1, interview: 2, reports: 3, review: 4, done: 5 };
const LANGUAGES = ["English", "हिन्दी", "தமிழ்", "മലയാളം", "मराठी"];

const WELCOME_COPY: Record<string, { title: string; description: string; start: string }> = {
  English: {
    title: "Let's get you ready for the doctor",
    description: "It takes about two minutes. You can speak, tap, or type — whatever is easiest right now.",
    start: "Begin Patient Intake",
  },
  "हिन्दी": {
    title: "डॉक्टर से मिलने की तैयारी करें",
    description: "इसमें लगभग दो मिनट लगेंगे। आप बोलकर, टैप करके या लिखकर उत्तर दे सकते हैं।",
    start: "प्रारंभ करें",
  },
  "தமிழ்": {
    title: "மருத்துவரைச் சந்திக்கத் தயாராகலாம்",
    description: "இதற்கு சுமார் இரண்டு நிமிடங்கள் ஆகும். பேசலாம், தட்டலாம் அல்லது தட்டச்சு செய்யலாம்.",
    start: "தொடங்குங்கள்",
  },
  "മലയാളം": {
    title: "ഡോക്ടറെ കാണാൻ തയ്യാറാകാം",
    description: "ഇതിന് ഏകദേശം രണ്ട് മിനിറ്റ് മതി. സംസാരിച്ചോ, അമർത്തിയോ, ടൈപ്പ് ചെയ്തോ ഉത്തരം നൽകാം.",
    start: "ആരംഭിക്കുക",
  },
  "मराठी": {
    title: "डॉक्टरांना भेटण्यासाठी तयारी करूया",
    description: "यासाठी सुमारे दोन मिनिटे लागतील. तुम्ही बोलून, टॅप करून किंवा टाइप करून उत्तर देऊ शकता.",
    start: "सुरुवात करा",
  },
};

export function PatientKiosk() {
  const [step, setStep] = useState<Step>("welcome");
  const [language, setLanguage] = useState("English");
  const [mode, setMode] = useState<"voice" | "text" | "touch">("voice");
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    id: `P-${Math.floor(10000 + Math.random() * 90000)}`,
    name: "",
    age: "",
    sex: "Female",
    abhaId: "",
    language: "English",
  });
  const [answers, setAnswers] = useState<SymptomEntry[]>([]);
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [thinking, setThinking] = useState(false);
  const [interviewDone, setInterviewDone] = useState(false);
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ record: PatientRecord; queueNumber: string } | null>(null);

  const transcriptEnd = useRef<HTMLDivElement>(null);
  const welcomeCopy = WELCOME_COPY[language] || WELCOME_COPY.English;

  // Ask next adaptive question when on interview step
  useEffect(() => {
    // Stop if: not on interview step, already have a question, interview done, or hit hard cap
    if (step !== "interview" || question || interviewDone || answers.length >= 5) return;

    let cancelled = false;
    setThinking(true);
    fetchNextQuestion(answers, patientInfo, language).then((q) => {
      if (cancelled) return;
      if (!q) {
        // Backend signals interview is complete — advance to reports step
        setInterviewDone(true);
        setThinking(false);
        setTimeout(() => setStep("reports"), 800);
        return;
      }
      setQuestion(q);
      setThinking(false);
    }).catch(() => {
      if (!cancelled) setThinking(false);
    });
    return () => { cancelled = true; };
  }, [step, question, interviewDone, answers, language, patientInfo]);

  useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [answers.length, thinking, question]);

  const recordAnswer = (answerText: string) => {
    const currentQText = question?.text || "Symptom question";
    setAnswers((prev) => [
      ...prev,
      {
        question: currentQText,
        answer: answerText,
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setQuestion(null);
    // If we've now reached 5 answers, mark interview done and advance
    if (answers.length + 1 >= 5) {
      setInterviewDone(true);
      setTimeout(() => setStep("reports"), 600);
    }
  };

  const handlePatientDetailsSubmit = (details: {
    name: string;
    age: number;
    sex: "Male" | "Female" | "Other";
    abhaId: string;
    disease?: string;
  }) => {
    setPatientInfo((prev) => ({
      ...prev,
      ...details,
      language,
    }));
    setInterviewDone(false);
    setAnswers([]);
    setQuestion(null);
    setStep("interview");
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Generate clinical summary and triage
      const clinicalData = await fetchClinicalSummary(patientInfo, answers, reports);

      // 2. Assemble complete record
      const fullRecord: PatientRecord = {
        patientInfo,
        arrivedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        urgency: clinicalData?.urgency || "normal",
        reviewed: false,
        viewed: false,
        symptoms: answers,
        history: [],
        medications: [],
        reports,
        timelineEvents: clinicalData?.timelineEvents || [
          {
            id: "ev-1",
            date: "Today",
            label: "Intake completed at kiosk",
            detail: answers[0]?.answer || "Self intake",
            kind: "visit",
            severity: "low",
          },
        ],
        aiSummary: clinicalData?.aiSummary || {
          chiefComplaint: answers[0]?.answer || "Consultation request",
          associatedSymptoms: answers.slice(1, 3).map((a) => a.answer),
          duration: answers[1]?.answer || "Recent",
          pastHistory: [],
          currentMedication: [],
          oneLiner: `${patientInfo.age}${patientInfo.sex[0]} — ${answers[0]?.answer || "Intake completed"}`,
          confidence: 0.9,
        },
        redFlags: clinicalData?.redFlags || [],
      };

      // 3. Post to backend
      await createPatientRecord(fullRecord);

      setSubmitted({
        record: fullRecord,
        queueNumber: fullRecord.patientInfo.id,
      });
      setStep("done");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Top progress bar for active steps */}
      {step !== "welcome" && step !== "done" && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-primary">
              Step {STEP_INDEX[step]} of 4: {step}
            </span>
            <span>{Math.round((STEP_INDEX[step] / 4) * 100)}% Completed</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${(STEP_INDEX[step] / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 0: Welcome Screen */}
      {step === "welcome" && (
        <div className="animate-rise space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-clinical text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Stethoscope className="size-8" strokeWidth={2.2} />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {welcomeCopy.title}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              {welcomeCopy.description}
            </p>
          </div>

          {/* Language selector */}
          <div className="space-y-2 pt-2">
            <label className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Languages className="size-3.5" /> Select Preferred Language
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer border ${
                    language === lang
                      ? "border-primary bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Input mode preference */}
          <div className="space-y-2 pt-1">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              How would you prefer to answer?
            </span>
            <div className="flex justify-center gap-3">
              {[
                { id: "voice", label: "Voice", icon: Mic },
                { id: "touch", label: "Touch", icon: Hand },
                { id: "text", label: "Type", icon: Keyboard },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id as any)}
                  className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    mode === id
                      ? "border-primary bg-primary-soft text-primary font-semibold"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button size="lg" onClick={() => setStep("details")} className="w-full sm:w-auto min-w-48 text-base">
              {welcomeCopy.start}
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-2">
            <ShieldCheck className="size-3.5 text-primary" />
            Safe, confidential pre-consultation intake. Not an emergency service.
          </p>
        </div>
      )}

      {/* STEP 1: Patient Information */}
      {step === "details" && (
        <PatientDetails
          initialValues={patientInfo}
          onSubmit={handlePatientDetailsSubmit}
          language={language}
        />
      )}

      {/* STEP 2: Adaptive Interview */}
      {step === "interview" && (
        <div className="space-y-6">
          {/* Transcript / Conversation bubble history */}
          {answers.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your consultation dialogue ({answers.length}/6)
              </h2>
              <div className="space-y-2.5">
                {answers.map((entry, idx) => (
                  <div key={idx} className="space-y-1.5">
                    {/* Assistant Question */}
                    <div className="flex items-start gap-2.5">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-primary text-xs font-bold mt-0.5">
                        Q
                      </span>
                      <div className="rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-2.5 text-sm text-foreground">
                        {entry.question}
                      </div>
                    </div>

                    {/* Patient Answer */}
                    <div className="flex justify-end gap-2.5">
                      <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground font-medium max-w-[85%]">
                        {entry.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thinking bubble while waiting for AI */}
          {thinking && <ThinkingBubble />}

          {/* Current Adaptive Question Card */}
          {question && !thinking && (
            <AdaptiveQuestionCard
              question={question}
              onAnswer={recordAnswer}
              language={language}
            />
          )}

          {/* Measurement check option */}
          {answers.length >= 3 && !showMeasurement && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowMeasurement(true)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                + Add vital reading (Blood pressure, Sugar, Temperature)
              </button>
            </div>
          )}

          {showMeasurement && (
            <MeasurementInput
              measurementType="Blood Pressure"
              onSave={(result) => {
                recordAnswer(`${result.label}: ${result.value}`);
                setShowMeasurement(false);
              }}
              onSkip={() => setShowMeasurement(false)}
            />
          )}

          {/* Voice Input capture if mode is voice or by request */}
          <VoiceCapture
            language={language}
            seed={answers.length}
            onTranscript={(spokenText) => {
              if (spokenText) recordAnswer(spokenText);
            }}
          />

          <div ref={transcriptEnd} />

          {/* Controls to finish interview or move to reports */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => setStep("details")}>
              <ArrowLeft className="size-4 mr-1" /> Back
            </Button>

            {answers.length >= 2 && (
              <Button size="md" onClick={() => setStep("reports")}>
                Continue to Document Upload
                <ArrowRight className="size-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Report Upload */}
      {step === "reports" && (
        <div className="space-y-6">
          <ReportUploader
            reports={reports}
            onExtracted={(extractedDoc) => setReports((prev) => [...prev, extractedDoc])}
          />

          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => setStep("interview")}>
              <ArrowLeft className="size-4 mr-1" /> Back to Questions
            </Button>

            <Button size="md" onClick={() => setStep("review")}>
              Review Summary
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Review before submission */}
      {step === "review" && (
        <PatientReview
          patientInfo={patientInfo}
          answers={answers}
          reports={reports}
          onBack={() => setStep("interview")}
          onConfirm={handleFinalSubmit}
          submitting={submitting}
        />
      )}

      {/* STEP 5: Intake Complete Screen */}
      {step === "done" && submitted && (
        <div className="animate-rise space-y-6 rounded-2xl border border-ok/40 bg-card p-6 sm:p-10 shadow-clinical text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-ok-soft text-ok">
            <CheckCircle2 className="size-8" strokeWidth={2.4} />
          </div>

          <div>
            <span className="inline-flex rounded-full bg-ok-soft border border-ok/30 px-3 py-1 text-xs font-semibold text-ok">
              Intake Successfully Submitted
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              You are all set for your consultation
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Your doctor has received your structured clinical summary, symptoms, and uploaded records.
            </p>
          </div>

          <div className="mx-auto max-w-sm rounded-xl border border-border bg-surface p-5 text-left space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Patient Ticket:</span>
              <span className="font-bold text-foreground">{submitted.queueNumber}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Patient Name:</span>
              <span className="font-semibold text-foreground">{submitted.record.patientInfo.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Arrival Timestamp:</span>
              <span className="font-semibold text-foreground">{submitted.record.arrivedAt}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Triage Status:</span>
              <span className="font-semibold capitalize text-primary">{submitted.record.urgency}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Button asChild size="lg">
              <Link to="/">Return to Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/doctor">Doctor Queue View</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
