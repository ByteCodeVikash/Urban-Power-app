# Google Play Console — Production Release Checklist

**App Name:** Urban Power  
**Package:** com.urbanpower.app  
**Version:** 1.0.0 (Version Code: 1)  
**Entity:** Urban Power Services Pvt. Ltd.  
**Prepared:** June 2025

---

## How to Use This Checklist

Work through each section top to bottom before submitting for Google Play review. Mark each item `[x]` when complete. Items marked ⚠️ require action before submission. Items marked ℹ️ are informational.

---

## Section 1 — App Signing & Build

- [ ] Production AAB (Android App Bundle) built using `eas build --platform android --profile production`
- [ ] App signed with a production keystore (not the debug keystore)
- [ ] Keystore backed up securely in at least 2 locations (not committed to Git)
- [ ] `google-services.json` API key restricted in Google Cloud Console to the production package name `com.urbanpower.app`
- [ ] Version name is `1.0.0` and version code is `1` in `app.json`
- [ ] `newArchEnabled: false` confirmed in `app.json` (React Native new architecture disabled for stability)
- [ ] Build tested on a physical Android device (not only emulator)
- [ ] Minimum SDK confirmed as API 26 (Android 8.0)
- [ ] Target SDK confirmed as API 34 (Android 14) — required by Google Play as of August 2024

---

## Section 2 — Play Console Account Setup

- [ ] Google Play Developer account is active and in good standing
- [ ] Developer account identity verified (name, address, D-U-N-S or equivalent)
- [ ] Play Console payment profile set up for receiving revenue (if applicable)
- [ ] App created in Play Console with package name `com.urbanpower.app`
- [ ] App category set to: **Lifestyle**
- [ ] App type set to: **App** (not Game)

---

## Section 3 — Store Listing

### Basic Information

- [ ] **App name:** Urban Power _(max 30 characters — current: 11 ✅)_
- [ ] **Short description** written (max 80 characters):
  > "Book trusted home services — repairs, beauty, scrap pickup & more."
- [ ] **Full description** written (max 4,000 characters) — see template below
- [ ] App category confirmed: **Lifestyle** (or **House & Home**)
- [ ] Content rating questionnaire completed (expected rating: **Everyone** or **Teen**)
- [ ] Tags/keywords added for discoverability

### Full Description Template

```
Urban Power connects you with verified, trained home service professionals —
at your doorstep, on your schedule.

🔧 HOME MAINTENANCE
Book electricians, plumbers, AC technicians, carpenters, and more.
Transparent pricing. No hidden charges.

💄 BEAUTY & WELLNESS
Salon-quality services at home. Haircare, skincare, and personal care
for men and women.

♻️ KABADI PICKUP
Schedule free scrap collection from your doorstep. Get fair prices
for your recyclable items.

🛍️ SHOP & GROCERY
Browse curated products delivered to your door.

✅ WHY URBAN POWER?
• Background-verified professionals
• Upfront, fixed pricing — no surprises
• Real-time booking tracking
• 7-day service warranty
• Secure payments via UPI, cards & net banking
• In-app support available 7 days a week

📲 HOW IT WORKS
1. Choose your service category
2. Pick a date and time that suits you
3. A verified professional arrives at your door
4. Pay securely through the app

Join thousands of happy customers across India.
Download Urban Power today.
```

### Screenshots & Graphics

- [ ] **Icon:** 512×512 px PNG, no rounded corners applied (Play Console applies them)
- [ ] **Feature graphic:** 1024×500 px JPG or PNG
- [ ] **Phone screenshots:** Minimum 2, maximum 8 per device type (recommended: 6–8)
  - [ ] Screenshot 1: Home screen showing service categories
  - [ ] Screenshot 2: Service booking flow
  - [ ] Screenshot 3: Booking confirmation / tracking screen
  - [ ] Screenshot 4: Profile / account screen
  - [ ] Screenshot 5: Beauty or maintenance service category
  - [ ] Screenshot 6: Payment screen or booking history
