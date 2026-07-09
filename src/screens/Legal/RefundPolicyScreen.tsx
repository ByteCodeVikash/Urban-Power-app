import React from 'react';
import LegalScreen, { LegalSection } from './LegalScreen';

const LAST_UPDATED = 'June 1, 2025';

const INTRO =
  'Urban Power is committed to delivering high-quality services. We understand that situations may arise where a cancellation or refund is necessary. This policy outlines the terms under which cancellations, rescheduling, and refunds are processed.';

const SECTIONS: LegalSection[] = [
  {
    heading: 'Cancellation by Customer',
    body: [
      'Free Cancellation Window: You may cancel a booking without any charge if the cancellation is made at least 4 hours before the scheduled service start time.',
      'Late Cancellation (within 4 hours): A cancellation fee of ₹99 or 20% of the booking value (whichever is lower) will be charged if the booking is cancelled within 4 hours of the scheduled time.',
      'No-Show: If you are unavailable at the service address at the scheduled time and no advance cancellation was made, the full booking amount will be forfeited.',
      'To cancel a booking, use the "My Bookings" section in the app. Cancellations cannot be processed via phone or email.',
    ],
  },
  {
    heading: 'Cancellation by Urban Power',
    body: [
      'Urban Power reserves the right to cancel a booking in cases of unavailability of service professionals, safety concerns, or unforeseen circumstances such as severe weather or natural events.',
      'In such cases, you will receive a full refund of the booking amount within 5–7 business days, or you may reschedule at no additional charge.',
      'Urban Power will make reasonable efforts to notify you as early as possible in case of a cancellation on our end.',
    ],
  },
  {
    heading: 'Rescheduling Policy',
    body: [
      'You may reschedule a booking up to 2 hours before the scheduled service time at no charge.',
      'Rescheduling requests made within 2 hours of the service start time may be treated as a late cancellation and subject to the applicable fee.',
      'You may reschedule a booking a maximum of 2 times. After 2 reschedules, any further changes will be treated as a cancellation.',
    ],
  },
  {
    heading: 'Refund Eligibility',
    body: [
      'Service Not Rendered: If a service was booked and paid for but not delivered by the assigned professional, you are entitled to a full refund.',
      'Service Quality Issue: If you are dissatisfied with a completed service, you must raise a complaint within 24 hours of service completion through the app. Our quality team will review the complaint and may offer a partial refund, re-service at no charge, or credit to your Urban Power wallet, at our discretion.',
      'Duplicate Payment: If your payment was charged more than once for the same booking, the excess amount will be refunded within 5–7 business days.',
      'Incorrect Charge: If you were charged an amount different from the quoted booking price, the difference will be refunded after verification.',
    ],
  },
  {
    heading: 'Non-Refundable Situations',
    body: [
      'Refunds will not be issued for services that were fully and satisfactorily completed.',
      'Refunds will not be processed for dissatisfaction arising from scope-of-work requests that were outside the originally booked service.',
      'Urban Power wallet credits used for a booking are non-refundable to the original payment method; they will be re-credited to your wallet.',
      'Refunds will not be issued for promotional or discounted bookings where the refund condition was explicitly stated as non-refundable at the time of booking.',
    ],
  },
  {
    heading: 'Refund Process and Timeline',
    body: [
      'Approved refunds are processed within 2 business days of approval.',
      'The credit will appear in your original payment source within 5–7 business days, depending on your bank or payment provider.',
      'Urban Power Wallet refunds are instant and will reflect immediately in your wallet balance.',
      'Refund status can be tracked in the "My Bookings" section of the app.',
    ],
  },
  {
    heading: 'Service Warranty',
    body: 'Urban Power offers a 7-day service warranty on completed jobs. If the same issue recurs within 7 days of the original service, we will send a professional to resolve it at no additional charge, subject to verification that the issue is related to the original service performed.',
  },
  {
    heading: 'How to Raise a Refund Request',
    body: [
      '1. Open the Urban Power app and go to "My Bookings".',
      '2. Select the relevant booking and tap "Report an Issue".',
      '3. Describe the issue and attach relevant photos if applicable.',
      '4. Our support team will respond within 24 hours and process eligible refunds within the timelines described above.',
      'For escalations, contact us at support@urbanpowers.com.',
    ],
  },
];

export default function RefundPolicyScreen() {
  return (
    <LegalScreen
      title="Refund & Cancellation Policy"
      lastUpdated={LAST_UPDATED}
      intro={INTRO}
      sections={SECTIONS}
    />
  );
}
