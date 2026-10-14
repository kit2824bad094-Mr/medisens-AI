import { Router } from "express";
import { handleExtractReport } from "../controllers/reportController.js";

const router = Router();

// POST /api/reports/ocr
router.post("/ocr", handleExtractReport);

export default router;
