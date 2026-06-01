# 🔨 Android Build Guide — Urban Power

> This guide explains how to generate Android APK and AAB files from the Urban Power project.
> Covers debug builds, release builds, keystore signing, and troubleshooting.

---

## 📋 Table of Contents

1. [Before You Build](#1-before-you-build)
2. [Project Android Configuration](#2-project-android-configuration)
3. [Build Debug APK](#3-build-debug-apk)
4. [Generate a Release Keystore](#4-generate-a-release-keystore)
5. [Configure Signing in Gradle](#5-configure-signing-in-gradle)
6. [Build Release APK](#6-build-release-apk)
7. [Build Release AAB (Google Play)](#7-build-release-aab-google-play)
8. [Output File Locations](#8-output-file-locations)
9. [Install APK on Device](#9-install-apk-on-device)
10. [Reset and Rebuild from Scratch](#10-reset-and-rebuild-from-scratch)
11. [Expo Build Commands (Alternative)](#11-expo-build-commands-alternative)
12. [Common Build Failures](#12-common-build-failures)
13. [Build Notes & Important Details](#13-build-notes--important-details)

---

## 1. Before You Build

### Prerequisites Checklist

Before building, make sure ALL of these are installed and configured:

- ✅ Node.js 18 or 20 LTS
- ✅ Java JDK 17 (not 8, not 11, not 21)
- ✅ Android Studio with SDK installed
- ✅ `ANDROID_HOME` environment variable set
- ✅ `JAVA_HOME` environment variable set
- ✅ `platform-tools` in your system PATH
- ✅ `npm install` completed in the project root

### Verify your environment:

```bash
# Check all at once
node --version       # Should be v18.x or v20.x
java --version       # Should show openjdk 17.x
adb version          # Should show Android Debug Bridge version
echo $ANDROID_HOME   # Should print your SDK path (Linux)
echo %ANDROID_HOME%  # Should print your SDK path (Windows)
```

### Make gradlew executable (Linux only — one-time step):

```bash
chmod +x android/gradlew
```

---

## 2. Project Android Configuration

This project has the following Android configuration already set up:

| Setting | Value | Location |
|---|---|---|
| **Package Name** | `com.anonymous.urbonpower` | `app.json` |
| **Version Name** | `1.0.0` | `app.json` |
| **Min SDK** | API 24 (Android 7.0) | Android default for RN 0.81 |
| **Target SDK** | API 35 (Android 15) | `gradle.properties` |
| **JS Engine** | Hermes | `gradle.properties` |
| **New Architecture** | Enabled | `gradle.properties` |
| **Edge-to-Edge** | Enabled | `gradle.properties` |
| **ABI** | arm64-v8a (real phones) | `gradle.properties` |

> **Note for production:** Before publishing to the Play Store, change `com.anonymous.urbonpower` to your own unique package name in `app.json`.

---

## 3. Build Debug APK

A debug APK is used for **testing only**. It is signed with a debug keystore automatically and can be installed on any Android device.

### Windows:

```cmd
cd android
gradlew assembleDebug
cd ..
```

### Linux:

```bash
cd android
./gradlew assembleDebug
cd ..
```

### What happens during this build:

1. Gradle downloads dependencies (first time only — takes longer)
2. JavaScript bundle is compiled by Metro
3. Native code is compiled
4. APK is packaged and signed with debug key

### First build time: 10–20 minutes
### Subsequent builds: 2–5 minutes

### Output:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Generate a Release Keystore

A keystore is like a digital certificate that signs your app. Google Play and official distribution require a signed release build.

> ⚠️ **Keep your keystore file safe.** If you lose it, you cannot update your app on the Play Store. Never commit it to Git.

### Run this command from the project root:

**Windows (Command Prompt):**
```cmd
keytool -genkey -v -keystore urbanpower-release.keystore -alias urbanpower-key -keyalg RSA -keysize 2048 -validity 10000
```

**Linux:**
```bash
keytool -genkey -v -keystore urbanpower-release.keystore -alias urbanpower-key -keyalg RSA -keysize 2048 -validity 10000
```

### You will be asked to fill in details:

```
Enter keystore password: (create a strong password — remember it!)
Re-enter new password: (type it again)
What is your first and last name? [Unknown]: Your Name
What is the name of your organizational unit? [Unknown]: Dev
What is the name of your organization? [Unknown]: Urban Power
What is the name of your City or Locality? [Unknown]: Mumbai
What is the name of your State or Province? [Unknown]: Maharashtra
What is the two-letter country code for this unit? [Unknown]: IN
Is CN=Your Name, OU=Dev, O=Urban Power, L=Mumbai, ST=Maharashtra, C=IN correct? [no]: yes
```

### Move the keystore into the android/app folder:

**Windows:**
```cmd
move urbanpower-release.keystore android\app\urbanpower-release.keystore
```

**Linux:**
```bash
mv urbanpower-release.keystore android/app/urbanpower-release.keystore
```

---

## 5. Configure Signing in Gradle

Open the file: `android/app/build.gradle`

Find the `android { ... }` block. Add the following **inside** the `android` block, right after the `defaultConfig` block:

```gradle
android {
    // ... existing content ...

    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            // ... existing minifyEnabled line ...
            signingConfig signingConfigs.release
        }
    }
}
```

### Create a gradle.properties file for credentials:

Open or create `android/gradle.properties` and add these lines at the bottom:

```properties
MYAPP_RELEASE_STORE_FILE=urbanpower-release.keystore
MYAPP_RELEASE_KEY_ALIAS=urbanpower-key
MYAPP_RELEASE_STORE_PASSWORD=YourKeystorePassword
MYAPP_RELEASE_KEY_PASSWORD=YourKeyPassword
```

> Replace `YourKeystorePassword` and `YourKeyPassword` with the actual passwords you chose in Step 4.

### Add keystore to .gitignore:

Make sure you never accidentally commit the keystore and passwords. Open `.gitignore` in the root and verify these lines exist (add if missing):

```
# Keystore files — NEVER commit these
android/app/*.keystore
android/app/*.jks
```

---

## 6. Build Release APK

After configuring the keystore:

### Windows:

```cmd
cd android
gradlew assembleRelease
cd ..
```

### Linux:

```bash
cd android
./gradlew assembleRelease
cd ..
```

### Output:

```
android/app/build/outputs/apk/release/app-release.apk
```

This APK is signed and ready to distribute directly to users.

---

## 7. Build Release AAB (Google Play)

An AAB (Android App Bundle) is the **required format for Google Play Store** submissions. Google converts it into optimized APKs for each device type.

### Windows:

```cmd
cd android
gradlew bundleRelease
cd ..
```

### Linux:

```bash
cd android
./gradlew bundleRelease
cd ..
```

### Output:

```
android/app/build/outputs/bundle/release/app-release.aab
```

Upload this `.aab` file to the Google Play Console.

---

## 8. Output File Locations

| Build Type | Command | Output Location |
|---|---|---|
| Debug APK | `./gradlew assembleDebug` | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `./gradlew assembleRelease` | `android/app/build/outputs/apk/release/app-release.apk` |
| Release AAB | `./gradlew bundleRelease` | `android/app/build/outputs/bundle/release/app-release.aab` |

---

## 9. Install APK on Device

### Via ADB (recommended for testing):

```bash
# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Install release APK
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Via file transfer:

1. Copy the `.apk` file to your phone via USB or email
2. On your phone: open the file
3. If prompted about "installing from unknown sources", go to **Settings → Security → Install unknown apps** and allow your file manager or browser

---

## 10. Reset and Rebuild from Scratch

If your build is broken or producing errors, use these steps to fully reset:

### Step 1 — Clean Android build

**Linux:**
```bash
cd android
./gradlew clean
cd ..
```

**Windows:**
```cmd
cd android
gradlew clean
cd ..
```

### Step 2 — Clear Gradle cache

**Linux:**
```bash
rm -rf ~/.gradle/caches
```

**Windows:**
```cmd
rmdir /s /q "%USERPROFILE%\.gradle\caches"
```

### Step 3 — Clear Metro cache

```bash
npx expo start --clear
```

Or:
```bash
npx react-native start --reset-cache
```

### Step 4 — Reinstall node_modules

**Linux:**
```bash
rm -rf node_modules
npm install
```

**Windows:**
```cmd
rmdir /s /q node_modules
npm install
```

### Step 5 — Rebuild

```bash
# For development run:
npx expo run:android

# For APK:
cd android && ./gradlew assembleDebug && cd ..
```

---

## 11. Expo Build Commands (Alternative)

If you prefer using Expo's build tools rather than Gradle directly:

### Local Android build via Expo:

```bash
# Run on device/emulator (development)
npx expo run:android

# Run release build on device
npx expo run:android --variant release
```

### EAS Build (Cloud Build — requires Expo account):

> EAS is Expo's cloud build service. No Android Studio or local SDK needed. Requires free sign-up at expo.dev.

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure EAS (one-time)
eas build:configure

# Build APK in the cloud
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

---

## 12. Common Build Failures

---

### ❌ `Task :app:compileDebugJavaWithJavac FAILED`

**Cause:** Wrong Java version.

**Fix:**
```bash
java --version  # Must show Java 17
```

If it shows a different version, switch to Java 17:

Linux:
```bash
sudo update-alternatives --config java
# Select the entry for Java 17
```

---

### ❌ `SDK location not found. Define a valid SDK location`

**Cause:** `ANDROID_HOME` is not set or wrong.

**Fix:**
Create a file: `android/local.properties` with this content:
```properties
sdk.dir=/home/yourname/Android/Sdk
```

Replace the path with your actual Android SDK path from Android Studio.

On Windows:
```properties
sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

(Note the double backslashes on Windows.)

---

### ❌ `Could not resolve com.android.tools.build:gradle`

**Cause:** No internet connection during build, or corrupted Gradle cache.

**Fix:**
```bash
rm -rf ~/.gradle/caches
cd android && ./gradlew clean && cd ..
npx expo run:android
```

---

### ❌ `Execution failed for task ':app:mergeDebugNativeLibs'`

**Fix:**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

### ❌ `Error: duplicate resources`

**Fix:**
```bash
cd android && ./gradlew clean && cd ..
```

---

### ❌ `Keystore file does not exist`

**Cause:** The keystore path in `gradle.properties` is wrong.

**Fix:** Verify the keystore file is in `android/app/` and the path in `gradle.properties` matches exactly.

---

### ❌ `Signing key not found for config 'release'`

**Cause:** Signing config not properly set up.

**Fix:** Follow [Step 5](#5-configure-signing-in-gradle) again carefully, making sure the signingConfig is added inside `buildTypes { release { ... } }`.

---

### ❌ `Gradle build takes forever / hangs`

**Cause:** First build downloads Gradle and dependencies.

**Fix:** Be patient on the first build — it can take 10–20 minutes on slow internet. Subsequent builds are much faster.

If it truly hangs for 30+ minutes:
```bash
# Kill the process and try again
Ctrl + C

cd android
./gradlew --stop     # Stop all Gradle daemons
./gradlew assembleDebug
```

---

### ❌ `AAPT2 error: check logs for details`

**Fix:**
```bash
cd android
./gradlew assembleDebug --info 2>&1 | grep "error:"
```

This shows the actual error. Usually caused by a corrupted resource file or missing SDK tool.

---

### ❌ `Error: The apk for your currently selected variant cannot be signed`

**Cause:** Trying to build a release APK without configuring signing.

**Fix:** Follow Steps 4 and 5 to create and configure your keystore before running `assembleRelease`.

---

## 13. Build Notes & Important Details

### Hermes JS Engine

This project has Hermes enabled (`hermesEnabled=true` in `gradle.properties`). Hermes is a JavaScript engine optimized for React Native — it improves startup time and reduces memory usage. This is enabled by default and should not be disabled.

### New Architecture

This project uses React Native's New Architecture (`newArchEnabled=true`). This enables Fabric (new renderer) and JSI (JavaScript Interface) for better performance. The Android build is configured to use this automatically.

### Edge-to-Edge Display

`edgeToEdgeEnabled=true` in `gradle.properties` means the app renders behind Android system bars (status bar, navigation bar). This is modern Android design behavior.

### Build ABI

The default build is configured for `arm64-v8a` (modern 64-bit ARM phones). This covers 99% of Android phones released since 2016. For x86 emulators, override with:
```bash
./gradlew assembleDebug -PreactNativeArchitectures=x86_64
```

### Bundle Identifier for Production

The current bundle ID is `com.anonymous.urbonpower`. Before publishing to Google Play:
1. Change `android.package` in `app.json` to your own package name
2. Run `npx expo run:android` to apply the change to native files

### Gradle JVM Memory

The project is configured with `org.gradle.jvmargs=-Xmx4096m` (4 GB JVM heap). If your machine has less than 8 GB RAM, reduce this to `-Xmx2048m` in `android/gradle.properties`.

### First Build vs. Subsequent Builds

| Build | First Time | After That |
|---|---|---|
| `npx expo run:android` | 10–20 minutes | 1–3 minutes |
| `./gradlew assembleDebug` | 10–20 minutes | 2–5 minutes |
| `./gradlew assembleRelease` | 10–20 minutes | 2–5 minutes |

The first build downloads Gradle (~150 MB) and all Android build dependencies. These are cached in `~/.gradle/` and reused on subsequent builds.

---

> **Questions or issues?** See the main [README.md](./README.md) or open an issue on GitHub.
