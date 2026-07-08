import { NativeModules } from 'react-native';

const isGoogleSigninAvailable = !!NativeModules.RNGoogleSignin;

export const googleAuthService = {
  isAvailable: isGoogleSigninAvailable,

  configure: () => {
    if (isGoogleSigninAvailable) {
      try {
        const {
          GoogleSignin,
        } = require('@react-native-google-signin/google-signin');
        GoogleSignin.configure({
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
          offlineAccess: true,
        });
      } catch (error) {
        console.error('[GoogleAuthService] Configuration error:', error);
      }
    }
  },

  signIn: async (): Promise<{
    idToken: string;
    email: string;
    name: string;
    photo: string;
  }> => {
    if (isGoogleSigninAvailable) {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        // Handle both older v10 and newer v11/v12+ structures
        const data = userInfo.data ? userInfo.data : userInfo;
        const idToken = data.idToken;
        const email = data.user.email;
        const name =
          data.user.name ||
          `${data.user.givenName || ''} ${data.user.familyName || ''}`.trim() ||
          'Google User';
        const photo = data.user.photo || '';

        if (!idToken) {
          throw new Error('Google Sign-In: ID Token is null.');
        }

        return {
          idToken,
          email,
          name,
          photo,
        };
      } catch (error: any) {
        console.error('[GoogleAuthService] Sign-in error:', error);
        throw error;
      }
    } else {
      if (__DEV__) {
        // Dev-only: simulate sign-in when native module is unavailable
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
          idToken: `google-dev-${Date.now()}`,
          email: 'dev.test@urbanpower.app',
          name: 'Dev Test User',
          photo: '',
        };
      }
      throw new Error(
        'Google Sign-In is not available. Please ensure the app is installed correctly.',
      );
    }
  },

  signOut: async (): Promise<void> => {
    if (isGoogleSigninAvailable) {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.error('[GoogleAuthService] Sign-out error:', error);
      }
    } else {
      // Native module unavailable — nothing to sign out from
    }
  },
};
