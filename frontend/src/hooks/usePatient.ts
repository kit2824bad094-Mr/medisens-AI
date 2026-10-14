import { useState, useEffect, useCallback } from "react";
import type { PatientRecord } from "../types/patient";
import { fetchPatients, fetchPatientById, updatePatientRecord } from "../services/api/apiClient";

export function usePatient(patientId?: string) {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [activePatient, setActivePatient] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPatients();
      if (data && data.length > 0) {
        setPatients(data);
      }
    } catch (err: any) {
      console.warn("[usePatient] Load error:", err);
      setError("Failed to load patient records");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActivePatient = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchPatientById(id);
      if (data) {
        setActivePatient(data);
      } else {
        // Find in local array if available
        setPatients((prev) => {
          const match = prev.find((p) => p.patientInfo.id === id);
          if (match) setActivePatient(match);
          return prev;
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (patientId) {
      loadActivePatient(patientId);
    }
  }, [patientId, loadActivePatient]);

  const updatePatient = async (id: string, patch: Partial<PatientRecord>) => {
    // Optimistic UI update
    setPatients((prev) =>
      prev.map((p) => (p.patientInfo.id === id ? { ...p, ...patch } : p))
    );
    if (activePatient && activePatient.patientInfo.id === id) {
      setActivePatient((prev) => (prev ? { ...prev, ...patch } : null));
    }

    try {
      await updatePatientRecord(id, patch);
    } catch (err) {
      console.warn("[usePatient] Update error:", err);
    }
  };

  return {
    patients,
    activePatient,
    loading,
    error,
    refresh: loadPatients,
    updatePatient,
    setActivePatient,
  };
}
