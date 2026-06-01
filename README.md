<div align="center">

# 🏙️ Urban Power

### India's On-Demand Super App — Services · Shop · Grocery · Kabadi

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Android](https://img.shields.io/badge/Android-New_Arch-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A full-featured React Native mobile app with 4 business verticals, 3 user roles, and 70+ screens.**

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Screens & Modules](#-screens--modules)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Requirements](#-requirements)
- [Quick Start](#-quick-start)
- [Windows Setup](#-windows-setup)
- [Linux Setup](#-linux-setup)
- [Running the App](#-running-the-app)
- [Running on Real Android Device](#-running-on-real-android-device)
- [Expo Commands](#-expo-commands)
- [Build Android APK](#-build-android-apk)
- [Build Android AAB](#-build-android-aab)
- [Test Credentials](#-test-credentials)
- [Troubleshooting](#-troubleshooting)
- [Common Errors & Fixes](#-common-errors--fixes)
- [Backend Status](#-backend-status)
- [Developer Notes](#-developer-notes)
- [Supported Platforms](#-supported-platforms)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

## 🏙️ Project Overview

**Urban Power** is a cross-platform React Native mobile application targeting the Indian market. It is a super-app that combines home services, e-commerce shopping, grocery delivery, and scrap/recyclable pickup (Kabadi) into a single unified experience.

The app supports **three user roles** — Customer, Technician (field partner), and Admin — each with a completely different interface and feature set.

> **Current Status:** This is a fully functional UI prototype. All data is mocked locally. A real backend integration is planned for a future release.

---

## ✨ Features

### Customer Features
- Browse and book **15+ service categories** (Cleaning, Beauty, Repair, AC, Pest Control, Massage, Auto Service, Events, Learning, etc.)
- **Gender-filtered services** for Beauty and Massage categories
- **Multi-step booking flow** with date/time slot selection and address management
- **Grocery shopping** with 14 categories and sub-category navigation
- **E-commerce shop** with 10+ product categories
- **Kabadi (scrap pickup)** — schedule pickups with live per-kg rates for 10 scrap types
- **Shopping cart** with quantity management, coupon codes, and tax calculation
- **Service tracking** — track active bookings
- **Order tracking** for shop purchases
- **Wallet** — view balance and transaction history
- **Saved addresses** management
- **My Bookings** history across all verticals
- **Rewards** — loyalty points tracking
- **Global Search** across the app
- **Offers & Deals** section
- Pull-to-refresh on all data screens
- Skeleton loading states on all data components
- Auto-scrolling banner carousel

### Technician (Partner) Features
- **Partner Hub** dashboard with online/offline toggle
- Earnings overview with daily summary
- Job request management (Accept / Reject)
- Detailed job information per booking
- Earnings history screen

### Admin Features
- **Admin Console** with revenue overview and growth metrics
- Order management list
- User/provider management
- Live activity feed (Service / Shop / Kabadi)
- System health monitor

---

## 📱 Screens & Modules

| Module | Screens | Description |
|---|---|---|
| **Auth** | 2 | Splash screen, Phone OTP login |
| **Home** | 1 | Super-app dashboard with all verticals |
| **Services** | 10 | Categories, subcategories, booking flow, gender picker, tracking, rewards |
| **Shop** | 6 | Category > Subcategory > Product list > Product detail > Order tracking > Offers |
| **Grocery** | 3 | Category > Subcategory > Product list |
| **Kabadi** | 6 | Category > Subcategory > Form > Booking > Status > History |
| **Account** | 5 | Profile, Bookings, Wallet, Settings, Saved Addresses |
| **Support** | 2 | Help & Support, Generic Info |
| **Technician** | 4 | Dashboard, Login, Job Detail, Earnings |
| **Admin** | 3 | Dashboard, User Management, Order List |
| **Cart** | 1 | Cart summary with coupon and checkout |
| **Search** | 1 | Global search screen |

**Total: 70+ screens across 12 modules**

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Mobile Framework** | React Native | 0.81.5 |
| **Build Toolchain** | Expo SDK | ~54.0.33 |
| **Language** | TypeScript | ~5.9.2 |
| **UI Library** | React | 19.1.0 |
| **Navigation** | React Navigation (Native Stack + Bottom Tabs) | v7 |
| **State Management** | Zustand | ^5.0.12 |
| **Data Fetching** | TanStack React Query | ^5.97.0 |
| **Forms** | React Hook Form | ^7.72.1 |
| **Animations** | React Native Reanimated | ~4.1.1 |
| **Gestures** | React Native Gesture Handler | ~2.28.0 |
| **Icons** | Lucide React Native | ^1.8.0 |
| **Gradients** | Expo Linear Gradient | ~15.0.8 |
| **Vector Graphics** | React Native SVG | 15.12.1 |
| **JS Engine** | Hermes | Enabled |
| **Architecture** | React Native New Architecture | Enabled |

---

## 📁 Folder Structure

```
urbanPower/
│
├── App.tsx                     # App root: Splash → QueryClient → Navigator
├── index.ts                    # Expo entry point registration
├── app.json                    # Expo config (name, icons, bundle IDs)
├── package.json                # Dependencies and scripts
├── babel.config.js             # Babel config (expo + reanimated plugin)
├── metro.config.js             # Metro bundler config
├── tsconfig.json               # TypeScript config (strict mode)
│
├── assets/                     # Static images (app icon, splash, logo)
│
├── android/                    # Android native build files
│   ├── app/                    # Main Android app module
│   ├── build.gradle            # Root Gradle config
│   ├── gradle.properties       # Hermes, New Arch, edge-to-edge flags
│   └── settings.gradle         # Module includes
│
└── src/
    ├── components/             # 14 reusable UI components
    ├── constants/
    │   ├── Theme.ts            # Design tokens (Colors, Spacing, Typography)
    │   └── MockData.ts         # All app data (services, products, kabadi rates)
    ├── hooks/                  # TanStack Query custom hooks
    ├── navigation/
    │   ├── AppNavigator.tsx    # Root stack navigator (role-based)
    │   ├── TabNavigator.tsx    # Bottom tab + custom header
    │   └── Types.ts            # TypeScript route param types
    ├── screens/                # 70+ screen files
    │   ├── Auth/               # Login, Splash
    │   ├── Main/               # Home, Cart, Search, Grocery, Profile
    │   ├── Services/           # Booking flows, categories, tracking
    │   ├── Shop/               # E-commerce screens
    │   ├── Kabadi/             # Scrap pickup screens
    │   ├── Account/            # Bookings, Wallet, Settings
    │   ├── Admin/              # Admin dashboard and management
    │   ├── Technician/         # Partner hub screens
    │   └── Support/            # Help, Generic info
    ├── services/
    │   └── api.ts              # Mock API layer (simulated network delay)
    └── store/                  # Zustand global state stores
        ├── useAuthStore.ts     # Auth state (user, role, login/logout)
        ├── useCartStore.ts     # Shopping cart state
        ├── useBookingStore.ts  # General bookings state
        ├── useKabadiStore.ts   # Kabadi pickup state
        └── useServiceBookingStore.ts
```

---

## 📦 Requirements

### Minimum System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| **RAM** | 8 GB | 16 GB |
| **Disk Space** | 15 GB free | 25 GB free |
| **OS (Windows)** | Windows 10 (64-bit) | Windows 11 (64-bit) |
| **OS (Linux)** | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |

### Required Software

| Software | Required Version | Purpose |
|---|---|---|
| **Node.js** | 18.x LTS or 20.x LTS | JavaScript runtime |
| **npm** | 9.x or 10.x | Package manager (comes with Node.js) |
| **Git** | 2.x or newer | Clone the repository |
| **Java JDK** | 17 LTS (OpenJDK) | Android build system (Gradle) |
| **Android Studio** | Hedgehog 2023.1+ or newer | Android SDK, emulator, and tooling |
| **Android SDK** | API 35 (Android 15) | Build target platform |
| **Android Platform Tools** | Latest | `adb` device communication |

---

## ⚡ Quick Start

> Already have Node.js 18+, JDK 17, and Android Studio installed?

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/urbanPower.git

# 2. Navigate into the project
cd urbanPower

# 3. Install all dependencies
npm install

# 4. Start the development server
npx expo start

# 5. Press 'a' to open on Android emulator
#    OR scan the QR code with Expo Go on your phone
```

> **First time?** Follow the full setup guide for your operating system:
>
> - 🪟 **[WINDOWS_SETUP.md](./WINDOWS_SETUP.md)** — Complete Windows guide
> - 🐧 **[LINUX_SETUP.md](./LINUX_SETUP.md)** — Complete Linux/Ubuntu guide

---

## 🪟 Windows Setup

Complete beginner-friendly step-by-step guide for Windows users:

**➡️ [Read WINDOWS_SETUP.md](./WINDOWS_SETUP.md)**

Covers: Git, Node.js, JDK 17, Android Studio, Android SDK, environment variables, adb, USB debugging, clone, install, run, build APK/AAB.

---

## 🐧 Linux Setup

Complete beginner-friendly step-by-step guide for Ubuntu/Linux users:

**➡️ [Read LINUX_SETUP.md](./LINUX_SETUP.md)**

Covers: apt packages, Node.js via nvm, OpenJDK 17, Android Studio, Android SDK, adb, USB debugging, chmod fixes, clone, install, run, build APK/AAB.

---

## ▶️ Running the App

### Option 1 — Expo Go App (Quickest, No Build Needed)

> Best for: testing the UI quickly on your real phone

```bash
npx expo start
```

1. Install **Expo Go** on your Android phone from Google Play Store
2. Make sure your phone and computer are on the **same Wi-Fi**
3. Scan the QR code shown in your terminal
4. The app will load on your phone instantly

### Option 2 — Android Emulator

```bash
# Start Expo server, then press 'a'
npx expo start

# OR run directly on Android
npx expo run:android
```

Make sure an Android Virtual Device (AVD) is **already running** in Android Studio before pressing `a`.

### Option 3 — Physical Android Device via USB

```bash
# Connect phone via USB with USB Debugging enabled, then:
npx expo run:android
```

---

## 📱 Running on Real Android Device

### Step 1 — Enable Developer Mode

1. Open **Settings** on your phone
2. Tap **About Phone**
3. Find **Build Number** — tap it **7 times rapidly**
4. You will see: *"You are now a developer!"*

### Step 2 — Enable USB Debugging

1. Go to **Settings → Developer Options**
2. Find **USB Debugging** and turn it **ON**
3. Confirm any popup that appears

### Step 3 — Connect to Computer

1. Connect your phone with a **data-capable USB cable** (not a power-only cable)
2. On your phone, when a popup appears: tap **"Allow USB Debugging"**
3. Check the **"Always allow from this computer"** box

### Step 4 — Verify the Connection

```bash
adb devices
```

Expected output:
```
List of devices attached
XXXXXXXXXXXXXXXX    device
```

If you see `unauthorized`, unplug and replug your phone, then re-accept the prompt.

### Step 5 — Run the App

```bash
npx expo run:android
```

The app will be built and installed on your phone automatically.

---

## 🎮 Expo Commands

| Command | What It Does |
|---|---|
| `npx expo start` | Start the development server |
| `npx expo start --clear` | Start with cleared Metro cache |
| `npx expo start --tunnel` | Use ngrok tunnel (useful on restricted networks) |
| `npx expo run:android` | Build and install on Android |
| `npx expo install <package>` | Install an Expo-compatible package version |
| `npx expo doctor` | Diagnose environment issues |

**Inside the running Expo terminal:**

| Key | Action |
|---|---|
| `a` | Open on Android emulator |
| `r` | Reload the app |
| `m` | Toggle developer menu |
| `j` | Open React DevTools |
| `Ctrl + C` | Stop the server |

---

## 🔨 Build Android APK

An APK file can be installed directly on any Android device.

### Debug APK (For Testing — No Signing Required)

```bash
# Step 1: Go into the android folder
cd android

# Step 2: Build (Windows)
gradlew assembleDebug

# Step 2: Build (Linux)
./gradlew assembleDebug
```

**Where is the APK?**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Transfer this file to your phone (via USB, email, or WhatsApp) and install it.

### Release APK (Signed — For Sharing or Distribution)

> Requires creating a keystore first. See the full instructions:
> **➡️ [BUILD_GUIDE.md](./BUILD_GUIDE.md)**

```bash
cd android

# Windows
gradlew assembleRelease

# Linux
./gradlew assembleRelease
```

**Output:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Build Android AAB

An AAB (Android App Bundle) is required for uploading to the **Google Play Store**.

```bash
cd android

# Windows
gradlew bundleRelease

# Linux
./gradlew bundleRelease
```

**Output:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

> For complete keystore setup, signing config, and production build notes:
> **➡️ [BUILD_GUIDE.md](./BUILD_GUIDE.md)**

---

## 🔐 Test Credentials

This app uses mock data. Use these to test all three user roles:

| Role | Phone Number | OTP | What You Can Access |
|---|---|---|---|
| **Customer** | Any 10-digit (e.g. `9999999999`) | Any 4 digits | Home, Services, Shop, Grocery, Kabadi, Cart, Account |
| **Admin** | `9876543210` | Any 4 digits | Admin Console, Order Management, User Management |
| **Technician** | `8888888888` | Any 4 digits | Partner Hub, Job Requests, Earnings |

> OTP is simulated — enter any 4-digit number to proceed.

---

## 🔧 Troubleshooting

### Metro Bundler Cache Issues

```bash
npx expo start --clear
```

### Android Build Fails

```bash
# Clean Gradle and rebuild
cd android

# Windows
gradlew clean

# Linux
./gradlew clean

# Return to root
cd ..
npm install
npx expo run:android
```

### node_modules Corrupted

```bash
# Linux / Git Bash on Windows
rm -rf node_modules
npm install

# Windows PowerShell
Remove-Item -Recurse -Force node_modules
npm install
```

### App Won't Load on Phone (Expo Go)

1. Confirm phone and computer are on the **same Wi-Fi network**
2. Try: `npx expo start --tunnel`
3. Temporarily disable your firewall/antivirus

### Emulator Not Detected

1. Open **Android Studio → Device Manager**
2. Start your AVD (click the play button)
3. Wait until the emulator is fully booted (shows the Android home screen)
4. Then run `npx expo start` and press `a`

### `adb` Device Shows as `unauthorized`

1. Unplug the USB cable
2. Revoke USB debugging authorizations in Developer Options
3. Re-plug and re-accept the prompt on your phone

---

## ❗ Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `JAVA_HOME is not set` | JDK not in environment variables | See [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) / [LINUX_SETUP.md](./LINUX_SETUP.md) |
| `SDK location not found` | `ANDROID_HOME` not set | Add `ANDROID_HOME` to environment variables |
| `Unable to find expo in this project` | node_modules missing | Run `npm install` |
| `adb: command not found` | Platform Tools not in PATH | Add `%ANDROID_HOME%\platform-tools` to PATH |
| `No connected devices` | USB Debugging not enabled | Follow the USB debugging steps above |
| `Gradle build failed` | Corrupted Gradle cache | Run `cd android && ./gradlew clean` |
| `Port 8081 already in use` | Another Metro instance running | Kill it: `npx kill-port 8081` |
| `Cannot read property of undefined` | Stale cache | Run `npx expo start --clear` |
| `Duplicate resources` | Conflicting build artifacts | Run `cd android && ./gradlew clean` |
| `ENOMEM / heap out of memory` | Node.js memory limit | Set `NODE_OPTIONS=--max-old-space-size=4096` |
| `Task :app:processDebugMainManifest FAILED` | SDK tools issue | Open Android Studio and update SDK |

---

## 🗄️ Backend Status

> ⚠️ **This project has no live backend.**

All data is served from a local mock file:

```
src/constants/MockData.ts    ← Services, products, kabadi rates (hardcoded)
src/services/api.ts          ← Mock API with simulated delay (no real HTTP)
```

**What this means for developers:**
- ✅ No internet connection required to run the app
- ✅ No `.env` file or API keys needed
- ❌ All app data resets when you close the app (no persistence)
- ❌ OTP is simulated (any 4-digit code is accepted)
- ❌ User IDs are randomly generated on each login

**Packages installed but not yet in use:**
- `axios` — installed for future API calls, currently unused
- `react-hook-form` — installed, forms currently use `useState`

---

## 👨‍💻 Developer Notes

### Architecture Highlights
- **New Architecture enabled** — Fabric renderer + JSI for better performance
- **Hermes JS engine** — faster startup, lower memory usage
- **Edge-to-edge display** — app renders behind Android system bars
- **TypeScript strict mode** — `"strict": true` enforced throughout

### Design Token System (`src/constants/Theme.ts`)
- `Colors.light` / `Colors.dark` — full dual-theme color palette
- `Spacing` — 8-level spacing scale (2px → 64px)
- `Typography` — 8 text variants (h1 → tiny)
- `Shadows` — 4 elevation levels
- `BorderRadius` — 7 levels including `full: 9999`

> Note: Dark mode tokens are fully prepared but the theme switcher is not yet wired.

### State Architecture
All global state is managed by Zustand (in-memory only, resets on app restart):
- `useAuthStore` — user info, role, login/logout
- `useCartStore` — items, quantities, totals
- `useBookingStore` — all booking records
- `useKabadiStore` — scrap pickup requests
- `useServiceBookingStore` — service-specific booking records

---

## 🌐 Supported Platforms

| Platform | Status | Notes |
|---|---|---|
| **Android** | ✅ Fully Supported | New Architecture + Hermes, API 24+ |
| **Web** | ⚠️ Experimental | `npx expo start --web` (limited UI) |

> **Minimum Android version:** Android 7.0 (API level 24)
> **Target Android version:** Android 15 (API level 35)

---

## 🚀 Future Improvements

- [ ] Real backend API (Node.js + MongoDB or Firebase)
- [ ] Real OTP authentication (Firebase Auth / MSG91)
- [ ] Data persistence (AsyncStorage + Zustand persist)
- [ ] Payment gateway (Razorpay / PhonePe)
- [ ] Push notifications (Firebase FCM)
- [ ] Real-time tracking (WebSockets / Firebase Realtime DB)
- [ ] Dark mode activation (theme tokens are ready)
- [ ] EAS Build pipeline for automated APK/AAB production
- [ ] Unit + integration test suite
- [ ] Google Maps integration for address selection
- [ ] Analytics dashboard (Admin panel)
- [ ] Multi-language support (Hindi + English)

---

## 📄 License

```
MIT License

Copyright (c) 2025 Urban Power

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

<div align="center">

**Built with React Native + Expo**

⭐ If this project helped you, please star it on GitHub!

</div>
