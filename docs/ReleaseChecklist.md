# Urban Power — Production Release Checklist

**App Name:** Urban Power  
**Entity:** Urban Power Services Pvt. Ltd., Bengaluru, Karnataka, India  
**Prepared:** July 2026  
**Version:** 1.0.0 (Version Code: 1)

---

## 1. Application Identity

| Field                     | Value                          |
| ------------------------- | ------------------------------ |
| **App Name**              | Urban Power                    |
| **Android Package Name**  | `com.urbanpower.app`           |
| **iOS Bundle Identifier** | `com.urbanpower.app`           |
| **Expo Slug**             | `urban-power`                  |
| **Entity**                | Urban Power Services Pvt. Ltd. |
| **Registered Office**     | Bengaluru, Karnataka, India    |

> ⚠️ `Info.plist` currently contains `com.anonymous.urbanpower` in `CFBundleURLSchemes`. This is a dev/legacy artifact. Confirm the production build overrides this with `com.urbanpower.app` before submission.

---

## 2. Version Information

| Field                   | Value                              | Source                                                |
| ----------------------- | ---------------------------------- | ----------------------------------------------------- |
| **Version Name**        | `1.0.0`                            | `app.json`, `Info.plist` (CFBundleShortVersionString) |
| **Version Code**        | `1`                                | `Info.plist` (CFBundleVersion)                        |
| **Release Date**        | June 2025                          | `docs/ReleaseNotes.md`                                |
| **Framework**           | React Native 0.76.9 (Expo 52)      | `package.json`                                        |
| **Min Android SDK**     | API 26 (Android 8.0 Oreo)          | `docs/ReleaseNotes.md`                                |
| **Target Android SDK**  | API 34 (Android 14)                | `docs/ReleaseNotes.md`                                |
| **Min iOS Version**     | 12.0                               | `Info.plist` (LSMinimumSystemVersion)                 |
| **New Architecture**    | Disabled (`newArchEnabled: false`) | `app.json`                                            |
| **Admin Panel Version** | `0.0.0`                            | `admin/package.json`                                  |

---

## 3. Permissions Used

### Android — `android/app/src/main/AndroidManifest.xml`

| Permission                                   | Purpose                                           |
| -------------------------------------------- | ------------------------------------------------- |
| `ACCESS_FINE_LOCATION`                       | Address autofill and nearby professional matching |
| `ACCESS_COARSE_LOCATION`                     | Fallback location for map display                 |
| `INTERNET`                                   | Core app API communication                        |
| `READ_EXTERNAL_STORAGE` _(maxSdkVersion 32)_ | Gallery photo selection on Android ≤12            |
| `READ_MEDIA_IMAGES`                          | Gallery photo selection on Android 13+            |
| `VIBRATE`                                    | Notification vibration feedback                   |

> ⚠️ `POST_NOTIFICATIONS` and `RECEIVE_BOOT_COMPLETED` are referenced in the Play Store checklist but **not currently declared** in `AndroidManifest.xml`. Add them before submitting to Play Store if push notifications are active.

### iOS — `ios/UrbanPower/Info.plist`

| Key                                            | Usage Description                                 |
| ---------------------------------------------- | ------------------------------------------------- |
| `NSCameraUsageDescription`                     | Photo upload for service issue reports            |
| `NSLocationWhenInUseUsageDescription`          | Find nearby services and set delivery addresses   |
| `NSLocationAlwaysAndWhenInUseUsageDescription` | Location access (always + in-use)                 |
| `NSLocationAlwaysUsageDescription`             | Always-on location (legacy key)                   |
| `NSMicrophoneUsageDescription`                 | Microphone access (declared; verify active usage) |
| `NSPhotoLibraryUsageDescription`               | Photo library access for issue reports            |

---

## 4. Third-Party Libraries

### Mobile App (`package.json`)

#### Core Framework

| Library        | Version  | Purpose                       |
| -------------- | -------- | ----------------------------- |
| `expo`         | ~52.0.25 | Build toolchain and SDK       |
| `react`        | 18.3.1   | UI framework                  |
| `react-native` | 0.76.9   | Cross-platform mobile runtime |

