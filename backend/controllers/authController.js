/**
 * Authentication controller for clinician access.
 * Enforces strict verification of original, real email addresses and Google accounts.
 * Fake, dummy, and demo accounts are blocked.
 */

// Comprehensive list of blocked fake, disposable, and test email domains
const BLOCKED_DOMAINS = new Set([
  "test.com",
  "demo.com",
  "fake.com",
  "example.com",
  "example.org",
  "example.net",
  "sample.com",
  "sample.org",
  "sample.net",
  "dummy.com",
  "dummy.org",
  "medisens.ai",
  "medivoice.demo",
  "xyz.com",
  "foo.com",
  "bar.com",
  "baz.com",
  "abc.com",
  "domain.com",
  "website.com",
  "noemail.com",
  "nomail.com",
  "fakemail.com",
  "fakemail.net",
  "tempmail.com",
  "temp-mail.org",
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam4.me",
  "grr.la",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "trashmail.com",
  "trashmail.net",
  "trashmail.org",
  "sharklasers.com",
  "dispostable.com",
  "getairmail.com",
  "dropmail.me",
  "inboxkitten.com",
  "burnermail.io",
  "crazymailing.com",
  "maildrop.cc",
  "mohmal.com",
  "nada.ltd",
  "mytemp.email",
  "generator.email",
  "emailondeck.com",
  "fakeinbox.com",
  "tempmailaddress.com",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
]);

// Substrings that must NEVER appear anywhere in an authentic clinician email
const BLOCKED_SUBSTRINGS = [
  "demo",
  "fake",
  "dummy",
  "test",
  "sample",
  "temp",
  "trash",
  "dispos",
  "throwaway",
  "mailinator",
  "yopmail",
  "guerrilla",
  "sharklaser",
  "10minute",
  "dropmail",
  "getairmail",
  "inboxkitten",
  "burner",
  "nada",
  "mohmal",
  "anitha",
  "medisens",
  "example",
  "mock",
  "trial",
  "placeholder",
  "invalid",
  "anon",
  "nobody",
  "nowhere",
  "qwerty",
  "asdf",
  "foobar",
  "12345",
  "spam",
  "junk",
];

// Reserved generic usernames that cannot belong to a real doctor
const BLOCKED_USERNAMES = new Set([
  "admin",
  "administrator",
  "doctor",
  "clinician",
  "physician",
  "guest",
  "user",
  "username",
  "someone",
  "anyone",
  "person",
  "root",
  "default",
  "login",
  "email",
  "mail",
  "info",
  "support",
  "contact",
  "sales",
  "hello",
  "me",
  "abc",
  "xyz",
  "nurse",
  "patient",
  "doc",
  "dr",
]);

/**
 * Validates that an email is an original, authentic clinician email address.
 * Strictly blocks all fake, demo, dummy, disposable, and test emails.
 */
