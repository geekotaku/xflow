#!/usr/bin/env node
/**
 * xflow-agent
 *
 * Runs on each self-built proxy node. Periodically reads Xray-core's
 * per-user traffic stats directly over gRPC (StatsService.QueryStats with
 * reset=true, which atomically reads AND zeroes the counters) and POSTs
 * the deltas as JSON to an xflow-collector aggregator.
 *
 * Usage:
 *   xflow-agent -e https://data.example.com -t <token>
 *   xflow-agent -e https://data.example.com -t <token> -i 15
 *   xflow-agent -e https://data.example.com -t <token> -i 15 -u me@nodeA,alice@nodeA
 *
 * NOTE: Uses monotonic delta tracking (reset=false). Counters in Xray are
 * never cleared, eliminating race-condition traffic loss between query and
 * report. The in-memory cursor advances only upon confirmed HTTP 204 from
 * xflow, ensuring zero data loss during network interruptions or retries.
 */

import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { Command, InvalidArgumentError } from "commander";
import {
  createStatsClient,
  makeQueryStats,
  groupUserTraffic,
} from "./xray-stats";

interface Config {
  endpoint: string;
  token: string;
  interval: number; // minutes
  users?: string[];
  node: string;
  api: string;
}

interface UserTraffic {
  user: string;
  uplink: number;
  downlink: number;
}

function parsePositiveInt(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0)
    throw new InvalidArgumentError("must be a positive number");
  return n;
}

function parseUserList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseArgs(argv: string[]): Config {
  const program = new Command();
  program
    .name("xflow-agent")
    .requiredOption(
      "-e, --endpoint <url>",
      "xflow-collector endpoint, e.g. https://data.example.com",
    )
    .requiredOption("-t, --token <token>", "auth token for this node")
    .option(
      "-i, --interval <minutes>",
      "collection interval in minutes",
      parsePositiveInt,
      15,
    )
    .option(
      "-u, --users <list>",
      "comma-separated xray user(s) to track (email field on each client). Omit to track every user on this node",
      parseUserList,
    )
    .option(
      "--node <name>",
      "node name reported to the collector",
      os.hostname(),
    )
    .option(
      "--api <host:port>",
      "xray gRPC API server address",
      "127.0.0.1:10085",
    )
    .parse(argv);

  return program.opts<Config>();
}

// Path to persistent state file
const STATE_FILE = process.env.STATE_FILE || path.join(__dirname, "..", ".xflow-state.json");

// In-memory cursor of cumulative bytes successfully reported to xflow
const lastReported = new Map<string, { uplink: number; downlink: number }>();
let isInitialized = false;

function loadState(): void {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf8");
      const data = JSON.parse(raw);
      if (typeof data === "object" && data !== null) {
        for (const [k, v] of Object.entries(data)) {
          if (v && typeof v === "object") {
            lastReported.set(k, {
              uplink: Number((v as any).uplink) || 0,
              downlink: Number((v as any).downlink) || 0,
            });
          }
        }
        isInitialized = true;
        console.log(`[STATE] Restored state for ${lastReported.size} user(s) from ${STATE_FILE}`);
      }
    }
  } catch (err) {
    console.warn(`[STATE WARN] Could not load state file: ${(err as Error).message}`);
  }
}

function saveState(): void {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const obj: Record<string, { uplink: number; downlink: number }> = {};
    for (const [k, v] of lastReported) {
      obj[k] = v;
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(obj, null, 2), "utf8");
  } catch (err) {
    console.error(`[STATE ERROR] Failed to save state file: ${(err as Error).message}`);
  }
}

