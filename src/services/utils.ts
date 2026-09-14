import crypto from "crypto";
import fs from "fs";
import path from "path";

// ── Logging & Time Utilities ─────────────────────────────────────

/**
 * Formats a Date into local timezone representation: YYYY-MM-DD HH:mm:ss
 * Respects process.env.TZ if specified, falling back to local system timezone.
 */
export function formatLocalTime(date: Date = new Date()): string {
  if (isNaN(date.getTime())) return "";
  try {
    return date.toLocaleString("sv-SE", {
      timeZone: process.env.TZ || undefined,
      hour12: false,
    });
  } catch {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}

export const logger = {
  info: (...args: unknown[]) => console.info(`[${formatLocalTime()}]`, ...args),
  warn: (...args: unknown[]) => console.warn(`[${formatLocalTime()}]`, ...args),
  error: (...args: unknown[]) => console.error(`[${formatLocalTime()}]`, ...args),
  log: (...args: unknown[]) => console.log(`[${formatLocalTime()}]`, ...args),
};

/**
 * Parses an unknown input into an ISO date string, falling back to a custom generator or current time.
 */
export function parseDateIso(v: unknown, fallback: () => string = () => new Date().toISOString()): string {
  if (typeof v === "string" && !Number.isNaN(Date.parse(v))) {
    return new Date(v).toISOString();
  }
  return fallback();
}

// ── Traffic & Byte Formatting ────────────────────────────────────

/**
 * Formats bytes into MB with 2 decimal places (e.g. "12.34 MB").
 */
export function toMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Formats bytes into a human-readable size string (B, KB, MB, GB, TB, PB).
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const clampedIndex = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, clampedIndex)).toFixed(dm))} ${sizes[clampedIndex]}`;
}

// ── Parameter & Token Utilities ──────────────────────────────────

/**
 * Parses a comma-separated string into a trimmed, non-empty string array.
 * Returns null if the input is empty or invalid.
 */
export function parseList(v: unknown): string[] | null {
  if (typeof v !== "string" || !v.trim()) return null;
  const items = v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

/**
 * Generates a cryptographically secure random base64url token.
 */
export function generateToken(byteLength = 24): string {
  return crypto.randomBytes(byteLength).toString("base64url");
}

// ── Project Metadata ─────────────────────────────────────────────

let cachedPackageVersion = "";

/**
 * Reads and returns the package version from package.json in the current working directory.
 */
export function getPackageVersion(): string {
  if (cachedPackageVersion) return cachedPackageVersion;
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
    );
    cachedPackageVersion = pkg.version || "";
  } catch {
    cachedPackageVersion = "";
  }
  return cachedPackageVersion;
}
