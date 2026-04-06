#!/usr/bin/env bash
# deploy-blog.sh — Deploy DKblog on a fresh Ubuntu EC2 instance
# Usage: ssh into your EC2 instance, clone the repo, then run:
#   chmod +x deploy-blog.sh && ./deploy-blog.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
READER_PORT="${READER_PORT:-3000}"
WRITER_PORT="${WRITER_PORT:-3001}"

echo "==> DKblog deploy starting..."

# ── 1. Install Node.js (via NodeSource LTS) ─────────────────────────────
if ! command -v node &>/dev/null; then
  echo "==> Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "==> Node.js already installed: $(node -v)"
fi

# ── 2. Install pm2 globally ─────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  echo "==> Installing pm2..."
  sudo npm install -g pm2
else
  echo "==> pm2 already installed: $(pm2 -v)"
fi

# ── 3. Install project dependencies ─────────────────────────────────────
echo "==> Installing npm dependencies..."
cd "$REPO_DIR"
npm install --production

# ── 4. Stop any existing DKblog processes ────────────────────────────────
echo "==> Stopping existing DKblog processes (if any)..."
pm2 delete reader 2>/dev/null || true
pm2 delete writer 2>/dev/null || true

# ── 5. Start both apps with pm2 ─────────────────────────────────────────
echo "==> Starting reader on port $READER_PORT..."
READER_PORT="$READER_PORT" pm2 start reader.js --name reader

echo "==> Starting writer on port $WRITER_PORT..."
WRITER_PORT="$WRITER_PORT" pm2 start writer.js --name writer

# ── 6. Save pm2 process list and set up startup hook ─────────────────────
pm2 save
echo "==> Setting up pm2 startup hook (you may need to run the printed command with sudo)..."
pm2 startup || true

# ── Done ─────────────────────────────────────────────────────────────────
echo ""
echo "====================================="
echo "  DKblog deployed successfully!"
echo "====================================="
echo ""
echo "  Reader (public):  http://$(hostname -I | awk '{print $1}'):${READER_PORT}/"
echo "  Writer (admin):   http://$(hostname -I | awk '{print $1}'):${WRITER_PORT}/admin"
echo ""
echo "  Manage with:"
echo "    pm2 status          # check status"
echo "    pm2 logs            # view logs"
echo "    pm2 restart all     # restart both apps"
echo ""
echo "  Don't forget to open ports ${READER_PORT} and ${WRITER_PORT} in your EC2 Security Group."
echo ""
