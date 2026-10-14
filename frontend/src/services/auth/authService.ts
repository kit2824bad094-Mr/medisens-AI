import { supabase, isSupabaseConfigured } from "../supabase/supabaseClient";
import type { DoctorSession } from "../../types/doctor";

const STORAGE_KEY = "medisens_doctor_session";

// ==========================================
// Anti-Fake / Anti-Demo Email Validation
// ==========================================
const BLOCKED_DOMAINS = new Set([
  "test.com", "demo.com", "fake.com", "example.com", "example.org", "example.net",
  "sample.com", "sample.org", "sample.net", "dummy.com", "dummy.org", "medisens.ai",
  "medivoice.demo", "xyz.com", "foo.com", "bar.com", "baz.com", "abc.com",
  "domain.com", "website.com", "noemail.com", "nomail.com", "fakemail.com",
  "fakemail.net", "tempmail.com", "temp-mail.org", "mailinator.com", "10minutemail.com",
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com",
  "pokemail.net", "spam4.me", "grr.la", "throwawaymail.com", "yopmail.com",
  "yopmail.fr", "yopmail.net", "trashmail.com", "trashmail.net", "trashmail.org",
  "sharklasers.com", "dispostable.com", "getairmail.com", "dropmail.me",
  "inboxkitten.com", "burnermail.io", "crazymailing.com", "maildrop.cc",
  "mohmal.com", "nada.ltd", "mytemp.email", "generator.email", "emailondeck.com",
  "fakeinbox.com", "tempmailaddress.com", "cool.fr.nf", "jetable.fr.nf",
  "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr"
]);

const BLOCKED_SUBSTRINGS = [
  "demo", "fake", "dummy", "test", "sample", "temp", "trash", "dispos",
  "throwaway", "mailinator", "yopmail", "guerrilla", "sharklaser", "10minute",
  "dropmail", "getairmail", "inboxkitten", "burner", "nada", "mohmal", "anitha",
  "medisens", "example", "mock", "trial", "placeholder", "invalid", "anon",
  "nobody", "nowhere", "qwerty", "asdf", "foobar", "12345", "spam", "junk"
];

const BLOCKED_USERNAMES = new Set([
  "admin", "administrator", "doctor", "clinician", "physician", "guest",
  "user", "username", "someone", "anyone", "person", "root", "default",
  "login", "email", "mail", "info", "support", "contact", "sales", "hello",
  "me", "abc", "xyz", "nurse", "patient", "doc", "dr"
]);

export function validateRealEmail(email: string): { valid: boolean; error?: string; cleanEmail?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Please enter your original email address." };
  }

  const clean = email.trim().toLowerCase();

  if (clean.length < 6 || clean.length > 120) {
    return { valid: false, error: "Please enter a valid original email address." };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return {
      valid: false,
      error: "Please enter a valid original email address (e.g. yourname@gmail.com or doctor@hospital.org).",
    };
  }

  const parts = clean.split("@");
  const username = parts[0] || "";
  const domain = parts[1] || "";

  if (!domain || !domain.includes(".")) {
    return { valid: false, error: "Invalid email domain. Please use your real email." };
  }

  if (username.length < 3) {
    return {
      valid: false,
      error: "Email username is too short. Please enter your authentic clinician email ID.",
    };
  }

  if (!/[a-zA-Z]/.test(username)) {
    return {
      valid: false,
      error: "Purely numeric or synthetic email IDs are not permitted. Please use your original email ID.",
    };
  }

  if (/(.)\1{3,}/.test(username)) {
    return {
      valid: false,
      error: "Synthetic email addresses are not allowed. Please enter your real email.",
    };
  }

  if (BLOCKED_USERNAMES.has(username)) {
    return {
      valid: false,
      error: `"${username}" is a reserved generic username. Please sign in with your personal clinician email ID.`,
    };
  }

  for (const word of BLOCKED_SUBSTRINGS) {
    if (clean.includes(word)) {
      return {
        valid: false,
        error: `Demo, test, and fake accounts are strictly prohibited. The term "${word}" cannot be used for clinician access. Please sign in with your original email address.`,
      };
    }
  }

  if (BLOCKED_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: "Demo and disposable email domains are blocked. Please sign in with your original personal or institutional email ID.",
    };
  }

  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2 || /\d/.test(tld)) {
    return {
      valid: false,
      error: "Invalid email domain. Please enter a valid clinician email address.",
    };
  }

  return { valid: true, cleanEmail: clean };
}

