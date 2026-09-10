# xflow-agent

A lightweight agent that runs on each self-built Xray proxy node to query per-user traffic usage via gRPC and report deltas to an [`xflow`](../README.md) collector server.

---

## Overview

`xflow-agent` connects directly to Xray-core's `StatsService` over gRPC, periodically retrieves bandwidth consumption per user with `reset=true` (atomically reading and zeroing the counters), and POSTs the delta values to your `xflow` server.

Because it queries delta values directly with `reset=true`, it requires no local database, disk persistence, or state storage on the proxy node.

---

## CLI Usage

```bash
$ xflow-agent --help
Usage: xflow-agent [options]

Options:
  -e, --endpoint <url>       xflow server endpoint URL (e.g. https://xflow.example.com)
  -t, --token <token>        Authentication token generated for this node
  -i, --interval <minutes>   Collection interval in minutes (default: 15)
  -u, --users <list>         Comma-separated list of xray users (email field) to track. Omit to track every user on this node
  --node <name>              Node name reported to the collector (default: current hostname)
  --api <host:port>          Xray gRPC API server address (default: "127.0.0.1:10085")
  -h, --help                 display help for command
```

---

## Quick Start

### 1. Prerequisites: Enable Xray gRPC Stats

Ensure that Xray-core is configured to enable traffic statistics and the gRPC API server.

Add the following blocks to your Xray server configuration file (e.g. `/usr/local/etc/xray/config.json`):

```json
{
  "api": {
    "tag": "api",
    "listen": "127.0.0.1:10085",
    "services": [
      "StatsService"
    ]
  },
  "policy": {
    "levels": {
      "0": {
        "statsUserUplink": true,
        "statsUserDownlink": true
      }
    }
  },
  "stats": {}
}
```

> **Note**: Ensure the clients under your inbounds have their `email` field populated (which serves as the username identifier in Xray traffic stats).

### 2. Generate Node Token

Visit the `xflow` admin panel (`https://xflow.example.com/admin`) and create a node to get your Bearer token.

### 3. Run the Agent

#### Option A: One-Click Installation Script (Recommended for Linux VPS)

Run the installer on your Xray proxy node:

```bash
# Interactive mode (prompts for endpoint URL, token, node name, etc.)
sudo bash <(curl -fsSL https://raw.githubusercontent.com/geekotaku/xflow/main/agent/install.sh)
```

Or run non-interactively with arguments:

```bash
sudo bash <(curl -fsSL https://raw.githubusercontent.com/geekotaku/xflow/main/agent/install.sh) \
  -e https://xflow.example.com \
  -t your_node_token \
  -i 15 \
  --node hk-node-01
```

---

#### Option B: Docker Compose (Manual)

Use the provided [`docker-compose.yml`](./docker-compose.yml):

```yaml
version: "3.8"

services:
  xflow-agent:
    image: ghcr.io/geekotaku/xflow-agent:latest
    container_name: xflow-agent
    restart: unless-stopped
    # Use host network so the agent can directly communicate with Xray's 127.0.0.1:10085
    network_mode: "host"
    volumes:
      - xflow-agent-data:/data
    environment:
      - STATE_FILE=/data/.xflow-state.json
    command: >
      -e https://xflow.example.com
      -t your_node_token
      -i 15
      --node hk-node-01
      --api 127.0.0.1:10085

volumes:
  xflow-agent-data:
```

Start the container:

```bash
docker compose up -d
```

#### Option C: Direct Execution

```bash
cd agent
npm install
npm run build

# Report all users every 15 minutes:
node dist/index.js -e https://xflow.example.com -t your_node_token -i 15

# Or track specific users only:
node dist/index.js -e https://xflow.example.com -t your_node_token -i 15 -u alice@nodeA,bob@nodeA
```

#### Option D: Running as a Systemd Service (on Linux VPS)

1. Create `/etc/systemd/system/xflow-agent.service`:

```ini
[Unit]
Description=xflow traffic reporting agent
After=network.target xray.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/xflow-agent
ExecStart=/usr/bin/node /opt/xflow-agent/dist/index.js -e https://xflow.example.com -t your_node_token -i 15 --node hk-node-01
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

2. Enable and start:

```bash
systemctl daemon-reload
systemctl enable --now xflow-agent
```

Check status and logs:

```bash
journalctl -u xflow-agent -f
```

---

## Behavior & Design

- **Zero-Loss Monotonic Delta Tracking**: Queries Xray stats with `reset=false` and never resets Xray counters. The agent tracks the last successfully reported cumulative byte cursor in memory and only reports deltas. This eliminates race-condition packet loss between query and upload, and guarantees zero traffic loss during network disconnects or retries. Automatically detects Xray daemon restarts.
- **Zero Disk Overhead**: Runs purely in memory without writing data or state to disk.
- **Selective User Tracking**: If `-u` is specified, only stats for the specified user emails are queried; traffic for unlisted users is left untouched.

---

## License

[MIT](../LICENSE)
