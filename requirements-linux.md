# 📋 Linux / Ubuntu Requirements — Urban Power

> Everything you need installed on Ubuntu/Linux before you can run or build this project.

---

## 💻 System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| **Operating System** | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS (Jammy) |
| **RAM** | 8 GB | 16 GB |
| **Free Disk Space** | 15 GB | 25 GB |
| **CPU** | Any modern 64-bit (x86_64) processor | Intel Core i5 / Ryzen 5 or better |
| **CPU Virtualization** | VT-x or AMD-V enabled in BIOS | Required for emulator acceleration |
| **Internet Connection** | Required for initial setup | Broadband (>10 Mbps) |

> **Supported Distributions:**
> - ✅ Ubuntu 22.04 LTS — **Recommended**
> - ✅ Ubuntu 20.04 LTS
> - ✅ Linux Mint 21.x
> - ⚠️ Other Debian-based distros — should work with minor adjustments
> - ❌ Arch Linux, Fedora, etc. — commands differ (use equivalent package manager)

---

## 🛠️ Required Software

| Software | Required Version | How to Install | Purpose |
|---|---|---|---|
| **Git** | 2.x or newer | `sudo apt install git` | Clone the repository |
| **curl** | Any | `sudo apt install curl` | Download tools/scripts |
| **Node.js** | **20.x LTS** (recommended) or 18.x LTS | Via `nvm` (see below) | JavaScript runtime |
| **npm** | 9.x or 10.x | Comes with Node.js via nvm | Package manager |
| **Java JDK** | **OpenJDK 17** | `sudo apt install openjdk-17-jdk` | Android Gradle build system |
| **Android Studio** | 2023.1.1 (Hedgehog) or newer | Download tar.gz from [developer.android.com](https://developer.android.com/studio) | Android SDK + emulator |
| **Android SDK** | API 34 or 35 | Via Android Studio SDK Manager | Android build target |
| **adb** | Latest | Via Android Studio, or `sudo apt install android-tools-adb` | Device communication |
| **KVM** | — | `sudo apt install qemu-kvm` | Emulator hardware acceleration |
| **Watchman** | 4.x+ | Optional via snap | Faster Metro file watching |

---

## 📦 Required Software Versions (Summary Table)

| Tool | Version Needed | How to Verify |
|---|---|---|
| Node.js | 18.x LTS or 20.x LTS | `node --version` |
| npm | 9.x or 10.x | `npm --version` |
| nvm | 0.39.x or newer | `nvm --version` |
| Git | 2.x or newer | `git --version` |
| Java (JDK) | **17.x** (OpenJDK) | `java --version` |
| Android SDK Build-Tools | 35.0.0 | Android Studio SDK Manager |
| Android SDK Platform | API 35 | Android Studio SDK Manager |
| adb | 1.0.41 or newer | `adb version` |
| Gradle | 8.x (managed by Gradle wrapper) | `cd android && ./gradlew --version` |

---

## 🖥️ Required apt Packages

Install these system packages first:

```bash
sudo apt update
sudo apt install -y \
  curl \
  wget \
  git \
  unzip \
  openjdk-17-jdk \
  android-tools-adb \
  qemu-kvm \
  libvirt-daemon-system \
  libvirt-clients \
  lib32z1 \
  lib32stdc++6 \
  libc6-i386 \
  libssl-dev
```

---

## 🤖 Android SDK Components

Install these via **Android Studio → SDK Manager**:

### SDK Platforms tab:
| Component | API Level | Required? |
|---|---|---|
| Android 15 | API 35 | ✅ Recommended |
| Android 14 | API 34 | ✅ Alternative |

### SDK Tools tab:
| Component | Required? |
|---|---|
| Android SDK Build-Tools (35.0.0) | ✅ Required |
| Android SDK Platform-Tools | ✅ Required |
| Android Emulator | ✅ Required (if using emulator) |
| Android SDK Command-line Tools (latest) | ✅ Required |

---

## 🌿 Environment Variables Required

Add to `~/.bashrc` (or `~/.zshrc` for Zsh):

```bash
# Java
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$HOME/Android/Sdk

# PATH additions
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

After adding, run:
```bash
source ~/.bashrc
```

---

## 📱 Android Device Requirements (for physical device testing)

| Requirement | Details |
|---|---|
| **Android Version** | Android 7.0 (API 24) or newer |
| **Developer Mode** | Must be enabled (tap Build Number 7 times) |
| **USB Debugging** | Must be enabled in Developer Options |
| **USB Cable** | Must be a data cable (not charge-only) |
| **udev Rules** | Must add phone vendor to `/etc/udev/rules.d/` |

---

## 🖥️ Emulator Requirements

| Requirement | Details |
|---|---|
| **KVM** | Must be installed and enabled (`/dev/kvm` accessible) |
| **User in kvm group** | Run: `sudo adduser $USER kvm` |
| **Recommended AVD** | Pixel 6, API 34 or 35 |
| **RAM for Emulator** | 2–4 GB allocated in AVD settings |

### Verify KVM is available:
```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
```
Output must be > 0. If it prints `0`, enable virtualization in your BIOS settings.

### Check KVM device access:
```bash
ls -la /dev/kvm
```
You should have read/write access. If not:
```bash
sudo chown $USER /dev/kvm
# OR
sudo adduser $USER kvm
# Then restart your session
```

---

## 📦 Node.js Installation Method

> **Do NOT use `sudo apt install nodejs`** — it installs an outdated version.

Use **nvm** (Node Version Manager):

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20
```

---

## 💡 No Additional Configuration Required

This project does NOT need:

| What | Status |
|---|---|
| `.env` file | ❌ Not required — no real backend |
| API keys | ❌ Not required — mock data only |
| Firebase config | ❌ Not required |
| Google Maps key | ❌ Not required |
| Payment gateway | ❌ Not required |

---

## 🔁 Checking Your Setup Is Complete

Run these commands to verify everything is installed:

```bash
git --version
node --version
npm --version
java --version
javac --version
adb version
echo $ANDROID_HOME
echo $JAVA_HOME
ls /dev/kvm    # KVM device for emulator
```

✅ All 9 commands must produce output without errors.

If any fail, see [LINUX_SETUP.md](./LINUX_SETUP.md) for detailed step-by-step installation instructions.

---

## 🗒️ Quick Install Script

You can run this block in your terminal to install most requirements at once:

```bash
# System packages
sudo apt update
sudo apt install -y curl wget git unzip openjdk-17-jdk android-tools-adb qemu-kvm lib32z1 lib32stdc++6 libc6-i386

# Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Verify
echo "Git: $(git --version)"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "Java: $(java --version 2>&1 | head -1)"
echo "adb: $(adb version | head -1)"
```

After this script, you still need to install **Android Studio** and configure the **Android SDK** manually. See [LINUX_SETUP.md](./LINUX_SETUP.md) for those steps.

---

## 📄 Full Setup Guide

For complete step-by-step installation instructions with detailed explanations:

**➡️ [LINUX_SETUP.md](./LINUX_SETUP.md)**
