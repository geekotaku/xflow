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

// Run cleanup immediately on database initialization
runCleanup();

// Schedule periodic cleanup every 24 hours
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
setInterval(runCleanup, CLEANUP_INTERVAL_MS);
