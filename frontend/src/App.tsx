import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Activity, Mic, Stethoscope, Wifi, Shield } from "lucide-react";
import { Toaster } from "sonner";
import { Home } from "./pages/Home";
import { Patient } from "./pages/Patient";
import { Doctor } from "./pages/Doctor";
import { Login } from "./pages/Login";
import { DoctorRegister } from "./pages/DoctorRegister";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { NotFound } from "./pages/NotFound";
import { checkBackendHealth } from "./services/api/apiClient";
import { cn } from "./utils/formatters";

function Navbar() {
  const location = useLocation();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [geminiActive, setGeminiActive] = useState<boolean>(false);

  useEffect(() => {
    checkBackendHealth().then((health) => {
      setBackendOnline(health.ok);
      setGeminiActive(Boolean(health.geminiConfigured));
    });
  }, []);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Activity className="size-4.5" strokeWidth={2.4} aria-hidden />
          </span>
          <span className="text-lg">
            MediSens<span className="text-primary font-extrabold">AI</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          <Link
            to="/patient"
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-colors",
              isActive("/patient") || isActive("/intake")
                ? "bg-primary-soft text-primary font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Mic className="size-3.5" />
            <span>Patient Intake</span>
          </Link>

          <Link
            to="/doctor"
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-colors",
              isActive("/doctor") || isActive("/doctor/dashboard") || isActive("/login") || isActive("/register")
                ? "bg-primary-soft text-primary font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Stethoscope className="size-3.5" />
            <span>Doctor Dashboard</span>
          </Link>
        </nav>

        {/* System & AI Status Indicator */}
        <div className="hidden sm:flex items-center gap-2">
          {backendOnline === true ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok-soft px-2.5 py-1 text-[11px] font-semibold text-ok"
              title={geminiActive ? "Gemini AI Online & Active" : "Backend Connected (Clinical Templates Mode)"}
            >
              <span className="size-1.5 rounded-full bg-ok animate-pulse" />
              {geminiActive ? "Gemini AI Online" : "Backend Connected"}
            </span>
          ) : backendOnline === false ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-warn/40 bg-warn-soft px-2.5 py-1 text-[11px] font-semibold text-warn-foreground"
              title="Running in Standalone Client Mode"
            >
              <span className="size-1.5 rounded-full bg-warn" />
              Standalone Mode
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/patient" element={<Patient />} />
            <Route path="/intake" element={<Patient />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<DoctorRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/doctor/dashboard" element={<Doctor />} />
            <Route path="/doctor/:patientId" element={<Doctor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster richColors position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