#### Navigation

| Library                               | Version  | Purpose                  |
| ------------------------------------- | -------- | ------------------------ |
| `@react-navigation/native`            | ^7.2.2   | Navigation container     |
| `@react-navigation/native-stack`      | ^7.14.10 | Stack navigator          |
| `@react-navigation/bottom-tabs`       | ^7.15.9  | Bottom tab navigator     |
| `@react-navigation/material-top-tabs` | ^7.4.23  | Top tab navigator        |
| `react-native-screens`                | ~4.4.0   | Native screen management |
| `react-native-safe-area-context`      | 4.12.0   | Safe area insets         |

#### Authentication & Cloud

| Library                                     | Version | Purpose                           |
| ------------------------------------------- | ------- | --------------------------------- |
| `@react-native-firebase/app`                | ^24.1.1 | Firebase core                     |
| `@react-native-firebase/auth`               | ^24.1.1 | Firebase phone OTP authentication |
| `@react-native-google-signin/google-signin` | ^16.1.2 | Google Sign-In                    |

#### Networking & State

| Library                                     | Version | Purpose                                          |
| ------------------------------------------- | ------- | ------------------------------------------------ |
| `axios`                                     | ^1.15.0 | HTTP client (installed; see Known Limitations)   |
| `@tanstack/react-query`                     | ^5.97.0 | Server state management                          |
| `zustand`                                   | ^5.0.12 | Client state management                          |
| `react-hook-form`                           | ^7.72.1 | Form handling (installed; see Known Limitations) |
| `@react-native-async-storage/async-storage` | 1.23.1  | Local key-value storage                          |

#### UI & Animations

| Library                        | Version | Purpose                    |
| ------------------------------ | ------- | -------------------------- |
| `react-native-reanimated`      | ~3.16.1 | Declarative animations     |
| `react-native-gesture-handler` | ~2.20.2 | Touch and gesture handling |
| `react-native-svg`             | 15.8.0  | SVG rendering              |
| `expo-linear-gradient`         | ~14.0.2 | Gradient backgrounds       |
| `lucide-react-native`          | ^1.8.0  | Icon set                   |

#### Maps & Location

| Library             | Version  | Purpose                |
| ------------------- | -------- | ---------------------- |
| `react-native-maps` | 1.18.0   | Google Maps display    |
| `expo-location`     | ~18.0.10 | Device location access |

#### Media

| Library             | Version  | Purpose                   |
| ------------------- | -------- | ------------------------- |
| `expo-image-picker` | ~16.0.6  | Camera and gallery picker |
| `expo-file-system`  | ~18.0.12 | File read/write           |
| `expo-asset`        | ~11.0.5  | Static asset management   |

#### Misc Expo

| Library                   | Version | Purpose                              |
| ------------------------- | ------- | ------------------------------------ |
| `expo-build-properties`   | ~0.13.3 | Native build config (Kotlin version) |
| `expo-status-bar`         | ~2.0.1  | Status bar control                   |
| `react-native-pager-view` | 6.5.1   | Swipeable page views                 |

---

### Admin Panel (`admin/package.json`)

| Library                 | Version  | Purpose                          |
| ----------------------- | -------- | -------------------------------- |
| `react`                 | ^19.2.7  | UI framework                     |
| `react-dom`             | ^19.2.7  | DOM renderer                     |
| `@mui/material`         | ^9.1.2   | UI component library             |
| `@mui/icons-material`   | ^9.1.1   | Material icons                   |
| `@emotion/react`        | ^11.14.0 | CSS-in-JS (MUI peer dep)         |
| `@emotion/styled`       | ^11.14.1 | Styled components (MUI peer dep) |
| `@tanstack/react-query` | ^5.101.2 | Server state management          |
| `axios`                 | ^1.18.1  | HTTP client                      |
| `react-router-dom`      | ^7.18.1  | Client-side routing              |
| `react-hook-form`       | ^7.80.0  | Form handling                    |
| `@hookform/resolvers`   | ^5.4.0   | Schema validation adapters       |
| `zod`                   | ^4.4.3   | Schema validation                |
| `zustand`               | ^5.0.14  | Client state management          |
| `recharts`              | ^3.9.1   | Chart / data visualisation       |
| `vite`                  | ^8.1.1   | Build tool                       |
| `typescript`            | ~6.0.2   | Type safety                      |

