import * as kv from "./kv_store";

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Generate secure token with timestamp and random component
function generateSecureToken(username: string): string {
  const timestamp = Date.now();
  const random = crypto.randomUUID();
  const tokenData = `${username}:${timestamp}:${random}`;
  return btoa(tokenData);
}

// Rate limiting: Track login attempts
interface LoginAttempt {
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remainingAttempts: number; lockedUntil?: number }> {
  const key = `ratelimit:login:${identifier}`;
  const attemptData = await kv.get(key) as LoginAttempt | null;
  
  const now = Date.now();
  
  // If locked out, check if lockout period has passed
  if (attemptData?.lockedUntil && now < attemptData.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: attemptData.lockedUntil,
    };
  }
  
  // Reset attempts if window has passed
  if (!attemptData || (now - attemptData.lastAttempt) > ATTEMPT_WINDOW) {
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
    };
  }
  
  // Check if max attempts reached
  if (attemptData.attempts >= MAX_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_DURATION;
    await kv.set(key, {
      ...attemptData,
      lockedUntil,
    });
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil,
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - attemptData.attempts,
  };
}

async function recordLoginAttempt(identifier: string, success: boolean): Promise<void> {
  const key = `ratelimit:login:${identifier}`;
  const attemptData = await kv.get(key) as LoginAttempt | null;
  const now = Date.now();
  
  if (success) {
    // Clear attempts on successful login
    await kv.del(key);
    return;
  }
  
  // Record failed attempt
  if (!attemptData || (now - attemptData.lastAttempt) > ATTEMPT_WINDOW) {
    await kv.set(key, {
      attempts: 1,
      lastAttempt: now,
    });
  } else {
    await kv.set(key, {
      attempts: attemptData.attempts + 1,
      lastAttempt: now,
    });
  }
}

// Session management
interface Session {
  token: string;
  username: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
  ipAddress?: string;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const ACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours of inactivity

async function createSession(username: string, ipAddress?: string): Promise<string> {
  const token = generateSecureToken(username);
  const now = Date.now();
  
  const session: Session = {
    token,
    username,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
    lastActivity: now,
    ipAddress,
  };
  
  await kv.set(`session:${token}`, session);
  console.log(`✅ Session created for ${username}, expires in 24h`);
  
  return token;
}

async function validateSession(token: string): Promise<{ valid: boolean; username?: string; reason?: string }> {
  const session = await kv.get(`session:${token}`) as Session | null;
  
  if (!session) {
    return { valid: false, reason: 'Session not found' };
  }
  
  const now = Date.now();
  
  // Check if session expired
  if (now > session.expiresAt) {
    await kv.del(`session:${token}`);
    return { valid: false, reason: 'Session expired' };
  }
  
  // Check activity timeout
  if (now - session.lastActivity > ACTIVITY_TIMEOUT) {
    await kv.del(`session:${token}`);
    return { valid: false, reason: 'Session inactive' };
  }
  
  // Update last activity
  await kv.set(`session:${token}`, {
    ...session,
    lastActivity: now,
  });
  
  return { valid: true, username: session.username };
}

async function invalidateSession(token: string): Promise<void> {
  await kv.del(`session:${token}`);
  console.log(`🔒 Session invalidated`);
}

// Initialize admin credentials with secure password
async function initializeAdmin(): Promise<void> {
  const credentials = await kv.get("admin:credentials");
  
  if (!credentials) {
    const hashedPassword = await hashPassword("traffic_hills");
    await kv.set("admin:credentials", {
      username: "admin",
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("🔐 Admin credentials initialized with secure password");
  } else if (!credentials.passwordHash) {
    // Migration: If old credentials exist without passwordHash, update them
    console.log("🔄 Migrating old admin credentials to new secure format...");
    const hashedPassword = await hashPassword("traffic_hills");
    await kv.set("admin:credentials", {
      username: "admin",
      passwordHash: hashedPassword,
      createdAt: credentials.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ Admin credentials migrated successfully");
  } else {
    console.log("✅ Admin credentials already initialized");
  }
}

// Authenticate admin
async function authenticateAdmin(username: string, password: string, ipAddress?: string): Promise<{ success: boolean; token?: string; error?: string; remainingAttempts?: number; lockedUntil?: number }> {
  // Check rate limiting
  const rateCheck = await checkRateLimit(username);
  if (!rateCheck.allowed) {
    const minutesLocked = Math.ceil((rateCheck.lockedUntil! - Date.now()) / 60000);
    return {
      success: false,
      error: `Too many failed attempts. Account locked for ${minutesLocked} minutes.`,
      lockedUntil: rateCheck.lockedUntil,
    };
  }
  
  // Ensure admin credentials exist
  await initializeAdmin();
  
  // Get stored credentials
  const credentials = await kv.get("admin:credentials") as { username: string; passwordHash: string } | null;
  
  if (!credentials) {
    await recordLoginAttempt(username, false);
    return {
      success: false,
      error: "Authentication system error",
      remainingAttempts: rateCheck.remainingAttempts - 1,
    };
  }
  
  // Verify username and password
  if (username !== credentials.username) {
    await recordLoginAttempt(username, false);
    return {
      success: false,
      error: "Invalid credentials",
      remainingAttempts: rateCheck.remainingAttempts - 1,
    };
  }
  
  const passwordValid = await verifyPassword(password, credentials.passwordHash);
  if (!passwordValid) {
    await recordLoginAttempt(username, false);
    return {
      success: false,
      error: "Invalid credentials",
      remainingAttempts: rateCheck.remainingAttempts - 1,
    };
  }
  
  // Successful login
  await recordLoginAttempt(username, true);
  const token = await createSession(username, ipAddress);
  
  // Log security event
  await kv.set(`security:login:${Date.now()}`, {
    username,
    timestamp: new Date().toISOString(),
    ipAddress,
    success: true,
  });
  
  console.log(`✅ Successful admin login: ${username} from ${ipAddress || 'unknown IP'}`);
  
  return {
    success: true,
    token,
  };
}

// Change admin password
async function changeAdminPassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const credentials = await kv.get("admin:credentials") as { username: string; passwordHash: string } | null;
  
  if (!credentials) {
    return { success: false, error: "Admin credentials not found" };
  }
  
  const oldPasswordValid = await verifyPassword(oldPassword, credentials.passwordHash);
  if (!oldPasswordValid) {
    return { success: false, error: "Current password is incorrect" };
  }
  
  // Validate new password strength
  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long" };
  }
  
  const newPasswordHash = await hashPassword(newPassword);
  await kv.set("admin:credentials", {
    ...credentials,
    passwordHash: newPasswordHash,
    updatedAt: new Date().toISOString(),
  });
  
  console.log("🔐 Admin password changed successfully");
  
  return { success: true };
}

export {
  authenticateAdmin,
  validateSession,
  invalidateSession,
  changeAdminPassword,
  initializeAdmin,
};