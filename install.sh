#!/usr/bin/env bash
# ==============================================================================
# xflow - One-Click Installer for Linux
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

INSTALL_DIR="/opt/xflow"
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
        echo "  -p, --port <port>             Web port to listen on (default: 3000)"
        echo "  -q, --quota <tb>              Default monthly quota in TB for /flow (default: 1)"
        echo "  -r, --retention <days>        Data retention in days, 0 for forever (default: 90)"
        echo "  -u, --admin-user <user>       Admin dashboard username (default: admin)"
        echo "  -a, --admin-pass <password>   Admin dashboard password (optional)"
        echo "  -t, --node-token <token>      Default node token (optional)"
        echo "      --uninstall               Stop containers and remove xflow installation"
        echo "  -h, --help                    Show this help message"
        echo ""
        echo "Example:"
        echo "  sudo bash $0 -p 3000 -q 1 -r 90 -a MySecretPass"
        exit 0
    fi
done

# 1. Check Root Privilege
if [ "$(id -u)" -ne 0 ]; then
    error "This script must be run as root. Please run with sudo: sudo bash $0"
    exit 1
fi

echo -e "${BOLD}${CYAN}"
cat << "EOF"
  __  __   __  _                    
  \ \/ /  / _|| |  ___ __      __  
   \  /  | |_ | | / _ \\ \ /\ / /  
   /  \  |  _|| || (_) |\ V  V /   
  /_/\_\ |_|  |_| \___/  \_/\_/    
                                    
  Traffic Collector & Sub-Store Hub
EOF
echo -e "${NC}"

# Parse optional command-line flags
PORT="3000"
QUOTA_TB="1"
RETENTION_DAYS="90"
ADMIN_USER="admin"
ADMIN_PASS=""
DEFAULT_NODE_TOKEN=""
DO_UNINSTALL=false
CLI_PORT_SET=false
CLI_QUOTA_SET=false
CLI_RETENTION_SET=false

show_help() {
    echo "Usage: sudo bash $0 [options]"
    echo ""
    echo "Options:"
    echo "  -p, --port <port>             Web port to listen on (default: 3000)"
    echo "  -q, --quota <tb>              Default monthly quota in TB for /flow (default: 1)"
    echo "  -r, --retention <days>        Data retention in days, 0 for forever (default: 90)"
    echo "  -u, --admin-user <user>       Admin dashboard username (default: admin)"
    echo "  -a, --admin-pass <password>   Admin dashboard password (optional)"
    echo "  -t, --node-token <token>      Default node token (optional)"
    echo "      --uninstall               Stop containers and remove xflow installation"
    echo "  -h, --help                    Show this help message"
    echo ""
    echo "Example:"
    echo "  sudo bash $0 -p 3000 -q 1 -r 90 -a MySecretPass"
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -p|--port)
            PORT="$2"; CLI_PORT_SET=true; shift 2 ;;
        -q|--quota)
            QUOTA_TB="$2"; CLI_QUOTA_SET=true; shift 2 ;;
        -r|--retention)
            RETENTION_DAYS="$2"; CLI_RETENTION_SET=true; shift 2 ;;
        -u|--admin-user)
            ADMIN_USER="$2"; shift 2 ;;
        -a|--admin-pass)
            ADMIN_PASS="$2"; shift 2 ;;
        -t|--node-token)
            DEFAULT_NODE_TOKEN="$2"; shift 2 ;;
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
    info "Uninstalling xflow..."
    if [ -d "${INSTALL_DIR}" ]; then
        cd "${INSTALL_DIR}"
        if command -v docker >/dev/null 2>&1 && [ -f "${INSTALL_DIR}/docker-compose.yml" ]; then
            docker compose down -v --remove-orphans || true
        fi
        cd /
        rm -rf "${INSTALL_DIR}"
    fi
    success "xflow has been completely uninstalled."
    exit 0
fi

# 2. Check and Install Docker & Docker Compose
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

# 3. Setup Installation Directory
info "Setting up installation directory at ${INSTALL_DIR}..."
mkdir -p "${INSTALL_DIR}"

