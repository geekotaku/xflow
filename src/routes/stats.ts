import { Router } from "express";
import { db } from "../db";

const router = Router();

function parseList(v: unknown): string[] | null {
  if (typeof v !== "string" || !v.trim()) return null;
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseDate(v: unknown, fallback: () => string): string {
  if (typeof v === "string" && !Number.isNaN(Date.parse(v)))
    return new Date(v).toISOString();
  return fallback();
}

// Populates the user/node filter dropdowns from whatever has actually
// been reported so far.
router.get("/meta", (_req, res) => {
  const users = db
    .prepare("SELECT DISTINCT user FROM traffic_reports ORDER BY user")
    .all() as {
    user: string;
  }[];
  const nodes = db
    .prepare("SELECT DISTINCT node FROM traffic_reports ORDER BY node")
    .all() as {
    node: string;
  }[];
  res.json({
    users: users.map((u) => u.user),
    nodes: nodes.map((n) => n.node),
  });
});

router.get("/", (req, res) => {
  const users = parseList(req.query.user);
  const nodes = parseList(req.query.node);
  const startIso = parseDate(req.query.start, () => new Date(0).toISOString());
  const endIso = parseDate(req.query.end, () => new Date().toISOString());

  // Client timezone offset in minutes (e.g. +480 for UTC+8, -300 for UTC-5). Defaults to 0 (UTC).
  const tzOffset = Math.max(-840, Math.min(840, Number(req.query.tz) || 0));
  const tzModifier = `${tzOffset >= 0 ? '+' : ''}${Math.round(tzOffset)} minutes`;

  // Determine granularity: hourly for ≤3 days, daily otherwise
  const rangeMs = Date.parse(endIso) - Date.parse(startIso);
  const hourly = rangeMs <= 3 * 24 * 3600 * 1000;
  // SQLite strftime in client local timezone:
  //   daily  → "2026-09-10"
  //   hourly → "2026-09-10T14"
  const timeBucket = hourly
    ? `strftime('%Y-%m-%dT%H', datetime(reported_at, '${tzModifier}'))`
    : `strftime('%Y-%m-%d', datetime(reported_at, '${tzModifier}'))`;

  const conditions: string[] = ["reported_at >= ?", "reported_at <= ?"];
  const params: unknown[] = [startIso, endIso];

  if (users) {
    conditions.push(`user IN (${users.map(() => "?").join(",")})`);
    params.push(...users);
  }
  if (nodes) {
    conditions.push(`node IN (${nodes.map(() => "?").join(",")})`);
    params.push(...nodes);
  }
  const where = conditions.join(" AND ");

  // per-user totals
  const byUser = db
    .prepare(
      `SELECT user, SUM(uplink) AS uplink, SUM(downlink) AS downlink
       FROM traffic_reports WHERE ${where} GROUP BY user ORDER BY user`,
    )
    .all(...params) as { user: string; uplink: number; downlink: number }[];

  // per-node totals
  const byNode = db
    .prepare(
      `SELECT node, SUM(uplink) AS uplink, SUM(downlink) AS downlink
       FROM traffic_reports WHERE ${where} GROUP BY node ORDER BY node`,
    )
    .all(...params) as { node: string; uplink: number; downlink: number }[];

  // per-user per-node detail (for the detail table)
  const byUserNode = db
    .prepare(
      `SELECT user, node, SUM(uplink) AS uplink, SUM(downlink) AS downlink
       FROM traffic_reports WHERE ${where}
       GROUP BY user, node ORDER BY user, node`,
    )
    .all(...params) as {
    user: string;
    node: string;
    uplink: number;
    downlink: number;
  }[];

  // time-bucket × user (for stacked chart — one series per user)
  const byTimeUser = db
    .prepare(
      `SELECT ${timeBucket} AS bucket, user,
              SUM(uplink + downlink) AS total
       FROM traffic_reports WHERE ${where}
       GROUP BY bucket, user ORDER BY bucket, user`,
    )
    .all(...params) as { bucket: string; user: string; total: number }[];

  // time-bucket × node (for stacked chart — one series per node)
  const byTimeNode = db
    .prepare(
      `SELECT ${timeBucket} AS bucket, node,
              SUM(uplink + downlink) AS total
       FROM traffic_reports WHERE ${where}
       GROUP BY bucket, node ORDER BY bucket, node`,
    )
    .all(...params) as { bucket: string; node: string; total: number }[];

  // time-bucket total traffic (uplink, downlink, total)
  const byTimeTotal = db
    .prepare(
      `SELECT ${timeBucket} AS bucket,
              SUM(uplink) AS uplink,
              SUM(downlink) AS downlink,
              SUM(uplink + downlink) AS total
       FROM traffic_reports WHERE ${where}
       GROUP BY bucket ORDER BY bucket`,
    )
    .all(...params) as {
    bucket: string;
    uplink: number;
    downlink: number;
    total: number;
  }[];

  res.json({
    range: { start: startIso, end: endIso },
    hourly,
    byUser,
    byNode,
    byUserNode,
    byTimeUser,
    byTimeNode,
    byTimeTotal,
  });
});

// Paginated raw records for the detail table
router.get("/records", (req, res) => {
  const users = parseList(req.query.user);
  const nodes = parseList(req.query.node);
  const startIso = parseDate(req.query.start, () => new Date(0).toISOString());
  const endIso = parseDate(req.query.end, () => new Date().toISOString());
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  const conditions: string[] = ["reported_at >= ?", "reported_at <= ?"];
  const params: unknown[] = [startIso, endIso];

  if (users) {
    conditions.push(`user IN (${users.map(() => "?").join(",")})`);
    params.push(...users);
  }
  if (nodes) {
    conditions.push(`node IN (${nodes.map(() => "?").join(",")})`);
    params.push(...nodes);
  }
  const where = conditions.join(" AND ");

  const total = (
    db
      .prepare(`SELECT COUNT(*) AS n FROM traffic_reports WHERE ${where}`)
      .get(...params) as { n: number }
  ).n;

  const records = db
    .prepare(
      `SELECT reported_at, user, node, uplink, downlink
       FROM traffic_reports WHERE ${where}
       ORDER BY reported_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset) as {
    reported_at: string;
    user: string;
    node: string;
    uplink: number;
    downlink: number;
  }[];

  res.json({ total, page, pages: Math.ceil(total / limit), limit, records });
});

export default router;
