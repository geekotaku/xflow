import { Router } from "express";
import { db } from "../services/db";
import { parseList, parseDateIso } from "../services/utils";

const router = Router();

// No real quota exists for self-built nodes, so `total` is set to 1 TB by default
// (high enough that clients never render a "quota exceeded" warning). Override via
// FLOW_DEFAULT_TOTAL environment variable (in bytes) if you want it to reflect
// your VPS's actual monthly bandwidth cap.
const DEFAULT_TOTAL_BYTES = Number(process.env.FLOW_DEFAULT_TOTAL) || 1024 ** 4; // 1 TB

// Auto-update interval in hours (header: profile-update-interval, default: 24)
const PROFILE_UPDATE_INTERVAL =
  process.env.PROFILE_UPDATE_INTERVAL !== undefined
    ? Number(process.env.PROFILE_UPDATE_INTERVAL)
    : 24;

// Web page URL for clients (header: profile-web-page-url, optional)
const PROFILE_WEB_PAGE_URL = process.env.PROFILE_WEB_PAGE_URL?.trim() || null;

// Default window is the 1st of the current UTC month through now.
function firstOfMonthUtc(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
}

// 1st of next UTC month (00:00:00 UTC) in Unix seconds
function endOfMonthUtcSeconds(): number {
  const now = new Date();
  return Math.floor(
    new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0),
    ).getTime() / 1000,
  );
}

router.get("/", (req, res) => {
  const users = parseList(req.query.user);
  const startIso = parseDateIso(req.query.start, firstOfMonthUtc);
  const endIso = parseDateIso(req.query.end);

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

  const expire =
    Number(process.env.FLOW_DEFAULT_EXPIRE) || endOfMonthUtcSeconds();

  // This header is the contract with Sub-Store: point a combined
  // subscription's "Traffic Info → URL" at this endpoint's URL and it reads
  // upload/download/total/expire straight off this response.
  res.setHeader(
    "subscription-userinfo",
    `upload=${upload}; download=${download}; total=${total}; expire=${expire}`,
  );

  if (PROFILE_UPDATE_INTERVAL > 0) {
    res.setHeader("profile-update-interval", String(PROFILE_UPDATE_INTERVAL));
  }

  if (PROFILE_WEB_PAGE_URL) {
    res.setHeader("profile-web-page-url", PROFILE_WEB_PAGE_URL);
  }

  res.json({
    user: users ? users.join(",") : null,
    range: { start: startIso, end: endIso },
    upload,
    download,
    total,
    expire,
    ...(PROFILE_UPDATE_INTERVAL > 0
      ? { updateInterval: PROFILE_UPDATE_INTERVAL }
      : {}),
    ...(PROFILE_WEB_PAGE_URL ? { webPageUrl: PROFILE_WEB_PAGE_URL } : {}),
  });
});

export default router;
