export interface NodeRow {
  id: number;
  name: string;
  token: string;
  created_at: string;
}

export interface TrafficReportRow {
  id: number;
  node: string;
  user: string;
  uplink: number;
  downlink: number;
  reported_at: string;
}

export interface IncomingUserTraffic {
  user: string;
  uplink: number;
  downlink: number;
}

export interface IncomingReport {
  // Informational only — the authoritative node identity comes from
  // whichever token the request authenticated with, never from this field.
  node?: string;
  timestamp?: string;
  users: IncomingUserTraffic[];
}
