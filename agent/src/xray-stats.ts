import path from "path";
import { promisify } from "util";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

export interface Stat {
  name: string;
  value: string; // int64 comes back as a decimal string (longs: String)
}

type QueryStatsFn = (
  request: { pattern: string; reset: boolean },
  callback: (err: grpc.ServiceError | null, response: { stat: Stat[] }) => void,
) => void;

export interface StatsServiceClient extends grpc.Client {
  QueryStats: QueryStatsFn;
}

// proto-loader parses the .proto file synchronously at require-time — no
// codegen step, no build-time protoc dependency.
const PROTO_PATH = path.join(__dirname, "../proto/command.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

export function createStatsClient(apiServer: string): StatsServiceClient {
  // Xray's API server listens in plaintext on loopback — no TLS.
  return new proto.xray.app.stats.command.StatsService(
    apiServer,
    grpc.credentials.createInsecure(),
  ) as StatsServiceClient;
}

// promisify() handles grpc-js's (request, (err, response) => void) shape
// directly — no need to hand-roll a Promise executor per call.
export function makeQueryStats(client: StatsServiceClient) {
  return promisify<{ pattern: string; reset: boolean }, { stat: Stat[] }>(
    client.QueryStats.bind(client),
  );
}

// Groups a flat Stat[] into per-user {uplink, downlink}, regardless of how
// narrow or broad the query pattern was. Entries that don't match the
// "user>>>{email}>>>traffic>>>{uplink|downlink}" shape are ignored.
export function groupUserTraffic(
  stats: Stat[],
): Map<string, { uplink: number; downlink: number }> {
  const map = new Map<string, { uplink: number; downlink: number }>();
  const re = /^user>>>(.+)>>>traffic>>>(uplink|downlink)$/;
  for (const stat of stats) {
    const m = stat.name.match(re);
    if (!m) continue;
    const [, user, dir] = m;
    if (!map.has(user)) map.set(user, { uplink: 0, downlink: 0 });
    // Safe for realistic traffic volumes (precision only degrades past
    // ~9 PB accumulated between reports).
    map.get(user)![dir as "uplink" | "downlink"] += Number(stat.value || "0");
  }
  return map;
}