async function collectStats(
  queryStats: ReturnType<typeof makeQueryStats>,
  config: Config,
): Promise<Map<string, { uplink: number; downlink: number }>> {
  const current = new Map<string, { uplink: number; downlink: number }>();

  if (!config.users) {
    // Read cumulative stats without resetting Xray counters
    const { stat } = await queryStats({ pattern: "user>>>", reset: false });
    for (const [user, v] of groupUserTraffic(stat)) current.set(user, v);
  } else {
    for (const user of config.users) {
      try {
        const { stat } = await queryStats({
          pattern: `user>>>${user}>>>traffic`,
          reset: false,
        });
        for (const [u, v] of groupUserTraffic(stat)) current.set(u, v);
      } catch (err) {
        console.error(
          `query failed for user=${user}: ${(err as Error).message}`,
        );
      }
    }
  }

  return current;
}

/**
 * Calculates delta traffic since the last successful report.
 * Automatically handles Xray restart (when current < last).
 */
function calculateDeltas(
  current: Map<string, { uplink: number; downlink: number }>,
): UserTraffic[] {
  const deltas: UserTraffic[] = [];

  for (const [user, curr] of current) {
    const prev = lastReported.get(user) || { uplink: 0, downlink: 0 };

    // If counter reset occurred in Xray (current < prev), treat current as delta
    const deltaUp = curr.uplink >= prev.uplink ? curr.uplink - prev.uplink : curr.uplink;
    const deltaDown = curr.downlink >= prev.downlink ? curr.downlink - prev.downlink : curr.downlink;

    if (deltaUp > 0 || deltaDown > 0) {
      deltas.push({ user, uplink: deltaUp, downlink: deltaDown });
    }
  }

  return deltas;
}

async function postReport(
  endpoint: string,
  token: string,
  body: unknown,
): Promise<void> {
  const res = await fetch(`${endpoint.replace(/\/$/, "")}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Server responded ${res.status}: ${text}`);
  }
}

async function tick(
  queryStats: ReturnType<typeof makeQueryStats>,
  config: Config,
): Promise<void> {
  const ts = new Date().toISOString();
  let currentSnapshot: Map<string, { uplink: number; downlink: number }>;

  try {
    currentSnapshot = await collectStats(queryStats, config);
  } catch (err) {
    console.error(`[${ts}] stats query failed: ${(err as Error).message}`);
    return;
  }

  // Cold start handling: If no state file existed, calibrate current cumulative
  // counters as the baseline instead of reporting historical traffic as a giant delta.
  if (!isInitialized) {
    for (const [user, curr] of currentSnapshot) {
      lastReported.set(user, curr);
    }
    saveState();
    isInitialized = true;
    console.log(
      `[${ts}] Initial baseline calibrated for ${currentSnapshot.size} user(s). Will report new traffic starting next interval.`,
    );
    return;
  }

  const deltas = calculateDeltas(currentSnapshot);
  if (!deltas.length) {
    console.log(`[${ts}] no new traffic this interval, skipping report`);
    return;
  }

  try {
    await postReport(config.endpoint, config.token, {
      node: config.node,
      timestamp: ts,
      users: deltas,
    });
    console.log(
      `[${ts}] reported node=${config.node} users=${JSON.stringify(deltas)}`,
    );

    // Commit snapshot and persist to state file ONLY after report was successfully accepted
    for (const [user, curr] of currentSnapshot) {
      lastReported.set(user, curr);
    }
    saveState();
  } catch (err) {
    console.error(`[${ts}] report failed: ${(err as Error).message}`);
    // lastReported is NOT updated on failure — next interval will retry and
    // include all traffic accumulated during the downtime.
  }
}

function main(): void {
  const config = parseArgs(process.argv);
  loadState();

  const client = createStatsClient(config.api);
  const queryStats = makeQueryStats(client);

  console.log(
    `starting xflow-agent: node=${config.node} users=${config.users ? config.users.join(",") : "ALL"} ` +
      `api=${config.api} endpoint=${config.endpoint} interval=${config.interval}min`,
  );

  tick(queryStats, config);
  const handle = setInterval(
    () => tick(queryStats, config),
    config.interval * 60 * 1000,
  );
  const shutdown = () => {
    clearInterval(handle);
    client.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
