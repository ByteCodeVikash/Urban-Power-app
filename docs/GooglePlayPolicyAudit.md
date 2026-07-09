# Google Play Developer Policy Audit Report

**Application Name:** Urban Power  
**Package Identifier:** `com.urbanpower.app`  
**Target Platform:** Android (React Native / Expo)  
**Audit Date:** July 8, 2026  
**Auditor:** AI Audit Assistant  
**Status:** **Partially Compliant (Action Required)**

---

## 1. Executive Summary

This report presents a comprehensive Google Play Policy Audit for the **Urban Power** React Native application. The codebase has been audited against the latest Google Play Developer Policies (effective 2024–2025).

### Key Findings:

- **Legal and Policy Pages:** 100% compliant. Detailed, professional screens exist for the Privacy Policy, Terms & Conditions, Refund & Cancellation Policy, Contact Us, and About Page. All are fully accessible via the **Legal & Info** hub in the account profile.
- **Account Deletion Policy:** **Partially Compliant.** The app offers an in-app deletion request screen (`DeleteAccountScreen.tsx`) with an automatic fallback to email request (`privacy@urbanpowers.com`) if the API call fails. However, the automated backend endpoint is currently commented out/stubbed in the API service (`api.ts`). A web-based deletion link must also be set up by the developers.
- **App Permissions:** **Action Required.** The app declares `android.permission.CAMERA` in its `AndroidManifest.xml` but does not use any camera capture APIs in the codebase (it uses `launchImageLibraryAsync` from `expo-image-picker` for image gallery uploads). The unused `CAMERA` permission should be removed.
- **Target SDK Version:** 100% compliant. The app compiles and targets **Android 15 (API Level 35)**.

---

## 2. Policy Documentation & Accessibility

Google Play requires that key legal policies are easily accessible inside the app.