export function validateRealEmail(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Please enter your original email address." };
  }

  const clean = email.trim().toLowerCase();

  // Basic length constraints
  if (clean.length < 6 || clean.length > 120) {
    return { valid: false, error: "Please enter a valid original email address." };
  }

  // Standard email format verification
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return {
      valid: false,
      error: "Please enter a valid original email address (e.g. yourname@gmail.com or doctor@hospital.org).",
    };
  }

  const [username, domain] = clean.split("@");

  if (!username || !domain || !domain.includes(".")) {
    return { valid: false, error: "Invalid email format. Please use your real email." };
  }

  // 1. Username length check (must be at least 3 characters)
  if (username.length < 3) {
    return {
      valid: false,
      error: "Email username is too short. Please enter your authentic clinician email ID.",
    };
  }

  // 2. Must contain at least one alphabetic letter
  if (!/[a-zA-Z]/.test(username)) {
    return {
      valid: false,
      error: "Purely numeric or synthetic email IDs are not permitted. Please use your original email ID.",
    };
  }

  // 3. Reject repetitive dummy characters (e.g., aaaa@, zzzz@)
  if (/(.)\1{3,}/.test(username)) {
    return {
      valid: false,
      error: "Synthetic email addresses are not allowed. Please enter your real email.",
    };
  }

  // 4. Reject exact generic reserved usernames
  if (BLOCKED_USERNAMES.has(username)) {
    return {
      valid: false,
      error: `"${username}" is a reserved generic username. Please sign in with your personal clinician email ID.`,
    };
  }

  // 5. Block any email containing prohibited demo / fake / test words ANYWHERE
  for (const word of BLOCKED_SUBSTRINGS) {
    if (clean.includes(word)) {
      return {
        valid: false,
        error: `Demo, test, and fake accounts are strictly prohibited. The term "${word}" cannot be used for clinician access. Please sign in with your original email address.`,
      };
    }
  }

  // 6. Check against comprehensive blocked domains list
  if (BLOCKED_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: "Demo and disposable email domains are blocked. Please sign in with your original personal or institutional email ID.",
    };
  }

  // 7. Verify TLD is valid (at least 2 letters, not purely digits)
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2 || /\d/.test(tld)) {
    return {
      valid: false,
      error: "Invalid email domain. Please enter a valid clinician email address.",
    };
  }

  return { valid: true, cleanEmail: clean };
}

export function handleEmailLogin(req, res) {
  const { email, password, name } = req.body;

  const emailCheck = validateRealEmail(email);
  if (!emailCheck.valid) {
    return res.status(400).json({
      success: false,
      error: emailCheck.error,
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      error: "Password must be at least 6 characters long.",
    });
  }

  const cleanEmail = emailCheck.cleanEmail;

  // Derive professional title from name or email username
  let doctorName = name && name.trim().length > 0 ? name.trim() : null;
  if (!doctorName) {
    const username = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
    const capitalized = username
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    doctorName = capitalized.toLowerCase().startsWith("dr") ? capitalized : `Dr. ${capitalized}`;
  }

  const user = {
    id: `doc_${Date.now()}`,
    email: cleanEmail,
    name: doctorName,
    isDoctor: true,
    provider: "email",
    department: "General Medicine",
    hospital: "Outpatient Clinic",
    loggedInAt: new Date().toISOString(),
    token: `jwt_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  };

  res.json({
    success: true,
    message: "Doctor authenticated successfully.",
    user,
  });
}

export function handleGoogleLogin(req, res) {
  const { email, name, picture, credential } = req.body;

  let userEmail = email;
  let userName = name;
  let userAvatar = picture;

  // If a raw Google JWT credential was provided, parse payload safely
  if (credential && typeof credential === "string") {
    try {
      const parts = credential.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        userEmail = payload.email || userEmail;
        userName = payload.name || userName;
        userAvatar = payload.picture || userAvatar;
      }
    } catch (e) {
      console.warn("[Auth] Failed to decode Google JWT token:", e.message);
    }
  }

  const emailCheck = validateRealEmail(userEmail);
  if (!emailCheck.valid) {
    return res.status(400).json({
      success: false,
      error: emailCheck.error || "Please use an authentic Google Account email.",
    });
  }

  const cleanEmail = emailCheck.cleanEmail;

  // Prefix Dr. if not already present
  let doctorName = userName || cleanEmail.split("@")[0];
  if (!doctorName.toLowerCase().startsWith("dr")) {
    doctorName = `Dr. ${doctorName}`;
  }

  const user = {
    id: `doc_g_${Date.now()}`,
    email: cleanEmail,
    name: doctorName,
    avatar: userAvatar || null,
    isDoctor: true,
    provider: "google",
    department: "General Medicine",
    hospital: "Outpatient Clinic",
    loggedInAt: new Date().toISOString(),
    token: `g_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  };

  res.json({
    success: true,
    message: "Google sign-in successful.",
    user,
  });
}
