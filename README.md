# MedisensAI — AI Patient Intake & Clinical Triage System

MedisensAI is a clean, professional, beginner-friendly clinical information collection and triage support application. It bridges the gap between arriving patients and attending physicians by capturing symptoms, medical histories, vital measurements, and report documents before the consultation begins.

---

## 1. Project Overview

In busy outpatient clinics and hospitals, doctors frequently lose valuable consultation time asking routine intake questions and transcribing medical reports. 

**MedisensAI** streamlines this process:
- **For Patients:** An accessible pre-consultation kiosk where patients can answer simple, one-at-a-time questions using **Voice**, **Touch**, or **Text** in their preferred language. They can also upload paper lab reports and prescriptions.
- **For Clinicians:** A triaged outpatient queue that presents a concise, 10-second AI clinical summary, longitudinal health timeline, OCR-extracted parameters, and urgent red-flag alerts before they examine the patient.
- **Clinical Safety Rule:** MedisensAI is a *screening and information gathering assistant*, not an autonomous diagnostic system. The AI **never invents or hallucinates** measurements (such as blood pressure, temperature, or glucose). If a patient is unsure, it safely records the value as **"Not Available"** and instructs the patient to check with an appropriate monitor.

---

## 2. Technology Stack

MedisensAI uses a modern, beginner-friendly **Frontend + Backend** decoupled architecture:

### Frontend
- **React (v19):** Modern component-based user interface.
- **TypeScript:** Type-safe code prevention and clean IDE autocomplete.
- **Vite:** High-performance frontend build tool and local dev server.
- **Tailwind CSS (v4):** Custom clinical design system with tailored OKLCH color palettes and micro-animations.
- **React Router DOM (v7):** Client-side navigation between Patient Kiosk and Doctor Dashboard.
- **Speech-to-Text:** Browser Web Speech API with backend AI fallback.
- **Report OCR:** Client document scanner with interactive visual parameter overlays.

### Backend
- **Node.js & Express:** Lightweight, modular REST API server.
- **Google Generative AI (Gemini 1.5 Flash):** AI engine for adaptive questioning, red-flag triage, and clinical summarization.
- **CORS & Dotenv:** Secure cross-origin requests and environment variable configuration.
- **Clinical Safety Rules:** Deterministic safety middleware preventing hallucination of vitals.

---

## 3. Folder Structure

```text
MedisensAI/
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── hero-clinical.jpg
│   │   │   └── report-scan.jpg
│   │   │
│   │   ├── components/
│   │   │   ├── patient/
│   │   │   │   ├── PatientKiosk.tsx
│   │   │   │   ├── PatientDetails.tsx
│   │   │   │   ├── AdaptiveQuestionCard.tsx
│   │   │   │   ├── VoiceCapture.tsx
│   │   │   │   ├── ReportUploader.tsx
│   │   │   │   ├── MeasurementInput.tsx
│   │   │   │   └── PatientReview.tsx
│   │   │   │
│   │   │   ├── doctor/
│   │   │   │   ├── DoctorDashboard.tsx
│   │   │   │   ├── DoctorQueue.tsx
│   │   │   │   ├── PatientSummaryPanel.tsx
│   │   │   │   ├── HealthTimeline.tsx
│   │   │   │   ├── RedFlagBanner.tsx
│   │   │   │   ├── ReportViewer.tsx
│   │   │   │   └── UrgencyBadge.tsx
│   │   │   │
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Loading.tsx
│   │   │       └── ErrorMessage.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Patient.tsx
│   │   │   ├── Doctor.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   └── apiClient.ts
│   │   │   │
│   │   │   ├── voice/
│   │   │   │   └── speechToText.ts
│   │   │   │
│   │   │   └── ocr/
│   │   │       └── reportOCR.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── usePatient.ts
│   │   │   └── useConversation.ts
│   │   │
│   │   ├── types/
│   │   │   ├── patient.ts
│   │   │   ├── doctor.ts
│   │   │   └── ai.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   └── formatters.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── patientRoutes.js
│   │   └── reportRoutes.js
│   │
│   ├── services/
│   │   ├── geminiService.js
│   │   ├── ocrService.js
│   │   └── voiceService.js
│   │
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── patientController.js
│   │   └── reportController.js
│   │
│   ├── middleware/
│   │   └── errorHandler.js
│   │
│   ├── utils/
│   │   └── validation.js
│   │
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── .gitignore
├── README.md
└── package.json
```

---

## 4. Frontend Responsibility

