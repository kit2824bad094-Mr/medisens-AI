import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in local dev
      }
    },
    credentials: true,
  })
);

// Body parsers with payload limits for base64 OCR / voice
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "MediSense AI Backend",
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/reports", reportRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});

// Central Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("=========================================");
  console.log(`🩺 MediSense AI Backend running on port ${PORT}`);
  console.log(`🚀 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Engine: ${process.env.GEMINI_API_KEY ? "Gemini 1.5 Flash (Online)" : "Clinical Rules & Templates (Demo Mode)"}`);
  console.log("=========================================");
});
