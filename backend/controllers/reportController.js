import { extractMedicalReport } from "../services/ocrService.js";

export async function handleExtractReport(req, res, next) {
  try {
    const { fileName = "Report.jpg", image = null, mimeType = "image/jpeg" } = req.body;
    const report = await extractMedicalReport(fileName, image, mimeType);
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}
