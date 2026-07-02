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
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ArrowLeft, AlertCircle, PhoneCall } from 'lucide-react-native';
import { useAuthStore, UserRole } from '../../store/useAuthStore';
import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { firebaseAuthService } from '../../services/firebaseAuth';
import { api } from '../../services/api';
import { OtpInput } from '../../components/OtpInput';
import { googleAuthService } from '../../services/googleAuth';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const login = useAuthStore(state => state.login);
  const requiredOtpLength = firebaseAuthService.isNative ? 6 : 4;

  const stepRef = useRef(step);
  const loadingRef = useRef(loading);
  const isBackendVerifying = useRef(false);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // Listen to Firebase Auth state changes for auto-verification on Android
  useEffect(() => {
    if (!firebaseAuthService.isNative) return;

    const firebaseAuth = require('@react-native-firebase/auth').default;
    const unsubscribe = firebaseAuth().onAuthStateChanged(async (user: any) => {
      // If user is logged in to Firebase and we are currently in OTP verification stage
      if (user && stepRef.current === 'OTP') {
        if (isBackendVerifying.current) return;

        console.log(
          '[LoginScreen] Firebase authenticated successfully. Commencing backend validation...',
        );
        isBackendVerifying.current = true;
        setLoading(true);
        setError(null);
        try {
          const idToken = await user.getIdToken();
          const verifiedPhone = user.phoneNumber || '';

          // Exchange token with backend
          console.log(
            '[LoginScreen] Exchanging token with backend for verified phone:',
            verifiedPhone,
          );
          const response = await api.auth.verifyOtp(verifiedPhone, idToken);

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

          login(verifiedPhone, role, name, id, response.access_token);
        } catch (err: any) {
          console.error(
            '[LoginScreen] Auto-login backend exchange error:',
            err,
          );
          setError(err?.message || 'Verification failed. Please try again.');
          isBackendVerifying.current = false;
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, [login]);

  // Initialize Google Sign-In SDK on mount
  useEffect(() => {
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
      handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Trigger Google login flow
      const { idToken, name } = await googleAuthService.signIn();

      // 2. Exchange token with backend
      const response = await api.auth.googleLogin(idToken);

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
      console.error('[LoginScreen] Google Login error:', err);
      // Skip error banners for user cancellations
      if (err?.message !== 'SIGN_IN_CANCELLED' && err?.code !== '12501') {
        setError(err?.message || 'Google Sign-in failed. Please try again.');
      }
    } finally {
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
    if (phoneNumber.length < 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError(null);
    setPhoneError(null);
    try {
      const confirmResult = await firebaseAuthService.sendOtp(phoneNumber);
      setConfirmation(confirmResult);
      setStep('OTP');
      setResendTimer(30); // 30-second resend limit
      setOtp(''); // clear previous OTP
    } catch (err: any) {
      console.error('[LoginScreen] Send OTP error:', err);
      setError(
        err?.message || 'Failed to send verification code. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < requiredOtpLength) return;
    setLoading(true);
    setError(null);
    try {
      if (!confirmation) {
        throw new Error(
          'No active verification session. Please request a new OTP.',
        );
      }
      // Verify OTP with Firebase
      await confirmation.confirm(otp);
      // The onAuthStateChanged listener handles backend validation and Zustand state updates.
    } catch (err: any) {
      console.error('[LoginScreen] Verify OTP error:', err);
      setError(
        err?.message ||
          'Verification failed. Please check the code and try again.',
      );
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    if (loading) return;
    setStep('PHONE');
    setError(null);
    setOtp('');
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

                  <Button
                    title="Continue with Google"
                    variant="outline"
                    onPress={handleGoogleLogin}
                    loading={loading}
                    icon={
                      <Image
                        source={require('../../../assets/google_logo.png')}
                        style={styles.googleIcon}
                      />
                    }
                    size="lg"
                    style={styles.googleButton}
                    textStyle={styles.googleButtonText}
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
              <Typography
                variant="caption"
                color={Colors.light.textMuted}
                align="center"
              >
                By continuing, you agree to our Terms of Service & Privacy
                Policy
              </Typography>
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
    backgroundColor: Colors.light.white,
    borderColor: Colors.light.border,
    borderWidth: 1,
    height: 56,
    borderRadius: BorderRadius.lg,
    elevation: 0,
    shadowOpacity: 0,
  },
  googleButtonText: {
    color: Colors.light.text,
    fontWeight: '700',
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
});