---

### Backend Third-Party Integrations (from `backend/.env.example`)

| Integration           | Purpose                                     |
| --------------------- | ------------------------------------------- |
| PostgreSQL            | Primary relational database                 |
| Redis                 | Caching and session storage                 |
| Firebase              | Auth (phone OTP) and push notifications     |
| Google OAuth          | Social sign-in (Android + iOS client IDs)   |
| Google Maps API       | Geocoding and address resolution            |
| Google Sheets API     | Reporting and data export                   |
| Razorpay              | Payment gateway (UPI, cards, net banking)   |
| S3-compatible Storage | Media and file uploads (max 10 MB per file) |

---

## 5. API Base URL & Environment

### Mobile App

| Environment    | Base URL                      | Source                    |
| -------------- | ----------------------------- | ------------------------- |
| **Production** | `https://api.urbanpowers.com` | `src/config/apiConfig.ts` |

```typescript
// src/config/apiConfig.ts
export const BASE_URL = 'https://api.urbanpowers.com';
```

### Admin Panel

| Environment    | Base URL                      | Source                       |
| -------------- | ----------------------------- | ---------------------------- |
| **Local dev**  | `http://localhost:8000`       | `admin/src/api/apiClient.ts` |
| **Production** | `https://api.urbanpowers.com` | `admin/src/api/apiClient.ts` |
| **Override**   | `VITE_API_BASE_URL` env var   | `admin/src/api/apiClient.ts` |

### API Version Prefix

```
/api/v1
```

### Token Refresh Endpoint

```
POST https://api.urbanpowers.com/api/v1/auth/refresh
```

### Mobile App Environment Variables (`.env.example`)

| Variable                           | Purpose                         |
| ---------------------------------- | ------------------------------- |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`  | Google Maps SDK for Android/iOS |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Sign-In OAuth web client |

### Backend Environment Variables (key production values)

| Variable                                                       | Purpose                     |
| -------------------------------------------------------------- | --------------------------- |
| `POSTGRES_SERVER`                                              | Database host               |
| `SECRET_KEY`                                                   | JWT signing key             |
| `FIREBASE_API_KEY`                                             | Firebase project key        |
| `GOOGLE_MAPS_API_KEY`                                          | Server-side geocoding       |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`                      | Payment gateway credentials |
| `S3_BUCKET_NAME` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | File storage                |

---

## 6. Legal Policies

All policies are embedded as in-app screens and should also be hosted at a publicly accessible URL for Play Store and App Store compliance.

### Privacy Policy

| Field                      | Detail                                              |
| -------------------------- | --------------------------------------------------- |
| **Last Updated**           | June 1, 2025                                        |
| **Screen**                 | `src/screens/Legal/PrivacyPolicyScreen.tsx`         |
| **Recommended Public URL** | `https://urbanpowers.com/privacy`                   |
| **Contact Email**          | `privacy@urbanpowers.com`                           |
| **Data deletion timeline** | Requests processed within 30 days                   |
| **Payment processor**      | Razorpay (full card details not stored server-side) |
| **Analytics**              | Firebase Analytics (anonymized data only)           |

Data collected: name, email, mobile, profile photo, location (with consent), usage data, device identifiers.  
Data shared with: assigned service professional (name, contact, address for booking fulfillment only), Razorpay (payment processing), anonymized analytics partners.  
Data not sold or traded to any third party for marketing.

---

### Terms & Conditions

| Field                           | Detail                                           |
| ------------------------------- | ------------------------------------------------ |
| **Last Updated**                | June 1, 2025                                     |
| **Screen**                      | `src/screens/Legal/TermsAndConditionsScreen.tsx` |
| **Recommended Public URL**      | `https://urbanpowers.com/terms`                  |
| **Minimum User Age**            | 18 years                                         |
| **Governing Law**               | Laws of India                                    |
| **Jurisdiction**                | Bengaluru, Karnataka, India                      |
| **Legal Contact**               | `legal@urbanpowers.com`                          |
| **Unauthorized Access Contact** | `support@urbanpowers.com`                        |

