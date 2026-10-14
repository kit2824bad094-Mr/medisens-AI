import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, Eye, EyeOff, AlertCircle, CheckCircle2, Activity, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { updatePassword } from "../services/auth/authService";

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || password.length < 6) {
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
      const res = await updatePassword(password);
      if (res.success) {
        toast.success("✓ Password updated successfully");
        setSuccess("Your password has been reset securely. Redirecting to Doctor Sign In...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const err = res.error || "Failed to update password. Recovery link may have expired.";
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
              <LockKeyhole className="size-4.5 text-primary" />
              Create New Password
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter your new secure clinician password below
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

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">New Password (min 6 characters)</label>
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
                autoComplete="new-password"
                autoFocus
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

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Confirm New Password</label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="•••••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" size="md" className="w-full text-sm font-semibold h-11" loading={loading}>
            <LockKeyhole className="size-4 mr-1.5" />
            Update Password
          </Button>
        </form>

        <div className="pt-2 text-center text-xs">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
          >
            <ArrowLeft className="size-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
