import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Text,
} from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { ArrowLeft, AlertCircle, PhoneCall } from 'lucide-react-native';
import { useAuthStore, UserRole } from '../../store/useAuthStore';
import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { firebaseAuthService } from '../../services/firebaseAuth';
import { api } from '../../services/api';
import { OtpInput } from '../../components/OtpInput';
import { googleAuthService } from '../../services/googleAuth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GoogleButtonProps {
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({
  onPress,
  disabled,
  loading,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withTiming(0.98, { duration: 120 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.googleButton,
        (disabled || loading) && styles.googleButtonDisabled,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#1F2937" size="small" />
      ) : (
        <View style={styles.googleButtonContent}>
          <Image
            source={require('../../../assets/google_logo.png')}
            style={styles.googleIcon}
          />
          <Typography
            variant="body1"
            weight="600"
            style={styles.googleButtonText}
          >
            Continue with Google
          </Typography>
        </View>
      )}
    </AnimatedPressable>
  );
};

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const login = useAuthStore(state => state.login);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const requiredOtpLength = firebaseAuthService.isNative ? 6 : 4;

  const stepRef = useRef(step);
  const loadingRef = useRef(loading);
  const isBackendVerifying = useRef(false);
  const isVerificationInProgress = useRef(false);
  const phoneNumberRef = useRef(phoneNumber);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    phoneNumberRef.current = phoneNumber;
  }, [phoneNumber]);

  // Clear any stale firebase auth session on mount to prevent false-positive auto-verifications
  useEffect(() => {
    if (firebaseAuthService.isNative) {
      const firebaseAuth = require('@react-native-firebase/auth').default;
      firebaseAuth()
        .signOut()
        .catch((_err: any) => {
          // Silently ignore — stale session cleanup is best-effort
        });
    }
  }, []);

  // Listen to Firebase Auth state changes for auto-verification on Android
  useEffect(() => {
    if (!firebaseAuthService.isNative) return;

    const firebaseAuth = require('@react-native-firebase/auth').default;
    const unsubscribe = firebaseAuth().onAuthStateChanged(async (user: any) => {
      console.log('[LoginScreen] onAuthStateChanged triggered.', {
        userUid: user?.uid,
        userPhone: user?.phoneNumber,
        currentStep: stepRef.current,
        isVerificationInProgress: isVerificationInProgress.current,
        isBackendVerifying: isBackendVerifying.current,
      });

      // If user is logged in to Firebase and we have verification in progress
      if (
        user &&
        (stepRef.current === 'OTP' || isVerificationInProgress.current)
      ) {
        if (isBackendVerifying.current) {
          console.log(
            '[LoginScreen] Backend verification is already in progress, skipping duplicate.',
          );
          return;
        }

        isBackendVerifying.current = true;
        if (!loadingRef.current) {
          loadingRef.current = true;
          setLoading(true);
        }
        setError(null);
        let idToken = '';
        try {
          console.log(
            '[LoginScreen] Retrieving Firebase ID Token for backend validation...',
          );
          idToken = await user.getIdToken();
          const verifiedPhone =
            user.phoneNumber || `+91${phoneNumberRef.current}`;
          console.log(
            '[LoginScreen] ID token retrieved. Exchanging with backend `/verify-otp` for:',
            verifiedPhone,
          );

          // Exchange token with backend
          const response = await api.auth.verifyOtp(verifiedPhone, idToken);
          console.log('JWT response:', JSON.stringify(response));
          console.log('[LoginScreen] Backend verifyOtp response success:', {
            hasUser: !!response?.user,
            role: response?.user?.role,
            fullName: response?.user?.full_name,
            hasAccessToken: !!response?.access_token,
          });

          // Complete login and navigate directly to Dashboard
          let role: UserRole = 'Customer';
          if (response.user?.role === 'admin') {
            role = 'Admin';
          } else if (
            response.user?.role === 'provider' ||
            response.user?.role === 'technician'
          ) {
            role = 'Technician';
          }
          const name =
            response.user?.full_name ||
            response.user?.name ||
            'Urban Power User';
          const id = response.user?.id || Math.random().toString();

          isVerificationInProgress.current = false;
          login(verifiedPhone, role, name, id, response.access_token);
        } catch (err: any) {
          console.log('--- AUTO-LOGIN/VERIFY-OTP BACKEND EXCHANGE ERROR ---');
          console.log('error:', err);
          console.log('error.message:', err?.message);
          console.log('error.response:', err?.response);
          console.log('error.response.status:', err?.response?.status);
          console.log('error.response.data:', err?.response?.data);
          console.log('error.code:', err?.code);
          console.log('error.stack:', err?.stack);
          console.log('axios config:', err?.config);
          console.log('request url:', err?.config?.url);
          console.log('request body:', err?.config?.data);
          console.log('request headers:', err?.config?.headers);
          console.log('Firebase ID Token:', idToken);
          console.log('verificationId:', confirmation?.verificationId);
          console.log('credential:', user?.credential || err?.credential);
          console.log('backend endpoint:', '/api/v1/auth/verify-otp');
          console.log('JWT response:', null);
          console.log('---------------------------------------------------');
          console.error(
            '[LoginScreen] Auto-login backend exchange detailed error:',
            {
              message: err?.message,
              code: err?.code,
              responseStatus: err?.response?.status,
              responseData: err?.response?.data,
              stack: err?.stack,
              rawError: JSON.stringify(err, Object.getOwnPropertyNames(err)),
            },
          );
          setError(err?.message || 'Verification failed. Please try again.');
          isVerificationInProgress.current = false;
          isBackendVerifying.current = false;
          loadingRef.current = false;
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, [login]);

  // Initialize Google Sign-In SDK on mount
  useEffect(() => {
    console.log(
      '[LoginScreen] Component mounted. Initializing Google Sign-In...',
    );
    googleAuthService.configure();
  }, []);

  // Timer countdown handler
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Auto-submit OTP when length criteria is met
  useEffect(() => {
    if (otp.length === requiredOtpLength && step === 'OTP' && !loading) {
      console.log('[LoginScreen] Auto-submitting OTP of length', otp.length);
      handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleGoogleLogin = async () => {
    console.log('[LoginScreen] handleGoogleLogin requested.');
    setGoogleLoading(true);
    setLoading(true);
    setError(null);
    let idTokenVar: any = null;
    try {
      // 1. Trigger Google login flow
      console.log('[LoginScreen] Launching googleAuthService.signIn...');
      const { idToken, name } = await googleAuthService.signIn();
      idTokenVar = idToken;
      console.log(
        '[LoginScreen] googleAuthService.signIn success. Exchanging token with backend...',
      );

      // 2. Exchange token with backend
      const response = await api.auth.googleLogin(idToken);
      console.log('JWT response:', JSON.stringify(response));
      console.log(
        '[LoginScreen] Backend googleLogin success response received:',
        {
          hasUser: !!response?.user,
          role: response?.user?.role,
          hasAccessToken: !!response?.access_token,
        },
      );

      // 3. Complete login
      let userRole: UserRole = 'Customer';
      if (response.user?.role === 'admin') userRole = 'Admin';
      else if (response.user?.role === 'technician') userRole = 'Technician';

      const userName = response.user?.full_name || name;
      const userId = response.user?.id || Math.random().toString();
      const userPhone = response.user?.phone || '';

      // Complete login immediately
      login(userPhone, userRole, userName, userId, response.access_token);
    } catch (err: any) {
      console.log('--- GOOGLE LOGIN ERROR ---');
      console.log('error:', err);
      console.log('error.message:', err?.message);
      console.log('error.response:', err?.response);
      console.log('error.response.status:', err?.response?.status);
      console.log('error.response.data:', err?.response?.data);
      console.log('error.code:', err?.code);
      console.log('error.stack:', err?.stack);
      console.log('axios config:', err?.config);
      console.log('request url:', err?.config?.url);
      console.log('request body:', err?.config?.data);
      console.log('request headers:', err?.config?.headers);
      console.log('Firebase ID Token:', idTokenVar);
      console.log('backend endpoint:', '/api/v1/auth/google-login');
      console.log('Google Sign-In error.code:', err?.code);
      console.log('Google Sign-In error.message:', err?.message);
      console.log('Google Sign-In nativeStatus:', err?.nativeStatus);
      console.log('Google Sign-In statusCodes:', err?.statusCodes);
      console.log('JWT response:', null);
      console.log('--------------------------');
      console.error('[LoginScreen] Google Login detailed error:', {
        message: err?.message,
        code: err?.code,
        responseStatus: err?.response?.status,
        responseData: err?.response?.data,
        stack: err?.stack,
        rawError: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      // Skip error banners for user cancellations
      if (err?.message !== 'SIGN_IN_CANCELLED' && err?.code !== '12501') {
        setError(err?.message || 'Google Sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
      setLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned);
    if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError('Enter a valid 10-digit number');
    } else {
      setPhoneError(null);
    }
  };

  const handleSendOtp = async () => {
    console.log(
      '[LoginScreen] handleSendOtp requested for phone number:',
      phoneNumber,
    );
    if (phoneNumber.length < 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }
    if (loadingRef.current) {
      console.log('[LoginScreen] handleSendOtp skipped: load lock is active.');
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setPhoneError(null);
    isVerificationInProgress.current = true;
    try {
      console.log('[LoginScreen] Invoking firebaseAuthService.sendOtp...');
      const confirmResult = await firebaseAuthService.sendOtp(phoneNumber);
      console.log(
        '[LoginScreen] sendOtp resolved. Storing confirmation & switching step to OTP.',
      );
      setConfirmation(confirmResult);
      setStep('OTP');
      setResendTimer(30); // 30-second resend limit
      setOtp(''); // clear previous OTP
    } catch (err: any) {
      isVerificationInProgress.current = false;
      console.log('--- SEND OTP ERROR ---');
      console.log('error:', err);
      console.log('error.message:', err?.message);
      console.log('error.response:', err?.response);
      console.log('error.response.status:', err?.response?.status);
      console.log('error.response.data:', err?.response?.data);
      console.log('error.code:', err?.code);
      console.log('error.stack:', err?.stack);
      console.log('axios config:', err?.config);
      console.log('request url:', err?.config?.url);
      console.log('request body:', err?.config?.data);
      console.log('request headers:', err?.config?.headers);
      console.log('phoneNumber:', phoneNumber);
      console.log('backend endpoint:', '/api/v1/auth/send-otp');
      console.log('-----------------------');
      console.error('[LoginScreen] Send OTP detailed error:', {
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
        rawError: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      setError(
        err?.message || 'Failed to send verification code. Please try again.',
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    console.log('[LoginScreen] handleVerifyOtp requested with code:', otp);
    if (otp.length < requiredOtpLength) return;
    if (loadingRef.current || isBackendVerifying.current) {
      console.log(
        '[LoginScreen] handleVerifyOtp skipped: verification or loading lock active.',
      );
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    isVerificationInProgress.current = true;
    try {
      if (!confirmation) {
        throw new Error(
          'No active verification session. Please request a new OTP.',
        );
      }

      // Check if user is already signed in natively (auto-verification succeeded)
      const firebaseAuth = require('@react-native-firebase/auth').default;
      const currentUser = firebaseAuth().currentUser;
      console.log(
        '[LoginScreen] Checking current native user before confirmation:',
        currentUser?.uid,
      );
      if (currentUser) {
        console.log(
          '[LoginScreen] User already signed in natively. Skipping manual confirmation.',
        );
        return;
      }

      // Verify OTP with Firebase
      console.log('[LoginScreen] Invoking confirmation.confirm...');
      await confirmation.confirm(otp);
      console.log('[LoginScreen] confirmation.confirm resolved.');
      // The onAuthStateChanged listener handles backend validation and Zustand state updates.
    } catch (err: any) {
      console.log('--- VERIFY OTP ERROR ---');
      console.log('error:', err);
      console.log('error.message:', err?.message);
      console.log('error.code:', err?.code);
      console.log('error.stack:', err?.stack);
      console.log('verificationId:', confirmation?.verificationId);
      console.log('otp:', otp);
      console.log('credential:', err?.credential);
      console.log('------------------------');
      // If the user has already signed in natively or backend verification is in progress,
      // we can ignore the 'session-expired' or similar error.
      const firebaseAuth = require('@react-native-firebase/auth').default;
      const isAlreadySignedIn = !!firebaseAuth().currentUser;
      const isSessionExpired =
        err?.code === 'auth/session-expired' ||
        err?.message?.includes('session-expired') ||
        err?.message?.includes('expired');

      console.warn('[LoginScreen] Verify OTP handler caught error:', {
        message: err?.message,
        code: err?.code,
        isAlreadySignedIn,
        isBackendVerifying: isBackendVerifying.current,
      });

      if (
        isAlreadySignedIn ||
        isBackendVerifying.current ||
        (isAlreadySignedIn && isSessionExpired)
      ) {
        console.log(
          '[LoginScreen] Ignored manual verification error since user is already signed in natively:',
          err?.message || err,
        );
        return;
      }

      isVerificationInProgress.current = false;
      console.error('[LoginScreen] Verify OTP detailed error:', {
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
        rawError: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      setError(
        err?.message ||
          'Verification failed. Please check the code and try again.',
      );
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    if (loadingRef.current) return;
    setStep('PHONE');
    setError(null);
    setOtp('');
    isVerificationInProgress.current = false;
    if (firebaseAuthService.isNative) {
      const firebaseAuth = require('@react-native-firebase/auth').default;
      firebaseAuth()
        .signOut()
        .catch((_err: any) => {
          // Silently ignore — best-effort cleanup
        });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              {step === 'OTP' && (
                <Pressable
                  onPress={handleBackToPhone}
                  style={styles.backButton}
                  disabled={loading}
                >
                  <ArrowLeft size={24} color={Colors.light.text} />
                </Pressable>
              )}
              <View style={styles.iconWrapper}>
                <Image
                  source={require('../../../assets/app_logo.jpeg')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Typography
                variant="body2"
                color={Colors.light.textSecondary}
                weight="700"
                style={styles.tagline}
              >
                Professional • Trusted • On-Demand
              </Typography>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.welcomeSection}>
                <Typography
                  variant="h2"
                  weight="700"
                  style={styles.welcomeTitle}
                >
                  {step === 'PHONE' ? 'Welcome back' : 'Verify OTP'}
                </Typography>
                <Typography
                  variant="body1"
                  color={Colors.light.textSecondary}
                  weight="600"
                  style={styles.welcomeSubtitle}
                >
                  {step === 'PHONE'
                    ? 'Enter your mobile number'
                    : `Enter the code sent to +91 ${phoneNumber}`}
                </Typography>
              </View>

              {error && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.errorBanner}
                >
                  <AlertCircle size={18} color={Colors.light.error} />
                  <Typography
                    variant="caption"
                    color={Colors.light.error}
                    weight="600"
                    style={styles.errorText}
                  >
                    {error}
                  </Typography>
                </Animated.View>
              )}

              {step === 'PHONE' ? (
                <View style={styles.inputStepContainer}>
                  <View
                    style={[
                      styles.inputContainer,
                      phoneError ? styles.inputContainerError : null,
                    ]}
                  >
                    <View style={styles.countryCode}>
                      <Typography
                        variant="body1"
                        weight="700"
                        color={Colors.light.primary}
                      >
                        +91
                      </Typography>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Mobile Number"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                      placeholderTextColor={Colors.light.textMuted}
                      editable={!loading}
                    />
                  </View>
                  {phoneError && (
                    <Typography
                      variant="caption"
                      color={Colors.light.error}
                      style={styles.helperText}
                    >
                      {phoneError}
                    </Typography>
                  )}
                </View>
              ) : (
                <Animated.View entering={FadeIn.duration(300)}>
                  <OtpInput
                    value={otp}
                    onChangeText={setOtp}
                    length={requiredOtpLength}
                    error={!!error}
                    disabled={loading}
                  />
                </Animated.View>
              )}

              <Button
                title={step === 'PHONE' ? 'Get OTP' : 'Verify & Continue'}
                onPress={step === 'PHONE' ? handleSendOtp : handleVerifyOtp}
                loading={loading}
                disabled={
                  step === 'PHONE'
                    ? phoneNumber.length < 10 || !!phoneError
                    : otp.length < requiredOtpLength
                }
                size="lg"
                style={styles.button}
              />

              {step === 'PHONE' && (
                <>
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Typography
                      variant="caption"
                      color={Colors.light.textMuted}
                      style={styles.dividerText}
                      weight="600"
                    >
                      OR
                    </Typography>
                    <View style={styles.dividerLine} />
                  </View>

                  <GoogleButton
                    onPress={handleGoogleLogin}
                    disabled={loading}
                    loading={googleLoading}
                  />
                </>
              )}

              {step === 'OTP' && (
                <View style={styles.otpActions}>
                  {resendTimer > 0 ? (
                    <Typography
                      variant="body2"
                      color={Colors.light.textMuted}
                      weight="600"
                      style={styles.resendTimerText}
                    >
                      Resend OTP in {resendTimer}s
                    </Typography>
                  ) : (
                    <Pressable
                      onPress={handleSendOtp}
                      disabled={loading}
                      style={({ pressed }) => [
                        styles.resendBtn,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <PhoneCall size={16} color={Colors.light.primary} />
                      <Typography
                        variant="body2"
                        color={Colors.light.primary}
                        weight="700"
                        style={{ marginLeft: Spacing.xs }}
                      >
                        Resend OTP
                      </Typography>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={handleBackToPhone}
                    disabled={loading}
                    style={styles.changePhoneBtn}
                  >
                    <Typography
                      variant="body2"
                      color={Colors.light.textSecondary}
                      weight="700"
                    >
                      Change Phone Number
                    </Typography>
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.consentText}>
                {'By continuing, you agree to our '}
                <Text
                  style={styles.consentLink}
                  onPress={() => navigation.navigate('TermsAndConditions')}
                >
                  Terms of Service
                </Text>
                {' & '}
                <Text
                  style={styles.consentLink}
                  onPress={() => navigation.navigate('PrivacyPolicy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'space-between' },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: 40,
    position: 'relative',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.light.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.light.sm,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  tagline: { letterSpacing: 1, opacity: 0.8 },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: Spacing.xl,
  },
  welcomeSection: { marginBottom: Spacing.xl, alignItems: 'center' },
  welcomeTitle: {
    marginBottom: Spacing.xxs,
    textAlign: 'center',
    fontSize: 28,
  },
  welcomeSubtitle: { textAlign: 'center', fontSize: 16 },
  inputStepContainer: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    height: 60,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.light.xs,
  },
  inputContainerError: {
    borderColor: Colors.light.error,
  },
  countryCode: {
    paddingHorizontal: Spacing.lg,
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    height: '60%',
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  helperText: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  errorText: {
    marginLeft: Spacing.xs,
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  warningText: {
    marginLeft: Spacing.xs,
    flex: 1,
  },
  button: { marginTop: Spacing.md, height: 56, borderRadius: BorderRadius.lg },
  otpActions: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  resendTimerText: {
    marginBottom: Spacing.md,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  changePhoneBtn: {
    paddingVertical: Spacing.sm,
  },
  footer: { marginTop: 'auto', paddingVertical: Spacing.lg },
  consentText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.textMuted,
    lineHeight: 18,
  },
  consentLink: {
    color: Colors.light.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: 100,
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successTitle: {
    marginBottom: Spacing.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    letterSpacing: 1,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
});