- [ ] All screenshots are from the production build (no debug overlays, no placeholder data)
- [ ] Screenshots resolution: minimum 320 px on shortest side, maximum 3840 px on longest side

---

## Section 4 — Privacy & Legal

- [ ] **Privacy Policy URL** published on a publicly accessible webpage (not behind a login)
  - Host at: e.g., `https://urbanpowers.com/privacy` or GitHub Pages URL pointing to `docs/PrivacyPolicy.md`
  - URL entered in Play Console → App Content → Privacy Policy
- [ ] Privacy Policy is in English and covers all data collected by the app
- [ ] **Terms & Conditions URL** available (optional but recommended for service apps)
- [ ] **Account Deletion:** In-app account deletion flow confirmed working (Settings → Delete My Account)
  - Required by Google Play for apps with account creation
  - See `docs/DeleteAccountPolicy.md` for full details
- [ ] **Data Safety form** completed in Play Console (App Content → Data Safety):
  - [ ] Location data: Collected, shared with service professionals, not sold
  - [ ] Personal info (name, phone, email): Collected for account management
  - [ ] Financial info: Not stored (handled by Razorpay)
  - [ ] Device identifiers: Collected for push notifications
  - [ ] User data encryption in transit: Yes (HTTPS/TLS)
  - [ ] User can request data deletion: Yes

---

## Section 5 — App Content Rating

Complete the IARC rating questionnaire in Play Console:

- [ ] Violence: None
- [ ] Sexual content: None
- [ ] Language: None
- [ ] Controlled substances: None
- [ ] User-generated content: No public UGC (reviews are moderated)
- [ ] Location sharing: Yes — shared with service professional for booking fulfillment only
- [ ] Personal information collection: Yes — phone, name, address for bookings
- [ ] Expected rating: **Everyone** (or **Teen** if questionnaire yields it)

---

## Section 6 — Permissions Audit

Verify all requested permissions are declared in `AndroidManifest.xml` and have a legitimate purpose:

| Permission                                | Declared | Justified                               |
| ----------------------------------------- | -------- | --------------------------------------- |
| ACCESS_FINE_LOCATION                      | ☐        | Address autofill, professional matching |
| ACCESS_COARSE_LOCATION                    | ☐        | Fallback location for map display       |
| INTERNET                                  | ☐        | Core app API calls                      |
| CAMERA                                    | ☐        | Photo upload for issue reports          |
| READ_EXTERNAL_STORAGE / READ_MEDIA_IMAGES | ☐        | Gallery photo upload for issue reports  |
| POST_NOTIFICATIONS                        | ☐        | Booking confirmations, status updates   |
| RECEIVE_BOOT_COMPLETED                    | ☐        | Restore notification scheduling         |
| VIBRATE                                   | ☐        | Notification vibration                  |

- [ ] No permissions declared that are not actively used in the app
- [ ] All sensitive permissions (LOCATION, CAMERA) show a rationale dialog before requesting
- [ ] Permissions requested at runtime (not at app launch)

---

## Section 7 — Sensitive App Declarations (App Content Section)

Complete all required declarations in Play Console → App Content:

- [ ] **Ads:** Does the app display ads? → No
- [ ] **Target audience:** Confirm 18+ target audience
- [ ] **Government apps:** Not applicable
- [ ] **Financial features:** App includes payment processing (Razorpay) — declare under Financial Services if prompted
- [ ] **Health apps:** Not applicable
- [ ] **VPN service:** Not applicable

---

## Section 8 — Technical Requirements

- [ ] App does not crash on launch on Android 8.0 (API 26) devices
- [ ] App does not crash on Android 14 (API 34) devices
- [ ] All screens render correctly on small screens (360dp width) and large screens (tablet)
- [ ] App handles no-network state gracefully (shows error, does not crash)
- [ ] Back navigation works correctly throughout the app
- [ ] No `android:testOnly="true"` in the manifest
- [ ] No debug certificate used in the production build
- [ ] App does not use non-SDK APIs (hidden Android APIs)
- [ ] APK/AAB size is reasonable (recommend under 100 MB uncompressed)

---

