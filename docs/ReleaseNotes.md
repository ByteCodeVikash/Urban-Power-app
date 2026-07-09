# Release Notes

**App Name:** Urban Power  
**Package:** com.urbanpower.app  
**Platform:** Android (Google Play)  
**Entity:** Urban Power Services Pvt. Ltd.

---

## Version 1.0.0 — Initial Release

**Release Date:** June 2025  
**Version Code:** 1  
**Target SDK:** Android 14 (API 34)  
**Minimum SDK:** Android 8.0 (API 26)  
**Build Type:** Production

---

### What's New

This is the **first public release** of Urban Power on Google Play.

Urban Power brings verified home services to your doorstep — from electrical repairs and AC servicing to beauty treatments and scrap pickup. Book in minutes, track in real time, pay securely.

---

### Features in This Release

#### 🏠 Home Services

- Book electricians, plumbers, AC technicians, carpenters, and more
- Browse by service category with transparent upfront pricing
- Real-time booking confirmation and professional assignment
- Live service tracking with estimated arrival time

#### 💄 Beauty & Wellness

- Salon at home services for all genders
- Skincare, haircare, and personal care bookings
- Select your preferred gender for service professionals

#### ♻️ Kabadi (Scrap) Pickup

- Schedule free doorstep scrap collection
- Browse scrap categories and get estimated pricing
- Real-time pickup tracking and history

#### 🛍️ Shop & Grocery

- Browse curated product categories
- Add to cart and checkout (coming soon: full delivery integration)

#### 👤 Account & Profile

- OTP-based phone authentication via Firebase
- Manage saved addresses with Google Maps integration
- Booking history with status tracking
- Urban Power Wallet for credits and cashback

#### 💳 Payments

- Razorpay payment gateway integration
- Supports UPI, credit/debit cards, and net banking
- Secure checkout with payment receipt generation

#### 📋 Legal & Compliance

- In-app Privacy Policy, Terms & Conditions, and Refund Policy
- Account deletion support
- Google Play Data Safety compliance

---

### Technical Details

| Property               | Value                               |
| ---------------------- | ----------------------------------- |
| Framework              | React Native 0.76.9 (Expo 52)       |
| Authentication         | Firebase Auth (Phone OTP)           |
| Maps                   | Google Maps SDK (react-native-maps) |
| Payments               | Razorpay SDK                        |
| State Management       | Zustand 5                           |
| Navigation             | React Navigation 7                  |
| Min Android Version    | Android 8.0 (Oreo, API 26)          |
| Target Android Version | Android 14 (API 34)                 |

---

### Permissions Requested

| Permission      | Reason                                            |
| --------------- | ------------------------------------------------- |
| Location (Fine) | Address autofill and nearby professional matching |
| Camera          | Photo upload for service issue reports            |
| Storage / Media | Photo selection from gallery for issue reports    |
| Internet        | Core app functionality                            |
| Notifications   | Booking confirmations and status updates          |

---

### Known Limitations in v1.0.0

- **Shop/Grocery checkout:** Checkout flow is in preview — full delivery integration will be available in v1.1.0
- **Dark mode:** Not supported in this release; planned for v1.2.0
- **iOS:** Not available in this release; Android-only

---

### Bug Fixes

- N/A — Initial release

---

### Security

- All API communication uses HTTPS/TLS
- No sensitive user data stored locally beyond session tokens
- Firebase Security Rules enforced on all data access
- Payment data handled exclusively by Razorpay (PCI-DSS compliant)

---

## Upcoming — Version 1.1.0 (Planned)

- Full grocery and shop delivery checkout integration
- In-app live chat with support agents
- Service professional ratings and review history
- Urban Power Wallet top-up via UPI
- Improved address management with landmark support
- Performance optimizations and reduced app startup time

---

## Upcoming — Version 1.2.0 (Planned)

- Dark mode support
- Multi-language support (Hindi, Kannada)
- Loyalty rewards program
- Subscription plans for frequent service users

---

_For support or to report issues with this release, contact support@urbanpowers.com_
