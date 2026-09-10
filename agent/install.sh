#!/usr/bin/env bash
# ==============================================================================
# xflow-agent - One-Click Installer for Linux
# https://github.com/geekotaku/xflow
# ==============================================================================

set -euo pipefail

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

INSTALL_DIR="/opt/xflow-agent"
REPO_URL="https://github.com/geekotaku/xflow.git"

info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# 1. Check Root Privilege
if [ "$(id -u)" -ne 0 ]; then
    error "This script must be run as root. Please run with sudo: sudo bash $0"
    exit 1
fi

echo -e "${BOLD}${CYAN}"
cat << "EOF"
  __  __   __  _                                                  _   
  \ \/ /  / _|| |  ___ __      __     __ _   __ _   ___  _ __   | |_ 
   \  /  | |_ | | / _ \\ \ /\ / /____ / _` | / _` | / _ \| '_ \  | __|
   /  \  |  _|| || (_) |\ V  V /|____| (_| || (_| ||  __/| | | | | |_ 
  /_/\_\ |_|  |_| \___/  \_/\_/       \__,_| \__, | \___||_| |_|  \__|
                                             |___/                    
  Xray Traffic Reporting Agent
EOF
echo -e "${NC}"

# Parse optional command line flags
ENDPOINT=""
TOKEN=""
INTERVAL="15"
NODE_NAME="$(hostname 2>/dev/null || echo 'node-01')"
API_ADDR="127.0.0.1:10085"
USERS=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -e|--endpoint)
            ENDPOINT="$2"; shift 2 ;;
        -t|--token)
            TOKEN="$2"; shift 2 ;;
        -i|--interval)
            INTERVAL="$2"; shift 2 ;;
        -n|--node)
            NODE_NAME="$2"; shift 2 ;;
        -a|--api)
            API_ADDR="$2"; shift 2 ;;
        -u|--users)
            USERS="$2"; shift 2 ;;
        -h|--help)
            echo "Usage: bash install.sh [options]"
            echo "Options:"
            echo "  -e, --endpoint <url>      xflow server URL (e.g. https://xflow.example.com)"
            echo "  -t, --token <token>       Authentication token for this node"
            echo "  -i, --interval <minutes>  Collection interval in minutes (default: 15)"
            echo "  -n, --node <name>         Node name (default: current hostname)"
            echo "  -a, --api <host:port>     Xray gRPC address (default: 127.0.0.1:10085)"
            echo "  -u, --users <list>        Comma-separated user list (optional)"
            exit 0
            ;;
        *)
            error "Unknown argument: $1"
            exit 1
            ;;
    esac
done

# 2. Interactive Input if not provided via flags
if [ -z "${ENDPOINT}" ]; then
    while [ -z "${ENDPOINT}" ]; do
        read -rp "Enter xflow server endpoint URL (e.g. https://xflow.example.com:3000): " ENDPOINT
    done
fi

# Strip trailing slash
ENDPOINT="${ENDPOINT%/}"

if [ -z "${TOKEN}" ]; then
    while [ -z "${TOKEN}" ]; do
        read -rp "Enter node authentication token (from xflow /admin): " TOKEN
    done
fi

read -rp "Enter node name [Default: ${NODE_NAME}]: " INPUT_NODE
NODE_NAME="${INPUT_NODE:-$NODE_NAME}"

read -rp "Enter reporting interval in minutes [Default: ${INTERVAL}]: " INPUT_INTERVAL
INTERVAL="${INPUT_INTERVAL:-$INTERVAL}"

read -rp "Enter Xray gRPC API address [Default: ${API_ADDR}]: " INPUT_API
API_ADDR="${INPUT_API:-$API_ADDR}"

read -rp "Enter specific users to track (comma-separated, leave blank for ALL) [Optional]: " INPUT_USERS
USERS="${INPUT_USERS:-$USERS}"