Everything the patient and doctor interact with lives inside `frontend/`:
- **Patient Experience:** Multilingual kiosk flow, voice wave microphone visualizer, adaptive clinical question cards, report image upload, and review screen.
- **Doctor Experience:** Triage queue sorted by clinical risk (`red-flag` first), 10-second summary panel, longitudinal health timeline, OCR overlays, and clinical notes.
- **Safety Guarantee:** The frontend **never** stores or handles `GEMINI_API_KEY`. All AI queries are sent through the secure backend API.

---

## 5. Backend Responsibility

Everything communicating with external AI services, protecting secrets, and storing data lives inside `backend/`:
- **`geminiService.js`:** Interacts with Google Gemini 1.5 Flash to generate adaptive questions, summarize clinical symptoms, and evaluate acute red flags.
- **`ocrService.js`:** Parses uploaded lab reports and prescriptions using Gemini Vision with reliable clinical template fallbacks.
- **`voiceService.js`:** Handles audio transcription and localized clinical language support.
- **`patientController.js`:** Manages patient queue records, arrived timestamps, and physician sign-offs.

---

## 6. Environment Variables

All secrets stay **strictly** in `backend/.env`.

1. In the `backend` folder, copy `.env.example` to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Open `backend/.env` and insert your Google Gemini API key:
   ```env
   PORT=5000
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```
   > **Note:** If `GEMINI_API_KEY` is omitted, MedisensAI automatically runs in **Demo Mode**, using built-in clinical templates so you can test the entire workflow without an API key!

---

## 7. Installation & Running the Project

### Quick Start (Both Backend & Frontend)

From the project root directory, run:
```bash
npm install
npm run dev
```
*This starts both the backend API (`http://localhost:5000`) and the frontend app (`http://localhost:5173`) concurrently with live reload!*

---

### Running Separately

#### Running the Backend
```bash
cd backend
npm install
npm run dev
```
*The backend API will start on `http://localhost:5000`.*
- Health check: `http://localhost:5000/api/health`

#### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend will start on `http://localhost:5173`.*

---

## 8. Application Flow

```text
       Patient
          ↓ (Speaks or enters symptoms)
       Frontend (React + Vite)
          ↓ (POST /api/ai/question or /api/ai/summary)
       Backend (Node.js + Express)
          ↓ (Secure call with GEMINI_API_KEY)
       Gemini AI LLM (Gemini 1.5 Flash)
          ↓ (Structured clinical JSON response)
       Backend Validation (Sanitizes & checks vitals safety)
          ↓ (Returns verified JSON)
       Frontend (Displays adaptive question / summary)
          ↓ (Physician opens review dashboard)
        Doctor (Reviews Red Flags, Summary, Timeline & Signs Off)
```

---

## 9. Doctor Authentication & Supabase Setup

MedisensAI uses **Supabase Authentication** with role-based access control for clinician sign in:
- **Email + Password Login:** Real authentication with session persistence.
- **Google OAuth Login:** One-click clinician sign-in via Google accounts.
- **Doctor Registration:** Clinician account creation with Full Name, Specialization, Medical License ID, and Phone Number.
- **Forgot Password & Recovery:** Automated reset links via email and secure new password creation.
- **Protected Doctor Dashboard:** Access to `/doctor` and `/doctor/dashboard` requires an active doctor session; unauthorized users are automatically redirected to `/login`.

### Setting up Supabase Authentication:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** -> **API**, and copy your **Project URL** and **anon public key**.
3. Add them to `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Open Supabase Dashboard -> **SQL Editor**, and run the SQL script located at:
   `supabase/schema.sql`
   *(This creates the `profiles` table, RLS security policies, and automatic profile provisioning triggers).*
5. To enable Google OAuth:
   - In Google Cloud Console, create OAuth 2.0 Credentials.
   - In Supabase Dashboard -> **Authentication** -> **Providers** -> **Google**, enable Google and enter your Google Client ID and Client Secret.
   - Add Supabase's Redirect URL (`https://<your-project>.supabase.co/auth/v1/callback`) to Authorized Redirect URIs in Google Cloud Console.

---

## 10. Architecture Explained Simply

- **Frontend = What the user sees:** The screens, buttons, voice microphone, text boxes, and charts that patients and doctors tap and read.
- **Backend = What happens behind the scenes:** The kitchen where orders are processed, patient records are saved, and data is protected.
- **Supabase = The Identity Provider:** Handles passwords, OAuth sessions, password-recovery emails, and role-based user profiles safely.
- **Gemini = The AI brain:** The intelligent assistant that reads patient statements and selects relevant clinical follow-up questions.
- **API Key = The secret password:** The backend's private key that grants permission to communicate with Gemini safely without exposing it to the public web.

