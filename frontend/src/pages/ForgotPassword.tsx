import React, { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft, Activity, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { sendPasswordResetEmail, validateRealEmail } from "../services/auth/authService";
import { isSupabaseConfigured } from "../services/supabase/supabaseClient";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabaseReady = isSupabaseConfigured();

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      const err = emailCheck.error || "Please enter a valid original email address.";
      setError(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      const res = await sendPasswordResetEmail(emailCheck.cleanEmail || email);
      if (res.success) {
        const msg = "✓ Password reset link sent to your email";
        setSuccess("Password reset instructions have been dispatched. Please check your inbox and spam folders.");
        toast.success(msg);
      } else {
        const err = res.error || "Failed to send reset link. Please try again.";
        setError(err);
        toast.error(`❌ ${err}`);
      }
    } catch (err) {
      const msg = "Something went wrong. Please check your connection.";
      setError(msg);
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
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
            <code className="rounded bg-muted px-1 py-0.5 font-mono">frontend/.env</code> to enable live password reset emails.
          </p>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-clinical space-y-6">
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
              <KeyRound className="size-4.5 text-primary" />
              Reset Password
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter your doctor email to receive a secure recovery link
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive animate-fade">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-xl border border-ok/30 bg-ok-soft p-3.5 text-xs font-medium text-ok animate-fade">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSendResetLink} className="space-y-4">
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
              autoFocus
              autoComplete="email"
            />
          </div>

          <Button type="submit" size="md" className="w-full text-sm font-semibold h-11" loading={loading}>
            <Mail className="size-4 mr-1.5" />
            Send Reset Link
          </Button>
        </form>

        <div className="pt-2 text-center text-xs">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
          >
            <ArrowLeft className="size-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
