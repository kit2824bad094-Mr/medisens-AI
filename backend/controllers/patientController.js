import { validatePatientPayload } from "../utils/validation.js";

// In-memory patient store
let patients = [
  {
    patientInfo: {
      id: "P-10241",
      name: "Ramesh Iyer",
      age: 58,
      sex: "Male",
      abhaId: "12-3456-7890-1234",
      language: "English",
    },
    arrivedAt: "09:12",
    urgency: "red-flag",
    reviewed: false,
    viewed: false,
    symptoms: [
      { question: "What brings you in today?", answer: "Heaviness in my chest since last night, it comes in waves.", at: "09:13" },
      { question: "You mentioned chest heaviness — does it spread to your arm, jaw or back?", answer: "Yes, down my left arm.", at: "09:14" },
      { question: "Are you sweating or feeling short of breath with it?", answer: "Sweating a lot, and breathless when I walk to the gate.", at: "09:15" },
      { question: "Have you taken your blood pressure medicine today?", answer: "No, I missed it yesterday and today.", at: "09:16" },
    ],
    history: [
      { condition: "Hypertension", since: "2016", status: "Active" },
      { condition: "Hyperlipidaemia", since: "2019", status: "Monitored" },
      { condition: "Smoker (15 pack-years)", since: "1998", status: "Active" },
    ],
    medications: [
      { name: "Telmisartan", dose: "40 mg", frequency: "Once daily" },
      { name: "Atorvastatin", dose: "20 mg", frequency: "At night" },
    ],
    reports: [
      {
        id: "R-771",
        title: "Lipid profile + ECG note",
        kind: "Lab report",
        uploadedAt: "09:17",
        fields: [
          { label: "LDL Cholesterol", value: "164 mg/dL", flagged: true, x: 62, y: 34 },
          { label: "Total Cholesterol", value: "248 mg/dL", flagged: true, x: 60, y: 48 },
          { label: "ECG note", value: "ST-T changes, lead II", flagged: true, x: 34, y: 68 },
          { label: "Collected on", value: "28 Aug 2026", x: 30, y: 20 },
        ],
      },
    ],
    timelineEvents: [
      { id: "t1", date: "2016", label: "Essential hypertension diagnosed", detail: "Started on Telmisartan 40 mg. Baseline BP 152/96 mmHg.", kind: "condition", severity: "medium" },
      { id: "t2", date: "2019", label: "Dyslipidaemia noted on routine health check", detail: "LDL 172 mg/dL. Atorvastatin 20 mg initiated.", kind: "condition", severity: "medium" },
      { id: "t3", date: "28 Aug 2026", label: "Outpatient bloods & routine ECG", detail: "LDL remains 164 mg/dL. Non-specific ST-T wave changes noted.", kind: "lab", severity: "high" },
      { id: "t4", date: "Today, 09:12", label: "Intake completed at clinic kiosk", detail: "Chief complaint: chest heaviness radiating to left arm with diaphoresis.", kind: "visit", severity: "high" },
    ],
    aiSummary: {
      chiefComplaint: "Episodic chest heaviness with left-arm radiation since last night",
      associatedSymptoms: ["Diaphoresis", "Exertional dyspnoea"],
      duration: "14 hours, episodic",
      pastHistory: ["Hypertension (2016)", "Hyperlipidaemia (2019)", "Current smoker"],
      currentMedication: ["Telmisartan 40 mg OD (missed 2 doses)", "Atorvastatin 20 mg nocte"],
      oneLiner: "58M with HTN/dyslipidaemia presents with acute episodic chest heaviness radiating to left arm and sweating.",
      confidence: 0.94,
    },
    redFlags: [
      {
        title: "Suspected acute coronary syndrome (ACS)",
        trigger: "Chest discomfort radiating to left arm accompanied by diaphoresis and exertional dyspnoea in a smoker with known cardiovascular risk factors.",
        recommendation: "Immediate 12-lead ECG, troponin I stat, continuous cardiac monitoring, bedside clinical evaluation.",
      },
    ],
  },
  {
    patientInfo: {
      id: "P-10242",
      name: "Sunita Sharma",
      age: 44,
      sex: "Female",
      abhaId: "98-7654-3210-9876",
      language: "हिन्दी",
    },
    arrivedAt: "09:28",
    urgency: "priority",
    reviewed: false,
    viewed: false,
    symptoms: [
      { question: "आज आपको क्या परेशानी है?", answer: "तीन दिनों से तेज़ बुखार है और ठंड लग रही है।", at: "09:29" },
      { question: "क्या साथ में खाँसी या बलगम भी है?", answer: "हाँ, सूखी खाँसी है और गले में खराश है।", at: "09:30" },
      { question: "क्या आप शुगर या बीपी की कोई नियमित दवा लेते हैं?", answer: "हाँ, टाइप 2 डायबिटीज़ की दवा लेती हूँ।", at: "09:31" },
    ],
    history: [{ condition: "Type 2 Diabetes Mellitus", since: "2021", status: "Active" }],
    medications: [{ name: "Metformin", dose: "500 mg", frequency: "Twice daily" }],
    reports: [
      {
        id: "R-772",
        title: "Fasting Blood Sugar & HbA1c",
        kind: "Lab report",
        uploadedAt: "09:32",
        fields: [
          { label: "Glucose (fasting)", value: "188 mg/dL", flagged: true, x: 55, y: 32 },
          { label: "HbA1c", value: "8.6 %", flagged: true, x: 55, y: 46 },
          { label: "Collected on", value: "24 Sep 2026", x: 30, y: 18 },
        ],
      },
    ],
    timelineEvents: [
      { id: "s1", date: "2021", label: "Type 2 Diabetes diagnosed", detail: "HbA1c 7.9% at diagnosis. Metformin started.", kind: "condition", severity: "medium" },
      { id: "s2", date: "Today, 09:28", label: "Intake completed at kiosk", detail: "Fever x 3 days with chills, diabetic patient.", kind: "visit", severity: "medium" },
    ],
    aiSummary: {
      chiefComplaint: "High fever with chills and dry cough for 3 days",
      associatedSymptoms: ["Chills", "Sore throat", "Dry cough"],
      duration: "3 days",
      pastHistory: ["Type 2 Diabetes Mellitus (2021)"],
      currentMedication: ["Metformin 500 mg BD"],
      oneLiner: "44F diabetic with 3-day high fever, dry cough, and elevated fasting glucose (188 mg/dL).",
      confidence: 0.91,
    },
    redFlags: [
      {
        title: "Fever in poorly controlled diabetic",
        trigger: "Persistent fever for 3 days with fasting glucose of 188 mg/dL.",
        recommendation: "Order complete blood count, urine analysis, and assess for focus of infection.",
      },
    ],
  },
  {
    patientInfo: {
      id: "P-10243",
      name: "Karthik Raja",
      age: 29,
      sex: "Male",
      abhaId: "45-6789-0123-4567",
      language: "English",
    },
    arrivedAt: "09:45",
    urgency: "normal",
    reviewed: true,
    viewed: true,
    symptoms: [
      { question: "What brings you in today?", answer: "Mild throat irritation and runny nose since yesterday.", at: "09:46" },
      { question: "Any fever, body pain or breathing difficulty?", answer: "No fever, just sneezing and slight tiredness.", at: "09:47" },
    ],
    history: [],
    medications: [],
    reports: [],
    timelineEvents: [
      { id: "k1", date: "Today, 09:45", label: "Intake completed", detail: "Mild upper respiratory tract symptoms.", kind: "visit", severity: "low" },
    ],
    aiSummary: {
      chiefComplaint: "Mild throat irritation and rhinorrhoea for 1 day",
      associatedSymptoms: ["Sneezing", "Mild fatigue"],
      duration: "1 day",
      pastHistory: ["No chronic illness on record"],
      currentMedication: ["None reported"],
      oneLiner: "29M presenting with 1-day history of mild upper respiratory symptoms; afebrile.",
      confidence: 0.95,
    },
    redFlags: [],
  },
];

export function getAllPatients(req, res) {
  res.json({ success: true, count: patients.length, data: patients });
}

export function getPatientById(req, res) {
  const patient = patients.find((p) => p.patientInfo.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, error: "Patient record not found" });
  }
  res.json({ success: true, data: patient });
}

export function createPatient(req, res) {
  const validation = validatePatientPayload(req.body);
  if (!validation.valid) {
    return res.status(400).json({ success: false, errors: validation.errors });
  }

  const record = req.body;
  if (!record.patientInfo.id) {
    record.patientInfo.id = `P-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  if (!record.arrivedAt) {
    record.arrivedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  patients = [record, ...patients];
  res.status(201).json({ success: true, data: record, queuePosition: patients.length });
}

export function updatePatient(req, res) {
  const index = patients.findIndex((p) => p.patientInfo.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Patient record not found" });
  }

  patients[index] = {
    ...patients[index],
    ...req.body,
    patientInfo: {
      ...patients[index].patientInfo,
      ...(req.body.patientInfo || {}),
    },
  };

  res.json({ success: true, data: patients[index] });
}
