import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'xflow.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
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
`);

export const RETENTION_DAYS = Number(process.env.RETENTION_DAYS ?? 90); // default: 90 days (3 months)
export const AGGREGATION_DAYS = Number(process.env.AGGREGATION_DAYS ?? 3); // default: 3 days

export function runCleanup(): void {
  if (RETENTION_DAYS <= 0) return;
  try {
    const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const info = db.prepare('DELETE FROM traffic_reports WHERE reported_at < ?').run(cutoffDate);
    if (info.changes > 0) {
      db.pragma('optimize');
      console.info(`[CLEANUP] Purged ${info.changes} traffic records older than ${RETENTION_DAYS} days.`);
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
  db.exec('CREATE TEMP TABLE IF NOT EXISTS _agg_to_process (node TEXT, user TEXT, hour_prefix TEXT, hour_stamp TEXT, uplink INTEGER, downlink INTEGER, cnt INTEGER)');
  db.exec('DELETE FROM _agg_to_process');

  db.prepare(`
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
  `).run(cutoffDate);

  const count = db.prepare('SELECT COUNT(*) as total, SUM(cnt) as rawTotal FROM _agg_to_process').get() as {
    total: number;
    rawTotal: number | null;
  };

  if (!count || count.total === 0) {
    db.exec('DELETE FROM _agg_to_process');
    return { aggregatedHours: 0, purgedRows: 0 };
  }

  db.prepare(`
    DELETE FROM traffic_reports
    WHERE reported_at < ?
      AND EXISTS (
        SELECT 1 FROM _agg_to_process a
        WHERE a.node = traffic_reports.node
          AND a.user = traffic_reports.user
          AND substr(traffic_reports.reported_at, 1, 13) = a.hour_prefix
      )
  `).run(cutoffDate);

  db.exec(`
    INSERT INTO traffic_reports (node, user, uplink, downlink, reported_at)
    SELECT node, user, uplink, downlink, hour_stamp
    FROM _agg_to_process
  `);

  db.exec('DELETE FROM _agg_to_process');

  const rawTotal = count.rawTotal ?? count.total;
  return {
    aggregatedHours: count.total,
    purgedRows: rawTotal - count.total,
  };
});

export function runHourlyAggregation(): void {
  if (AGGREGATION_DAYS <= 0) return;
  try {
    // Cutoff rounded to the start of the hour (e.g. 3 days ago at 00:00:00.000Z)
    const cutoffMs = Math.floor((Date.now() - AGGREGATION_DAYS * 24 * 60 * 60 * 1000) / 3600000) * 3600000;
    const cutoffDate = new Date(cutoffMs).toISOString();

    const { aggregatedHours, purgedRows } = aggregateTransaction(cutoffDate);
    if (aggregatedHours > 0) {
      db.pragma('optimize');
      console.info(
        `[AGGREGATION] Compacted ${purgedRows + aggregatedHours} raw records into ${aggregatedHours} hourly summaries (saved ${purgedRows} rows) older than ${AGGREGATION_DAYS} days.`
      );
    }
  } catch (err) {
    console.error('[AGGREGATION ERROR] Failed to aggregate historical records:', err);
  }
}

export function runDailyMaintenance(): void {
  runCleanup();
  runHourlyAggregation();
}

// Run maintenance immediately on database initialization
runDailyMaintenance();

// Schedule periodic maintenance every day at 02:00 AM
function scheduleDailyTask(targetHour: number, task: () => void): void {
  const scheduleNext = () => {
    const now = new Date();
    const nextTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, 0, 0, 0);
    if (nextTarget.getTime() <= now.getTime()) {
      nextTarget.setDate(nextTarget.getDate() + 1);
    }
    const msUntilTarget = Math.max(1000, nextTarget.getTime() - now.getTime());

    setTimeout(() => {
      try {
        task();
      } finally {
        scheduleNext();
      }
    }, msUntilTarget);
  };

  scheduleNext();
}

scheduleDailyTask(2, runDailyMaintenance);