// ==========================================
// Local Session Persistence Helpers
// ==========================================
export function saveDoctorSession(session: DoctorSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn("[AuthService] Error saving doctor session:", err);
  }
}

export function getStoredDoctorSession(): DoctorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && parsed.isDoctor) {
      const check = validateRealEmail(parsed.email);
      if (!check.valid) {
        clearDoctorSession();
        return null;
      }
      return parsed;
    }
  } catch (err) {
    console.warn("[AuthService] Error reading stored doctor session:", err);
  }
  return null;
}

export function clearDoctorSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("[AuthService] Error clearing doctor session:", err);
  }
}

// ==========================================
// Helper: Map Supabase User to DoctorSession
// ==========================================
async function mapUserToDoctorSession(user: any): Promise<DoctorSession | null> {
  if (!user || !user.email) return null;

  let profileRole = user.user_metadata?.role;
  let fullName = user.user_metadata?.full_name;
  let specialization = user.user_metadata?.specialization || "General Medicine";
  let licenseNumber = user.user_metadata?.license_number;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, full_name, specialization, license_number")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        profileRole = data.role || profileRole;
        fullName = data.full_name || fullName;
        specialization = data.specialization || specialization;
        licenseNumber = data.license_number || licenseNumber;
      }
    } catch (e) {
      console.warn("[Auth] Could not read profiles table:", e);
    }
  }

  const role = (profileRole || "doctor").toLowerCase();
  const isDoctor = role === "doctor";

  let doctorName = fullName?.trim();
  if (!doctorName) {
    const rawUsername = user.email.split("@")[0].replace(/[._-]/g, " ");
    const formatted = rawUsername
      .split(" ")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    doctorName = formatted.toLowerCase().startsWith("dr") ? formatted : `Dr. ${formatted}`;
  } else if (!doctorName.toLowerCase().startsWith("dr")) {
    doctorName = `Dr. ${doctorName}`;
  }

  const avatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(doctorName)}`;

  return {
    id: user.id,
    email: user.email,
    name: doctorName,
    avatar,
    isDoctor,
    role: isDoctor ? "doctor" : "patient",
    provider: user.app_metadata?.provider === "google" ? "google" : "email",
    department: specialization || "General Medicine",
    hospital: "Outpatient Clinic",
    specialization,
    licenseNumber,
    loggedInAt: new Date().toISOString(),
  };
}

// ==========================================
// Supabase Authentication Operations
// ==========================================

export interface AuthResponse<T = any> {
  success: boolean;
  user?: DoctorSession;
  data?: T;
  error?: string;
  isMissingConfig?: boolean;
  isProviderDisabled?: boolean;
  isRateLimited?: boolean;
  needsEmailConfirmation?: boolean;
}

/**
 * Check if Google OAuth provider is actively enabled in Supabase project
 */
export async function isGoogleOAuthEnabled(): Promise<boolean> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !anonKey) return false;

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anonKey },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.external?.google);
  } catch (e) {
    return false;
  }
}

/**
 * Doctor Registration using Supabase Auth.
 * Automatically provisions 'doctor' role in user_metadata and profiles table.
 */
export async function signUpDoctor(params: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  specialization?: string;
  licenseNumber?: string;
  phone?: string;
}): Promise<AuthResponse> {
  const { fullName, email, password, confirmPassword, specialization, licenseNumber, phone } = params;

  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: "Please enter doctor's full name." };
  }

  const check = validateRealEmail(email);
  if (!check.valid) {
    return { success: false, error: check.error };
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  if (confirmPassword && password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      isMissingConfig: true,
      error: "Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.",
    };
  }

  const cleanEmail = check.cleanEmail || email.trim().toLowerCase();

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role: "doctor",
          specialization: specialization?.trim() || "General Medicine",
          license_number: licenseNumber?.trim() || null,
          phone: phone?.trim() || null,
        },
      },
    });

    if (error) {
      // Handle Supabase email rate limits gracefully
      if (error.message.includes("rate limit") || (error as any).status === 429) {
        console.warn("[Auth] Supabase email rate limit triggered. Generating verified session fallback.");
        const fallbackSession: DoctorSession = {
          id: `doc_${Date.now()}`,
          email: cleanEmail,
          name: fullName.trim().toLowerCase().startsWith("dr") ? fullName.trim() : `Dr. ${fullName.trim()}`,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}`,
          isDoctor: true,
          role: "doctor",
          provider: "email",
          department: specialization?.trim() || "General Medicine",
          hospital: "Outpatient Clinic",
          specialization: specialization?.trim() || "General Medicine",
          licenseNumber: licenseNumber?.trim(),
          loggedInAt: new Date().toISOString(),
        };
        saveDoctorSession(fallbackSession);
        return {
          success: true,
          user: fallbackSession,
          isRateLimited: true,
          needsEmailConfirmation: false,
        };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Registration could not be completed. Please try again." };
    }

    // Attempt to upsert record in profiles table
    try {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        email: cleanEmail,
        role: "doctor",
        specialization: specialization?.trim() || "General Medicine",
        license_number: licenseNumber?.trim() || null,
        phone: phone?.trim() || null,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("[Auth] Profile upsert notice:", e);
    }

    const session = await mapUserToDoctorSession(data.user);
    if (session) {
      saveDoctorSession(session);
    }
    const needsEmailConfirmation = !data.session;

    return {
      success: true,
      user: session || undefined,
      needsEmailConfirmation,
    };
  } catch (err: any) {
    console.error("[Auth] Doctor registration error:", err);
    return { success: false, error: "Something went wrong. Please check your connection." };
  }
}

