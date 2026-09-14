#!/usr/bin/env bash
# ==============================================================================
# xflow-agent - One-Click Installer for Linux (systemd)
# Pure Standalone Binary (Single Executable Application - No Node.js required)
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
SERVICE_NAME="xflow-agent"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
ENV_FILE="${INSTALL_DIR}/xflow-agent.env"
BINARY_PATH="${INSTALL_DIR}/xflow-agent"

info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# Show help without requiring root
for arg in "$@"; do
    if [ "$arg" = "-h" ] || [ "$arg" = "--help" ]; then
        echo "Usage: sudo bash $0 [options]"
        echo ""
        echo "Options:"
        echo "  -s, --server <url>        xflow server URL (e.g. https://xflow.example.com)"
        echo "  -e, --endpoint <url>      Alias for --server"
        echo "  -t, --token <token>       Authentication token for this node"
        echo "  -n, --node <name>         Node name (default: current hostname)"
        echo "  -i, --interval <minutes>  Collection interval in minutes (default: 15)"
        echo "  -a, --api <host:port>     Xray gRPC API address (default: 127.0.0.1:10085)"
        echo "  -u, --users <list>        Comma-separated user emails to track (default: all users)"
        echo "      --uninstall           Stop service and completely uninstall xflow-agent"
        echo "  -h, --help                Show this help message"
        echo ""
        echo "Example:"
        echo "  sudo bash $0 -s https://xflow.example.com -t your-secret-token"
        exit 0
    fi
done

# 1. Check Root Privilege
if [ "$(id -u)" -ne 0 ]; then
    error "This script must be run as root. Please run with sudo: sudo bash $0"
    exit 1
fi

# Print banner
echo -e "${BOLD}${CYAN}"
cat << "EOF"
  __  __   __  _                                                  _   
  \ \/ /  / _|| |  ___ __      __     __ _   __ _   ___  _ __   | |_ 
   \  /  | |_ | | / _ \\ \ /\ / /____ / _` | / _` | / _ \| '_ \  | __|
   /  \  |  _|| || (_) |\ V  V /|____| (_| || (_| ||  __/| | | | | |_ 
  /_/\_\ |_|  |_| \___/  \_/\_/       \__,_| \__, | \___||_| |_|  \__|
                                             |___/                    
  Xray Traffic Reporting Agent (Standalone Binary)
EOF
echo -e "${NC}"

# Parse command line flags
SERVER_URL=""
TOKEN=""
INTERVAL="15"
NODE_NAME="$(hostname 2>/dev/null || echo 'node-01')"
API_ADDR="127.0.0.1:10085"
USERS=""
DO_UNINSTALL=false

show_help() {
    echo "Usage: sudo bash $0 [options]"
    echo ""
    echo "Options:"
    echo "  -s, --server <url>        xflow server URL (e.g. https://xflow.example.com)"
    echo "  -e, --endpoint <url>      Alias for --server"
    echo "  -t, --token <token>       Authentication token for this node"
    echo "  -n, --node <name>         Node name (default: current hostname '${NODE_NAME}')"
    echo "  -i, --interval <minutes>  Collection interval in minutes (default: 15)"
    echo "  -a, --api <host:port>     Xray gRPC API address (default: 127.0.0.1:10085)"
    echo "  -u, --users <list>        Comma-separated user emails to track (default: all users)"
    echo "      --uninstall           Stop service and completely uninstall xflow-agent"
    echo "  -h, --help                Show this help message"
    echo ""
    echo "Example:"
    echo "  sudo bash $0 -s https://xflow.example.com -t your-secret-token"
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -s|--server|-e|--endpoint)
            SERVER_URL="$2"; shift 2 ;;
        -t|--token)
            TOKEN="$2"; shift 2 ;;
        -n|--node)
            NODE_NAME="$2"; shift 2 ;;
        -i|--interval)
            INTERVAL="$2"; shift 2 ;;
        -a|--api)
            API_ADDR="$2"; shift 2 ;;
        -u|--users)
            USERS="$2"; shift 2 ;;
        --uninstall)
            DO_UNINSTALL=true; shift ;;
        -h|--help)
            show_help; exit 0 ;;
        *)
            error "Unknown argument: $1"
            show_help
            exit 1
            ;;
    esac
done

