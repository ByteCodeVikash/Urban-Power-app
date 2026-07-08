import { Alert } from 'react-native';

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise (₹ * 100)
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: { color: string };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Opens the Razorpay checkout sheet.
 * Falls back to a simulated Alert dialog when the native module isn't linked
 * (e.g. in Expo Go / web environments).
 */
export const openRazorpayCheckout = async (
  options: RazorpayOptions,
): Promise<RazorpaySuccessResponse> => {
  // 1. Try to use the real native Razorpay SDK
  try {
    // Dynamic require avoids a hard crash when the native lib isn't linked
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RazorpayCheckout = require('react-native-razorpay').default;
    if (RazorpayCheckout && typeof RazorpayCheckout.open === 'function') {
      const response = await RazorpayCheckout.open(options);
      return response as RazorpaySuccessResponse;
    }
  } catch (err) {
    if (!__DEV__) {
      throw new Error(
        'Payment gateway unavailable. Please update the app and try again.',
      );
    }
    console.warn(
      '[Razorpay] Native module unavailable – using dev fallback. Error:',
      err,
    );
  }

  // 2. Dev-only simulated checkout (never runs in production builds)
  if (!__DEV__) {
    throw new Error(
      'Payment gateway unavailable. Please update the app and try again.',
    );
  }

  return new Promise<RazorpaySuccessResponse>((resolve, reject) => {
    Alert.alert(
      'Razorpay Payment (Dev Simulation)',
      `Simulate payment of ₹${(options.amount / 100).toFixed(2)} for "${options.description}"?`,
      [
        {
          text: '✅ Pay Successfully',
          onPress: () => {
            const devPaymentId = `pay_dev_${Math.random().toString(36).substring(2, 11)}`;
            resolve({
              razorpay_payment_id: devPaymentId,
              razorpay_order_id: options.order_id,
              razorpay_signature: 'dev_signature_only',
            });
          },
        },
        {
          text: '❌ Cancel',
          onPress: () => {
            reject({ code: 2, description: 'Payment cancelled by user' });
          },
          style: 'cancel',
        },
      ],
      { cancelable: false },
    );
  });
};
