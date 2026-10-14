import React, { useState } from "react";
import { ArrowRight, UserCheck, Shield } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { validatePatientDetails } from "../../utils/validation";
import type { PatientInfo } from "../../types/patient";

interface Props {
  initialValues?: Partial<PatientInfo>;
  onSubmit: (details: { name: string; age: number; sex: "Male" | "Female" | "Other"; abhaId: string; disease?: string }) => void;
  language?: string;
}

const COMMON_DISEASES = [
  "Diabetes",
  "Asthma",
  "Chest Pain",
  "High BP",
  "Fever",
  "Migraine",
  "Gastritis / Acidity",
  "Skin Allergy",
  "Joint Pain",
];

export function PatientDetails({ initialValues, onSubmit }: Props) {
  const [name, setName] = useState(initialValues?.name || "");
  const [age, setAge] = useState(initialValues?.age ? String(initialValues.age) : "");
  const [sex, setSex] = useState<"Male" | "Female" | "Other">(initialValues?.sex || "Female");
  const [disease, setDisease] = useState(initialValues?.disease || initialValues?.primaryCondition || "");
  const [abhaId, setAbhaId] = useState(initialValues?.abhaId || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePatientDetails({ name, age, sex });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit({
      name: name.trim(),
      age: parseInt(age, 10),
      sex,
      disease: disease.trim(),
      abhaId: abhaId.trim() || `ABHA-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="animate-rise space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-clinical">
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <UserCheck className="size-4" aria-hidden />
          Step 1: Patient Information
        </div>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">Tell us about yourself</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This helps the clinical team identify you and tailor the consultation.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Ramesh Iyer"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Age (Years)"
            type="number"
            min={1}
            max={125}
            placeholder="e.g. 45"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              if (errors.age) setErrors((prev) => ({ ...prev, age: "" }));
            }}
            error={errors.age}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Gender</label>
            <div className="flex h-11 items-center gap-2">
              {(["Female", "Male", "Other"] as const).map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setSex(gender)}
                  className={`flex-1 h-full rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                    sex === gender
                      ? "border-primary bg-primary-soft text-primary font-semibold"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
            {errors.sex && <p className="text-xs font-medium text-destructive">{errors.sex}</p>}
          </div>
        </div>

        {/* Disease / Health Condition (Targeted Intake) */}
        <div className="space-y-2 pt-1">
          <Input
            label="Primary Disease / Health Concern (Optional)"
            placeholder="e.g. Diabetes, Asthma, Chest Pain, Fever, Migraine, Gastritis…"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            helperText="The AI will tailor all consultation questions specifically to this condition."
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_DISEASES.map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => setDisease(cond)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer border ${
                  disease.toLowerCase() === cond.toLowerCase()
                    ? "border-primary bg-primary text-primary-foreground font-semibold"
                    : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <Input
            label="ABHA ID / National Health ID (Optional)"
            placeholder="e.g. 12-3456-7890-1234"
            value={abhaId}
            onChange={(e) => setAbhaId(e.target.value)}
            helperText="If you have an Ayushman Bharat Health Account number."
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="size-3.5 text-primary" aria-hidden /> Data is private & encrypted
        </span>
        <Button type="submit" size="lg" className="min-w-36">
          Continue
          <ArrowRight className="size-4 ml-1" aria-hidden />
        </Button>
      </div>
    </form>
  );
}