---

### Refund & Cancellation Policy

| Field                      | Detail                                     |
| -------------------------- | ------------------------------------------ |
| **Last Updated**           | June 1, 2025                               |
| **Screen**                 | `src/screens/Legal/RefundPolicyScreen.tsx` |
| **Recommended Public URL** | `https://urbanpowers.com/refund`           |

| Scenario                          | Policy                                               |
| --------------------------------- | ---------------------------------------------------- |
| Free cancellation                 | ≥4 hours before scheduled service                    |
| Late cancellation (within 4 hrs)  | ₹99 or 20% of booking value (whichever is lower)     |
| No-show                           | Full booking amount forfeited                        |
| Rescheduling                      | Up to 2 hours before service; max 2 reschedules      |
| Service not rendered              | Full refund                                          |
| Quality complaint                 | Must be raised within 24 hours via app               |
| Refund approval to payment source | 2 business days approval + 5–7 business days to bank |
| Wallet refund                     | Instant                                              |
| Service warranty                  | 7-day re-service warranty on completed jobs          |
| Escalations                       | `support@urbanpowers.com`                            |

---

### Delete Account Policy

| Field                      | Detail                                                          |
| -------------------------- | --------------------------------------------------------------- |
| **Last Updated**           | June 1, 2025                                                    |
| **Document**               | `docs/DeleteAccountPolicy.md`                                   |
| **Recommended Public URL** | `https://urbanpowers.com/delete-account`                        |
| **In-App Path**            | Account → Settings → Delete My Account                          |
| **Email Method**           | `privacy@urbanpowers.com` — Subject: "Account Deletion Request" |
| **Processing Time**        | Within 30 days of verified request                              |
| **Identity Verification**  | Registered mobile number or OTP                                 |

Data permanently deleted: profile, phone, email, addresses, wallet balance, push tokens, preferences, active bookings.

Data retained for legal compliance:

| Data Type                       | Retention                     | Legal Basis                          |
| ------------------------------- | ----------------------------- | ------------------------------------ |
| Booking and transaction records | 7 years                       | Income Tax Act 1961; GST regulations |
| Payment history and invoices    | 7 years                       | Financial record-keeping             |
| Dispute and complaint records   | 3 years                       | Consumer Protection Act 2019         |
| Fraud investigation records     | Investigation period + 1 year | IT Act 2000                          |

---

## 7. Contact Information

| Channel                      | Value                                                       |
| ---------------------------- | ----------------------------------------------------------- |
| **General Support Email**    | `support@urbanpowers.com`                                   |
| **Privacy / Data Deletion**  | `privacy@urbanpowers.com`                                   |
| **Legal / Terms**            | `legal@urbanpowers.com`                                     |
| **Business Partnerships**    | `partnerships@urbanpowers.com`                              |
| **Alternate Support Email**  | `urbanpower.homecare@gmail.com`                             |
| **Support Phone / WhatsApp** | `+91 76785 49869`                                           |
| **Registered Address**       | Urban Power Services Pvt. Ltd., Bengaluru, Karnataka, India |

### Support Hours (IST, UTC+5:30)

| Day               | Hours              |
| ----------------- | ------------------ |
| Monday – Friday   | 8:00 AM – 9:00 PM  |
| Saturday          | 9:00 AM – 7:00 PM  |
| Sunday & Holidays | 10:00 AM – 5:00 PM |

### Response Times

| Channel         | Response Time          |
| --------------- | ---------------------- |
| In-App Chat     | Within 2 hours         |
| Email           | Within 24 hours        |
| Legal / Privacy | Within 3 business days |

---

## 8. Known Limitations (v1.0.0)