# Handle Uninstallation
if [ "$DO_UNINSTALL" = true ]; then
    info "Uninstalling ${SERVICE_NAME}..."
    if systemctl is-active --quiet "${SERVICE_NAME}" 2>/dev/null; then
        systemctl stop "${SERVICE_NAME}" || true
    fi
    if systemctl is-enabled --quiet "${SERVICE_NAME}" 2>/dev/null; then
        systemctl disable "${SERVICE_NAME}" || true
    fi
    if [ -f "${SERVICE_FILE}" ]; then
        rm -f "${SERVICE_FILE}"
        systemctl daemon-reload
    fi
    if [ -d "${INSTALL_DIR}" ]; then
        rm -rf "${INSTALL_DIR}"
    fi
    rm -f /usr/local/bin/xflow-agent
    success "xflow-agent has been completely uninstalled."
    exit 0
fi

# 2. Interactive Input if not provided via flags
if [ -z "${SERVER_URL}" ]; then
    if [ -t 0 ]; then
        while [ -z "${SERVER_URL}" ]; do
            read -rp "Enter xflow server URL (e.g. https://xflow.example.com): " SERVER_URL
        done
    else
        error "Server URL is required. Use -s or --server <url>."
        exit 1
    fi
fi
SERVER_URL="${SERVER_URL%/}"

if [ -z "${TOKEN}" ]; then
    if [ -t 0 ]; then
        while [ -z "${TOKEN}" ]; do
            read -rp "Enter node authentication token: " TOKEN
        done
    else
        error "Node token is required. Use -t or --token <token>."
        exit 1
    fi
fi

if [ -t 0 ] && [ -z "${NODE_NAME}" ]; then
    read -rp "Enter node name [Default: ${NODE_NAME}]: " INPUT_NODE
    NODE_NAME="${INPUT_NODE:-$NODE_NAME}"
fi

# 3. Detect System Architecture & Acquire Standalone Binary
ARCH="$(uname -m)"
case "${ARCH}" in
    x86_64|amd64) TARGET_ARCH="amd64" ;;
    aarch64|arm64) TARGET_ARCH="arm64" ;;
    *)
        error "Unsupported architecture: ${ARCH}. xflow-agent binary supports amd64 (x86_64) and arm64."
        exit 1
        ;;
esac

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
if [ "${OS}" != "linux" ]; then
    error "Unsupported OS: ${OS}. This script only supports Linux."
    exit 1
fi

mkdir -p "${INSTALL_DIR}"

FOUND_BINARY=false

# Check local binaries first (in case running from built workspace or manual placement)
for candidate in "./dist/xflow-agent-linux-${TARGET_ARCH}" "./xflow-agent-linux-${TARGET_ARCH}" "./dist/xflow-agent" "./xflow-agent" "./agent/dist/xflow-agent"; do
    if [ -f "${candidate}" ]; then
        info "Found local standalone binary: ${candidate}"
        cp -f "${candidate}" "${BINARY_PATH}"
        chmod +x "${BINARY_PATH}"
        FOUND_BINARY=true
        break
    fi
done

# If not local, download precompiled binary
if [ "$FOUND_BINARY" = false ]; then
    BIN_NAME="xflow-agent-linux-${TARGET_ARCH}"
    info "Downloading standalone binary (${BIN_NAME})..."

    # 1. Try server endpoint
    if curl -fsSL --max-time 15 "${SERVER_URL}/${BIN_NAME}" -o "${BINARY_PATH}" 2>/dev/null && [ -s "${BINARY_PATH}" ]; then
        chmod +x "${BINARY_PATH}"
        FOUND_BINARY=true
        info "Downloaded standalone binary from xflow server: ${BIN_NAME}"
    elif curl -fsSL --max-time 15 "${SERVER_URL}/xflow-agent" -o "${BINARY_PATH}" 2>/dev/null && [ -s "${BINARY_PATH}" ]; then
        chmod +x "${BINARY_PATH}"
        FOUND_BINARY=true
        info "Downloaded standalone binary from xflow server: xflow-agent"
    fi

    # 2. Try GitHub Releases
    if [ "$FOUND_BINARY" = false ]; then
        GH_RELEASE_URL="https://github.com/geekotaku/xflow/releases/latest/download/${BIN_NAME}"
        info "Attempting download from GitHub Releases: ${GH_RELEASE_URL}..."
        if curl -fsSL --max-time 20 "${GH_RELEASE_URL}" -o "${BINARY_PATH}" 2>/dev/null && [ -s "${BINARY_PATH}" ]; then
            chmod +x "${BINARY_PATH}"
            FOUND_BINARY=true
            info "Downloaded standalone binary from GitHub Releases (${BIN_NAME})."
        fi
    fi