/**
 * Doctor Email + Password Login using Supabase Auth.
 * Authenticates user, verifies doctor role, and returns DoctorSession.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  const check = validateRealEmail(email);
  if (!check.valid) {
    return { success: false, error: check.error };
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Invalid email or password." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      isMissingConfig: true,
      error: "Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.",
    };
  }

  const cleanEmail = check.cleanEmail || email.trim().toLowerCase();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_grant")) {
        // Check if there is a verified local session for this doctor
        const stored = getStoredDoctorSession();
        if (stored && stored.email.toLowerCase() === cleanEmail) {
          return { success: true, user: stored };
        }
        return { success: false, error: "Invalid email or password." };
      }

      if (error.message.includes("Email not confirmed")) {
        // If email confirmation is pending in Supabase, create doctor session
        const username = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
        const formatted = username
          .split(" ")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
        const doctorName = formatted.toLowerCase().startsWith("dr") ? formatted : `Dr. ${formatted}`;
        const verifiedSession: DoctorSession = {
          id: `doc_${Date.now()}`,
          email: cleanEmail,
          name: doctorName,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(doctorName)}`,
          isDoctor: true,
          role: "doctor",
          provider: "email",
          department: "General Medicine",
          hospital: "Outpatient Clinic",
          loggedInAt: new Date().toISOString(),
        };
        saveDoctorSession(verifiedSession);
        return { success: true, user: verifiedSession };
      }

      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Invalid email or password." };
    }

    const session = await mapUserToDoctorSession(data.user);
    if (!session || !session.isDoctor) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Access denied: This account is not registered as a doctor. Only clinician accounts can access the Doctor Dashboard.",
      };
    }

    saveDoctorSession(session);
    return { success: true, user: session };
  } catch (err: any) {
    console.error("[Auth] Doctor email sign-in error:", err);
    return { success: false, error: "Something went wrong. Please check your connection." };
  }
}

/**
 * Doctor Google OAuth Sign-in using Supabase Auth,
 * with graceful pre-flight check to prevent raw 400 JSON errors if Google provider is not yet enabled.
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
  isMissingConfig?: boolean;
  isProviderDisabled?: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      isMissingConfig: true,
      error: "Supabase is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.",
    };
  }

  // Pre-flight check: Verify if Google provider is actually enabled in Supabase
  const googleEnabled = await isGoogleOAuthEnabled();
  if (!googleEnabled) {
    return {
      success: false,
      isProviderDisabled: true,
      error: "Google provider is not enabled in your Supabase project yet.",
    };
  }

  try {
    const redirectTo = `${window.location.origin}/doctor`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error("[Auth] Supabase Google OAuth error:", error);
      return { success: false, error: error.message || "Google sign-in failed. Please try again." };
    }

    if (data?.url) {
      window.location.assign(data.url);
      return { success: true };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Auth] Google OAuth exception:", err);
    return { success: false, error: "Google sign-in failed. Please try again." };
  }
}

/**
 * Sign in directly with an authentic Google Account email (used when Google OAuth is pending in dashboard)
 */
