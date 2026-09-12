#!/usr/bin/env bash
# ==============================================================================
# xflow-agent - One-Click Installer for Linux (systemd)
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
REPO_URL="https://github.com/geekotaku/xflow.git"

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
  Xray Traffic Reporting Agent (Native systemd)
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

# 3. Check and Install Node.js
install_nodejs() {
    if command -v node >/dev/null 2>&1; then
        NODE_VER=$(node -v 2>/dev/null | sed -E 's/^v//' | cut -d. -f1)
        if [ "${NODE_VER}" -ge 18 ]; then
            info "Node.js $(node -v) is already installed."
            return 0
        fi
        warn "Detected Node.js $(node -v) which is older than v18."
    fi

    info "Installing Node.js (v20 LTS)..."
    if [ -f /etc/debian_version ] || command -v apt-get >/dev/null 2>&1; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get update -y && apt-get install -y nodejs
    elif [ -f /etc/redhat-release ] || command -v yum >/dev/null 2>&1; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    elif [ -f /etc/alpine-release ] || command -v apk >/dev/null 2>&1; then
        apk add --no-cache nodejs npm
    elif [ -f /etc/arch-release ] || command -v pacman >/dev/null 2>&1; then
        pacman -Sy --noconfirm nodejs npm
    else
        error "Automatic Node.js installation is not supported on this OS. Please install Node.js >= 18 manually."
        exit 1
    fi
}

install_nodejs
NODE_BIN="$(command -v node)"

if [ -z "${NODE_BIN}" ]; then
    error "Node.js executable could not be found."
    exit 1
fi

# 4. Setup Installation Directory
info "Setting up agent in ${INSTALL_DIR}..."
mkdir -p "${INSTALL_DIR}"

# Determine source
if [ -f "./package.json" ] && grep -q '"name": "xflow-agent"' "./package.json" 2>/dev/null; then
    # Running directly from agent source directory
    info "Copying local agent files..."
    cp -r ./* "${INSTALL_DIR}/"
elif [ -f "./agent/package.json" ]; then
    # Running from root directory of xflow repository
    info "Copying agent files from ./agent..."
    cp -r ./agent/* "${INSTALL_DIR}/"
else
    # Running via remote curl | bash
    # Try downloading latest release package first
    DOWNLOADED=false
    info "Fetching latest agent release package..."
    RELEASE_URL=$(curl -fsSL --max-time 5 https://api.github.com/repos/geekotaku/xflow/releases/latest 2>/dev/null | grep -o 'https://[^"]*xflow-agent-[^"]*\.tar\.gz' | head -n 1 || true)
    
    if [ -n "${RELEASE_URL}" ]; then
        if curl -fsSL "${RELEASE_URL}" -o /tmp/xflow-agent.tar.gz; then
            tar -xzf /tmp/xflow-agent.tar.gz -C "${INSTALL_DIR}"
            rm -f /tmp/xflow-agent.tar.gz
            DOWNLOADED=true
            info "Release package downloaded and extracted."
        fi
    fi

    if [ "$DOWNLOADED" = false ]; then
        info "Cloning xflow repository (shallow clone)..."
        TEMP_DIR=$(mktemp -d)
        if ! command -v git >/dev/null 2>&1; then
            if command -v apt-get >/dev/null 2>&1; then
                apt-get update -y && apt-get install -y git
            elif command -v yum >/dev/null 2>&1; then
                yum install -y git
            elif command -v apk >/dev/null 2>&1; then
                apk add git
            fi
        fi
        git clone --depth 1 "${REPO_URL}" "${TEMP_DIR}"
        cp -r "${TEMP_DIR}/agent/"* "${INSTALL_DIR}/"
        rm -rf "${TEMP_DIR}"
    fi
fi

# Copy install-agent.sh into INSTALL_DIR for easy management/uninstallation
cp -f "$0" "${INSTALL_DIR}/install-agent.sh" 2>/dev/null || true
chmod +x "${INSTALL_DIR}/install-agent.sh" 2>/dev/null || true

cd "${INSTALL_DIR}"

# 5. Build / Install Dependencies
if [ ! -f "${INSTALL_DIR}/dist/index.js" ]; then
    info "Building agent from source..."
    npm install
    npm run build
    npm prune --omit=dev
else
    if [ ! -d "${INSTALL_DIR}/node_modules/@grpc/grpc-js" ]; then
        info "Installing production dependencies..."
        npm install --omit=dev --no-audit --no-fund
    fi
fi

# 6. Generate Environment Configuration File
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

# 7. Configure systemd Service
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
ExecStart=${NODE_BIN} ${INSTALL_DIR}/dist/index.js
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

# 8. Check Service Status
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
echo ""
echo -e "${BOLD}Management Commands:${NC}"
echo -e "  View Status:        ${CYAN}systemctl status ${SERVICE_NAME}${NC}"
echo -e "  View Realtime Logs: ${CYAN}journalctl -u ${SERVICE_NAME} -f${NC}"
echo -e "  Restart Service:    ${CYAN}systemctl restart ${SERVICE_NAME}${NC}"
echo -e "  Edit Configuration: ${CYAN}nano ${ENV_FILE} && systemctl restart ${SERVICE_NAME}${NC}"
echo -e "  Uninstall:          ${CYAN}sudo bash ${INSTALL_DIR}/install-agent.sh --uninstall${NC}"
echo ""
