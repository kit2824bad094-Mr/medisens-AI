import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey && apiKey.trim().length > 0) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn("[VoiceService] Failed to initialize Gemini API client:", err.message);
  }
}

const TRANSCRIPT_SAMPLES = {
  English: [
    "I have had fever for about three days now, mostly in the evening",
    "There is a heaviness in my chest when I walk",
    "I feel very weak and tired since two days",
    "My sugar reading was high this morning",
  ],
  "हिन्दी": [
    "मुझे तीन दिनों से बुखार है, ज़्यादातर शाम को",
    "चलते समय मेरे सीने में भारीपन होता है",
  ],
  "தமிழ்": [
    "மூன்று நாட்களாக மாலையில் காய்ச்சல் வருகிறது",
    "நடக்கும்போது நெஞ்சில் கனமாக இருக்கிறது",
  ],
  "മലയാളം": [
    "മൂന്ന് ദിവസമായി വൈകുന്നേരങ്ങളിൽ പനിയുണ്ട്",
    "നടക്കുമ്പോൾ നെഞ്ചിൽ ഭാരം തോന്നുന്നു",
  ],
  "मराठी": [
    "मला तीन दिवसांपासून संध्याकाळी ताप येतो",
    "चालताना छातीत जडपणा जाणवतो",
  ],
};

/**
 * Transcribes audio data or provides clinical speech samples.
 *
 * @param {object} params
 * @param {string|null} params.audioData - Base64 encoded audio
 * @param {string} params.mimeType - Audio mime type
 * @param {string} params.language - Language requested
 * @param {number} params.seed - Sample index selector
 * @returns {Promise<{ transcript: string, language: string }>}
 */
export async function transcribeVoice({ audioData = null, mimeType = "audio/webm", language = "English", seed = 0 } = {}) {
  // If real audio data is provided and Gemini API key is present
  if (genAI && audioData && typeof audioData === "string") {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const cleanBase64 = audioData.includes("base64,") ? audioData.split("base64,")[1] : audioData;

      const prompt = `Transcribe this patient audio recording verbatim in the patient's language (${language}).
Return ONLY the raw transcription text, without commentary or quotes.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "audio/webm",
          },
        },
      ]);

      const transcript = result.response.text().trim();
      if (transcript) {
        return { transcript, language, source: "gemini-audio" };
      }
    } catch (err) {
      console.warn("[VoiceService] Gemini audio transcription error, using sample fallback:", err.message);
    }
  }

  // Clinical transcript fallback based on requested language and seed
  const samples = TRANSCRIPT_SAMPLES[language] || TRANSCRIPT_SAMPLES.English;
  const sampleText = samples[seed % samples.length] || samples[0];

  return {
    transcript: sampleText,
    language,
    source: "sample",
  };
}
