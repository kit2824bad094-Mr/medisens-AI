import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ClipboardList,
  FileScan,
  Mic,
  MessagesSquare,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Activity,
} from "lucide-react";
import heroImage from "../assets/hero-clinical.jpg";
import { Button } from "../components/common/Button";

const PIPELINE = [
  { Icon: Mic, title: "Voice Capture", text: "Patient speaks in their native language; real-time audio waveform and speech-to-text." },
  { Icon: MessagesSquare, title: "AI Questions", text: "Adaptive follow-up questions tailored to previous answers and missing parameters." },
  { Icon: FileScan, title: "Report OCR", text: "Lab values, blood tests, and prescriptions scanned and extracted into structured parameters." },
  { Icon: AlertTriangle, title: "Triage Alert", text: "Automatic rule & LLM screening for acute cardiac, metabolic, and respiratory red flags." },
  { Icon: ClipboardList, title: "Clinical Summary", text: "Structured chief complaint, duration, medication, and explicit measurement availability." },
  { Icon: Stethoscope, title: "Physician Review", text: "Physician-first dashboard with longitudinal timeline, OCR tags, and 10-second summary." },
];

export function Home() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:py-16 md:grid-cols-2 md:py-20">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-soft px-3.5 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" aria-hidden /> Pre-Consultation Clinical Intake & Triage
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight text-foreground">
              The consultation starts before the doctor says hello.
            </h1>

            <p className="max-w-prose text-base sm:text-lg leading-relaxed text-muted-foreground">
              <strong className="text-foreground font-semibold">MediSens AI</strong> interviews the patient by voice, touch or text, extracts data from uploaded medical reports, and hands the physician a structured clinical intake summary — with urgent red flags highlighted, and never diagnosing autonomously.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Button asChild size="lg" className="text-base px-6">
                <Link to="/patient">
                  <Mic className="size-5 mr-1.5" /> Start Patient Intake
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="text-base px-6">
                <Link to="/doctor">
                  <Stethoscope className="size-5 mr-1.5" /> Open Doctor Dashboard
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              * Powered by Google Gemini. All outputs are presented as an AI-assisted intake summary for clinician verification.
            </p>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Clinical intake review workflow"
              width={1400}
              height={1000}
              className="w-full rounded-2xl border border-border bg-surface shadow-clinical object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6-Stage Pipeline Explanation */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Clinical Architecture</span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            How the MediSens AI Pipeline Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Six coordinated clinical stages designed to save physician consultation time while improving diagnostic safety.
          </p>
        </div>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PIPELINE.map(({ Icon, title, text }, i) => (
            <li
              key={title}
              className="animate-rise rounded-2xl border border-border bg-card p-6 shadow-panel hover:shadow-md transition-shadow"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary font-bold">
                  <Icon className="size-5" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Stage 0{i + 1}
                  </span>
                  <h3 className="font-bold text-foreground text-base">{title}</h3>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>

              <div
                className="mt-4 h-1 rounded-full bg-gradient-to-r from-primary to-primary/20"
                style={{ width: `${(i + 1) * 16.6}%` }}
              />
            </li>
          ))}
        </ol>
      </section>

      {/* Two Persona Split: Patient vs Doctor */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-panel space-y-4">
            <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
              <Mic className="size-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">For the Patient</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Large text, accessible touch targets, voice dictation in multiple Indian languages, and adaptive questions. No overwhelming medical jargon — one simple question at a time with a review screen before submitting.
            </p>
            <div>
              <Button asChild variant="outline">
                <Link to="/patient">
                  Try the Kiosk Experience <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-panel space-y-4">
            <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
              <Stethoscope className="size-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">For the Clinician</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              An urgency-prioritized outpatient queue with one-line AI summaries, a 10-second summary panel, longitudinal health timeline, OCR report overlays, and sign-off tracking.
            </p>
            <div>
              <Button asChild variant="outline">
                <Link to="/doctor">
                  Open Doctor Queue &amp; Detail <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground">
        MediSens AI · Ayushman Bharat Digital Mission (ABDM) Ready Architecture · Clinical Information Gathering &amp; Triage Support Tool.
      </footer>
    </main>
  );
}
