/**
 * Voice capture and speech-to-text service.
 * Supports Web Speech API in supported browsers, and falls back to backend AI transcription.
 */

const LOCALES: Record<string, string> = {
  English: "en-IN",
  "हिन्दी": "hi-IN",
  "தமிழ்": "ta-IN",
  "മലയാളം": "ml-IN",
  "मराठी": "mr-IN",
};

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function createSpeechRecognizer(
  language = "English",
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (err: any) => void,
  onEnd: () => void
) {
  if (!isSpeechRecognitionSupported()) return null;

  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new Ctor();

  recognition.lang = LOCALES[language] || "en-IN";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event: any) => {
    let interim = "";
    let finalStr = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalStr += transcript;
      } else {
        interim += transcript;
      }
    }

    onResult((finalStr || interim).trim(), Boolean(finalStr));
  };

  recognition.onerror = onError;
  recognition.onend = onEnd;

  return recognition;
}

export async function requestBackendTranscription(
  audioBase64: string | null,
  language = "English",
  seed = 0
): Promise<string> {
  try {
    const res = await fetch("/api/ai/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioData: audioBase64, language, seed }),
    });
    if (!res.ok) throw new Error("Transcription request failed");
    const data = await res.json();
    return data.transcript || "";
  } catch (err) {
    console.warn("[VoiceService] Backend transcription fallback:", err);
    return "";
  }
}
