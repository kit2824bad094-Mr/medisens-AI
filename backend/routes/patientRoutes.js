import { Router } from "express";
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
} from "../controllers/patientController.js";

const router = Router();

// GET /api/patients
router.get("/", getAllPatients);

// GET /api/patients/:id
router.get("/:id", getPatientById);

// POST /api/patients
router.post("/", createPatient);

// PATCH /api/patients/:id
router.patch("/:id", updatePatient);

export default router;
