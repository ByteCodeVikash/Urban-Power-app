import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, Pressable, ScrollView, Image } from 'react-native';
import { useAuthStore, UserRole } from '../../store/useAuthStore';
import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);

  const getRoleFromNumber = (num: string): UserRole => {
    if (num === '9876543210') return 'Admin';
    if (num === '8888888888') return 'Technician';
    return 'Customer';
  };

  const handleSendOtp = () => {
    if (phoneNumber.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) return;
    setLoading(true);
    const role = getRoleFromNumber(phoneNumber);
    setTimeout(() => {
      setLoading(false);
      login(phoneNumber, role);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.iconWrapper}>
                <Image 
                  source={require('../../../assets/app_logo.jpeg')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Typography variant="body2" color={Colors.light.textSecondary} weight="700" style={styles.tagline}>
                Professional • Trusted • On-Demand
              </Typography>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.welcomeSection}>
                <Typography variant="h2" weight="900" style={styles.welcomeTitle}>
                  {step === 'PHONE' ? 'Welcome back' : 'Verify OTP'}
                </Typography>
                <Typography variant="body1" color={Colors.light.textSecondary} weight="600" style={styles.welcomeSubtitle}>
                  {step === 'PHONE' 
                    ? 'Enter your mobile number' 
                    : `Enter 4-digit code sent to +91 ${phoneNumber}`}
                </Typography>
              </View>


              {step === 'PHONE' ? (
                <View style={styles.inputContainer}>
                  <View style={styles.countryCode}>
                    <Typography variant="body1" weight="800" color={Colors.light.primary}>+91</Typography>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Mobile Number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholderTextColor={Colors.light.textMuted}
                  />
                </View>
              ) : (
                <View style={[styles.inputContainer, styles.otpContainer]}>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="0 0 0 0"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={otp}
                    onChangeText={setOtp}
                    placeholderTextColor={Colors.light.textMuted}
                    autoFocus
                  />
                </View>
              )}

              <Button
                title={step === 'PHONE' ? 'Get OTP' : 'Verify & Continue'}
                onPress={step === 'PHONE' ? handleSendOtp : handleVerifyOtp}
                loading={loading}
                disabled={step === 'PHONE' ? phoneNumber.length < 10 : otp.length < 4}
                size="lg"
                style={styles.button}
              />

              {step === 'OTP' && (
                <Pressable onPress={() => setStep('PHONE')} style={styles.resendBtn}>
                   <Typography variant="body2" color={Colors.light.primary} weight="800">Change Phone Number</Typography>
                </Pressable>
              )}
            </View>

            <View style={styles.footer}>
               <Typography variant="caption" color={Colors.light.textMuted} align="center">
                  By continuing, you agree to our Terms of Service & Privacy Policy
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
  logoContainer: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: 40 },
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
  brandName: { letterSpacing: 2, marginBottom: Spacing.xxs, fontSize: 40 },
  tagline: { letterSpacing: 1, opacity: 0.8 },
  formContainer: { flex: 1, justifyContent: 'flex-start', marginTop: Spacing.xl },
  welcomeSection: { marginBottom: Spacing.xl, alignItems: 'center' },
  welcomeTitle: { marginBottom: Spacing.xxs, textAlign: 'center', fontSize: 28 },
  welcomeSubtitle: { textAlign: 'center', fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    height: 60,
    marginBottom: Spacing.lg,
    borderWidth: 1, 
    borderColor: Colors.light.border,
    ...Shadows.light.xs,
  },
  otpContainer: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.white,
  },
  countryCode: {
    paddingHorizontal: Spacing.lg,
    borderRightWidth: 1, borderRightColor: Colors.light.border,
    justifyContent: 'center', alignItems: 'center',
    height: '60%',
  },
  input: { flex: 1, paddingHorizontal: Spacing.lg, fontSize: 18, fontWeight: '600', color: Colors.light.text },
  otpInput: { textAlign: 'center', letterSpacing: 12, fontSize: 24, paddingHorizontal: 0 },
  button: { marginTop: Spacing.md, height: 56, borderRadius: BorderRadius.lg },
  resendBtn: { marginTop: Spacing.xl, alignSelf: 'center' },
  footer: { marginTop: 'auto', paddingVertical: Spacing.lg },
});
