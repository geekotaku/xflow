import type { Request } from "express";

// ── 1. Database Row Models (SQLite Persistence) ──────────────────

export interface NodeRow {
  id: number;
  name: string;
  token: string;
  created_at: string;
  last_reported_at?: string | null;
}

export interface AdminUserRow {
  id: number;
  username: string;
  password_hash: string;
  salt: string;
  session_secret: string;
  updated_at: string;
}

export interface TrafficReportRow {
  id: number;
  node: string;
  user: string;
  uplink: number;
  downlink: number;
  reported_at: string;
}

// ── 2. Node Agent Ingestion Models ───────────────────────────────

export interface IncomingUserTraffic {
  user: string;
  uplink: number;
  downlink: number;
}

export interface IncomingReport {
  // Informational only — authoritative node identity comes from the bearer token
  node?: string;
  timestamp?: string;
  users: IncomingUserTraffic[];
}

// ── 3. Auth & Request Context Models ─────────────────────────────

export interface AuthenticatedRequest extends Request {
  admin?: {
    username: string;
  };
}

// ── 4. System & Maintenance Models ───────────────────────────────

export interface AggResult {
  aggregatedHours: number;
  purgedRows: number;
}

// ── 5. Analytics & Dashboard API Response Contracts ──────────────

export interface TrafficSummary {
  monthTotal: number;
  monthUplink: number;
  monthDownlink: number;
  todayTotal: number;
  todayUplink: number;
  todayDownlink: number;
  activeUsers: number;
  totalUsers: number;
  onlineNodes: number;
  totalNodes: number;
}

export interface UserTrafficStats {
  user: string;
  uplink: number;
  downlink: number;
}

export interface NodeTrafficStats {
  node: string;
  uplink: number;
  downlink: number;
}

export interface UserNodeTrafficStats {
  user: string;
  node: string;
  uplink: number;
  downlink: number;
}

export interface TimeSeriesUserStats {
  bucket: string;
  user: string;
  total: number;
}

export interface TimeSeriesNodeStats {
  bucket: string;
  node: string;
  total: number;
}

export interface TimeSeriesTotalStats {
  bucket: string;
  uplink: number;
  downlink: number;
  total: number;
}

export interface TimeSeriesUserNodeStats {
  bucket: string;
  user: string;
  node: string;
  uplink: number;
  downlink: number;
  total: number;
}

export interface StatsResponse {
  range: {
    start: string;
    end: string;
  };
  hourly: boolean;
  summary: TrafficSummary;
  byUser: UserTrafficStats[];
  byNode: NodeTrafficStats[];
  byUserNode: UserNodeTrafficStats[];
  byTimeUser: TimeSeriesUserStats[];
  byTimeNode: TimeSeriesNodeStats[];
  byTimeTotal: TimeSeriesTotalStats[];
  byTimeUserNode?: TimeSeriesUserNodeStats[];
}

export interface StatsMetaResponse {
  version: string;
  users: string[];
  nodes: string[];
}

export interface PaginatedRecordsResponse {
  total: number;
  page: number;
  pages: number;
  limit: number;
  records: Omit<TrafficReportRow, "id">[];
}
