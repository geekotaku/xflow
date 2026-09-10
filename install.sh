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

# 4. Configuration Prompts
echo ""
echo -e "${BOLD}--- Configuration Settings ---${NC}"

DEFAULT_PORT="3000"
read -rp "Enter listening port [Default: ${DEFAULT_PORT}]: " PORT
PORT="${PORT:-$DEFAULT_PORT}"

DEFAULT_QUOTA_TB="1"
read -rp "Enter default monthly quota in TB for /flow [Default: ${DEFAULT_QUOTA_TB} TB]: " QUOTA_TB
QUOTA_TB="${QUOTA_TB:-$DEFAULT_QUOTA_TB}"
# Calculate bytes (TB * 1024^4)
TOTAL_BYTES=$(awk "BEGIN {printf \"%.0f\", ${QUOTA_TB} * 1024 * 1024 * 1024 * 1024}")

DEFAULT_RETENTION="90"
read -rp "Enter traffic data retention days [Default: ${DEFAULT_RETENTION} (3 months), 0 to keep forever]: " RETENTION_DAYS
RETENTION_DAYS="${RETENTION_DAYS:-$DEFAULT_RETENTION}"

# Write .env file
cat > "${INSTALL_DIR}/.env" << EOF
PORT=${PORT}
FLOW_DEFAULT_TOTAL=${TOTAL_BYTES}
RETENTION_DAYS=${RETENTION_DAYS}
EOF

# Update docker-compose.yml to read port and env if needed
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
    volumes:
      - xflow-data:/data
    restart: unless-stopped

volumes:
  xflow-data:
EOF

# 5. Build and Start Container
info "Building and launching xflow container..."
docker compose down --remove-orphans >/dev/null 2>&1 || true
docker compose up -d --build

# 6. Retrieve Server IP
SERVER_IP=$(curl -4s --max-time 3 https://api.ipify.org || curl -4s --max-time 3 https://ifconfig.me || echo "your-server-ip")

echo ""
echo -e "${GREEN}==============================================================${NC}"
echo -e "${BOLD}${GREEN}  xflow has been successfully installed and started!${NC}"
echo -e "${GREEN}==============================================================${NC}"
echo ""
echo -e "  ${BOLD}Dashboard URL:${NC}    http://${SERVER_IP}:${PORT}/"
echo -e "  ${BOLD}Admin Panel:${NC}      http://${SERVER_IP}:${PORT}/admin/"
echo -e "  ${BOLD}Sub-Store Flow:${NC}   http://${SERVER_IP}:${PORT}/flow?user=your_email"
echo ""
echo -e "${BOLD}Useful Management Commands:${NC}"
echo -e "  View logs:          ${CYAN}cd ${INSTALL_DIR} && docker compose logs -f${NC}"
echo -e "  Restart service:    ${CYAN}cd ${INSTALL_DIR} && docker compose restart${NC}"
echo -e "  Stop service:       ${CYAN}cd ${INSTALL_DIR} && docker compose down${NC}"
echo -e "  Update & rebuild:   ${CYAN}cd ${INSTALL_DIR} && git pull && docker compose up -d --build${NC}"
echo ""
