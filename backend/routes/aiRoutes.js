import { Router } from "express";
import {
  handleNextQuestion,
  handleGenerateSummary,
  handleDetectTriage,
  handleTranscribeVoice,
} from "../controllers/aiController.js";

const router = Router();

// POST /api/ai/question
router.post("/question", handleNextQuestion);

// POST /api/ai/summary
router.post("/summary", handleGenerateSummary);

// POST /api/ai/triage
router.post("/triage", handleDetectTriage);

// POST /api/ai/transcribe
router.post("/transcribe", handleTranscribeVoice);

export default router;
