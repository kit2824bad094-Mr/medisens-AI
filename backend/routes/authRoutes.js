import { Router } from "express";
import { handleEmailLogin, handleGoogleLogin } from "../controllers/authController.js";

const router = Router();

// POST /api/auth/login
router.post("/login", handleEmailLogin);

// POST /api/auth/google
router.post("/google", handleGoogleLogin);

export default router;
