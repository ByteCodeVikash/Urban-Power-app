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

    console.log('[FirebaseAuthService] sendOtp() initiated.', {
      isFirebaseAvailable,
      originalPhone: phoneNumber,
      formattedPhone,
    });

    if (isFirebaseAvailable) {
      const firebaseAuth = require('@react-native-firebase/auth').default;
      try {
        console.log(
          '[FirebaseAuthService] Invoking native signInWithPhoneNumber for:',
          formattedPhone,
        );
        const confirmation =
          await firebaseAuth().signInWithPhoneNumber(formattedPhone);
        console.log(
          '[FirebaseAuthService] Native confirmation object returned.',
          {
            verificationId: confirmation?.verificationId,
            hasConfirm: typeof confirmation?.confirm === 'function',
          },
        );
        return confirmation;
      } catch (error: any) {
        console.log("--- FIREBASE SEND OTP ERROR DETECTED ---");
        console.log("error:", error);
        console.log("error.message:", error?.message);
        console.log("error.code:", error?.code);
        console.log("error.stack:", error?.stack);
        console.log("phoneNumber:", formattedPhone);
        console.log("-----------------------------------------");
        console.error('[FirebaseAuthService] sendOtp failed detailed error:', {
          code: error?.code,
          message: error?.message,
          stack: error?.stack,
          rawError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
        throw error;
      }
    } else {
      console.warn(
        '[FirebaseAuthService] Native Firebase Auth is not available in this environment.',
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
    console.log('[FirebaseAuthService] verifyOtp() initiated.', {
      code,
      verificationId: confirmation?.verificationId,
    });
    try {
      console.log('[FirebaseAuthService] Invoking confirmation.confirm...');
      const result = await confirmation.confirm(code);
      const user = result.user;
      console.log(
        '[FirebaseAuthService] Native confirmation successful. User retrieved:',
        {
          uid: user?.uid,
          phoneNumber: user?.phoneNumber,
          displayName: user?.displayName,
        },
      );
      console.log('[FirebaseAuthService] Retrieving Firebase ID token...');
      const idToken = await user.getIdToken();
      console.log(
        '[FirebaseAuthService] Firebase ID token successfully retrieved. Length:',
        idToken?.length,
      );
      return {
        idToken,
        phoneNumber: user.phoneNumber || '',
      };
    } catch (error: any) {
      console.log("--- FIREBASE VERIFY OTP ERROR DETECTED ---");
      console.log("error:", error);
      console.log("error.message:", error?.message);
      console.log("error.code:", error?.code);
      console.log("error.stack:", error?.stack);
      console.log("verificationId:", confirmation?.verificationId);
      console.log("credential:", error?.credential);
      console.log("-------------------------------------------");
      console.error('[FirebaseAuthService] verifyOtp failed detailed error:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
        rawError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    }
  },
};
