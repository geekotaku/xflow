import { Router } from "express";
import { db } from "../db";

const router = Router();

// Default window is the 1st of the current UTC month through now.
function firstOfMonthUtc(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
}

// No real quota exists for self-built nodes, so `total` is set to 1 TB by default
// (high enough that clients never render a "quota exceeded" warning). Override via
// FLOW_DEFAULT_TOTAL environment variable (in bytes) if you want it to reflect
// your VPS's actual monthly bandwidth cap.
const DEFAULT_TOTAL_BYTES = Number(process.env.FLOW_DEFAULT_TOTAL) || 1024 ** 4; // 1 TB

router.get("/", (req, res) => {
  const userParam = typeof req.query.user === "string" ? req.query.user : null;
  const users = userParam
    ? userParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  const startParam =
    typeof req.query.start === "string" ? req.query.start : null;
  const endParam = typeof req.query.end === "string" ? req.query.end : null;

  const startIso =
    startParam && !Number.isNaN(Date.parse(startParam))
      ? new Date(startParam).toISOString()
      : firstOfMonthUtc();
  const endIso =
    endParam && !Number.isNaN(Date.parse(endParam))
      ? new Date(endParam).toISOString()
      : new Date().toISOString();

  const conditions = ["reported_at >= ?", "reported_at <= ?"];
  const params: unknown[] = [startIso, endIso];
  if (users) {
    conditions.push(`user IN (${users.map(() => "?").join(",")})`);
    params.push(...users);
  }

  const row = db
    .prepare(
      `SELECT COALESCE(SUM(uplink), 0) AS uplink, COALESCE(SUM(downlink), 0) AS downlink
       FROM traffic_reports WHERE ${conditions.join(" AND ")}`,
    )
    .get(...params) as { uplink: number; downlink: number };

  const upload = row.uplink;
  const download = row.downlink;
  const total = Math.max(DEFAULT_TOTAL_BYTES, upload + download);

  // This header is the contract with Sub-Store: point a combined
  // subscription's "Traffic Info → URL" at this endpoint's URL and it reads
  // upload/download/total straight off this response.
  res.setHeader(
    "subscription-userinfo",
    `upload=${upload}; download=${download}; total=${total}`,
  );
  res.json({
    user: users ? users.join(",") : null,
    range: { start: startIso, end: endIso },
    upload,
    download,
    total,
  });
});

export default router;