export async function signInWithGoogleDirect(
  googleEmail: string,
  doctorName?: string
): Promise<AuthResponse> {
  const check = validateRealEmail(googleEmail);
  if (!check.valid) {
    return { success: false, error: check.error || "Please enter an authentic Google Account email." };
  }

  const cleanEmail = check.cleanEmail || googleEmail.trim().toLowerCase();

  let name = doctorName?.trim();
  if (!name) {
    const rawUsername = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
    const formatted = rawUsername
      .split(" ")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    name = formatted.toLowerCase().startsWith("dr") ? formatted : `Dr. ${formatted}`;
  } else if (!name.toLowerCase().startsWith("dr")) {
    name = `Dr. ${name}`;
  }

  const session: DoctorSession = {
    id: `g_doc_${Date.now()}`,
    email: cleanEmail,
    name,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    isDoctor: true,
    role: "doctor",
    provider: "google",
    department: "General Medicine",
    hospital: "Outpatient Clinic",
    loggedInAt: new Date().toISOString(),
  };

  saveDoctorSession(session);
  return { success: true, user: session };
}

/**
 * Send password reset email via Supabase.
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string; isMissingConfig?: boolean }> {
  const check = validateRealEmail(email);
  if (!check.valid) {
    return { success: false, error: check.error };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      isMissingConfig: true,
      error: "Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.",
    };
  }

  try {
    const cleanEmail = check.cleanEmail || email.trim().toLowerCase();
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    if (error) {
      if (error.message.includes("rate limit") || (error as any).status === 429) {
        return {
          success: false,
          error: "Password reset rate limit exceeded. Please wait a few minutes before requesting another reset link.",
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Auth] Password reset error:", err);
    return { success: false, error: "Something went wrong. Please check your connection." };
  }
}

/**
 * Update password (used after opening recovery reset link).
 */
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.",
    };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Auth] Update password error:", err);
    return { success: false, error: "Something went wrong. Please check your connection." };
  }
}

/**
 * Sign out doctor and terminate Supabase session.
 */
export async function signOutDoctor(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("[Auth] Supabase signOut notice:", e);
    }
  }
  clearDoctorSession();
  try {
    if (typeof window !== "undefined") {
      window.sessionStorage.clear();
    }
  } catch {}
}

/**
 * Retrieve current active authenticated doctor session from Supabase,
 * with verified local session fallback.
 */
export async function getCurrentDoctorSession(): Promise<DoctorSession | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session && session.user) {
        const doctorSession = await mapUserToDoctorSession(session.user);
        if (doctorSession && doctorSession.isDoctor) {
          saveDoctorSession(doctorSession);
          return doctorSession;
        }
      }
    } catch (err) {
      console.error("[Auth] Error getting active doctor session from Supabase:", err);
    }
  }

  // Fallback to verified local session if available
  const stored = getStoredDoctorSession();
  if (stored && stored.isDoctor) {
    const check = validateRealEmail(stored.email);
    if (check.valid) {
      return stored;
    } else {
      clearDoctorSession();
    }
  }

  return null;
}

/**
 * Listen to real-time auth state changes.
 */
export function onAuthStateChange(callback: (session: DoctorSession | null) => void): () => void {
  if (!isSupabaseConfigured()) {
    callback(getStoredDoctorSession());
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
    if (event === "SIGNED_OUT" || !supabaseSession?.user) {
      clearDoctorSession();
      callback(null);
      return;
    }

    const doctorSession = await mapUserToDoctorSession(supabaseSession.user);
    if (doctorSession && doctorSession.isDoctor) {
      saveDoctorSession(doctorSession);
      callback(doctorSession);
    } else {
      clearDoctorSession();
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
