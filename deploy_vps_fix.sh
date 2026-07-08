#!/bin/bash
# ============================================================================
# VPS Deploy Script — Run this ON THE VPS to apply the missing migrations
# and restart the backend service.
#
# Usage:
#   ssh into VPS, then run:
#   bash /tmp/deploy_fix.sh
# OR copy-paste the commands below directly into the VPS terminal.
# ============================================================================

set -e

BACKEND_DIR="/media/H-Drive/Project/shivam_project/urban-power-app-project-updated/backend"
VENV_DIR="$BACKEND_DIR/venv"
SERVICE_NAME="urbanpower"

echo "=== [1/4] Pulling latest code from GitHub ==="
cd "$BACKEND_DIR/.."
git pull origin main

echo ""
echo "=== [2/4] Running Alembic migration (upgrade head) ==="
cd "$BACKEND_DIR"
"$VENV_DIR/bin/alembic" upgrade head

echo ""
echo "=== [3/4] Restarting backend service ==="
sudo systemctl restart "$SERVICE_NAME"
sleep 3
sudo systemctl status "$SERVICE_NAME" --no-pager | head -20

echo ""
echo "=== [4/4] Smoke-testing key endpoints ==="
sleep 2

BASE="https://api.urbanpowers.com/api/v1"

# Get admin token
ADMIN_TOKEN=$(curl -s -X POST "$BASE/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))" 2>/dev/null || echo "")

# Get user token (mock google login)
USER_TOKEN=$(curl -s -X POST "$BASE/auth/google-login" \
  -H "Content-Type: application/json" \
  -d '{"id_token":"google-mock-smoketest@urbanpowers.com"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))" 2>/dev/null || echo "")

echo ""
echo "--- Testing user endpoints ---"
echo -n "GET /maintenance-bookings/me : "
curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $USER_TOKEN" "$BASE/maintenance-bookings/me"
echo ""

echo -n "GET /scrap-bookings/me : "
curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $USER_TOKEN" "$BASE/scrap-bookings/me"
echo ""

if [ -n "$ADMIN_TOKEN" ]; then
  echo ""
  echo "--- Testing admin endpoints ---"
  echo -n "GET /admin/orders/statistics : "
  curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/admin/orders/statistics"
  echo ""

  echo -n "GET /admin/orders/technicians : "
  curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/admin/orders/technicians"
  echo ""

  echo -n "GET /admin/orders?page_size=5 : "
  curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/admin/orders?page_size=5"
  echo ""
else
  echo "(Admin token not available — skipping admin endpoint tests)"
fi

echo ""
echo "=== Deploy complete! All 200 responses = success ==="
