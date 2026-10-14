import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorLogin } from "../components/doctor/DoctorLogin";
import { getCurrentDoctorSession } from "../services/auth/authService";
import { Loading } from "../components/common/Loading";

export function Login() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCurrentDoctorSession().then((session) => {
      if (mounted) {
        if (session && session.isDoctor) {
          navigate("/doctor", { replace: true });
        } else {
          setChecking(false);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (checking) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background">
        <Loading message="Verifying clinician session..." />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background">
      <DoctorLogin onSuccess={() => navigate("/doctor")} />
    </main>
  );
}
