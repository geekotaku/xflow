import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH =
  process.env.DB_PATH || path.join(__dirname, "..", "..", "data", "xflow.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Single-administrator table (guaranteed at most 1 row via CHECK constraint)
  CREATE TABLE IF NOT EXISTS admin_user (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    session_secret TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Each row is one interval's delta from one node for one user (not a
  -- running counter), so any date-range / user / node query is a plain
  -- SUM(...) WHERE ... — no need to reconstruct deltas from cumulative
  -- values at query time.
  CREATE TABLE IF NOT EXISTS traffic_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node TEXT NOT NULL,
    user TEXT NOT NULL,
    uplink INTEGER NOT NULL,
    downlink INTEGER NOT NULL,
    reported_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_traffic_user ON traffic_reports(user);
  CREATE INDEX IF NOT EXISTS idx_traffic_node ON traffic_reports(node);
  CREATE INDEX IF NOT EXISTS idx_traffic_reported_at ON traffic_reports(reported_at);
  CREATE INDEX IF NOT EXISTS idx_traffic_node_reported ON traffic_reports(node, reported_at DESC);
`);

export const RETENTION_DAYS = Number(process.env.RETENTION_DAYS ?? 90); // default: 90 days (3 months)
export const AGGREGATION_DAYS = Number(process.env.AGGREGATION_DAYS ?? 3); // default: 3 days

export function runCleanup(): void {
  if (RETENTION_DAYS <= 0) return;
  try {
    const cutoffDate = new Date(
      Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const info = db
      .prepare("DELETE FROM traffic_reports WHERE reported_at < ?")
      .run(cutoffDate);
    if (info.changes > 0) {
      db.pragma("optimize");
      console.info(
        `[CLEANUP] Purged ${info.changes} traffic records older than ${RETENTION_DAYS} days.`,
      );
    }
  } catch (err) {
    console.error(`[CLEANUP ERROR] Failed to purge old records:`, err);
  }
}

interface AggResult {
  aggregatedHours: number;
  purgedRows: number;
}

// Transaction: aggregates uncompacted historical reports older than cutoffDate
// into 1 record per hour (at :00:00.000Z) grouped by (node, user, hour).
const aggregateTransaction = db.transaction((cutoffDate: string): AggResult => {
  db.exec(
    "CREATE TEMP TABLE IF NOT EXISTS _agg_to_process (node TEXT, user TEXT, hour_prefix TEXT, hour_stamp TEXT, uplink INTEGER, downlink INTEGER, cnt INTEGER)",
  );
  db.exec("DELETE FROM _agg_to_process");

  db.prepare(
    `
    INSERT INTO _agg_to_process
    SELECT
      node,
      user,
      substr(reported_at, 1, 13) AS hour_prefix,
      substr(reported_at, 1, 13) || ':00:00.000Z' AS hour_stamp,
      SUM(uplink) AS uplink,
      SUM(downlink) AS downlink,
      COUNT(*) AS cnt
    FROM traffic_reports
    WHERE reported_at < ?
    GROUP BY node, user, substr(reported_at, 1, 13)
    HAVING COUNT(*) > 1 OR MIN(reported_at) != (substr(reported_at, 1, 13) || ':00:00.000Z')
  `,
  ).run(cutoffDate);

  const count = db
    .prepare(
      "SELECT COUNT(*) as total, SUM(cnt) as rawTotal FROM _agg_to_process",
    )
    .get() as {
    total: number;
    rawTotal: number | null;
  };

  if (!count || count.total === 0) {
    db.exec("DELETE FROM _agg_to_process");
    return { aggregatedHours: 0, purgedRows: 0 };
  }

  db.prepare(
    `
    DELETE FROM traffic_reports
    WHERE reported_at < ?
      AND EXISTS (
        SELECT 1 FROM _agg_to_process a
        WHERE a.node = traffic_reports.node
          AND a.user = traffic_reports.user
          AND substr(traffic_reports.reported_at, 1, 13) = a.hour_prefix
      )
  `,
  ).run(cutoffDate);

  db.exec(`
    INSERT INTO traffic_reports (node, user, uplink, downlink, reported_at)
    SELECT node, user, uplink, downlink, hour_stamp
    FROM _agg_to_process
  `);

  const purgedCount = (count.rawTotal || 0) - count.total;
  db.exec("DELETE FROM _agg_to_process");
  return { aggregatedHours: count.total, purgedRows: Math.max(0, purgedCount) };
});

export function runHourlyAggregation(): void {
  if (AGGREGATION_DAYS <= 0) return;
  try {
    const cutoffDate = new Date(
      Date.now() - AGGREGATION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const result = aggregateTransaction(cutoffDate);
    if (result.aggregatedHours > 0) {
      db.pragma("optimize");
      console.info(
        `[AGGREGATION] Compacted historical data older than ${AGGREGATION_DAYS} days: ` +
          `created ${result.aggregatedHours} 1h summaries, purged ${result.purgedRows} raw rows.`,
      );
    }
  } catch (err) {
    console.error(
      `[AGGREGATION ERROR] Failed to compact historical records:`,
      err,
    );
  }
}

// Run maintenance on startup
runHourlyAggregation();
runCleanup();

// Schedule daily maintenance: target 02:00 AM in the container timezone
function scheduleDailyMaintenance(): void {
  function getMsUntilNextTargetHour(targetHour = 2): number {
    const now = new Date();
    const target = new Date(now);
    target.setHours(targetHour, 0, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime() - now.getTime();
  }

  const msUntil2AM = getMsUntilNextTargetHour(2);
  console.info(
    `[SCHEDULER] Next database maintenance scheduled in ${(msUntil2AM / 1000 / 60).toFixed(1)} minutes (at ~02:00 AM local time).`,
  );

  setTimeout(() => {
    runHourlyAggregation();
    runCleanup();
    // Subsequent runs every 24 hours
    setInterval(
      () => {
        runHourlyAggregation();
        runCleanup();
      },
      24 * 60 * 60 * 1000,
    );
  }, msUntil2AM);
}

scheduleDailyMaintenance();
