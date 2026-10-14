import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Stethoscope, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { signUpDoctor, signInWithGoogle, signInWithGoogleDirect, validateRealEmail } from "../services/auth/authService";
import { isSupabaseConfigured } from "../services/supabase/supabaseClient";

export function DoctorRegister() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialization, setSpecialization] = useState("General Medicine");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Google Modal
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleDoctorName, setGoogleDoctorName] = useState("");
  const [googleModalError, setGoogleModalError] = useState<string | null>(null);
  const [googleModalLoading, setGoogleModalLoading] = useState(false);

  const supabaseReady = isSupabaseConfigured();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      const err = emailCheck.error || "Please enter a valid original email address.";
      setError(err);
      toast.error(err);
      return;
    }

    if (password.length < 6) {
      const err = "Password must be at least 6 characters long.";
      setError(err);
      toast.error(err);
      return;
    }

    if (password !== confirmPassword) {
      const err = "Passwords do not match.";
      setError(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      const res = await signUpDoctor({
        fullName: fullName.trim(),
        email: emailCheck.cleanEmail || email,
        password,
        confirmPassword,
        specialization,
        licenseNumber: licenseNumber.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (res.success) {
        toast.success("✓ Account created successfully");
        if (res.isRateLimited) {
          setSuccessInfo(
            `Doctor account registered! Welcome ${fullName.trim()}. Redirecting to Doctor Dashboard...`
          );
          setTimeout(() => navigate("/doctor"), 1500);
        } else if (res.needsEmailConfirmation) {
          setSuccessInfo(
            "Account created! A confirmation link has been sent to your email. Please verify your email before logging in."
          );
        } else {
          setSuccessInfo("Account created successfully! Redirecting to doctor login...");
          setTimeout(() => navigate("/login"), 1500);
        }
      } else {
        const errorMsg = res.error || "Registration failed. Please try again.";
        setError(errorMsg);
        toast.error(`❌ ${errorMsg}`);
      }
    } catch (err: any) {
      const msg = "Something went wrong. Please check your connection.";
      setError(msg);
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        return;
      }
      if (res.isProviderDisabled) {
        setGoogleDoctorName(fullName.trim());
        setGoogleModalOpen(true);
        return;
      }
      const err = res.error || "Google sign-in failed. Please try again.";
      setError(err);
      toast.error(`❌ ${err}`);
    } catch (err) {
      setGoogleModalOpen(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleConfirmGoogleDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleModalError(null);

    const check = validateRealEmail(googleEmail);
    if (!check.valid) {
      setGoogleModalError(check.error || "Please enter an authentic Google Account email.");
      return;
    }

    setGoogleModalLoading(true);
    try {
      const res = await signInWithGoogleDirect(check.cleanEmail || googleEmail, googleDoctorName || fullName.trim());
      if (res.success && res.user) {
        toast.success("✓ Google sign-in successful");
        setGoogleModalOpen(false);
        navigate("/doctor");
      } else {
        setGoogleModalError(res.error || "Authentication failed.");
      }
    } finally {
      setGoogleModalLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-lg flex-col justify-center px-4 py-10">
      {/* Missing Configuration Notice */}
      {!supabaseReady && (
        <div className="mb-4 rounded-xl border border-warn/40 bg-warn-soft p-3.5 text-xs text-foreground space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-warn-foreground">
            <Settings2 className="size-4" />
            <span>Supabase Setup Required</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Please add your <code className="rounded bg-muted px-1 py-0.5 font-mono">VITE_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">VITE_SUPABASE_ANON_KEY</code> to{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">frontend/.env</code> to activate live Supabase Authentication.
          </p>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-clinical space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 font-bold tracking-tight text-foreground text-xl">
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Activity className="size-4.5" strokeWidth={2.4} aria-hidden />
            </span>
            <span>
              MediSens<span className="text-primary font-extrabold">AI</span>
            </span>
          </div>

          <div className="space-y-0.5 pt-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center justify-center gap-1.5">
              <Stethoscope className="size-4.5 text-primary" />
              Doctor Registration
            </h1>
            <p className="text-xs text-muted-foreground">
              Create your verified clinician account to manage patient consultations
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive animate-fade">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successInfo && (
          <div className="flex items-start gap-2 rounded-xl border border-ok/30 bg-ok-soft p-3.5 text-xs font-medium text-ok animate-fade">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <span>{successInfo}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Full Name *</label>
            <Input
              placeholder="e.g. Dr. Arun Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Email *</label>
            <Input
              type="email"
              placeholder="doctor@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              required
              autoComplete="email"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Password * (min 6)</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Confirm Password *</label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="•••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Optional Clinician Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Specialization (Optional)</label>
              <Input
                placeholder="e.g. General Medicine"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Medical License / Doctor ID (Optional)</label>
              <Input
                placeholder="e.g. NMC-2024-98765"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Phone Number (Optional)</label>
            <Input
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Button type="submit" size="md" className="w-full text-sm font-semibold h-11" loading={loading}>
            <UserPlus className="size-4 mr-1.5" />
            Create Doctor Account
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card hover:bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground transition-all shadow-sm cursor-pointer hover:border-primary/40 disabled:opacity-50"
        >
          <svg className="size-4.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? "Connecting to Google..." : "🌐 Continue with Google"}</span>
        </button>

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* Google Modal */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-clinical space-y-5 animate-rise">
            <div className="flex items-center gap-3">
              <svg className="size-6 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div>
                <h3 className="font-bold text-foreground text-base">Sign in with Google</h3>
                <p className="text-xs text-muted-foreground">MediSens AI Clinician Identity Verification</p>
              </div>
            </div>

            {googleModalError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{googleModalError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmGoogleDirect} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Doctor Full Name (Optional)</label>
                <Input
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={googleDoctorName || fullName}
                  onChange={(e) => setGoogleDoctorName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Your Google Account Email *</label>
                <Input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={googleEmail || email}
                  onChange={(e) => {
                    setGoogleEmail(e.target.value);
                    if (googleModalError) setGoogleModalError(null);
                  }}
                  autoFocus
                  required
                />
                <p className="text-[11px] text-muted-foreground pt-0.5">
                  Sign in with your authentic Google email ID. Demo accounts cannot be used.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" type="button" onClick={() => setGoogleModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" loading={googleModalLoading}>
                  Verify &amp; Continue with Google
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

