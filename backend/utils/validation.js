/**
 * Validation utilities for patient intake and clinical summaries.
 * Enforces clinical safety rules: measurements must never be hallucinated.
 * If unknown, they are strictly recorded as "Not Available".
 */

export function sanitizeMeasurement(value, label = "Measurement") {
  if (
    !value ||
    typeof value !== "string" ||
    /^(i don'?t know|not sure|unknown|na|n\/a|none|no idea)$/i.test(value.trim())
  ) {
    return {
      value: "Not Available",
      isAvailable: false,
      advice: `That's okay. If possible, please check your ${label.toLowerCase()} using an appropriate monitor and enter the reading.`,
    };
  }
  return {
    value: value.trim(),
    isAvailable: true,
  };
}

export function validatePatientPayload(payload) {
  const errors = [];
  if (!payload) {
    errors.push("Missing request body");
    return { valid: false, errors };
  }

  const { patientInfo, symptoms } = payload;
  if (!patientInfo) {
    errors.push("Patient info is required");
  } else {
    if (!patientInfo.name || patientInfo.name.trim().length === 0) {
      errors.push("Patient name is required");
    }
    if (patientInfo.age === undefined || isNaN(Number(patientInfo.age))) {
      errors.push("Valid patient age is required");
    }
  }

  if (symptoms && !Array.isArray(symptoms)) {
    errors.push("Symptoms must be an array");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
