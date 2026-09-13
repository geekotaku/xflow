import { Router } from "express";
import fs from "fs";
import path from "path";
import { db } from "../services/db";

const router = Router();

let packageVersion = "";
try {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
  );
  if (pkg.version) packageVersion = pkg.version;
} catch {}

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
    version: packageVersion,
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

  // ── Summary KPI metrics ───────────────────────────────────────
  // Calculate global summary metrics for top overview cards (unlinked from filters)
  // 1. This Month's global traffic & active users (start of month local client time -> now)
  const monthRow = db
    .prepare(
      `SELECT COALESCE(SUM(uplink), 0) AS uplink,
              COALESCE(SUM(downlink), 0) AS downlink,
              COUNT(DISTINCT user) AS active_users
       FROM traffic_reports 
       WHERE date(datetime(reported_at, '${tzModifier}')) >= date('now', '${tzModifier}', 'start of month')`,
    )
    .get() as { uplink: number; downlink: number; active_users: number };
  const monthUplink = Number(monthRow?.uplink) || 0;
  const monthDownlink = Number(monthRow?.downlink) || 0;
  const monthTotal = monthUplink + monthDownlink;
  const activeUsers = Number(monthRow?.active_users) || 0;

  // 2. Today's global traffic (00:00:00 local client time -> now)
  const todayRow = db
    .prepare(
      `SELECT COALESCE(SUM(uplink), 0) AS uplink,
              COALESCE(SUM(downlink), 0) AS downlink
       FROM traffic_reports 
       WHERE date(datetime(reported_at, '${tzModifier}')) = date('now', '${tzModifier}')`,
    )
    .get() as { uplink: number; downlink: number };
  const todayUplink = Number(todayRow?.uplink) || 0;
  const todayDownlink = Number(todayRow?.downlink) || 0;
  const todayTotal = todayUplink + todayDownlink;

  // 3. Total distinct registered users in system
  const totalUsersRow = db
    .prepare("SELECT COUNT(DISTINCT user) AS count FROM traffic_reports")
    .get() as { count: number };
  const totalUsers = Number(totalUsersRow?.count) || 0;

  // 4. Online nodes (reported within last 30 minutes)
  const totalNodesInDb =
    (db.prepare("SELECT COUNT(*) AS count FROM nodes").get() as { count: number })
      ?.count || 0;

  let onlineNodes = 0;
  let totalNodes = 0;

  if (totalNodesInDb > 0) {
    const nodeStatusRow = db
      .prepare(
        `SELECT 
           COUNT(*) AS total,
           COUNT(CASE WHEN last_reported_at >= datetime('now', '-30 minutes') THEN 1 END) AS online
         FROM (
           SELECT n.name, (SELECT MAX(reported_at) FROM traffic_reports WHERE node = n.name) AS last_reported_at
           FROM nodes n
         )`,
      )
      .get() as { total: number; online: number };
    totalNodes = Number(nodeStatusRow?.total) || 0;
    onlineNodes = Number(nodeStatusRow?.online) || 0;
  } else {
    const nodeStatusRow = db
      .prepare(
        `SELECT 
           COUNT(*) AS total,
           COUNT(CASE WHEN max_rep >= datetime('now', '-30 minutes') THEN 1 END) AS online
         FROM (
           SELECT node, MAX(reported_at) AS max_rep
           FROM traffic_reports
           GROUP BY node
         )`,
      )
      .get() as { total: number; online: number };
    totalNodes = Number(nodeStatusRow?.total) || 0;
    onlineNodes = Number(nodeStatusRow?.online) || 0;
  }

  const summary = {
    monthTotal,
    monthUplink,
    monthDownlink,
    todayTotal,
    todayUplink,
    todayDownlink,
    activeUsers,
    totalUsers,
    onlineNodes,
    totalNodes,
  };

  res.json({
    range: { start: startIso, end: endIso },
    hourly,
    summary,
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
