# 🛡️ VPS Security Configuration Documentation

This document explains the security configuration designed for the VPS at `103.127.146.18` (Port: `7576`) to enforce SSH key-based authentication and a basic UFW firewall.

---

## 📋 Configuration Summary

| Feature                     | Setting / Rule                               | Purpose                                  |
| --------------------------- | -------------------------------------------- | ---------------------------------------- |
| **SSH Public Key**          | `ssh-ed25519 AAAAC3N... vikash.d@elintai.in` | Authorized client key                    |
| **SSH Port**                | `7576/tcp`                                   | Non-standard SSH connection port         |
| **SSH Password Auth**       | `PasswordAuthentication no`                  | Prevent brute-force password cracking    |
| **Default Firewall Policy** | `Deny incoming`, `Allow outgoing`            | Block all unauthorized traffic           |
| **Firewall Rules**          | Allow `7576/tcp`, `80/tcp`, `443/tcp`        | Permit SSH, HTTP, and HTTPS traffic only |

---

## 🛠️ Deployment Instructions

Since root password access is required to apply changes to the VPS, the configuration must be run on the VPS itself using the prepared [vps_security_setup.sh](./vps_security_setup.sh) script.

### Step 1: Copy the Script to the VPS

Run the following command from your local terminal to transfer the security script to the remote server:

```bash
scp -P 7576 vps_security_setup.sh root@103.127.146.18:/root/vps_security_setup.sh
```

### Step 2: Connect to the VPS

Log in using your current password:

```bash
ssh root@103.127.146.18 -p 7576
```

### Step 3: Run the Security Setup Script

Execute the script with root privileges:

```bash
chmod +x /root/vps_security_setup.sh
sudo /root/vps_security_setup.sh
```

---

## 🔍 Verification Guide

### 1. Test SSH Key Authentication

Open a **new terminal session** on your local machine (do not close the active session on the VPS yet) and test passwordless key authentication:

```bash
ssh -i ~/.ssh/id_ed25519 -p 7576 root@103.127.146.18 "echo 'SSH Key Authentication Successful'"
```

If configured correctly, this should log you in instantly and return the message without asking for a password.

### 2. Verify Firewall Status

Run the following command on the VPS to inspect UFW rules:

```bash
sudo ufw status verbose
```

**Expected Output:**

```text
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
7576/tcp                   ALLOW IN    Anywhere                   # SSH Custom Port
80/tcp                     ALLOW IN    Anywhere                   # HTTP Web Port
443/tcp                    ALLOW IN    Anywhere                   # HTTPS Web Port
```

### 3. Verify SSH Password Authentication is Disabled

Run this command on your local machine to check if password authentication is rejected:

```bash
ssh -p 7576 -o PubkeyAuthentication=no root@103.127.146.18
```

**Expected Output:**
`root@103.127.146.18: Permission denied (publickey).` (No prompt for a password should appear).
