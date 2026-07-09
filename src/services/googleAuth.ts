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

        let webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
        console.log(
          '[GoogleAuthService] Initial EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID from process.env:',
          webClientId,
        );

        // Dynamic fallback: read from google-services.json if env variable is empty
        if (!webClientId) {
          try {
            console.log(
              '[GoogleAuthService] Env client ID is empty. Attempting fallback to google-services.json',
            );
            const googleServices = require('../../google-services.json');
            const clients = googleServices?.client || [];
            console.log(
              '[GoogleAuthService] Found clients in google-services.json:',
              clients.length,
            );
            for (const client of clients) {
              const oauthClients = client?.oauth_client || [];
              console.log(
                '[GoogleAuthService] Checking package:',
                client?.client_info?.android_client_info?.package_name,
                'with oauthClients count:',
                oauthClients.length,
              );
              const webClient = oauthClients.find(
                (o: any) => o.client_type === 3,
              );
              if (webClient?.client_id) {
                webClientId = webClient.client_id;
                console.log(
                  '[GoogleAuthService] Found web client ID in google-services.json:',
                  webClientId,
                );
                break;
              }
            }
          } catch (e) {
            console.warn(
              '[GoogleAuthService] Failed to load client ID from google-services.json:',
              e,
            );
          }
        }

        console.log(
          '[GoogleAuthService] Calling GoogleSignin.configure with webClientId:',
          webClientId,
        );
        GoogleSignin.configure({
          webClientId: webClientId,
          offlineAccess: true,
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
