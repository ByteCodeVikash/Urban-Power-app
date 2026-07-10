import { NativeModules } from 'react-native';

const isGoogleSigninAvailable = !!NativeModules.RNGoogleSignin;

export const googleAuthService = {
  isAvailable: isGoogleSigninAvailable,

  configure: () => {
    console.log(
      '[GoogleAuthService] configure() called. isGoogleSigninAvailable:',
      isGoogleSigninAvailable,
    );
    if (isGoogleSigninAvailable) {
      try {
        const {
          GoogleSignin,
        } = require('@react-native-google-signin/google-signin');

        let webClientId = '';
        try {
          const googleServices = require('../../google-services.json');
          const clients = googleServices?.client || [];
          for (const client of clients) {
            const oauthClients = client?.oauth_client || [];
            const webClient = oauthClients.find(
              (o: any) => o.client_type === 3,
            );
            if (webClient?.client_id) {
              webClientId = webClient.client_id;
              break;
            }
          }
        } catch (e) {
          console.warn(
            '[GoogleAuthService] Failed to load client ID from google-services.json:',
            e,
          );
        }

        console.log(
          '[GoogleAuthService] Calling GoogleSignin.configure with webClientId:',
          webClientId,
        );
        GoogleSignin.configure({
          webClientId: webClientId,
          offlineAccess: false,
        });
        console.log(
          '[GoogleAuthService] GoogleSignin.configure successfully executed.',
        );
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
    console.log(
      '[GoogleAuthService] signIn() started. isGoogleSigninAvailable:',
      isGoogleSigninAvailable,
    );
    if (isGoogleSigninAvailable) {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      try {
        console.log('[GoogleAuthService] Checking Play Services...');
        await GoogleSignin.hasPlayServices();
        console.log(
          '[GoogleAuthService] Play Services checked. Requesting native GoogleSignin.signIn...',
        );
        const userInfo = await GoogleSignin.signIn();
        console.log(
          '[GoogleAuthService] Native GoogleSignin.signIn success response received.',
        );

        // Handle both older v10 and newer v11/v12+ structures
        const data = userInfo.data ? userInfo.data : userInfo;
        console.log(
          '[GoogleAuthService] Parsed native user data envelope keys:',
          Object.keys(data),
        );
        const idToken = data.idToken;
        const email = data.user.email;
        const name =
          data.user.name ||
          `${data.user.givenName || ''} ${data.user.familyName || ''}`.trim() ||
          'Google User';
        const photo = data.user.photo || '';

        console.log('[GoogleAuthService] Retrieved user profile:', {
          email,
          name,
          hasIdToken: !!idToken,
          idTokenSnippet: idToken ? `${idToken.substring(0, 15)}...` : 'null',
        });

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
        console.log('--- GOOGLE SIGN-IN ERROR DETECTED ---');
        console.log('error:', error);
        console.log('error.message:', error?.message);
        console.log('error.code:', error?.code);
        console.log('error.stack:', error?.stack);
        console.log('Google Sign-In error.code:', error?.code);
        console.log('Google Sign-In error.message:', error?.message);
        console.log('Google Sign-In nativeStatus:', error?.nativeStatus);
        console.log('Google Sign-In statusCodes:', error?.statusCodes);
        console.log('-------------------------------------');
        console.error('[GoogleAuthService] Native Sign-in error details:', {
          code: error?.code,
          message: error?.message,
          stack: error?.stack,
          rawError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
        throw error;
      }
    } else {
      if (__DEV__) {
        console.log(
          '[GoogleAuthService] Native module unavailable. Dev mode simulation starting...',
        );
        // Dev-only: simulate sign-in when native module is unavailable
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('[GoogleAuthService] Dev mode simulation successful.');
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
    console.log('[GoogleAuthService] signOut() called.');
    if (isGoogleSigninAvailable) {
      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      try {
        await GoogleSignin.signOut();
        console.log(
          '[GoogleAuthService] Native GoogleSignin.signOut successful.',
        );
      } catch (error) {
        console.error('[GoogleAuthService] Sign-out error:', error);
      }
    } else {
      console.log(
        '[GoogleAuthService] Native module unavailable. Skipping signOut.',
      );
    }
  },
};
