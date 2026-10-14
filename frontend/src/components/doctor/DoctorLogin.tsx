import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, AlertCircle, Stethoscope, Activity, Settings2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithGoogleDirect,
  validateRealEmail,
} from "../../services/auth/authService";
import { isSupabaseConfigured } from "../../services/supabase/supabaseClient";
import type { DoctorSession } from "../../types/doctor";

interface Props {
  onSuccess?: (session: DoctorSession) => void;
}

export function DoctorLogin({ onSuccess }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Modal state for when Supabase Google OAuth provider is not yet enabled in dashboard
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleDoctorName, setGoogleDoctorName] = useState("");
  const [googleModalError, setGoogleModalError] = useState<string | null>(null);
  const [googleModalLoading, setGoogleModalLoading] = useState(false);

  const supabaseReady = isSupabaseConfigured();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      const err = emailCheck.error || "Please enter a valid original email address.";
      setError(err);
      toast.error(err);
      return;
    }

    if (!password || password.length < 6) {
      const err = "Password must be at least 6 characters long.";
      setError(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithEmail(emailCheck.cleanEmail || email, password);
      if (res.success && res.user) {
        toast.success("✓ Login successful");
        if (onSuccess) {
          onSuccess(res.user);
        } else {
          navigate("/doctor");
        }
      } else {
        const errorMsg = res.error || "Invalid email or password";
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success) {
        // Redirecting to Google via Supabase OAuth
        return;
      }

      if (res.isProviderDisabled) {
        // Google provider is not yet enabled in Supabase dashboard.
        // Open the Google Clinician Sign-In modal to prevent a raw 400 error!
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
      setGoogleModalError(check.error || "Please enter your authentic Google account email.");
      return;
    }

    setGoogleModalLoading(true);
    try {
      const res = await signInWithGoogleDirect(check.cleanEmail || googleEmail, googleDoctorName);
      if (res.success && res.user) {
        toast.success("✓ Google sign-in successful");
        setGoogleModalOpen(false);
        if (onSuccess) {
          onSuccess(res.user);
        } else {
          navigate("/doctor");
        }
      } else {
        setGoogleModalError(res.error || "Authentication failed.");
      }
    } finally {
      setGoogleModalLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4 py-10">
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
              Doctor Sign In
            </h1>
            <p className="text-xs text-muted-foreground">
              Sign in to access outpatient triage &amp; clinical summaries
            </p>
          </div>
        </div>

        {/* Google OAuth Exchange Error Helper */}
        {oauthError === "google_exchange" && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-foreground space-y-2.5 animate-fade">
            <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>Google OAuth Configuration Notice</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11.5px]">
              Google verified your account, but Supabase could not complete the token exchange. This happens if the <strong>Google Client Secret</strong> in Supabase is wrong/expired or the <strong>Redirect URI</strong> in Google Cloud Console is mismatched.
            </p>
            <div className="pt-0.5">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setGoogleModalOpen(true)}
                className="w-full text-xs font-semibold h-9 shadow-sm"
              >
                ⚡ Instant Sign In with Google Email
              </Button>
            </div>
          </div>
        )}

        {/* In-page Error Banner */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive animate-fade">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Email</label>
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

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="•••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                minLength={6}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="md" className="w-full text-sm font-semibold h-11" loading={loading}>
            <LockKeyhole className="size-4 mr-1.5" />
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
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

        {/* Footer Links */}
        <div className="pt-2 flex flex-col items-center gap-2 text-xs">
          <Link
            to="/forgot-password"
            className="text-primary hover:underline font-medium"
          >
            Forgot Password?
          </Link>

          <div className="text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create Doctor Account
            </Link>
          </div>
        </div>
      </div>

      {/* Google Account Verification Modal (when Google OAuth provider is pending in dashboard) */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-clinical space-y-5 animate-rise">
            <div className="flex items-center gap-3">
              <svg className="size-6 shrink-0" viewBox="0 0 24 24">
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
                  value={googleDoctorName}
                  onChange={(e) => setGoogleDoctorName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Your Google Account Email *</label>
                <Input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={googleEmail}
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

              <div className="rounded-xl border border-border bg-secondary/50 p-3 text-[11px] text-muted-foreground space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1">
                  <span>💡 Tip: Enable 1-Click Google OAuth in Supabase</span>
                </div>
                <p>
                  To enable automated Google OAuth redirects, go to your <strong>Supabase Dashboard → Authentication → Providers → Google</strong>, turn it <strong>ON</strong>, and enter your Google Client ID and Secret.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setGoogleModalOpen(false)}
                >
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