# 3. Check and Install Docker & Docker Compose
install_docker() {
    if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        info "Docker and Docker Compose are already installed."
        return
    fi

    info "Docker or Docker Compose not found. Installing via official script..."
    curl -fsSL https://get.docker.com | bash
    systemctl enable --now docker
    success "Docker successfully installed."
}

install_docker

# 4. Setup Agent Files in /opt/xflow-agent
info "Setting up agent in ${INSTALL_DIR}..."
mkdir -p "${INSTALL_DIR}"

if [ -f "./Dockerfile" ] && [ -f "./package.json" ]; then
    # Running directly from agent directory
    info "Copying local agent files..."
    cp -r ./* "${INSTALL_DIR}/"
elif [ -f "./agent/Dockerfile" ]; then
    # Running from root directory of xflow repo
    info "Copying agent files from ./agent..."
    cp -r ./agent/* "${INSTALL_DIR}/"
else
    # Running via remote curl | bash
    info "Cloning xflow repository..."
    TEMP_DIR=$(mktemp -d)
    if command -v git >/dev/null 2>&1; then
        git clone --depth 1 "${REPO_URL}" "${TEMP_DIR}"
    else
        if command -v apt-get >/dev/null 2>&1; then
            apt-get update -y && apt-get install -y git
        elif command -v yum >/dev/null 2>&1; then
            yum install -y git
        elif command -v apk >/dev/null 2>&1; then
            apk add git
        fi
        git clone --depth 1 "${REPO_URL}" "${TEMP_DIR}"
    fi
    cp -r "${TEMP_DIR}/agent/"* "${INSTALL_DIR}/"
    rm -rf "${TEMP_DIR}"
fi

cd "${INSTALL_DIR}"

# Build CLI command arguments
AGENT_CMD="-e ${ENDPOINT} -t ${TOKEN} -i ${INTERVAL} --node ${NODE_NAME} --api ${API_ADDR}"
if [ -n "${USERS}" ]; then
    AGENT_CMD="${AGENT_CMD} -u ${USERS}"
fi

# 5. Generate docker-compose.yml
cat > "${INSTALL_DIR}/docker-compose.yml" << EOF
services:
  xflow-agent:
    build: .
    image: ghcr.io/geekotaku/xflow-agent:latest
    container_name: xflow-agent
    restart: unless-stopped
    network_mode: "host"
    volumes:
      - xflow-agent-data:/data
    environment:
      - STATE_FILE=/data/.xflow-state.json
    command: ${AGENT_CMD}

volumes:
  xflow-agent-data:
EOF

# 6. Build and Start Container
info "Building and launching xflow-agent..."
docker compose down --remove-orphans >/dev/null 2>&1 || true
docker compose up -d --build

echo ""
echo -e "${GREEN}==============================================================${NC}"
echo -e "${BOLD}${GREEN}  xflow-agent has been successfully installed and started!${NC}"
echo -e "${GREEN}==============================================================${NC}"
echo ""
echo -e "  ${BOLD}Node Name:${NC}       ${NODE_NAME}"
echo -e "  ${BOLD}Endpoint:${NC}        ${ENDPOINT}"
echo -e "  ${BOLD}Reporting Every:${NC} ${INTERVAL} minutes"
echo -e "  ${BOLD}Xray gRPC API:${NC}   ${API_ADDR}"
echo -e "  ${BOLD}Tracked Users:${NC}   ${USERS:-All users on node}"
echo ""
echo -e "${BOLD}Useful Management Commands:${NC}"
echo -e "  View real-time logs: ${CYAN}cd ${INSTALL_DIR} && docker compose logs -f${NC}"
echo -e "  Restart agent:       ${CYAN}cd ${INSTALL_DIR} && docker compose restart${NC}"
echo -e "  Stop agent:          ${CYAN}cd ${INSTALL_DIR} && docker compose down${NC}"
echo -e "  Update & rebuild:    ${CYAN}cd ${INSTALL_DIR} && docker compose up -d --build${NC}"
echo ""