| Limitation                          | Detail                                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Shop/Grocery checkout**           | Preview only — cart UI present but delivery checkout not wired; full integration planned for v1.1.0 |
| **Dark mode**                       | Not supported; theme tokens prepared but switcher not active; planned for v1.2.0                    |
| **iOS build**                       | Not available in v1.0.0; Android-only release                                                       |
| **`axios` unused**                  | Installed for future API calls but currently not in use                                             |
| **`react-hook-form` unused**        | Installed but forms currently use `useState`                                                        |
| **No data persistence**             | All app data resets on app close; no AsyncStorage persistence yet                                   |
| **OTP simulation**                  | In dev/demo mode, any 4-digit code is accepted (must be disabled in production build)               |
| **User IDs**                        | Randomly generated on each login in dev/demo mode                                                   |
| **`POST_NOTIFICATIONS` permission** | Referenced in Play Store checklist but not yet declared in `AndroidManifest.xml`                    |
| **`CFBundleURLSchemes`**            | `Info.plist` still contains `com.anonymous.urbanpower`; needs production override                   |

---

## 9. Future Features

### Planned for v1.1.0

- Full grocery and shop delivery checkout integration
- In-app live chat with support agents
- Service professional ratings and review history
- Urban Power Wallet top-up via UPI
- Improved address management with landmark support
- Performance optimizations and reduced app startup time

### Planned for v1.2.0

- Dark mode support
- Multi-language support (Hindi, Kannada)
- Loyalty rewards program
- Subscription plans for frequent service users

### Longer-Term Roadmap (from README)

- Real-time technician tracking (WebSockets / Firebase Realtime DB)
- Unit + integration test suite
- EAS Build CI/CD pipeline
- Full Google Maps integration for address selection
- Admin panel analytics dashboard
- Multi-language support (Hindi + English)

---

## 10. Pre-Release Verification Checklist

### Build & Config

- [ ] Version name is `1.0.0` and version code is `1` in `app.json`
- [ ] `newArchEnabled: false` confirmed in `app.json`
- [ ] `BASE_URL` in `src/config/apiConfig.ts` points to `https://api.urbanpowers.com`
- [ ] `EXPO_PUBLIC_RAZORPAY_KEY_ID` set to live key (`rzp_live_...`), not test key
- [ ] `google-services.json` is the production file (not dev/staging)
- [ ] `CFBundleURLSchemes` in `Info.plist` updated from `com.anonymous.urbanpower` to `com.urbanpower.app`
- [ ] No hardcoded `localhost` or `192.168.x.x` URLs in production code
- [ ] No `console.log` statements in production builds
- [ ] OTP simulation / fake auth paths disabled for production

### Permissions

- [ ] All declared Android permissions have active usage in code
- [ ] `POST_NOTIFICATIONS` declared in `AndroidManifest.xml` if push notifications are live
- [ ] `NSMicrophoneUsageDescription` in `Info.plist` has confirmed active usage (or removed if unused)
- [ ] Sensitive permissions (LOCATION, CAMERA) show a rationale dialog before requesting

### Policies & Legal

- [ ] Privacy Policy hosted at a publicly accessible URL (not behind login)
- [ ] Terms & Conditions hosted at a publicly accessible URL
- [ ] Refund Policy hosted at a publicly accessible URL
- [ ] Delete Account policy page hosted at a publicly accessible URL
- [ ] In-app account deletion flow verified working end-to-end
- [ ] Data Safety form completed in Google Play Console

### Contact & Support

- [ ] `support@urbanpowers.com` inbox active and monitored
- [ ] `privacy@urbanpowers.com` inbox active and monitored
- [ ] `legal@urbanpowers.com` inbox active and monitored
- [ ] Support phone `+91 76785 49869` active and reachable
- [ ] WhatsApp on `+91 76785 49869` responsive

---

## Sign-Off

| Role          | Name | Date | Status     |
| ------------- | ---- | ---- | ---------- |
| Developer     |      |      | ☐ Approved |
| QA / Tester   |      |      | ☐ Approved |
| Product Owner |      |      | ☐ Approved |
| Legal Review  |      |      | ☐ Approved |

---

_Urban Power v1.0.0 · com.urbanpower.app · Urban Power Services Pvt. Ltd. · June 2025_
