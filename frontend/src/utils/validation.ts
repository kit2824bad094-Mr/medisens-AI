/**
 * Validation utilities for patient intake and clinical safety.
 *
 * CRITICAL SAFETY PRINCIPLE:
 * Measurements (BP, blood sugar, temp, SpO2) must NEVER be hallucinated or guessed.
 * If the patient is unsure or doesn't know, it must be stored as "Not Available"
 * and guided to measure when possible.
 */

export function sanitizeMeasurement(value: string | undefined | null, label = "Blood Pressure") {
  if (
    !value ||
    typeof value !== "string" ||
    /^(i don'?t know|not sure|unknown|na|n\/a|none|no idea|skip|not tested)$/i.test(value.trim())
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

export function validatePatientDetails(data: { name: string; age: string | number; sex: string }) {
  const errors: Record<string, string> = {};

  if (!data.name || !data.name.trim()) {
    errors.name = "Please enter your name.";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  const ageNum = Number(data.age);
  if (!data.age || isNaN(ageNum) || ageNum <= 0 || ageNum > 125) {
    errors.age = "Please enter a valid age between 1 and 125.";
  }

  if (!data.sex) {
    errors.sex = "Please select gender.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
