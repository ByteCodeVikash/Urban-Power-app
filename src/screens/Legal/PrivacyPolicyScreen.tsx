import React from 'react';
import LegalScreen, { LegalSection } from './LegalScreen';

const LAST_UPDATED = 'June 1, 2025';

const INTRO =
  'Urban Power ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our mobile application and services. Please read this policy carefully.';

const SECTIONS: LegalSection[] = [
  {
    heading: 'Information We Collect',
    body: [
      'Personal Identification Information: When you register, we collect your name, email address, mobile number, and profile photo to create and manage your account.',
      'Location Information: We collect your precise location (with your consent) to show you relevant service providers, estimate arrival times, and process address-based bookings.',
      'Payment Information: Payment transactions are processed through secure third-party gateways (Razorpay). We do not store your full card details on our servers.',
      'Usage Data: We collect information about how you interact with the app — screens visited, services searched, and bookings made — to improve your experience.',
      'Device Information: We collect device identifiers, operating system version, and push notification tokens to provide app functionality and send service alerts.',
    ],
  },
  {
    heading: 'How We Use Your Information',
    body: [
      'To create and manage your account and authenticate your identity.',
      'To process service bookings, assign technicians, and send booking confirmations and status updates.',
      'To facilitate payment processing and generate invoices for completed services.',
      'To personalize your app experience and show relevant service recommendations.',
      'To send transactional notifications (booking reminders, technician arrival, payment receipts) via SMS, email, and push notifications.',
      'To improve our platform by analyzing usage patterns and resolving technical issues.',
      'To comply with applicable laws, regulations, and legal processes.',
    ],
  },
  {
    heading: 'Sharing of Your Information',
    body: [
      'Service Professionals: We share your name, contact number, and service address with the assigned technician solely to fulfill your booking.',
      'Payment Processors: We share transaction details with Razorpay to process payments securely.',
      'Analytics Providers: We use anonymized, aggregated analytics data with trusted partners to understand app usage. No personally identifiable information is shared.',
      'Legal Obligations: We may disclose your information when required by law, court order, or government authority.',
      'We do not sell, rent, or trade your personal information to any third party for marketing purposes.',
    ],
  },
  {
    heading: 'Data Retention',
    body: 'We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us at privacy@urbanpowers.com. We will process deletion requests within 30 days, except where retention is required by applicable law.',
  },
  {
    heading: 'Data Security',
    body: 'We implement industry-standard security measures including HTTPS/TLS encryption for data in transit, secure storage practices, and access controls to protect your personal information. While we strive to protect your data, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    heading: 'Your Rights',
    body: [
      'Access: You may request a copy of the personal data we hold about you.',
      'Correction: You may update or correct inaccurate information via your profile settings or by contacting support.',
      'Deletion: You may request deletion of your personal data, subject to legal retention requirements.',
      'Withdraw Consent: You may withdraw consent for location access or push notifications at any time through your device settings.',
      'To exercise any of these rights, contact us at privacy@urbanpowers.com.',
    ],
  },
  {
    heading: "Children's Privacy",
    body: 'Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal data, please contact us immediately and we will delete such information promptly.',
  },
  {
    heading: 'Cookies and Tracking Technologies',
    body: 'Our mobile app does not use cookies. However, we may use device identifiers and analytics SDKs (such as Firebase Analytics) to understand app performance and user behavior. These tools collect anonymized usage data consistent with the data practices described in this policy.',
  },
  {
    heading: 'Third-Party Links and Services',
    body: 'Our app may contain links to third-party websites or integrate with third-party services (e.g., Google Maps, payment gateways). We are not responsible for the privacy practices of these third parties. We encourage you to review their respective privacy policies.',
  },
  {
    heading: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes via in-app notification or email. Your continued use of the app after such changes constitutes your acceptance of the updated policy.',
  },
  {
    heading: 'Contact Us',
    body: 'If you have any questions, concerns, or requests related to this Privacy Policy, please contact us at:\n\nEmail: privacy@urbanpowers.com\nAddress: Urban Power Services Pvt. Ltd., India\nPhone: Available through the Help & Support section of the app.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <LegalScreen
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={INTRO}
      sections={SECTIONS}
    />
  );
}
