# 🪟 Windows Setup Guide — Urban Power

> **Who is this for?** Complete beginners. If you have never used Android Studio, React Native, or a terminal before, this guide is written for you. Every single step is explained.

---

## 📋 Table of Contents

1. [Before You Begin](#1-before-you-begin)
2. [Install Git](#2-install-git)
3. [Install Node.js](#3-install-nodejs)
4. [Verify Node.js and npm](#4-verify-nodejs-and-npm)
5. [Install Java JDK 17](#5-install-java-jdk-17)
6. [Install Android Studio](#6-install-android-studio)
7. [Install Android SDK](#7-install-android-sdk)
8. [Set Up Environment Variables](#8-set-up-environment-variables)
9. [Verify adb Works](#9-verify-adb-works)
10. [Clone the Repository](#10-clone-the-repository)
11. [Install Project Dependencies](#11-install-project-dependencies)
12. [Start the App](#12-start-the-app)
13. [Run on Android Emulator](#13-run-on-android-emulator)
14. [Run on Real Android Phone](#14-run-on-real-android-phone)
15. [Build APK](#15-build-apk)
16. [Build AAB](#16-build-aab)
17. [Common Windows Problems & Fixes](#17-common-windows-problems--fixes)

---

## 1. Before You Begin

### What terminal to use?

Throughout this guide, we will use **Command Prompt** or **PowerShell**. Here is how to open either one:

**Command Prompt:**
- Press `Win + R` on your keyboard
- Type `cmd`
- Press Enter

**PowerShell:**
- Press `Win + X`
- Click "Windows PowerShell" or "Terminal"

> **Tip:** You can also right-click on a folder while holding `Shift` and select "Open PowerShell window here" to open a terminal directly in that folder.

### Check your Windows version

This guide requires **Windows 10 or Windows 11 (64-bit)**.

To check:
- Press `Win + R`, type `winver`, press Enter
- You will see your Windows version

---

## 2. Install Git

Git is a tool used to download (clone) the project from GitHub.

### Steps:

1. Open your browser and go to: **https://git-scm.com/download/win**
2. The download will start automatically. Save the file.
3. Open the downloaded installer (it looks like `Git-2.xx.x-64-bit.exe`)
4. Click **Next** on every screen — the default settings are fine
5. On the screen that asks about your default editor, you can leave it as-is
6. Click **Install**
7. Click **Finish**

### Verify Git is installed:

Open a new Command Prompt or PowerShell and type:

```cmd
git --version
```

You should see something like:
```
git version 2.43.0.windows.1
```

If you see that, Git is installed correctly. ✅

---

## 3. Install Node.js

Node.js is the JavaScript engine that runs this project.

### Which version to install?

> **Important:** Install **Node.js 20 LTS** (Long Term Support). Do NOT install the "Current" version.

### Steps:

1. Go to: **https://nodejs.org**
2. Click the button that says **"20.x.x LTS"** (Recommended For Most Users)
3. Download the Windows Installer (`.msi` file)
4. Open the installer
5. Click **Next** → Accept the license → Click **Next** → Click **Next**
6. On the "Tools for Native Modules" screen:
   - **Check the box** that says "Automatically install the necessary tools"
   - This will install Chocolatey and build tools — you need this
7. Click **Install**
8. Click **Finish**
9. A separate black window may open to install extra tools — let it run. Press any key when it says to.

### Verify Node.js is installed:

Close your old terminal, open a **new** terminal, and type:

```cmd
node --version
```

Expected output (yours may differ slightly):
```
v20.18.0
```

```cmd
npm --version
```

Expected output:
```
10.8.2
```

If both commands show version numbers, Node.js is installed correctly. ✅

---

## 4. Verify Node.js and npm

Run these two commands to confirm everything is working:

```cmd
node --version
npm --version
```

Both should print version numbers. If either says `command not found` or `not recognized`, Node.js was not installed correctly — go back to Step 3 and try again.

---

## 5. Install Java JDK 17

Java is required to build Android apps. We need version **17** specifically (newer versions may cause issues with the Android build system).

### Steps:

1. Go to: **https://adoptium.net/temurin/releases/**
2. In the filters at the top:
   - **Version:** Select `17`
   - **OS:** Select `Windows`
   - **Architecture:** Select `x64`
   - **Package Type:** Select `JDK`
3. Download the `.msi` installer
4. Open the installer
5. Click **Next** → Click **Next** → On the setup screen, make sure these are selected:
   - ✅ Add to PATH
   - ✅ Set JAVA_HOME variable
6. Click **Install**
7. Click **Finish**

### Verify Java is installed:

Open a **new** terminal and type:

```cmd
java --version
```

Expected output:
```
openjdk 17.0.x 2024-xx-xx
OpenJDK Runtime Environment Temurin-17.0.x...
```

```cmd
javac --version
```

Expected:
```
javac 17.0.x
```

If both work, Java JDK 17 is installed correctly. ✅

---

## 6. Install Android Studio

Android Studio provides the Android SDK (the tools needed to build Android apps) and lets you create virtual phone emulators.

### Steps:

1. Go to: **https://developer.android.com/studio**
2. Click the **Download Android Studio** button
3. Accept the terms and download the `.exe` installer
4. Open the installer
5. Click **Next** → Make sure these are checked:
   - ✅ Android Studio
   - ✅ Android Virtual Device
6. Click **Next** → Choose the install location (default is fine) → Click **Next**
7. Click **Install** — this takes 5–10 minutes
8. Click **Next** then **Finish**
9. Android Studio will open

### First-time setup inside Android Studio:

1. A **Setup Wizard** will appear — click **Next**
2. Choose **Standard** install type → Click **Next**
3. Choose a UI theme (doesn't matter) → Click **Next**
4. Click **Finish** — Android Studio will download the Android SDK (~2–3 GB)
   - This takes time depending on your internet speed — wait for it to finish
5. Click **Finish** again when complete

---

## 7. Install Android SDK

After Android Studio finishes installing, you need to verify the correct SDK components are installed.

### Steps:

1. Open **Android Studio**
2. On the welcome screen, click **More Actions** → **SDK Manager**
   - OR: Go to **Settings** (gear icon) → **SDK Manager**
3. Make sure you are on the **SDK Platforms** tab
4. Check that these are installed (with a checkmark or green icon):
   - **Android 15 (API 35)** ← recommended
   - **Android 14 (API 34)** ← also good
5. Click the **SDK Tools** tab at the top
6. Make sure these are checked:
   - ✅ **Android SDK Build-Tools** (latest version)
   - ✅ **Android SDK Platform-Tools**
   - ✅ **Android Emulator**
   - ✅ **Android SDK Command-line Tools (latest)**
7. Click **Apply** → **OK** → Let it download
8. Click **Finish**

### Note your SDK location

In SDK Manager, at the very top you will see a path like:

```
C:\Users\YourName\AppData\Local\Android\Sdk
```

**Copy this path** — you will need it in the next step.

---

## 8. Set Up Environment Variables

Environment variables tell Windows where to find important tools like `adb`, `java`, and `gradlew`. This is one of the most important steps.

### Open Environment Variables:

1. Press `Win + S` and search for **"Edit the system environment variables"**
2. Click on it
3. At the bottom of the window, click **"Environment Variables"**

You will see two sections: **User variables** (top) and **System variables** (bottom). We will work in both.

---

### Set JAVA_HOME

> Skip this if the Temurin installer already set it for you (check if it exists already in the list)

1. In the **System variables** section (bottom), click **New**
2. Set:
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot`
   
   > **Find your actual JDK path:** Open File Explorer, navigate to `C:\Program Files\Eclipse Adoptium\` and copy the exact folder name.

3. Click **OK**

---

### Set ANDROID_HOME

1. In the **User variables** section (top), click **New**
2. Set:
   - Variable name: `ANDROID_HOME`
   - Variable value: The SDK path you copied earlier, e.g.:
     ```
     C:\Users\YourName\AppData\Local\Android\Sdk
     ```
3. Click **OK**

---

### Add Tools to PATH

PATH tells Windows which folders to look in when you type commands.

1. In **User variables**, find the variable called **Path** and double-click it
2. Click **New** and add each of these one at a time:

```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
%ANDROID_HOME%\emulator
```

3. Click **OK** → **OK** → **OK** to close all windows

---

### Apply the changes

Close **all** open terminals and open a **new** terminal. Environment variables only take effect in new terminal windows.

### Verify the setup:

```cmd
echo %ANDROID_HOME%
```
Should print your SDK path.

```cmd
echo %JAVA_HOME%
```
Should print your JDK path.

```cmd
adb --version
```
Should print:
```
Android Debug Bridge version 1.0.41
```

If `adb` works, your environment variables are set correctly. ✅

---

## 9. Verify adb Works

`adb` (Android Debug Bridge) is the tool that communicates with Android devices.

```cmd
adb version
```

Expected output:
```
Android Debug Bridge version 1.0.41
Version xx.x.x-xxxxxxxx
```

If you see this, `adb` is working. ✅

If you get `'adb' is not recognized`, the Platform Tools path is not in your PATH — go back to Step 8 and add `%ANDROID_HOME%\platform-tools` to your PATH.

---

## 10. Clone the Repository

Now we will download the project code from GitHub.

### Choose where to save the project:

Open Command Prompt and navigate to where you want the project. For example, to put it on your Desktop:

```cmd
cd C:\Users\YourName\Desktop
```

> Replace `YourName` with your actual Windows username.

### Clone the project:

```cmd
git clone https://github.com/YOUR_USERNAME/urbanPower.git
```

> Replace `YOUR_USERNAME/urbanPower` with the actual GitHub repository URL.

### Enter the project folder:

```cmd
cd urbanPower
```

You are now inside the project folder. All future commands should be run from here unless stated otherwise.

---

## 11. Install Project Dependencies

This command reads the `package.json` file and downloads all the required packages (libraries) that the project needs.

```cmd
npm install
```

This may take 2–5 minutes depending on your internet speed. You will see a progress bar.

When it finishes, you should see something like:
```
added 1234 packages in 45s
```

> **If you see warnings** — that is normal. Ignore warnings unless it says "ERROR".
>
> **If you see errors** — try running `npm install` again. If it still fails, see [Troubleshooting](#17-common-windows-problems--fixes).

---

## 12. Start the App

You have two ways to run the app:

### Option A — With Expo Go (No Build Required)

```cmd
npx expo start
```

A QR code will appear in the terminal. Install **Expo Go** from the Google Play Store on your Android phone. Open Expo Go → Tap "Scan QR Code" → Scan the code.

Your phone and computer must be on the **same Wi-Fi network**.

### Option B — Build and Run Directly

```cmd
npx expo run:android
```

This will build the app and install it on a connected Android device or running emulator. The first time will take several minutes to compile.

---

## 13. Run on Android Emulator

An emulator is a virtual Android phone that runs on your computer. You need Android Studio to create one.

### Create an Emulator:

1. Open **Android Studio**
2. Click **Device Manager** on the right side panel (phone icon)
3. Click the **"+"** button → **"Create Virtual Device"**
4. Select a phone model (e.g., **Pixel 6**) → Click **Next**
5. Select a system image:
   - Choose **API 35** (Android 15) or **API 34** (Android 14)
   - If it shows a **Download** link next to the image, click Download first
6. Click **Next** → Click **Finish**

### Start the Emulator:

1. In **Device Manager**, find your AVD
2. Click the **Play (▶)** button
3. Wait until you see the **Android home screen** — this can take 1–2 minutes

### Run the app on it:

In your project terminal:

```cmd
npx expo start
```

Then press `a` on your keyboard to open on the emulator.

---

## 14. Run on Real Android Phone

Follow these steps carefully:

### Enable Developer Options on your phone:

1. Open **Settings** on your phone
2. Scroll to **About Phone**
3. Tap **Build Number** exactly **7 times**
4. You will see the message: *"You are now a developer!"*

### Enable USB Debugging:

1. Go back to **Settings**
2. Scroll down to **Developer Options** (near the bottom of Settings)
3. Toggle **USB Debugging** to **ON**
4. Tap **OK** on any confirmation popup

### Connect to your computer:

1. Use a **data-capable USB cable** (not a charging-only cable)
2. Connect phone to computer
3. On your phone: tap **"Allow USB Debugging"** when prompted
4. Select **"Always allow from this computer"**

### Check connection:

```cmd
adb devices
```

You should see:
```
List of devices attached
XXXXXXXXXXXXXXXX    device
```

If it shows `unauthorized`, unplug, revoke debug authorizations in Developer Options, and reconnect.

### Run the app:

```cmd
npx expo run:android
```

---

## 15. Build APK

An APK is a file you can install directly on Android phones.

### Debug APK (for testing):

```cmd
cd android
gradlew assembleDebug
cd ..
```

Output file:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

Build time: 5–15 minutes (first time longer due to downloading Gradle)

### Release APK (for sharing):

> Requires a signed keystore. See [BUILD_GUIDE.md](./BUILD_GUIDE.md) for full signing instructions.

```cmd
cd android
gradlew assembleRelease
cd ..
```

Output file:
```
android\app\build\outputs\apk\release\app-release.apk
```

---

## 16. Build AAB

AAB (Android App Bundle) is required for uploading to the **Google Play Store**.

```cmd
cd android
gradlew bundleRelease
cd ..
```

Output file:
```
android\app\build\outputs\bundle\release\app-release.aab
```

> For keystore generation and full release signing:
> **➡️ [BUILD_GUIDE.md](./BUILD_GUIDE.md)**

---

## 17. Common Windows Problems & Fixes

---

### ❌ `'node' is not recognized as an internal or external command`

**Cause:** Node.js was not added to PATH.

**Fix:**
1. Uninstall Node.js from Control Panel
2. Reinstall from [nodejs.org](https://nodejs.org) — make sure to check all options during install
3. Open a **new** terminal after installing

---

### ❌ `'adb' is not recognized`

**Cause:** `ANDROID_HOME\platform-tools` is not in PATH.

**Fix:**
1. Press `Win + S` → search for "Edit system environment variables"
2. Under **User variables**, find `Path` and double-click
3. Click **New** and add: `%ANDROID_HOME%\platform-tools`
4. Click OK → OK → OK
5. Open a **new** terminal and try `adb version` again

---

### ❌ `JAVA_HOME is not set` or `error: JAVA_HOME is not defined correctly`

**Cause:** Java JDK is not installed or JAVA_HOME environment variable is missing.

**Fix:**
1. Verify Java: `java --version` in a new terminal
2. If Java is not found, reinstall JDK 17 from [adoptium.net](https://adoptium.net)
3. If Java is installed but JAVA_HOME is missing:
   - Find your JDK path: usually `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot`
   - Set `JAVA_HOME` system variable to that path (see Step 8)

---

### ❌ `SDK location not found. Define a valid SDK location`

**Cause:** `ANDROID_HOME` environment variable is not set.

**Fix:**
1. Open Android Studio → SDK Manager
2. Copy the SDK path shown at the top (e.g., `C:\Users\You\AppData\Local\Android\Sdk`)
3. Set `ANDROID_HOME` in User variables to that path (see Step 8)

---

### ❌ `Gradle build failed` or `BUILD FAILED`

**Cause:** Corrupted Gradle cache or first-time build issue.

**Fix:**
```cmd
cd android
gradlew clean
cd ..
npm install
npx expo run:android
```

Also try clearing the Gradle cache:
```cmd
cd %USERPROFILE%\.gradle
rmdir /s /q caches
```

---

### ❌ `npm install` fails with permission errors

**Cause:** Running without admin privileges.

**Fix:**
1. Right-click on Command Prompt → **Run as Administrator**
2. Navigate back to the project folder and run `npm install` again

---

### ❌ `No devices found` when running `adb devices`

**Cause:** Phone not connected correctly or USB Debugging not enabled.

**Fix:**
1. Unplug and re-plug the USB cable
2. On your phone: check for an "Allow USB Debugging?" popup and tap Allow
3. Try a different USB cable (must be a data cable, not charge-only)
4. Run `adb kill-server` then `adb start-server`, then `adb devices`

---

### ❌ Metro bundler port 8081 already in use

**Fix:**
```cmd
npx kill-port 8081
npx expo start
```

---

### ❌ `Execution failed for task ':app:mergeDebugNativeLibs'`

**Cause:** Native library conflict or build artifact issue.

**Fix:**
```cmd
cd android
gradlew clean
cd ..
npx expo run:android
```

---

### ❌ Emulator is slow or freezes

**Fix:**
1. Open **Android Studio → Settings → Emulator**
2. Enable **Hardware GPU acceleration**
3. Make sure **Intel HAXM** or **Windows Hypervisor Platform** is enabled:
   - Search for "Turn Windows Features on or off"
   - Enable **Hyper-V** or **Windows Hypervisor Platform**
   - Restart your computer

---

## ✅ Quick Verification Checklist

Run these commands in a new terminal to verify everything is installed:

```cmd
git --version
node --version
npm --version
java --version
adb version
echo %ANDROID_HOME%
echo %JAVA_HOME%
```

All 7 commands should produce version numbers or paths without any errors.

If all pass — your Windows setup is complete! Go to Step 10 (Clone Repository) to get started with the project.

---

> **Need more help?** Check the main [README.md](./README.md) troubleshooting section, or open an issue on GitHub.