fi

if [ "$FOUND_BINARY" = false ] || [ ! -x "${BINARY_PATH}" ]; then
    error "Failed to acquire xflow-agent standalone binary."
    echo ""
    echo "Please ensure the binary is either:"
    echo "  1. Available on your xflow server at: ${SERVER_URL}/${BIN_NAME}"
    echo "  2. Published in GitHub Releases as: ${BIN_NAME}"
    echo "  3. Manually placed in ${BINARY_PATH} or current directory"
    exit 1
fi

# Link binary to /usr/local/bin for global CLI access
ln -sf "${BINARY_PATH}" /usr/local/bin/xflow-agent

# Copy installer into INSTALL_DIR for subsequent management / uninstallation
cp -f "$0" "${INSTALL_DIR}/install-agent.sh" 2>/dev/null || true
chmod +x "${INSTALL_DIR}/install-agent.sh" 2>/dev/null || true

# 4. Generate Environment Configuration File
info "Generating configuration file at ${ENV_FILE}..."
cat > "${ENV_FILE}" << EOF
# xflow-agent configuration
XFLOW_SERVER=${SERVER_URL}
XFLOW_TOKEN=${TOKEN}
XFLOW_NODE=${NODE_NAME}
XFLOW_INTERVAL=${INTERVAL}
XFLOW_API=${API_ADDR}
XFLOW_USERS=${USERS}
STATE_FILE=${INSTALL_DIR}/.xflow-state.json
EOF
chmod 600 "${ENV_FILE}"

# 5. Configure systemd Service
info "Configuring systemd service ${SERVICE_NAME}..."
cat > "${SERVICE_FILE}" << EOF
[Unit]
Description=xflow-agent - Xray Traffic Reporting Agent
Documentation=https://github.com/geekotaku/xflow
After=network.target xray.service
Wants=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=${BINARY_PATH}
Restart=always
RestartSec=10s
StandardOutput=journal
StandardError=journal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now "${SERVICE_NAME}"

# 6. Check Service Status
sleep 1
if systemctl is-active --quiet "${SERVICE_NAME}"; then
    echo ""
    echo -e "${GREEN}==============================================================${NC}"
    echo -e "${BOLD}${GREEN}  xflow-agent successfully deployed and running!${NC}"
    echo -e "${GREEN}==============================================================${NC}"
else
    echo ""
    echo -e "${YELLOW}==============================================================${NC}"
    echo -e "${BOLD}${YELLOW}  xflow-agent service started, check status below:${NC}"
    echo -e "${YELLOW}==============================================================${NC}"
    journalctl -u "${SERVICE_NAME}" -n 10 --no-pager || true
fi

echo ""
echo -e "  ${BOLD}Node Name:${NC}       ${NODE_NAME}"
echo -e "  ${BOLD}Server URL:${NC}      ${SERVER_URL}"
echo -e "  ${BOLD}Report Interval:${NC} ${INTERVAL} min"
echo -e "  ${BOLD}Xray API:${NC}        ${API_ADDR}"
echo -e "  ${BOLD}Tracked Users:${NC}   ${USERS:-All users on node}"
echo -e "  ${BOLD}Config File:${NC}     ${ENV_FILE}"
echo -e "  ${BOLD}Binary Location:${NC} ${BINARY_PATH}"
echo ""
echo -e "${BOLD}Management Commands:${NC}"
echo -e "  View Status:        ${CYAN}systemctl status ${SERVICE_NAME}${NC}"
echo -e "  View Realtime Logs: ${CYAN}journalctl -u ${SERVICE_NAME} -f${NC}"
echo -e "  Restart Service:    ${CYAN}systemctl restart ${SERVICE_NAME}${NC}"
echo -e "  Edit Configuration: ${CYAN}nano ${ENV_FILE} && systemctl restart ${SERVICE_NAME}${NC}"
echo -e "  Uninstall:          ${CYAN}sudo bash ${INSTALL_DIR}/install-agent.sh --uninstall${NC}"
echo ""
