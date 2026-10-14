import type { AiSummary, RedFlag, TimelineEvent, Urgency } from "./patient";

export interface InterviewQuestion {
  id: string;
  text: string;
  chips: string[];
  allowFreeText?: boolean;
  advice?: string;
}

export interface GeneratedIntake {
  aiSummary: AiSummary;
  redFlags: RedFlag[];
  urgency: Urgency;
  timelineEvents: TimelineEvent[];
}

export interface TranscribeResult {
  transcript: string;
  language: string;
  source?: string;
}