## Section 9 — Firebase & Third-Party Config

- [ ] `google-services.json` is the production file (not a development/staging config)
- [ ] Firebase API key restricted to `com.urbanpower.app` in Google Cloud Console
- [ ] Firebase project is on the Blaze (pay-as-you-go) plan or has adequate free tier limits
- [ ] Google Sign-In OAuth client ID configured for production package name and SHA-1
- [ ] Razorpay live key (`rzp_live_...`) configured via environment variable `EXPO_PUBLIC_RAZORPAY_KEY_ID`
- [ ] Google Maps API key restricted to `com.urbanpower.app` and Maps SDK for Android

---

## Section 10 — Code Quality (Pre-Build Checklist)

- [ ] No `console.log` statements in production code (App.tsx, screens, services)
- [ ] No `'rzp_test_dummy_key'` or other test keys in production code
- [ ] No hardcoded `localhost` or `192.168.x.x` URLs
- [ ] No placeholder address data (`city: 'City'`, `pincode: '123456'`) in booking flows
- [ ] No `__DEV__` fake authentication or payment simulation paths that could execute
- [ ] No TODO/FIXME comments in user-facing code paths
- [ ] All fake phone numbers on "call" buttons replaced or gated behind real data checks
- [ ] `BASE_URL` in `apiConfig.ts` points to production API (`https://api.urbanpowers.com`)
- [ ] CartScreen checkout wired to a real API or clearly gated as "Coming Soon"

---

## Section 11 — Release Track Strategy

Recommended rollout approach for first release:

### Step 1: Internal Testing Track

- Upload AAB to **Internal Testing** track
- Add internal testers (team members with Google accounts)
- Verify core flows: login, booking, payment, account
- Fix any crash-level bugs

### Step 2: Closed Testing (Alpha) Track

- Expand to 20–50 trusted external testers
- Test on a variety of Android devices and versions
- Collect feedback on UX and performance

### Step 3: Open Testing (Beta) Track _(optional)_

- Open to broader audience (100–500 users)
- Monitor crash rates in Firebase Crashlytics
- Aim for crash-free session rate > 99.5%

### Step 4: Production — Staged Rollout

- Start with **10% rollout** of production release
- Monitor for 48–72 hours: crash rate, ANR rate, review scores
- Increase to 50% → 100% if no critical issues

---

## Section 12 — Post-Submission

After submitting for review:

- [ ] Review typically takes **1–3 business days** for new apps
- [ ] Monitor Play Console for policy rejection notices
- [ ] Common rejection reasons for service apps:
  - Privacy Policy URL not accessible
  - Account deletion not available in-app
  - Permissions not properly justified
  - Data Safety form incomplete or inaccurate
- [ ] Set up **Firebase Crashlytics** alerts for production crash spikes
- [ ] Monitor **Android Vitals** dashboard for ANR and crash rates
- [ ] Respond to user reviews within 24–48 hours

---

## Section 13 — Links & Resources

| Resource                      | URL                                                             |
| ----------------------------- | --------------------------------------------------------------- |
| Play Console                  | play.google.com/console                                         |
| Play Policy Center            | play.google.com/about/developer-content-policy                  |
| Data Safety Guidance          | support.google.com/googleplay/android-developer/answer/10787469 |
| Account Deletion Requirements | support.google.com/googleplay/android-developer/answer/13327111 |
| Target API Level Requirements | support.google.com/googleplay/android-developer/answer/11926878 |
| Expo EAS Build Docs           | docs.expo.dev/build/introduction                                |
| Firebase Console              | console.firebase.google.com                                     |
| Razorpay Dashboard            | dashboard.razorpay.com                                          |

---

## Sign-Off

| Role          | Name | Date | Status     |
| ------------- | ---- | ---- | ---------- |
| Developer     |      |      | ☐ Approved |
| QA / Tester   |      |      | ☐ Approved |
| Product Owner |      |      | ☐ Approved |
| Legal Review  |      |      | ☐ Approved |

---

_This checklist was prepared for Urban Power v1.0.0 (com.urbanpower.app) — June 2025._
