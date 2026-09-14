import { InvalidArgumentError } from "commander";

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

export function parsePositiveInt(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0)
    throw new InvalidArgumentError("must be a positive number");
  return n;
}

export function parseUserList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
