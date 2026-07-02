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
        // Configure with a default webClientId for local environment
        GoogleSignin.configure({
          webClientId:
            '356047649885-mockwebclientid.apps.googleusercontent.com',
          offlineAccess: true,
        });
      } catch (error) {
        console.error('[GoogleAuthService] Configuration error:', error);
      }
    } else {
      console.log(
        '[GoogleAuthService] Native Google Sign-In module is not available. Using mock mode.',
      );
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
      console.log('[GoogleAuthService] Triggered mock sign-in.');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Use a mock user details matching the backend structure
      const mockEmail = 'alice.smith@example.com';
      const mockName = 'Alice Smith';
      const mockPhoto =
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop';
      const mockIdToken = `google-mock-${mockEmail}-${mockName.replace(/\s+/g, '_')}-${mockPhoto}`;

      return {
        idToken: mockIdToken,
        email: mockEmail,
        name: mockName,
        photo: mockPhoto,
      };
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
      console.log('[GoogleAuthService] Triggered mock sign-out.');
    }
  },
};
