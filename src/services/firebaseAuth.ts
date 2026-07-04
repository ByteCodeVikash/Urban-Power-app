import { NativeModules } from 'react-native';

// Check if React Native Firebase modules are available in the current runtime (e.g. not Expo Go)
const isFirebaseAvailable =
  !!NativeModules.RNFBAppModule && !!NativeModules.RNFBAuthModule;

export interface ConfirmationResult {
  confirm: (code: string) => Promise<any>;
  verificationId: string | null;
}

export const firebaseAuthService = {
  isNative: isFirebaseAvailable,

  sendOtp: async (phoneNumber: string): Promise<ConfirmationResult> => {
    // Standardize to E.164 format: e.g. +91XXXXXXXXXX
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = `+91${formattedPhone}`;
      } else {
        formattedPhone = `+${formattedPhone}`;
      }
    }

    console.log(
      '[OTP Login Flow] Firebase sendOtp() start. Phone:',
      formattedPhone,
    );

    if (isFirebaseAvailable) {
      const firebaseAuth = require('@react-native-firebase/auth').default;
      console.log('[FirebaseAuthService] Sending OTP to:', formattedPhone);
      try {
        const confirmation =
          await firebaseAuth().signInWithPhoneNumber(formattedPhone);
        console.log(
          '[OTP Login Flow] Firebase sendOtp() success. Verification ID:',
          confirmation ? confirmation.verificationId : 'null',
        );
        return confirmation;
      } catch (error: any) {
        console.error(
          '[OTP Login Flow] Firebase sendOtp() failed. Error:',
          error?.message || error,
          'Stack:',
          error?.stack,
        );
        throw error;
      }
    } else {
      console.error(
        '[OTP Login Flow] Firebase sendOtp() failed: Firebase not available in environment.',
      );
      throw new Error(
        'Firebase Authentication is not available in the current environment.',
      );
    }
  },

  verifyOtp: async (
    confirmation: ConfirmationResult,
    code: string,
  ): Promise<{ idToken: string; phoneNumber: string }> => {
    try {
      const result = await confirmation.confirm(code);
      const user = result.user;
      const idToken = await user.getIdToken();
      return {
        idToken,
        phoneNumber: user.phoneNumber || '',
      };
    } catch (error) {
      console.error('[FirebaseAuthService] Verification error:', error);
      throw error;
    }
  },
};
