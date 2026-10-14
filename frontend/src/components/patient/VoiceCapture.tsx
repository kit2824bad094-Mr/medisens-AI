import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Mic, Square } from "lucide-react";
import { cn } from "../../utils/formatters";
import { createSpeechRecognizer, requestBackendTranscription } from "../../services/voice/speechToText";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  seed?: number;
  language?: string;
}

const BARS = 28;
const IDLE = () => Array.from({ length: BARS }, () => 0.15);

type VoiceCopy = {
  unsupported: string;
  blocked: string;
  denied: string;
  empty: string;
  stopped: string;
  start: string;
  stop: string;
  listening: string;
  idle: string;
};

const ENGLISH_COPY: VoiceCopy = {
  unsupported: "Microphone speech recognition is not supported in this browser. Using sample speech input.",
  blocked: "Microphone access was blocked. Please enable mic access in your browser settings.",
  denied: "Microphone permission is denied. Turn it on in your browser.",
  empty: "No voice detected. Tap the microphone and speak again.",
  stopped: "Voice input stopped. Tap to try again or type your answer.",
  start: "Start speaking",
  stop: "Stop and use what I said",
  listening: "Listening… speak in your own words, then tap the square when done.",
  idle: "Tap the microphone and speak your answer.",
};

export function VoiceCapture({ onTranscript, disabled, seed = 0, language = "English" }: Props) {
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(IDLE);
  const copy = ENGLISH_COPY;

  const recognitionRef = useRef<any>(null);
  const finalTextRef = useRef("");
  const stopAudioRef = useRef<(() => void) | null>(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      recognitionRef.current?.abort?.();
      stopAudioRef.current?.();
    };
  }, []);

  async function startWaveform() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (const v of data) peak = Math.max(peak, Math.abs(v - 128) / 128);
        setLevels((prev) => [...prev.slice(1), Math.max(0.12, Math.min(1, peak * 3))]);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      stopAudioRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
        stopAudioRef.current = null;
      };
      return true;
    } catch {
      return false;
    }
  }

  function finish(text: string) {
    stopAudioRef.current?.();
    if (!aliveRef.current) return;
    setListening(false);
    setLevels(IDLE());
    setPartial("");
    const clean = text.trim();
    if (clean) onTranscript(clean);
  }

  async function handleSimulatedFallback() {
    setListening(true);
    setNotice(copy.unsupported);
    const transcript = await requestBackendTranscription(null, language, seed);
    finish(transcript);
  }

  async function start() {
    setNotice(null);
    setPartial("");
    finalTextRef.current = "";

    const micGranted = await startWaveform();
    const recognizer = createSpeechRecognizer(
      language,
      (text, isFinal) => {
        setPartial(text);
        if (isFinal) {
          finalTextRef.current = text;
        }
      },
      (err: any) => {
        if (err?.error === "not-allowed") {
          setNotice(copy.denied);
        } else {
          setNotice(copy.stopped);
        }
        finish(finalTextRef.current);
      },
      () => {
        finish(finalTextRef.current || partial);
      }
    );

    if (!recognizer || !micGranted) {
      await handleSimulatedFallback();
      return;
    }

    recognitionRef.current = recognizer;
    setListening(true);
    try {
      recognizer.start();
    } catch {
      await handleSimulatedFallback();
    }
  }

  function stop() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    finish(finalTextRef.current || partial);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-panel">
      <div className="flex items-center gap-4">
        <div className="relative">
          {listening && (
            <span className="absolute inset-0 animate-ripple rounded-full bg-primary/25" aria-hidden />
          )}
          <button
            type="button"
            onClick={listening ? stop : start}
            disabled={disabled}
            aria-label={listening ? copy.stop : copy.start}
            className={cn(
              "relative grid size-16 place-items-center rounded-full text-primary-foreground transition-all cursor-pointer",
              listening ? "animate-breathe bg-primary" : "bg-primary hover:bg-primary/90",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {listening ? <Square className="size-6" strokeWidth={2.2} /> : <Mic className="size-7" strokeWidth={2} />}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex h-10 items-end gap-[3px]" aria-hidden>
            {levels.map((l, i) => (
              <span
                key={i}
                className={cn(
                  "w-full rounded-full transition-[height] duration-100",
                  listening ? "bg-primary/75" : "bg-border"
                )}
                style={{ height: `${Math.max(8, l * 100)}%` }}
              />
            ))}
          </div>
          <p aria-live="polite" className="mt-2 min-h-6 text-xs sm:text-sm text-muted-foreground">
            {listening ? partial || copy.listening : copy.idle}
          </p>
        </div>
      </div>

      {notice && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-warn/35 bg-warn-soft px-3 py-2 text-xs sm:text-sm text-warn-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {notice}
        </p>
      )}
    </div>
  );
}