if [ -f "./Dockerfile" ] && [ -f "./package.json" ]; then
    # Running directly from a local clone
    info "Installing from current directory..."
    cp -r ./* "${INSTALL_DIR}/"
else
    # Running via remote curl | bash
    info "Cloning repository from ${REPO_URL}..."
    if command -v git >/dev/null 2>&1; then
        if [ -d "${INSTALL_DIR}/.git" ]; then
            git -C "${INSTALL_DIR}" pull
        else
            git clone "${REPO_URL}" "${INSTALL_DIR}"
        fi
    else
        warn "'git' is not installed. Installing git..."
        if command -v apt-get >/dev/null 2>&1; then
            apt-get update -y && apt-get install -y git
        elif command -v yum >/dev/null 2>&1; then
            yum install -y git
        elif command -v apk >/dev/null 2>&1; then
            apk add git
        fi
        git clone "${REPO_URL}" "${INSTALL_DIR}"
    fi
fi

cd "${INSTALL_DIR}"

# 4. Configuration Prompts (Interactive if terminal and flags not supplied)
if [ -t 0 ] && [ "$CLI_PORT_SET" = false ]; then
    echo ""
    echo -e "${BOLD}--- Configuration Settings ---${NC}"
    read -rp "Enter listening port [Default: ${PORT}]: " INPUT_PORT
    PORT="${INPUT_PORT:-$PORT}"
fi

if [ -t 0 ] && [ "$CLI_QUOTA_SET" = false ]; then
    read -rp "Enter default monthly quota in TB for /flow [Default: ${QUOTA_TB} TB]: " INPUT_QUOTA
    QUOTA_TB="${INPUT_QUOTA:-$QUOTA_TB}"
fi

# Calculate bytes (TB * 1024^4)
TOTAL_BYTES=$(awk "BEGIN {printf \"%.0f\", ${QUOTA_TB} * 1024 * 1024 * 1024 * 1024}")

if [ -t 0 ] && [ "$CLI_RETENTION_SET" = false ]; then
    read -rp "Enter traffic data retention days [Default: ${RETENTION_DAYS} (3 months), 0 for forever]: " INPUT_RETENTION
    RETENTION_DAYS="${INPUT_RETENTION:-$RETENTION_DAYS}"
fi

# Auto-detect host timezone
HOST_TZ=""
if command -v timedatectl >/dev/null 2>&1; then
    HOST_TZ=$(timedatectl show -p Timezone --value 2>/dev/null || true)
fi
if [ -z "${HOST_TZ}" ] && [ -f /etc/timezone ]; then
    HOST_TZ=$(cat /etc/timezone 2>/dev/null | tr -d ' \n\r' || true)
fi
if [ -z "${HOST_TZ}" ] && [ -L /etc/localtime ]; then
    HOST_TZ=$(readlink /etc/localtime 2>/dev/null | sed -E 's#.*/zoneinfo/##' || true)
fi
HOST_TZ="${HOST_TZ:-Asia/Shanghai}"

# Write .env file
info "Writing environment configuration (.env)..."
cat > "${INSTALL_DIR}/.env" << EOF
PORT=${PORT}
FLOW_DEFAULT_TOTAL=${TOTAL_BYTES}
RETENTION_DAYS=${RETENTION_DAYS}
TZ=${HOST_TZ}
EOF

if [ -n "${ADMIN_PASS}" ]; then
    echo "ADMIN_USERNAME=${ADMIN_USER}" >> "${INSTALL_DIR}/.env"
    echo "ADMIN_PASSWORD=${ADMIN_PASS}" >> "${INSTALL_DIR}/.env"
fi

if [ -n "${DEFAULT_NODE_TOKEN}" ]; then
    echo "DEFAULT_NODE_TOKEN=${DEFAULT_NODE_TOKEN}" >> "${INSTALL_DIR}/.env"
fi

# Write docker-compose.yml
cat > "${INSTALL_DIR}/docker-compose.yml" << EOF
services:
  xflow:
    build: .
    image: ghcr.io/geekotaku/xflow:latest
    container_name: xflow
    ports:
      - "${PORT}:${PORT}"
    environment:
      PORT: "${PORT}"
      DB_PATH: /data/xflow.db
      FLOW_DEFAULT_TOTAL: "${TOTAL_BYTES}"
      RETENTION_DAYS: "${RETENTION_DAYS}"
      TZ: "${HOST_TZ}"
    env_file:
      - .env
    volumes:
      - xflow-data:/data
    restart: unless-stopped

volumes:
  xflow-data:
EOF

# 5. Build and Start Container
info "Pulling prebuilt image or building container..."
docker compose pull 2>/dev/null || true
docker compose down --remove-orphans >/dev/null 2>&1 || true
docker compose up -d --build

# 6. Retrieve Server IP
SERVER_IP=$(curl -4s --max-time 3 https://api.ipify.org || curl -4s --max-time 3 https://ifconfig.me || echo "your-server-ip")

echo ""
echo -e "${GREEN}==============================================================${NC}"
echo -e "${BOLD}${GREEN}  xflow has been successfully installed and started!${NC}"
echo -e "${GREEN}==============================================================${NC}"
echo ""
echo -e "  ${BOLD}Dashboard URL:${NC}        http://${SERVER_IP}:${PORT}/"
echo -e "  ${BOLD}Admin Panel:${NC}          http://${SERVER_IP}:${PORT}/admin/"
echo -e "  ${BOLD}Sub-Store Flow:${NC}       http://${SERVER_IP}:${PORT}/flow?user=your_email"
echo -e "  ${BOLD}Server Timezone:${NC}      ${HOST_TZ}"
if [ -n "${ADMIN_PASS}" ]; then
echo -e "  ${BOLD}Admin User:${NC}           ${ADMIN_USER}"
echo -e "  ${BOLD}Admin Password:${NC}       ${ADMIN_PASS}"
fi
echo ""
echo -e "${BOLD}One-Click Agent Node Deployment (systemd, 5 seconds):${NC}"
echo -e "  ${CYAN}sudo bash <(curl -fsSL http://${SERVER_IP}:${PORT}/install-agent.sh) -s http://${SERVER_IP}:${PORT} -t <NODE_TOKEN>${NC}"
echo ""
echo -e "${BOLD}Useful Management Commands:${NC}"
echo -e "  View logs:              ${CYAN}cd ${INSTALL_DIR} && docker compose logs -f${NC}"
echo -e "  Restart service:        ${CYAN}cd ${INSTALL_DIR} && docker compose restart${NC}"
echo -e "  Stop service:           ${CYAN}cd ${INSTALL_DIR} && docker compose down${NC}"
echo -e "  Update & rebuild:       ${CYAN}cd ${INSTALL_DIR} && git pull && docker compose up -d --build${NC}"
echo -e "  Uninstall:              ${CYAN}sudo bash ${INSTALL_DIR}/install.sh --uninstall${NC}"
echo ""
