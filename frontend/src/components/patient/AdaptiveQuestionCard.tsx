import React, { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import type { InterviewQuestion } from "../../types/ai";
import { Button } from "../common/Button";
import { Input } from "../common/Input";

interface Props {
  question: InterviewQuestion;
  onAnswer: (answer: string) => void;
  busy?: boolean;
  language?: string;
}

type CardCopy = { assistant: string; unsure: string; placeholder: string; send: string };
const ENGLISH_COPY: CardCopy = {
  assistant: "AI Intake Assistant",
  unsure: "I don't know",
  placeholder: "Or type your answer…",
  send: "Send",
};

const COPY: Record<string, CardCopy> = {
  English: ENGLISH_COPY,
  "हिन्दी": { assistant: "AI सेवन सहायक", unsure: "पता नहीं", placeholder: "या अपना उत्तर लिखें…", send: "भेजें" },
  "தமிழ்": { assistant: "AI உடல்நல உதவியாளர்", unsure: "தெரியவில்லை", placeholder: "அல்லது பதிலை தட்டச்சு செய்யுங்கள்…", send: "அனுப்பு" },
  "മലയാളം": { assistant: "AI ആരോഗ്യ സഹായി", unsure: "ഉറപ്പില്ല", placeholder: "അല്ലെങ്കിൽ ഉത്തരം ടൈപ്പ് ചെയ്യൂ…", send: "അയയ്ക്കുക" },
  "मराठी": { assistant: "AI आरोग्य सहाय्यक", unsure: "माहीत नाही", placeholder: "किंवा उत्तर टाइप करा…", send: "पाठवा" },
};

export function AdaptiveQuestionCard({ question, onAnswer, busy, language = "English" }: Props) {
  const [draft, setDraft] = useState("");
  const copy = COPY[language] || ENGLISH_COPY;

  return (
    <div className="animate-rise rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-clinical">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        <Sparkles className="size-4" strokeWidth={2.2} aria-hidden />
        {copy.assistant}
      </div>

      <p className="mt-3 text-kiosk font-medium text-foreground">{question.text}</p>

      {question.advice && (
        <div className="mt-2.5 rounded-lg border border-primary/20 bg-primary-soft/60 px-3.5 py-2 text-xs text-primary font-medium">
          {question.advice}
        </div>
      )}

      {/* Quick reply suggestion chips */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {question.chips.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={busy}
            onClick={() => onAnswer(chip)}
            className="min-h-11 rounded-full border border-primary/25 bg-primary-soft px-4 text-sm sm:text-base font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-50 cursor-pointer"
          >
            {chip}
          </button>
        ))}

        {!question.chips.some((c) => c.toLowerCase().includes("know") || c.toLowerCase().includes("sure")) && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAnswer(copy.unsure)}
            className="min-h-11 rounded-full border border-border bg-secondary px-4 text-sm sm:text-base font-medium text-secondary-foreground transition-all hover:bg-accent disabled:opacity-50 cursor-pointer"
          >
            {copy.unsure}
          </button>
        )}
      </div>

      {/* Free text response */}
      <form
        className="mt-5 flex gap-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          onAnswer(draft.trim());
          setDraft("");
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={copy.placeholder}
          aria-label="Type your answer"
          className="h-12 text-sm sm:text-base"
          disabled={busy}
        />
        <Button type="submit" size="lg" disabled={busy || !draft.trim()} className="h-12 shrink-0">
          <Send className="size-4" aria-hidden />
          <span className="sr-only sm:not-sr-only sm:ml-1.5">{copy.send}</span>
        </Button>
      </form>
    </div>
  );
}

export function ThinkingBubble() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs sm:text-sm text-muted-foreground shadow-panel">
      <Sparkles className="size-4 text-primary animate-pulse" aria-hidden />
      <span>AI is evaluating and choosing the next clinical question</span>
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-primary/70"
            style={{ animationDelay: `${i * 130}ms` }}
          />
        ))}
      </span>
    </div>
  );
}
