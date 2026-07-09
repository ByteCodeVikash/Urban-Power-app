import React from 'react';
import LegalScreen, { LegalSection } from './LegalScreen';

const LAST_UPDATED = 'June 1, 2025';

const INTRO =
  'These Terms and Conditions ("Terms") govern your access to and use of the Urban Power mobile application and services. By downloading, installing, or using the app, you agree to be bound by these Terms. If you do not agree, please uninstall the app and discontinue use.';

const SECTIONS: LegalSection[] = [
  {
    heading: 'About Urban Power',
    body: 'Urban Power is a technology platform that connects customers with verified, trained service professionals for home services including maintenance, repairs, beauty services, kabadi (scrap) pickup, and related services. Urban Power acts as an intermediary platform and is not itself the provider of the underlying services.',
  },
  {
    heading: 'Eligibility',
    body: [
      'You must be at least 18 years of age to use our services.',
      'You must be legally capable of entering into binding contracts under applicable law.',
      'You must provide accurate, complete, and up-to-date information during registration and keep it updated.',
      'One person may not maintain more than one account. Account sharing is not permitted.',
    ],
  },
  {
    heading: 'Account Registration and Security',
    body: [
      'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
      'You agree to notify us immediately at support@urbanpowers.com of any unauthorized use of your account.',
      'We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.',
    ],
  },
  {
    heading: 'Booking and Service Terms',
    body: [
      'All bookings are subject to service professional availability in your area.',
      'Urban Power reserves the right to reassign service professionals to ensure timely service delivery.',
      'You agree to provide accurate service address details, be present or arrange access at the booked time, and provide a safe working environment for our professionals.',
      'Urban Power does not guarantee specific service professionals for any booking.',
      'Services are provided during scheduled hours only. Emergency or off-hours requests may incur additional charges.',
    ],
  },
  {
    heading: 'Pricing and Payments',
    body: [
      'All prices are displayed in Indian Rupees (INR) inclusive of applicable taxes unless otherwise stated.',
      'Prices are subject to change without prior notice. The price confirmed at booking is the price you will be charged.',
      'Payment is due at the time of booking or upon service completion, as indicated in the app.',
      'We accept UPI, debit/credit cards, net banking, and Urban Power wallet credits.',
      'Urban Power is not liable for any payment failures caused by your bank or payment provider.',
    ],
  },
  {
    heading: 'Prohibited Conduct',
    body: [
      'You agree not to use the platform for any unlawful purpose or in violation of these Terms.',
      'You must not harass, abuse, threaten, or discriminate against service professionals.',
      'You must not attempt to contact or hire service professionals directly to bypass the Urban Power platform.',
      'You must not submit false, misleading, or fraudulent bookings or reviews.',
      'Violation of these prohibitions may result in immediate account termination and legal action where applicable.',
    ],
  },
  {
    heading: 'Ratings and Reviews',
    body: 'After each completed service, you may submit a rating and review. Reviews must be honest, accurate, and respectful. Urban Power reserves the right to remove reviews that are abusive, fraudulent, or violate our community guidelines. Repeated submission of false reviews may result in account suspension.',
  },
  {
    heading: 'Intellectual Property',
    body: 'All content on the Urban Power platform — including but not limited to logos, trademarks, text, graphics, and software — is the exclusive property of Urban Power Services Pvt. Ltd. and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without our express written permission.',
  },
  {
    heading: 'Limitation of Liability',
    body: [
      'Urban Power provides the platform "as is" and "as available" without warranties of any kind, express or implied.',
      'Urban Power shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.',
      'Our total liability for any claim arising under these Terms shall not exceed the amount you paid for the specific service that is the subject of the claim.',
      'Urban Power is not liable for service quality disputes beyond facilitating communication between the customer and the service professional.',
    ],
  },
  {
    heading: 'Governing Law and Dispute Resolution',
    body: 'These Terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India. We encourage you to contact us first to resolve disputes amicably before initiating legal proceedings.',
  },
  {
    heading: 'Modifications to Terms',
    body: 'Urban Power reserves the right to modify these Terms at any time. We will notify you of material changes through in-app notifications or email. Your continued use of the app after changes are posted constitutes your acceptance of the revised Terms.',
  },
  {
    heading: 'Contact',
    body: 'For questions or concerns about these Terms, please contact:\n\nEmail: legal@urbanpowers.com\nUrban Power Services Pvt. Ltd., India',
  },
];

export default function TermsAndConditionsScreen() {
  return (
    <LegalScreen
      title="Terms & Conditions"
      lastUpdated={LAST_UPDATED}
      intro={INTRO}
      sections={SECTIONS}
    />
  );
}