| Document / Page           | Code Location (Screen File)                                                                                                                                 | Accessibility Path                                    | Professionalism & Content Quality                                                                                                                               |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Privacy Policy**        | [PrivacyPolicyScreen.tsx](file:///media/H-Drive/Project/shivam_project/urban-power-app-project-updated/src/screens/Legal/PrivacyPolicyScreen.tsx)           | Profile → Legal & Info → Privacy Policy               | **Excellent.** Details data collection (identifiers, location, payment info, device stats), sharing rules, security (HTTPS), retention, and user rights.        |
| **Terms & Conditions**    | [TermsAndConditionsScreen.tsx](file:///media/H-Drive/Project/shivam_project/urban-power-app-project-updated/src/screens/Legal/TermsAndConditionsScreen.tsx) | Profile → Legal & Info → Terms & Conditions           | **Excellent.** Covers eligibility (18+), account registration, booking limits, Razorpay payments, limitation of liability, and jurisdiction (Bengaluru, India). |
| **Refund & Cancellation** | [RefundPolicyScreen.tsx](file:///media/H-Drive/Project/shivam_project/urban-power-app-project-updated/src/screens/Legal/RefundPolicyScreen.tsx)             | Profile → Legal & Info → Refund & Cancellation Policy | **Excellent.** Clearly details the 4-hour free cancellation window, rescheduling limits, refund timelines (5-7 business days), and the 7-day service warranty.  |
| **Contact Us**            | [ContactUsScreen.tsx](file:///media/H-Drive/Project/shivam_project/urban-power-app-project-updated/src/screens/Legal/ContactUsScreen.tsx)                   | Profile → Legal & Info → Contact Us                   | **Excellent.** Displays contact channels (email, phone, address), hours of operation, and help center links.                                                    |
| **About Page**            | [AboutScreen.tsx](file:///media/H-Drive/Project/shivam_project/urban-power-app-project-updated/src/screens/Legal/AboutScreen.tsx)                           | Profile → Legal & Info → About Urban Power            | **Excellent.** Showcases app version (`1.0.2`), company mission, business stats, and core corporate values.                                                     |

---

## 3. Google Play Account Deletion Policy Audit

Under Google Play's Account Deletion Policy, if your app allows users to create an account, it **must** allow users to request deletion of their account from both within the app and via a web-based resource.

### Code-Level Findings:

- **In-App Flow:** Implemented in `src/screens/Account/DeleteAccountScreen.tsx`. It provides a clear layout explaining:
  - What gets deleted (profile data, phone number, saved addresses, wallet balance, active bookings).
  - What is retained for legal compliance (financial history/invoices for 7 years under Income Tax/GST acts).
  - Clear confirmation dialog.
- **Backend API Integration Status:** **Missing backend support.** In `src/services/api.ts` (lines 142–153), the automated delete account request is commented out:
  ```typescript
  // deleteAccount: async (reason?: string) => {
  //   const response = await API.delete('/api/v1/auth/account', {
  //     data: { reason },
  //   });
  //   return response.data;
  // },
  deleteAccount: async (_reason?: string): Promise<{ message: string }> => {
    // TODO(backend): Replace this stub with the real API call above.
    throw new Error(
      'Account deletion is not yet available. Please contact support@urbanpowers.com to request account deletion.',
    );
  },
  ```
- **App Graceful Fallback:** When the stub throws, the frontend displays an alert giving the user a direct button to send an email request to `privacy@urbanpowers.com` via `Linking.openURL('mailto:...')`.
- **Play Console Web-level URL:** Developers must publish a web-based data deletion request form (or link to this policy document with email request instructions) and register the link in their Play Console under the "App Content" -> "Data Safety" section.

---

## 4. Dangerous & Declared Permissions Audit

Every permission declared in `android/app/src/main/AndroidManifest.xml` has been audited against actual use cases in the source code:

| Declared Permission      | Protection Level        | Code Use Case / File Location                                                              | Audit Finding & Recommendation                                                                                                                                                                                         |
| :----------------------- | :---------------------- | :----------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ACCESS_COARSE_LOCATION` | Dangerous               | `src/screens/Main/MapScreen.tsx`                                                           | **Valid.** Used by `expo-location` to approximate coordinates on the map.                                                                                                                                              |
| `ACCESS_FINE_LOCATION`   | Dangerous               | `src/screens/Main/MapScreen.tsx`                                                           | **Valid.** Used by `expo-location` to pinpoint location on the map for service address entry.                                                                                                                          |
| `INTERNET`               | Normal                  | Global APIs & Razorpay SDK                                                                 | **Valid.** Essential for remote data, images, and payments.                                                                                                                                                            |
| `READ_EXTERNAL_STORAGE`  | Dangerous (Max SDK 32)  | `src/screens/Services/ServiceBookingScreen.tsx`, `src/screens/Kabadi/KabadiFormScreen.tsx` | **Valid.** Used by `expo-image-picker` to select reference images from the gallery.                                                                                                                                    |
| `READ_MEDIA_IMAGES`      | Dangerous (Android 13+) | `src/screens/Services/ServiceBookingScreen.tsx`, `src/screens/Kabadi/KabadiFormScreen.tsx` | **Valid.** Used by `expo-image-picker` on newer Android devices for gallery access.                                                                                                                                    |
| `CAMERA`                 | Dangerous               | **None**                                                                                   | **Unnecessary.** The codebase only utilizes `launchImageLibraryAsync` (gallery select) and never calls `launchCameraAsync` or requests camera device permissions. **Recommendation: Remove from AndroidManifest.xml.** |
| `POST_NOTIFICATIONS`     | Dangerous (Android 13+) | Global push tokens                                                                         | **Valid.** Used to send booking alerts and status updates.                                                                                                                                                             |
| `VIBRATE`                | Normal                  | Global feedback                                                                            | **Valid.** Used for haptic triggers and push alerts.                                                                                                                                                                   |

---

## 5. Data Safety Audit

When submitting the Data Safety form in the Google Play Console, the following fields must be declared based on static analysis:

1. **Data Collection:**
   - **Location:** Precise and coarse coordinates (collected via `MapScreen` with permission).
   - **Personal Info:** Name, Email, Phone Number (stored in profile/auth stores and sent to bookings).
   - **Financial Info:** Razorpay transactions are processed inside the client SDK; card details are **not** stored by the app.
   - **Photos/Videos:** Optional reference images uploaded by the user from their gallery.
   - **Device Identifiers:** Push tokens and OS metadata for updates and notification dispatch.
2. **Data Security & Transfer:**
   - **Encryption:** Encrypted in transit. All endpoints use `HTTPS` via standard TLS-secured Axios client instances.
   - **Data Deletion Request:** The user has access to a deletion request button in-app (which prompts manual deletion request via email to `privacy@urbanpowers.com`).

---

## 6. Background Services & Tasks

Google Play has strict policies regarding background location tracking (`ACCESS_BACKGROUND_LOCATION`) and background services/receivers.

- **Service Declarations:** No background `<service>`, `<receiver>`, or foreground service permissions are declared in `AndroidManifest.xml`.
- **Background Tasks:** No background task managers (like `expo-task-manager` or `react-native-background-actions`) are registered in `package.json`.
- **Conclusion:** **100% Compliant.** No background operations are active, eliminating risk of background location policy violations.

---

## 7. Target SDK Compliance

Google Play requires all new apps and updates to target recent Android SDK versions:

- Starting August 31, 2024: Target SDK must be **Android 14 (API 34) or higher**.
- Starting August 31, 2025: Target SDK must be **Android 15 (API 35) or higher**.

### Current Configuration (`android/build.gradle`):

```groovy
ext {
    minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '24')
    compileSdkVersion = Integer.parseInt(findProperty('android.compileSdkVersion') ?: '35')
    targetSdkVersion = Integer.parseInt(findProperty('android.targetSdkVersion') ?: '35')
}
```

- **Compliance Status:** **100% Compliant.** The app targets **Android 15 (API 35)** and supports devices back to **Android 7.0 (API 24)**.

---

## 8. Remediation Checklist for Production Launch

Ensure all items below are addressed before compiling the production AAB:

- [ ] **Remove Unused Camera Permission:** Remove `<uses-permission android:name="android.permission.CAMERA"/>` from `android/app/src/main/AndroidManifest.xml` (Line 7) to avoid policy warnings.
- [ ] **Enable Backend Deletion Endpoint (Optional but Recommended):** Uncomment the automated delete account request logic in `src/services/api.ts` and set up the corresponding backend endpoint `/api/v1/auth/account`.
- [ ] **Configure Play Console Web URL:** Provide a web page (e.g. your privacy policy page or a dedicated contact form) on the company website where users can submit account deletion requests. Update the Google Play Console with this URL under **Data Safety → Data Deletion**.
- [ ] **Submit Data Safety Form:** Complete the Google Play Data Safety form declaring the collection of location, identifiers, images, and device details.
