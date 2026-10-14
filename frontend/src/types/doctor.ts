export interface DoctorSession {
  id?: string;
  email: string;
  name: string;
  avatar?: string | null;
  isDoctor: boolean;
  role: "doctor" | "patient";
  provider: "email" | "google";
  department?: string;
  hospital?: string;
  specialization?: string;
  licenseNumber?: string;
  token?: string;
  loggedInAt: string;
}

export type QueueFilter = "all" | "waiting" | "reviewed" | "red-flag";

export interface ConsultationNote {
  patientId: string;
  doctorName: string;
  note: string;
  prescriptions?: string[];
  orders?: string[];
  createdAt: string;
}
