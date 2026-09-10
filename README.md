# xflow

A lightweight, self-hosted traffic aggregation and statistics server for Xray proxy nodes.

`xflow` collects periodic bandwidth usage reports sent by [xflow-agent](./agent) instances running on your nodes, records usage deltas in a high-performance SQLite database, provides an interactive web dashboard, and exposes a Sub-Store compatible subscription header endpoint (`/flow`).

---

## Features

- **Sub-Store Traffic Info Integration (`/flow`)**: Serves the `subscription-userinfo` header (`upload=...; download=...; total=...`) and JSON payload for Sub-Store and proxy client subscription widgets.
- **Multi-Node Traffic Collector (`/report`)**: Receives traffic reports securely via Bearer token authentication with clear console logs in MB units.
- **Modern Web Dashboard (`/dashboard`)**:
  - Interactive multi-view charts: **By User**, **By Node**, and **Total Uplink/Downlink**.
  - Hourly or daily resolution depending on the selected date range.
  - Paginated detailed traffic records table with local timezone support.
  - Light/Dark theme switching and multi-language support (English / Chinese, default: English).
- **Node & Token Management (`/admin`)**:
  - Web UI and REST API to create nodes, rotate authentication tokens, and manage node lifecycles.
- **Fast & Minimal**: Powered by Node.js, Express, and SQLite with WAL (Write-Ahead Logging) enabled.

---

## Architecture

```
[ Xray Node 1 ] ──(gRPC StatsService)──> [ xflow-agent ] ──(HTTP POST /report)──┐
                                                                                 ▼
[ Xray Node 2 ] ──(gRPC StatsService)──> [ xflow-agent ] ──(HTTP POST /report)───> [ xflow Server ]
                                                                                   ├── SQLite (WAL)
                                                                                   ├── Web Dashboard
                                                                                   ├── Admin UI
                                                                                   └── /flow (Sub-Store)
```

---

## Quick Start

### Option 1: One-Click Installation Script (Linux)

For Linux servers (Ubuntu, Debian, CentOS, AlmaLinux, etc.):

```bash
# Run installer (automatically configures Docker, asks for port & quota, and starts xflow)
sudo bash <(curl -fsSL https://raw.githubusercontent.com/geekotaku/xflow/main/install.sh)
```

Or from a cloned repository:

```bash
sudo bash install.sh
```

---

### Option 2: Docker Compose (Manual)

1. Create a `docker-compose.yml` file:

```yaml
version: "3.8"

services:
  xflow:
    image: ghcr.io/geekotaku/xflow:latest
    container_name: xflow
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - FLOW_DEFAULT_TOTAL=1099511627776 # 1 TB in bytes
    volumes:
      - ./data:/app/data
```

2. Start the service:

```bash
docker compose up -d
```

### Option 3: Running from Source

**Requirements**: Node.js >= 22

```bash
# Clone the repository
git clone https://github.com/geekotaku/xflow.git
cd xflow

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
npm start
```

The server will start on `http://localhost:3000`.

---

## Sub-Store Integration (`/flow`)

Use this endpoint to provide traffic usage directly to Sub-Store:

```http
GET /flow?user=me@nodeA&start=2026-09-01&end=2026-09-10
```

### Query Parameters

| Parameter | Type   | Required | Description                                                                                                 |
| --------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| `user`    | string | Optional | Comma-separated list of user identifiers/emails (e.g. `user=alice,bob`). If omitted, aggregates all users.  |
| `start`   | string | Optional | ISO date or timestamp (e.g. `2026-09-01`). Defaults to the 1st day of the current UTC month at `00:00:00Z`. |
| `end`     | string | Optional | ISO date or timestamp. Defaults to the current moment.                                                      |

### Response Headers

The response sets the standard `subscription-userinfo` header used by Sub-Store and proxy clients:

```http
subscription-userinfo: upload=123456789; download=987654321; total=1099511627776
```

- **`total`**: Self-hosted nodes typically have no rigid per-user quota. By default, `xflow` returns `1 TB` (`1099511627776` bytes) so clients never display a "quota exceeded" warning. You can override this using the `FLOW_DEFAULT_TOTAL` environment variable (in bytes) to match your VPS monthly limit.

### Response Body

```json
{
  "user": "me@nodeA",
  "range": {
    "start": "2026-09-01T00:00:00.000Z",
    "end": "2026-09-10T05:54:00.000Z"
  },
  "upload": 123456789,
  "download": 987654321,
  "total": 1099511627776
}
```

### Sub-Store Configuration Example

In Sub-Store:

1. Open your combined or node subscription settings.
2. Under **Traffic Info** → **URL**, paste:
   ```text
   https://xflow.example.com/flow?user=your_email@domain.com
   ```
3. Save. Sub-Store will fetch usage and display remaining traffic in subscription clients (Clash, Surge, Shadowrocket, Quantumult X, etc.).

---

## Reporting API (`POST /report`)

Called periodically by [xflow-agent](./agent) on each proxy node.

### Request

```http
POST /report HTTP/1.1
Host: xflow.example.com
Authorization: Bearer <node_token>
Content-Type: application/json

{
  "node": "hk-node-01",
  "timestamp": "2026-09-10T05:54:00.000Z",
  "users": [
    { "user": "alice", "uplink": 10485760, "downlink": 104857600 },
    { "user": "bob",   "uplink": 5242880,  "downlink": 20971520 }
  ]
}
```

- **Authentication**: Requires a Bearer token created via the `/admin` panel.
- **Server Logging**:
  - Valid reports log an `[INFO]` message with traffic formatted in **MB**.
  - Missing or invalid tokens log an `[ERROR]` message to console.

---

## Admin Panel & Node Management (`/admin`)

Visit `http://localhost:3000/admin` in your browser to manage node tokens:

- **Create Node**: Assign a unique name to generate an authentication token.
- **Copy Token**: One-click token copying for agent setup.
- **Rotate Token**: Immediately revokes the old token and generates a new one.
- **Delete Node**: Removes the node credentials (historical traffic records are preserved).

> **Security Note**: The `/admin` path does not include built-in login authentication. If exposing `xflow` to the public internet, place `/admin` behind reverse-proxy authentication (e.g. Nginx HTTP Basic Auth or Cloudflare Access).

---

## Web Dashboard (`/dashboard`)

Visit `http://localhost:3000/` or `http://localhost:3000/dashboard/` to view traffic analytics:

- **Dimension Switcher**:
  - **By User**: Stacked bar chart showing each user's usage over time.
  - **By Node**: Stacked bar chart showing traffic distribution across nodes.
  - **Total**: High-level upload and download volume breakdown.
- **Detailed History**: Paginated raw traffic records with timestamp, user, node, upload, download, and total.
- **Timezone**: Automatically localized to your browser's time zone.

---

## Environment Variables

| Variable             | Default                | Description                                                                                                                                                    |
| -------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`               | `3000`                 | HTTP port the server listens on                                                                                                                                |
| `DB_PATH`            | `data/xflow.db`        | Absolute or relative path to the SQLite database file                                                                                                          |
| `FLOW_DEFAULT_TOTAL` | `1099511627776` (1 TB) | Default total bytes reported in the `/flow` endpoint                                                                                                           |
| `RETENTION_DAYS`     | `90` (3 months)        | Number of days to retain traffic reports. Records older than this are automatically deleted on startup and every 24h. Set to `0` to keep records indefinitely. |

---

## License

[MIT](./LICENSE)
