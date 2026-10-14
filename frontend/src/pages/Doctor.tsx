import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Stethoscope, LogOut, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DoctorQueue } from "../components/doctor/DoctorQueue";
import { DoctorDashboard } from "../components/doctor/DoctorDashboard";
import { usePatient } from "../hooks/usePatient";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { Button } from "../components/common/Button";
import {
  getCurrentDoctorSession,
  signOutDoctor,
  onAuthStateChange,
} from "../services/auth/authService";
import type { DoctorSession } from "../types/doctor";

export function Doctor() {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const { patients, loading, error, refresh, updatePatient } = usePatient();
  const [selectedId, setSelectedId] = useState<string | null>(patientId || null);
  const [session, setSession] = useState<DoctorSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Authentication check and real-time state listener with robust OAuth callback handling
  useEffect(() => {
    let mounted = true;

    // Check if URL has OAuth callback params
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const isOAuthCallback =
      hash.includes("access_token") ||
      hash.includes("error") ||
      search.includes("code=");

    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(search.replace(/^\?/, ""));
    const errorParam =
      hashParams.get("error_description") ||
      hashParams.get("error") ||
      searchParams.get("error_description") ||
      searchParams.get("error");

    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam.replace(/\+/g, " "));
      const isExchangeError = decodedError.toLowerCase().includes("unable to exchange external code");

      if (isExchangeError) {
        toast.error(
          "❌ Google Sign-In: Google rejected the token exchange with Supabase. Check your Google Client Secret & Authorized Redirect URI in Supabase Dashboard.",
          { duration: 8000 }
        );
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate("/login?error=google_exchange", { replace: true });
        return;
      }

      toast.error(`❌ Google Sign-In: ${decodedError}`, { duration: 8000 });
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/login", { replace: true });
      return;
    }

    const checkSession = async () => {
      // If OAuth callback is in progress, allow Supabase to exchange token
      if (isOAuthCallback) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const activeSession = await getCurrentDoctorSession();
      if (!mounted) return;

      if (!activeSession) {
        // Retry once more if returning from OAuth
        if (isOAuthCallback) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const retrySession = await getCurrentDoctorSession();
          if (mounted && retrySession) {
            setSession(retrySession);
            setSessionLoading(false);
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        }

        navigate("/login", { replace: true });
        return;
      }

      if (activeSession.role && activeSession.role !== "doctor") {
        toast.error("❌ Access denied: Only registered doctor accounts can access the Doctor Dashboard.");
        await signOutDoctor();
        if (mounted) navigate("/patient", { replace: true });
        return;
      }

      setSession(activeSession);
      setSessionLoading(false);
      if (isOAuthCallback) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkSession();

    const unsubscribe = onAuthStateChange((newSession) => {
      if (!mounted) return;
      if (!newSession) {
        if (!isOAuthCallback) {
          setSession(null);
          navigate("/login", { replace: true });
        }
      } else if (newSession.role && newSession.role !== "doctor") {
        setSession(null);
        navigate("/patient", { replace: true });
      } else {
        setSession(newSession);
        setSessionLoading(false);
        if (isOAuthCallback) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (patientId) {
      setSelectedId(patientId);
    }
  }, [patientId]);

  const handleLogout = async () => {
    await signOutDoctor();
    toast.success("✓ Logged out successfully");
    setSession(null);
    navigate("/login", { replace: true });
  };

  if (sessionLoading) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background">
        <Loading message="Verifying clinician authorization..." />
      </main>
    );
  }

  if (!session) {
    return null;
  }

  const activePatient = patients.find((p) => p.patientInfo.id === (selectedId || patientId));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Clinician bar with authenticated doctor details & Logout action */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          {session.avatar ? (
            <img
              src={session.avatar}
              alt={session.name}
              className="size-10 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="size-10 rounded-xl bg-primary-soft text-primary font-bold text-base grid place-items-center">
              {session.name.replace(/^Dr\.\s*/i, "").charAt(0) || "D"}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-base">{session.name}</span>
              {session.provider === "google" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Google Verified
                </span>
              )}
              {session.licenseNumber && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  ID: {session.licenseNumber}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="size-3" /> {session.email}
              </span>
              <span>· {session.department || session.specialization || "General Medicine"}</span>
              <span>· {session.hospital || "Outpatient Clinic"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refresh()}>
            Refresh Queue
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive hover:border-destructive/30"
          >
            <LogOut className="size-3.5 mr-1.5" /> Sign Out
          </Button>
        </div>
      </div>

      {loading && patients.length === 0 ? (
        <Loading message="Loading outpatient triage queue..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : activePatient ? (
        <DoctorDashboard
          patient={activePatient}
          onBack={() => {
            setSelectedId(null);
            navigate("/doctor");
          }}
          onUpdatePatient={updatePatient}
        />
      ) : (
        <DoctorQueue
          patients={patients}
          onSelectPatient={(id) => {
            setSelectedId(id);
            navigate(`/doctor/${id}`);
          }}
          onToggleViewed={(id, currentViewed) => {
            updatePatient(id, { viewed: !currentViewed });
          }}
        />
      )}
    </main>
  );
}
