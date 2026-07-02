#!/bin/bash
# VPS Security Setup Script
# Configures SSH keys, disables password auth, and sets up UFW firewall.

set -euo pipefail

# Client SSH Public Key to authorize
CLIENT_PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP6Fx+ZCkKdLlcOhVKgeZiA1ILrkKH6ULHjXshpOnVzN vikash.d@elintai.in"
SSH_PORT=7576

echo "=========================================="
echo "   VPS Security Configuration Script      "
echo "=========================================="

# Check if run as root
if [ "$EUID" -ne 0 ]; then
  echo "Error: Please run this script as root (using sudo)." >&2
  exit 1
fi

echo "[1/5] Configuring SSH Authorized Keys..."
SSH_DIR="/root/.ssh"
AUTHORIZED_KEYS="$SSH_DIR/authorized_keys"

mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

if [ ! -f "$AUTHORIZED_KEYS" ]; then
  touch "$AUTHORIZED_KEYS"
  chmod 600 "$AUTHORIZED_KEYS"
fi

if ! grep -qF "$CLIENT_PUBKEY" "$AUTHORIZED_KEYS"; then
  echo "$CLIENT_PUBKEY" >> "$AUTHORIZED_KEYS"
  echo "Authorized key successfully added."
else
  echo "Key is already authorized. Skipping."
fi
chmod 600 "$AUTHORIZED_KEYS"

echo "[2/5] Hardening SSH Configuration..."
SSHD_CONFIG="/etc/ssh/sshd_config"
SSHD_CONFIG_BAK="/etc/ssh/sshd_config.bak.$(date +%F_%H%M%S)"

cp "$SSHD_CONFIG" "$SSHD_CONFIG_BAK"
echo "Backup of sshd_config created at $SSHD_CONFIG_BAK"

# Modify sshd_config options safely
modify_sshd_config() {
  local key=$1
  local value=$2
  # Remove existing configuration lines for this key (handles commented lines as well)
  sed -i "/^[#[:space:]]*${key}[[:space:]]/d" "$SSHD_CONFIG"
  # Append new configuration
  echo "${key} ${value}" >> "$SSHD_CONFIG"
}

modify_sshd_config "PubkeyAuthentication" "yes"
modify_sshd_config "PasswordAuthentication" "no"
modify_sshd_config "ChallengeResponseAuthentication" "no"
modify_sshd_config "KbdInteractiveAuthentication" "no"
modify_sshd_config "PermitRootLogin" "prohibit-password"

echo "SSH configuration updated."

echo "[3/5] Restarting SSH Service..."
if systemctl is-active --quiet sshd; then
  systemctl restart sshd
  echo "sshd restarted successfully."
elif systemctl is-active --quiet ssh; then
  systemctl restart ssh
  echo "ssh restarted successfully."
else
  echo "Warning: Could not restart SSH service automatically. Please restart it manually."
fi

echo "[4/5] Configuring UFW Firewall..."
if ! command -v ufw >/dev/null 2>&1; then
  echo "UFW is not installed. Installing ufw..."
  apt-get update && apt-get install -y ufw
fi

# Reset UFW to default settings (just in case)
ufw --force reset

# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow necessary ports
ufw allow "$SSH_PORT/tcp" comment 'SSH Custom Port'
ufw allow 80/tcp comment 'HTTP Web Port'
ufw allow 443/tcp comment 'HTTPS Web Port'

# Enable firewall
ufw --force enable

echo "[5/5] Verifying Configurations..."
echo "----------------------------------------"
echo "UFW Firewall Status:"
ufw status verbose
echo "----------------------------------------"
echo "SSH daemon port configured: $SSH_PORT"
echo "SSH Key authentication: ENABLED"
echo "SSH Password authentication: DISABLED"
echo "=========================================="
echo "Security configuration completed!"
echo "IMPORTANT: DO NOT close this terminal session before verifying you can log in using your SSH key in a NEW terminal session!"
