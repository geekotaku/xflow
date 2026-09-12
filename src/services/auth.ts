import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import type { AdminUserRow } from "./types";

// ── Password & Crypto Utilities ──────────────────────────────────

export function hashPassword(
  password: string,
  salt = crypto.randomBytes(16).toString("hex"),
): { hash: string; salt: string } {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(derived, "hex"),
      Buffer.from(hash, "hex"),
    );
  } catch {
    return false;
  }
}

// ── Database Operations for Single-Admin User ────────────────────

export function getAdminUser(): AdminUserRow | undefined {
  return db.prepare("SELECT * FROM admin_user WHERE id = 1").get() as
    | AdminUserRow
    | undefined;
}

export function createAdminUser(
  username: string,
  password: string,
): AdminUserRow {
  const { hash, salt } = hashPassword(password);
  const sessionSecret = crypto.randomBytes(32).toString("hex");
  const now = new Date().toISOString();
  db.prepare(
    `
    INSERT INTO admin_user (id, username, password_hash, salt, session_secret, updated_at)
    VALUES (1, ?, ?, ?, ?, ?)
  `,
  ).run(username, hash, salt, sessionSecret, now);
  return getAdminUser()!;
}

export function updateAdminCredentials(
  newUsername: string,
  newPassword?: string,
  rotateSecret = false,
): void {
  const now = new Date().toISOString();
  const current = getAdminUser();
  if (!current) return;
  const secret = rotateSecret
    ? crypto.randomBytes(32).toString("hex")
    : current.session_secret;

  if (newPassword) {
    const { hash, salt } = hashPassword(newPassword);
    db.prepare(
      `
      UPDATE admin_user
      SET username = ?, password_hash = ?, salt = ?, session_secret = ?, updated_at = ?
      WHERE id = 1
    `,
    ).run(newUsername, hash, salt, secret, now);
  } else {
    db.prepare(
      `
      UPDATE admin_user
      SET username = ?, session_secret = ?, updated_at = ?
      WHERE id = 1
    `,
    ).run(newUsername, secret, now);
  }
}

export function rotateSessionSecret(): void {
  const secret = crypto.randomBytes(32).toString("hex");
  db.prepare(
    "UPDATE admin_user SET session_secret = ?, updated_at = ? WHERE id = 1",
  ).run(secret, new Date().toISOString());
}

export function syncAdminFromEnv(): void {
  const envPassword = process.env.ADMIN_PASSWORD;
  const envUsername = process.env.ADMIN_USERNAME;
  const hasPassword = typeof envPassword === "string" && !!envPassword.trim();
  const hasUsername = typeof envUsername === "string" && !!envUsername.trim();

  if (!hasPassword && !hasUsername) {
    return;
  }

  const admin = getAdminUser();

  if (!admin) {
    if (hasPassword) {
      const username = hasUsername ? envUsername.trim() : "admin";
      createAdminUser(username, envPassword.trim());
      console.info(
        `[AUTH] Admin account initialized from environment variables (Username: ${username}).`,
      );
    }
    return;
  }

  const targetUsername = hasUsername ? envUsername.trim() : admin.username;
  const targetPassword = hasPassword ? envPassword.trim() : undefined;

  const usernameChanged = targetUsername !== admin.username;
  const passwordChanged = !!targetPassword;

  if (usernameChanged || passwordChanged) {
    updateAdminCredentials(targetUsername, targetPassword, passwordChanged);
    console.info(
      `[AUTH] Admin credentials updated from environment variables (Username: ${targetUsername}${passwordChanged ? ", password updated" : ""}).`,
    );
  }
}

// ── Stateless HMAC Session Tokens ────────────────────────────────

export function createSessionToken(secret: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = String(expiresAt);
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expiresStr, sig] = parts;
  const expiresAt = Number(expiresStr);
  if (!expiresAt || expiresAt < Date.now()) return false;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(expiresStr)
    .digest("hex");
  if (sig.length !== expectedSig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
}

// ── Cookie & Request Helpers ─────────────────────────────────────

export function parseCookies(req: Request): Record<string, string> {
  const list: Record<string, string> = {};
  const header = req.headers.cookie;
  if (!header) return list;
  for (const part of header.split(";")) {
    const [key, ...v] = part.split("=");
    if (key) list[key.trim()] = decodeURIComponent(v.join("=").trim());
  }
  return list;
}

export function parseSessionToken(req: Request): string | null {
  const cookies = parseCookies(req);
  if (cookies.xflow_session) {
    return cookies.xflow_session;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function setSessionCookie(res: Response, token: string): void {
  // Max-Age 7 days (604800 seconds)
  res.setHeader(
    "Set-Cookie",
    `xflow_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
  );
}

export function clearSessionCookie(res: Response): void {
  res.setHeader(
    "Set-Cookie",
    "xflow_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  );
}

export interface AuthenticatedRequest extends Request {
  admin?: {
    username: string;
  };
}

export function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const token = parseSessionToken(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized, please sign in" });
    return;
  }
  const admin = getAdminUser();
  if (!admin || !verifySessionToken(token, admin.session_secret)) {
    res
      .status(401)
      .json({ error: "Session expired or invalid, please sign in" });
    return;
  }
  req.admin = { username: admin.username };
  next();
}

// ── Login Rate Limiter (Brute-force protection: max 5 failures / 1 min cooldown) ──
const loginFailures = new Map<string, { count: number; lockUntil: number }>();

export function checkLoginLimit(req: Request, failed?: boolean): number | null {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket?.remoteAddress || "127.0.0.1";
  const now = Date.now();
  const rec = loginFailures.get(ip);

  if (failed === undefined) {
    return rec && rec.lockUntil > now ? Math.ceil((rec.lockUntil - now) / 1000) : null;
  }
  if (!failed) {
    loginFailures.delete(ip);
    return null;
  }
  const count = (rec?.count || 0) + 1;
  const lockUntil = count >= 5 ? now + 60000 : 0;
  loginFailures.set(ip, { count, lockUntil });
  return lockUntil ? 60 : null;
}

