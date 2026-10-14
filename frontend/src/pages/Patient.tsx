import React from "react";
import { PatientKiosk } from "../components/patient/PatientKiosk";

export function Patient() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background">
      <PatientKiosk />
    </main>
  );
}
