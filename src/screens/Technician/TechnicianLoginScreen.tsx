import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TextInput, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Briefcase, ArrowLeft, Phone, Lock } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export default function TechnicianLoginScreen() {
  const navigation = useNavigation();
  const [partnerId, setPartnerId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Mock login success
    navigation.navigate('Main', { screen: 'Home' } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={Colors.light.text} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Briefcase size={40} color={Colors.light.white} />
            </View>
            <Typography variant="h2" weight="900" style={{ marginTop: Spacing.xl }}>Partner Login</Typography>
            <Typography variant="body1" color={Colors.light.textSecondary} style={{ marginTop: Spacing.sm }}>
              Welcome back to UrbanPower Partner Hub
            </Typography>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Typography variant="caption" weight="800" color={Colors.light.textMuted} style={styles.label}>PARTNER ID / PHONE</Typography>
              <View style={styles.inputRow}>
                <Phone size={20} color={Colors.light.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Partner ID"
                  value={partnerId}
                  onChangeText={setPartnerId}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={[styles.inputWrapper, { marginTop: Spacing.xl }]}>
              <Typography variant="caption" weight="800" color={Colors.light.textMuted} style={styles.label}>PASSWORD</Typography>
              <View style={styles.inputRow}>
                <Lock size={20} color={Colors.light.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <Button 
                title="Login to Dashboard" 
                onPress={handleLogin} 
                size="lg" 
                style={{ marginTop: Spacing.xxl }} 
            />
            
            <Pressable style={styles.forgotBtn}>
               <Typography variant="body2" weight="700" color={Colors.light.primary}>Forgot Password?</Typography>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Typography variant="body2" color={Colors.light.textSecondary}>New to UrbanPower?</Typography>
            <Pressable>
              <Typography variant="body2" weight="800" color={Colors.light.primary} style={{ marginLeft: 4 }}>Register as Partner</Typography>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  container: { flexGrow: 1, padding: Spacing.xxl },
  backBtn: { width: 40, height: 40, justifyContent: 'center', marginBottom: Spacing.xl },
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoBox: {
    width: 80, height: 80,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.light.md,
  },
  form: { marginTop: Spacing.xl },
  inputWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: Spacing.xs,
  },
  label: { marginBottom: Spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1, marginLeft: Spacing.md,
    fontSize: 16, weight: '600',
    color: Colors.light.text,
    paddingVertical: Spacing.sm,
  },
  forgotBtn: { alignSelf: 'center', marginTop: Spacing.xl },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.xxl,
  },
});
import { ScrollView } from 'react-native';
