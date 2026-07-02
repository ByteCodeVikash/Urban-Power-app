#!/bin/bash
# Nginx and FastAPI Systemd Setup Script
set -e

echo "=== [1/8] Stopping and Disabling Apache2 ==="
if systemctl is-active --quiet apache2; then
    echo "Stopping apache2..."
    systemctl stop apache2
fi
if systemctl is-enabled --quiet apache2; then
    echo "Disabling apache2..."
    systemctl disable apache2
fi

echo "=== [2/8] Installing Nginx ==="
if ! command -v nginx &> /dev/null; then
    echo "Nginx not found. Installing..."
    apt-get update
    apt-get install -y nginx
else
    echo "Nginx is already installed."
fi

echo "=== [3/8] Configuring FastAPI systemd service ==="
CAT_BACKEND_SERVICE="[Unit]
Description=Urban Power FastAPI Backend Service
After=network.target

[Service]
User=vikash
WorkingDirectory=/media/H-Drive/Project/shivam_project/urban-power-app-project-updated/backend
ExecStart=/media/H-Drive/Project/shivam_project/urban-power-app-project-updated/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8081 --workers 2
Restart=always
RestartSec=5
Environment=\"PATH=/media/H-Drive/Project/shivam_project/urban-power-app-project-updated/backend/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\"

[Install]
WantedBy=multi-user.target"

echo "$CAT_BACKEND_SERVICE" > /etc/systemd/system/urban-power-backend.service
systemctl daemon-reload

echo "=== [4/8] Configuring Nginx Server Block ==="
CAT_NGINX_CONF="server {
    listen 80;
    server_name localhost _;

    # Client upload size limit
    client_max_body_size 50M;

    # Dynamic API Requests
    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}"

echo "$CAT_NGINX_CONF" > /etc/nginx/sites-available/urban-power-backend

echo "=== [5/8] Enabling Nginx configuration ==="
ln -sf /etc/nginx/sites-available/urban-power-backend /etc/nginx/sites-enabled/
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "Removing default site from sites-enabled..."
    rm -f /etc/nginx/sites-enabled/default
fi

echo "=== [6/8] Validating Nginx configuration ==="
nginx -t

echo "=== [7/8] Starting and Enabling Services ==="
echo "Enabling and starting urban-power-backend..."
systemctl enable urban-power-backend
systemctl restart urban-power-backend

echo "Enabling and starting nginx..."
systemctl enable nginx
systemctl restart nginx

echo "=== [8/8] Checking service status ==="
systemctl status urban-power-backend --no-pager | head -n 15
echo ""
systemctl status nginx --no-pager | head -n 15

echo "=== Setup complete! ==="
