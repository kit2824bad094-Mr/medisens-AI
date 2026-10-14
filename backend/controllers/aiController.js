import {
  generateAdaptiveQuestion,
  generateClinicalSummary,
  detectRedFlags,
} from "../services/geminiService.js";
import { transcribeVoice } from "../services/voiceService.js";

export async function handleNextQuestion(req, res, next) {
  try {
    const { answers = [], patientInfo = {}, language = "English" } = req.body;
    const question = await generateAdaptiveQuestion(answers, patientInfo, language);
    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
}

export async function handleGenerateSummary(req, res, next) {
  try {
    const { patientInfo = {}, symptoms = [], reports = [] } = req.body;
    const result = await generateClinicalSummary(patientInfo, symptoms, reports);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function handleDetectTriage(req, res, next) {
  try {
    const { text = "" } = req.body;
    const redFlags = await detectRedFlags(text);
    res.json({
      success: true,
      redFlags,
      urgency: redFlags.length > 0 ? "red-flag" : "normal",
    });
  } catch (error) {
    next(error);
  }
}

export async function handleTranscribeVoice(req, res, next) {
  try {
    const { audioData = null, mimeType = "audio/webm", language = "English", seed = 0 } = req.body;
    const transcript = await transcribeVoice({ audioData, mimeType, language, seed });
    res.json({ success: true, ...transcript });
  } catch (error) {
    next(error);
  }
}
