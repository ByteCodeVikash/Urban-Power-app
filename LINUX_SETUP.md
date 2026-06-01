# 🐧 Linux / Ubuntu Setup Guide — Urban Power

> **Who is this for?** Complete beginners on Ubuntu or any Debian-based Linux. If you have never set up React Native or Android development on Linux, follow every step.

---

## 📋 Table of Contents

1. [Before You Begin](#1-before-you-begin)
2. [Update Your System](#2-update-your-system)
3. [Install curl and git](#3-install-curl-and-git)
4. [Install Node.js via nvm](#4-install-nodejs-via-nvm)
5. [Verify Node.js and npm](#5-verify-nodejs-and-npm)
6. [Install Java JDK 17](#6-install-java-jdk-17)
7. [Install Android Studio](#7-install-android-studio)
8. [Install Android SDK via Android Studio](#8-install-android-sdk-via-android-studio)
9. [Set Up Environment Variables](#9-set-up-environment-variables)
10. [Install adb and Verify It Works](#10-install-adb-and-verify-it-works)
11. [Install Watchman (Optional but Recommended)](#11-install-watchman-optional-but-recommended)
12. [Clone the Repository](#12-clone-the-repository)
13. [Install Project Dependencies](#13-install-project-dependencies)
14. [Start the App](#14-start-the-app)
15. [Run on Android Emulator](#15-run-on-android-emulator)
16. [Run on Real Android Phone via USB](#16-run-on-real-android-phone-via-usb)
17. [Build Android APK](#17-build-android-apk)
18. [Build Android AAB](#18-build-android-aab)
19. [Common Linux Problems & Fixes](#19-common-linux-problems--fixes)

---

## 1. Before You Begin

### Supported Linux Distributions

This guide is tested on:
- ✅ Ubuntu 22.04 LTS (Jammy Jellyfish) — **Recommended**
- ✅ Ubuntu 20.04 LTS (Focal Fossa)
- ✅ Linux Mint 21
- ⚠️ Other Debian-based distros — should work with minor adjustments

### What terminal to use?

Press `Ctrl + Alt + T` to open a terminal on Ubuntu.

You will run all commands in this terminal. When the guide says "run this command", type it exactly and press **Enter**.

### Check your system type

This guide is for **64-bit** Linux. Verify:

```bash
uname -m
```

If it prints `x86_64`, you are on 64-bit. ✅

---

## 2. Update Your System

Always start by updating your system to make sure all package lists are current:

```bash
sudo apt update && sudo apt upgrade -y
```

> `sudo` means "run as admin". It will ask for your password — this is your Ubuntu login password.

---

## 3. Install curl and git

We need `curl` to download files and `git` to clone the project.

```bash
sudo apt install -y curl git wget unzip
```

### Verify:

```bash
git --version
curl --version
```

Both should print version numbers. ✅

---

## 4. Install Node.js via nvm

We use **nvm** (Node Version Manager) to install Node.js. This is the best approach on Linux — it avoids permission issues and lets you switch Node.js versions easily.

### Step 1 — Install nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

### Step 2 — Load nvm into your current session

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

> **Alternatively**, close the terminal and open a new one — nvm will load automatically.

### Step 3 — Verify nvm is installed

```bash
nvm --version
```

Should print something like: `0.39.7` ✅

### Step 4 — Install Node.js 20 LTS

```bash
nvm install 20
```

### Step 5 — Set Node.js 20 as default

```bash
nvm use 20
nvm alias default 20
```

---

## 5. Verify Node.js and npm

```bash
node --version
npm --version
```

Expected output:
```
v20.18.0
10.8.2
```

If both print version numbers, Node.js is ready. ✅

---

## 6. Install Java JDK 17

Android's build system (Gradle) requires **Java 17**. Do not use Java 8, 11, or 21 — only Java 17.

```bash
sudo apt install -y openjdk-17-jdk
```

### Verify:

```bash
java --version
javac --version
```

Expected output:
```
openjdk 17.0.x 2024-xx-xx
OpenJDK Runtime Environment ...

javac 17.0.x
```

✅ Java 17 is installed.

### If you have multiple Java versions:

Set Java 17 as the active version:

```bash
sudo update-alternatives --config java
```

A numbered list will appear. Type the number corresponding to Java 17 and press Enter.

Also set it for the compiler:
```bash
sudo update-alternatives --config javac
```

---

## 7. Install Android Studio

Android Studio provides the Android SDK, emulator, and build tools.

### Download Android Studio:

```bash
# Create a downloads folder and navigate into it
mkdir -p ~/Downloads
cd ~/Downloads

# Download Android Studio (check https://developer.android.com/studio for the latest URL)
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2024.1.2.13/android-studio-2024.1.2.13-linux.tar.gz -O android-studio.tar.gz
```

> **If the above URL is outdated**, visit [https://developer.android.com/studio#downloads](https://developer.android.com/studio#downloads) and copy the latest Linux `.tar.gz` download link.

### Extract and install:

```bash
# Extract
tar -xzf android-studio.tar.gz

# Move to /opt (standard location for third-party apps)
sudo mv android-studio /opt/android-studio
```

### Create a desktop launcher:

```bash
sudo nano /usr/share/applications/android-studio.desktop
```

Paste this content:

```
[Desktop Entry]
Version=1.0
Type=Application
Name=Android Studio
Comment=Android Development Environment
Exec=/opt/android-studio/bin/studio.sh
Icon=/opt/android-studio/bin/studio.svg
Categories=Development;IDE;
Terminal=false
StartupWMClass=jetbrains-studio
```

Save and exit: press `Ctrl + X`, then `Y`, then `Enter`.

### Launch Android Studio:

```bash
/opt/android-studio/bin/studio.sh &
```

Or search for "Android Studio" in your app launcher.

### First-time setup inside Android Studio:

1. A **Setup Wizard** opens — click **Next**
2. Choose **Standard** install type → Click **Next**
3. Choose a UI theme → Click **Next**
4. Click **Finish** — Android Studio will download the Android SDK (~2–3 GB)
   - Wait for this to fully complete before continuing
5. Click **Finish** again when the download is done

---

## 8. Install Android SDK via Android Studio

After Android Studio is set up:

1. Open **Android Studio**
2. Click **More Actions** (or go to **Settings**) → **SDK Manager**
3. In the **SDK Platforms** tab, install:
   - ✅ **Android 15 (API Level 35)**
   - ✅ **Android 14 (API Level 34)**
4. Click the **SDK Tools** tab and make sure these are checked:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Command-line Tools (latest)
5. Click **Apply** → **OK** → Wait for download → Click **Finish**

### Note your SDK path:

In the SDK Manager, the path is shown at the top. It will look like:
```
/home/yourname/Android/Sdk
```

**Copy this path** — you need it in the next step.

---

## 9. Set Up Environment Variables

We need to tell Linux where Java and Android SDK are located.

### Open your shell configuration file:

For Bash (default on Ubuntu):
```bash
nano ~/.bashrc
```

For Zsh (if you use zsh):
```bash
nano ~/.zshrc
```

### Add these lines at the END of the file:

```bash
# Java
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$HOME/Android/Sdk

# Android tools in PATH
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

> **Important:** Replace `$HOME/Android/Sdk` with the actual SDK path from Android Studio if it is different.

Save the file: press `Ctrl + X`, then `Y`, then `Enter`.

### Apply the changes immediately:

```bash
source ~/.bashrc
```

(Use `source ~/.zshrc` if you use zsh.)

### Verify:

```bash
echo $ANDROID_HOME
echo $JAVA_HOME
adb --version
```

Expected:
```
/home/yourname/Android/Sdk
/usr/lib/jvm/java-17-openjdk-amd64
Android Debug Bridge version 1.0.41 ...
```

If all three work, your environment is set up correctly. ✅

---

## 10. Install adb and Verify It Works

`adb` (Android Debug Bridge) should already be in your PATH from Step 9. Let's verify:

```bash
adb version
```

Expected:
```
Android Debug Bridge version 1.0.41
Version xx.x.x-xxxxxxxx
```

### If adb is not found:

Install it from apt as a backup:
```bash
sudo apt install -y android-tools-adb
```

Then check again:
```bash
adb version
```

---

## 11. Install Watchman (Optional but Recommended)

Watchman is a file watcher tool that makes Metro Bundler (React Native's JS server) faster and more reliable.

```bash
sudo apt install -y libssl-dev autoconf automake libtool python3-dev pkg-config

# Install via snap (easiest on Ubuntu)
sudo snap install watchman --edge --devmode
```

> If you have issues with the snap version, skip Watchman — the app will still run fine without it.

---

## 12. Clone the Repository

Navigate to the folder where you want to store the project:

```bash
# Go to your home directory
cd ~

# OR go to a specific folder, for example:
cd ~/Documents
```

Clone the project:

```bash
git clone https://github.com/YOUR_USERNAME/urbanPower.git
```

> Replace `YOUR_USERNAME/urbanPower` with the actual GitHub repository URL.

Enter the project folder:

```bash
cd urbanPower
```

All future commands should be run from inside this folder.

---

## 13. Install Project Dependencies

This command downloads all the libraries and packages the project needs:

```bash
npm install
```

This will take 2–5 minutes depending on your internet speed. When complete, you will see something like:
```
added 1234 packages in 45s
```

> **Warnings are normal** — ignore them unless you see the word "ERROR".

### Fix permissions if needed:

If you see permission errors during `npm install`:

```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

---

## 14. Start the App

### Option A — With Expo Go (Quickest, No Build Needed)

```bash
npx expo start
```

A QR code will appear. Install **Expo Go** from the Google Play Store on your Android phone. Open Expo Go → "Scan QR Code" → Scan the code.

Your phone and computer must be on the **same Wi-Fi network**.

### Option B — Build and Run Directly

```bash
npx expo run:android
```

This builds the app and installs it on your connected device or running emulator. First-time build takes 5–15 minutes.

---

## 15. Run on Android Emulator

### Create a Virtual Device:

1. Open **Android Studio**
2. Click the **Device Manager** icon (phone icon on the right side)
3. Click **"+"** → **"Create Virtual Device"**
4. Select **Pixel 6** or any Pixel model → Click **Next**
5. Choose **API 35** (Android 15) as the system image
   - If a **Download** link appears, click it and wait
6. Click **Next** → Click **Finish**

### Required: Enable KVM for hardware acceleration (makes emulator much faster):

```bash
# Check if KVM is supported
egrep -c '(vmx|svm)' /proc/cpuinfo
```

If this prints a number greater than 0, your CPU supports virtualization. Enable KVM:

```bash
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils
sudo adduser $USER kvm
sudo chown $USER /dev/kvm
```

Restart your computer after running these commands.

### Start the Emulator:

1. In Android Studio → **Device Manager**
2. Click the **Play (▶)** button next to your AVD
3. Wait for the emulator to fully boot (shows the Android home screen)

### Run the app on the emulator:

```bash
npx expo start
```

Then press `a` to open on the emulator.

---

## 16. Run on Real Android Phone via USB

### Step 1 — Enable Developer Options on your phone:

1. Open **Settings** on your Android phone
2. Tap **About Phone**
3. Find **Build Number** and tap it **7 times**
4. You will see: *"You are now a developer!"*

### Step 2 — Enable USB Debugging:

1. Go to **Settings → Developer Options**
2. Turn **USB Debugging** to **ON**

### Step 3 — Connect the phone:

1. Connect phone to computer via USB cable
2. Select **"File Transfer" or "MTP"** mode on your phone when prompted
3. On your phone: tap **"Allow USB Debugging"** when the popup appears

### Step 4 — Add udev rules (Linux-only step):

Linux requires permission rules to communicate with Android devices:

```bash
sudo apt install -y android-tools-adb

# Get your phone's vendor ID
lsusb
```

You will see output like:
```
Bus 001 Device 003: ID 18d1:4ee7 Google Inc. Nexus/Pixel Device
```

The part before the colon (e.g., `18d1`) is your **vendor ID**.

Create a udev rule:
```bash
sudo nano /etc/udev/rules.d/51-android.rules
```

Add this line (replace `18d1` with your actual vendor ID):
```
SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", MODE="0666", GROUP="plugdev"
```

Save and apply:
```bash
sudo chmod a+r /etc/udev/rules.d/51-android.rules
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Unplug and re-plug your phone.

### Step 5 — Verify connection:

```bash
adb devices
```

Expected:
```
List of devices attached
XXXXXXXXXXXXXXXX    device
```

### Step 6 — Run the app:

```bash
npx expo run:android
```

---

## 17. Build Android APK

### Make gradlew executable (one-time setup):

```bash
chmod +x android/gradlew
```

### Debug APK (for testing — no signing required):

```bash
cd android
./gradlew assembleDebug
cd ..
```

**Output location:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Build time: 5–15 minutes (first build downloads Gradle and dependencies).

### Release APK (for sharing/distribution):

> Requires a signed keystore. See [BUILD_GUIDE.md](./BUILD_GUIDE.md) for full instructions.

```bash
cd android
./gradlew assembleRelease
cd ..
```

**Output location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 18. Build Android AAB

AAB is required for **Google Play Store** submissions.

```bash
cd android
./gradlew bundleRelease
cd ..
```

**Output location:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

> For complete keystore generation and signing setup:
> **➡️ [BUILD_GUIDE.md](./BUILD_GUIDE.md)**

---

## 19. Common Linux Problems & Fixes

---

### ❌ `nvm: command not found`

**Fix:** Load nvm manually in your current session:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```
Then close and reopen your terminal for it to persist.

---

### ❌ `adb: command not found`

**Cause:** `ANDROID_HOME/platform-tools` not in PATH.

**Fix:**
```bash
echo 'export PATH=$PATH:$HOME/Android/Sdk/platform-tools' >> ~/.bashrc
source ~/.bashrc
adb version
```

---

### ❌ `JAVA_HOME is not set`

**Fix:**
```bash
# Find your Java path
readlink -f $(which java)
# Example output: /usr/lib/jvm/java-17-openjdk-amd64/bin/java

# Set JAVA_HOME (remove /bin/java from the end)
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
source ~/.bashrc
echo $JAVA_HOME
```

---

### ❌ `SDK location not found`

**Fix:**
```bash
# Get your Android SDK path from Android Studio SDK Manager
# Then add it:
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export ANDROID_SDK_ROOT=$HOME/Android/Sdk' >> ~/.bashrc
source ~/.bashrc
```

---

### ❌ `permission denied` on `./gradlew`

**Fix:**
```bash
chmod +x android/gradlew
```

---

### ❌ `Gradle build failed`

**Fix:**
```bash
cd android
./gradlew clean
cd ..
npm install
npx expo run:android
```

Also try clearing Gradle's own cache:
```bash
rm -rf ~/.gradle/caches
```

---

### ❌ `npm install` fails with `EACCES permission denied`

**Fix:**
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.config
npm install
```

---

### ❌ Metro bundler port 8081 is already in use

**Fix:**
```bash
# Kill the process using port 8081
fuser -k 8081/tcp
npx expo start
```

---

### ❌ Device shows as `unauthorized` in `adb devices`

**Fix:**
1. Unplug the USB cable
2. On your phone: go to Developer Options → Revoke USB debugging authorizations
3. Reconnect the cable
4. Tap "Allow" on the popup on your phone
5. Run `adb devices` again

---

### ❌ Emulator is extremely slow

**Cause:** KVM (hardware acceleration) is not enabled.

**Fix:**
```bash
# Verify KVM is available
egrep -c '(vmx|svm)' /proc/cpuinfo

# Enable KVM
sudo apt install -y qemu-kvm
sudo adduser $USER kvm
sudo chown $USER /dev/kvm

# Restart computer, then try emulator again
```

---

### ❌ `error: Expiry dates of OEM unlock`

This is specific to some Samsung phones. Use a different phone for testing, or use an emulator.

---

### ❌ `No AVD found` / Emulator won't start

**Fix:**
1. Open Android Studio
2. Go to **Device Manager**
3. If no AVD exists, create one (see Step 15)
4. Make sure you have a system image downloaded for your chosen API level

---

### ❌ `Failed to load JNI shared library`

**Cause:** 32-bit library missing (on some 64-bit systems).

**Fix:**
```bash
sudo apt install -y lib32z1 lib32ncurses6 lib32stdc++6 libc6-i386
```

---

## ✅ Quick Verification Checklist

Run all these commands to verify your setup is complete:

```bash
git --version
node --version
npm --version
java --version
javac --version
adb version
echo $ANDROID_HOME
echo $JAVA_HOME
```

All 8 commands should print version numbers or valid paths.

If all pass, your Linux setup is complete! Proceed to Step 12 (Clone Repository) to get started.

---

> **Need more help?** Check the main [README.md](./README.md) troubleshooting section, or open an issue on GitHub.
