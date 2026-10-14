import React, { useState } from "react";
import { Activity, Check, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { sanitizeMeasurement } from "../../utils/validation";

interface Props {
  measurementType?: "Blood Pressure" | "Blood Sugar" | "Temperature" | "Heart Rate" | "SpO2";
  onSave: (result: { label: string; value: string; isAvailable: boolean; note?: string }) => void;
  onSkip?: () => void;
}

export function MeasurementInput({
  measurementType = "Blood Pressure",
  onSave,
  onSkip,
}: Props) {
  const [value, setValue] = useState("");
  const [unknownAdvice, setUnknownAdvice] = useState<string | null>(null);

  const presets = {
    "Blood Pressure": ["120/80 mmHg", "130/85 mmHg", "140/90 mmHg", "Normal", "High"],
    "Blood Sugar": ["95 mg/dL (Fasting)", "140 mg/dL (PP)", "180 mg/dL", "Normal", "High"],
    Temperature: ["98.6 °F", "99.5 °F", "101.0 °F", "Normal", "High Fever"],
    "Heart Rate": ["72 bpm", "85 bpm", "100 bpm"],
    SpO2: ["98%", "95%", "92%"],
  };

  const handleUnknown = () => {
    const sanitized = sanitizeMeasurement("I don't know", measurementType);
    setUnknownAdvice(sanitized.advice || `That's okay. If possible, please check your ${measurementType.toLowerCase()} using an appropriate monitor.`);

    // Delay slightly so patient reads the reassuring message before proceeding
    setTimeout(() => {
      onSave({
        label: measurementType,
        value: "Not Available",
        isAvailable: false,
        note: "Patient reported reading is not known at intake.",
      });
    }, 1800);
  };

  const handleSaveCustom = (val: string) => {
    const cleanVal = val.trim();
    if (!cleanVal) return;
    const sanitized = sanitizeMeasurement(cleanVal, measurementType);

    if (!sanitized.isAvailable) {
      setUnknownAdvice(sanitized.advice || null);
      setTimeout(() => {
        onSave({
          label: measurementType,
          value: "Not Available",
          isAvailable: false,
        });
      }, 1500);
    } else {
      onSave({
        label: measurementType,
        value: sanitized.value,
        isAvailable: true,
      });
    }
  };

  return (
    <div className="animate-rise rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-panel space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        <Activity className="size-4" strokeWidth={2.2} aria-hidden />
        Vitals Check · {measurementType}
      </div>

      <p className="text-sm font-medium text-foreground">
        Do you know your recent <span className="font-semibold">{measurementType}</span> reading?
      </p>

      {unknownAdvice ? (
        <div className="animate-rise rounded-xl border border-primary/30 bg-primary-soft p-4 text-sm text-primary">
          <div className="flex items-start gap-2.5">
            <Check className="size-5 shrink-0 mt-0.5 text-primary" />
            <div>
              <p className="font-semibold">Recorded as: Not Available</p>
              <p className="mt-1 text-xs text-foreground/80">{unknownAdvice}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {(presets[measurementType] || []).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSaveCustom(preset)}
                className="rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary cursor-pointer"
              >
                {preset}
              </button>
            ))}

            <button
              type="button"
              onClick={handleUnknown}
              className="rounded-full border border-warn/40 bg-warn-soft px-3.5 py-1.5 text-xs font-semibold text-warn-foreground transition-colors hover:bg-warn/25 cursor-pointer inline-flex items-center gap-1"
            >
              <HelpCircle className="size-3.5" />
              I don't know
            </button>
          </div>

          {/* Direct entry input */}
          <form
            className="flex gap-2 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveCustom(value);
            }}
          >
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${measurementType} reading (e.g. 120/80)`}
              className="h-10 text-sm"
            />
            <Button type="submit" size="sm" disabled={!value.trim()} className="h-10 px-4 shrink-0">
              Save
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            * If you are unsure or haven't measured recently, tap "I don't know". We never guess your numbers.
          </p>
        </>
      )}
    </div>
  );
}
