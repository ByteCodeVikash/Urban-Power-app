# 📋 Windows Requirements — Urban Power

> Everything you need installed on Windows before you can run or build this project.

---

## 💻 System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| **Operating System** | Windows 10 (64-bit) | Windows 11 (64-bit) |
| **RAM** | 8 GB | 16 GB |
| **Free Disk Space** | 15 GB | 25 GB |
| **CPU** | Any modern 64-bit processor | Intel Core i5 / Ryzen 5 or better |
| **Internet Connection** | Required for initial setup | Broadband (>10 Mbps) for faster setup |
| **Screen Resolution** | 1280×720 | 1920×1080 |

> **Note on RAM:** Android Studio alone recommends 8 GB minimum. With the emulator running alongside Android Studio and your IDE, 16 GB RAM provides a noticeably better experience.

> **Note on Disk Space:** Android Studio (~1 GB) + Android SDK (~4–6 GB) + Gradle caches (~2 GB) + project node_modules (~500 MB) + emulator images (~2–4 GB each) add up quickly.

---

## 🛠️ Required Software

| Software | Required Version | Download Link | Notes |
|---|---|---|---|
| **Git** | 2.x or newer | [git-scm.com/download/win](https://git-scm.com/download/win) | For cloning the repo |
| **Node.js** | **20.x LTS** (recommended) or 18.x LTS | [nodejs.org](https://nodejs.org) | Do NOT use Node.js 21, 22 or "Current" versions |
| **npm** | 9.x or 10.x | Comes bundled with Node.js | No separate install needed |
| **Java JDK** | **17 LTS** (OpenJDK) | [adoptium.net](https://adoptium.net/temurin/releases/) | Must be version 17. Version 8, 11, or 21 will cause build errors |
| **Android Studio** | Hedgehog 2023.1.1 or newer | [developer.android.com/studio](https://developer.android.com/studio) | Used for SDK Manager and emulator |
| **Android SDK** | API 34 or API 35 | Via Android Studio SDK Manager | API 35 = Android 15 (recommended) |
| **Android Platform Tools** | Latest | Via Android Studio SDK Manager | Provides the `adb` command |

---

## 📦 Required Software Versions (Summary Table)

| Tool | Exact Version Needed | How to Check |
|---|---|---|
| Node.js | 18.x LTS or 20.x LTS | `node --version` |
| npm | 9.x or 10.x | `npm --version` |
| Git | 2.x or newer | `git --version` |
| Java JDK | 17.x | `java --version` |
| Android Studio | 2023.1.1 (Hedgehog) or newer | About → Android Studio version |
| Android SDK Build-Tools | 35.0.0 | Android Studio SDK Manager |
| Android SDK Platform | API 35 | Android Studio SDK Manager |
| Android Platform-Tools (adb) | 35.x or newer | `adb version` |
| Gradle | 8.x (managed automatically by Gradle wrapper) | `cd android && gradlew --version` |

---

## 🤖 Android SDK Components

These specific components must be installed via **Android Studio → SDK Manager**:

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
| Intel x86 Emulator Accelerator (HAXM) | Recommended (emulator speed) |

---

## 🌿 Environment Variables Required

These must be set in Windows System Environment Variables:

| Variable | Value Example | Purpose |
|---|---|---|
| `JAVA_HOME` | `C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot` | Points to JDK 17 installation |
| `ANDROID_HOME` | `C:\Users\YourName\AppData\Local\Android\Sdk` | Points to Android SDK |

### PATH entries required:

These folders must be added to the system `PATH`:

```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
%ANDROID_HOME%\emulator
```

---

## 📱 Android Device Requirements (for physical device testing)

| Requirement | Details |
|---|---|
| **Android Version** | Android 7.0 (API 24) or newer |
| **Developer Mode** | Must be enabled |
| **USB Debugging** | Must be enabled |
| **USB Cable** | Must be a data cable (not charge-only) |
| **USB Driver** | May need OEM drivers (Samsung/Xiaomi/etc.) |

> **Minimum Android version:** The app requires Android 7.0 (API 24) or higher.

---

## 🖥️ Emulator Requirements

| Requirement | Details |
|---|---|
| **CPU Virtualization** | Intel VT-x or AMD-V must be enabled in BIOS |
| **Windows Hypervisor** | Enable in Windows Features (for AMD CPUs) |
| **HAXM** | Install for Intel CPUs (via SDK Manager) |
| **Recommended AVD** | Pixel 6, API 34 or API 35 |
| **RAM for Emulator** | Allocate 2–4 GB to the emulator |

### Enable virtualization (if emulator is very slow):

1. Search for **"Turn Windows features on or off"**
2. Check **"Windows Hypervisor Platform"** (for AMD)
3. Or check **"Hyper-V"** (for Intel/modern systems)
4. Restart your computer

---

## 💡 No Additional Configuration Required

This project does NOT need:

| What | Status |
|---|---|
| `.env` file | ❌ Not required — no real backend |
| API keys | ❌ Not required — mock data only |
| Firebase config | ❌ Not required |
| Google Maps keys | ❌ Not required |
| Payment gateway credentials | ❌ Not required |

---

## 🔁 Checking Your Setup Is Complete

After installing everything, run these commands in a **new** Command Prompt or PowerShell:

```cmd
git --version
node --version
npm --version
java --version
adb version
echo %ANDROID_HOME%
echo %JAVA_HOME%
```

✅ All 7 commands must produce output without errors.

If any command fails, see [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) for detailed installation instructions.

---

## 📄 Full Setup Guide

For complete step-by-step installation instructions:

**➡️ [WINDOWS_SETUP.md](./WINDOWS_SETUP.md)**
