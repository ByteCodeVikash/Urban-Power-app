import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Trash2, AlertTriangle, Mail } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';

const WHAT_GETS_DELETED = [
  'Account profile (name, email, profile photo)',
  'Registered phone number',
  'Saved addresses',
  'Urban Power Wallet balance and credits',
  'Push notification tokens',
  'App preferences and settings',
  'Active and pending bookings',
];

const WHAT_IS_RETAINED = [
  'Booking & transaction records — 7 years (Income Tax Act)',
  'Payment history and invoices — 7 years (GST regulations)',
  'Dispute and complaint records — 3 years (Consumer Protection Act)',
];

export default function DeleteAccountScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Permanently Delete Account?',
      `This will delete your Urban Power account for ${user?.phone || 'your number'}. This action cannot be undone.\n\nYour wallet balance, saved addresses, and preferences will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await api.auth.deleteAccount();
      // Show success message, log out and redirect on dismiss
      Alert.alert(
        'Account Deleted',
        response.message || 'Your account has been successfully deleted.',
        [
          {
            text: 'OK',
            onPress: () => {
              logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            },
          },
        ],
        { cancelable: false },
      );
    } catch (err: any) {
      const message =
        err?.message ||
        'Account deletion is temporarily unavailable. Please contact privacy@urbanpowers.com to request deletion.';
      Alert.alert('Account Deletion Error', message, [
        { text: 'OK', style: 'cancel' },
        {
          text: 'Email Support',
          onPress: () =>
            Linking.openURL(
              'mailto:privacy@urbanpowers.com?subject=Account%20Deletion%20Request',
            ),
        },
      ]);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Delete Account"
        leftComponent={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={24} color="#B45309" />
          <Typography
            variant="body2"
            weight="700"
            color="#92400E"
            style={styles.warningText}
          >
            Deleting your account is permanent and cannot be reversed.
          </Typography>
        </View>

        {/* What gets deleted */}
        <View style={styles.card}>
          <Typography
            variant="body1"
            weight="800"
            color={Colors.light.error}
            style={styles.cardTitle}
          >
            What will be deleted
          </Typography>
          {WHAT_GETS_DELETED.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <View style={styles.bullet} />
              <Typography
                variant="body2"
                color={Colors.light.textSecondary}
                style={{ flex: 1 }}
              >
                {item}
              </Typography>
            </View>
          ))}
        </View>

        {/* What is retained */}
        <View style={styles.card}>
          <Typography
            variant="body1"
            weight="800"
            color={Colors.light.text}
            style={styles.cardTitle}
          >
            What is retained for legal compliance
          </Typography>
          {WHAT_IS_RETAINED.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <View style={[styles.bullet, styles.bulletNeutral]} />
              <Typography
                variant="body2"
                color={Colors.light.textSecondary}
                style={{ flex: 1 }}
              >
                {item}
              </Typography>
            </View>
          ))}
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            style={styles.retentionNote}
          >
            Retained data is used solely for legal compliance and is not used
            for any operational or marketing purposes.
          </Typography>
        </View>

        {/* Alternative email method */}
        <TouchableOpacity
          style={styles.emailAlternative}
          onPress={() =>
            Linking.openURL(
              'mailto:privacy@urbanpowers.com?subject=Account%20Deletion%20Request',
            )
          }
        >
          <Mail size={20} color={Colors.light.primary} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Typography
              variant="body2"
              weight="700"
              color={Colors.light.primary}
            >
              Request deletion via email
            </Typography>
            <Typography variant="caption" color={Colors.light.textMuted}>
              privacy@urbanpowers.com — response within 3 business days
            </Typography>
          </View>
        </TouchableOpacity>

        {/* Timeline */}
        <View style={styles.timeline}>
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            align="center"
          >
            Deletion requests are processed within{' '}
            <Typography
              variant="caption"
              weight="700"
              color={Colors.light.text}
            >
              30 days
            </Typography>{' '}
            of verification.
          </Typography>
        </View>

        {/* Destructive CTA */}
        <Button
          title="Delete My Account"
          onPress={handleDeleteAccount}
          loading={isDeleting}
          style={styles.deleteButton}
          variant="primary"
          icon={<Trash2 size={18} color={Colors.light.white} />}
        />

        <Button
          title="Cancel — Keep My Account"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
        />

        <View style={styles.footer}>
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            align="center"
          >
            For questions about data deletion, contact{' '}
            <Typography
              variant="caption"
              weight="700"
              color={Colors.light.primary}
            >
              privacy@urbanpowers.com
            </Typography>
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.lg, paddingBottom: 60 },
  backButton: { padding: 4 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  warningText: {
    flex: 1,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.error,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletNeutral: {
    backgroundColor: Colors.light.textMuted,
  },
  retentionNote: {
    marginTop: Spacing.md,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  emailAlternative: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.primaryLight,
    ...Shadows.light.sm,
  },
  timeline: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  deleteButton: {
    backgroundColor: Colors.light.error,
    borderColor: Colors.light.error,
    marginBottom: Spacing.md,
  },
  cancelButton: {
    marginBottom: Spacing.lg,
  },
  footer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
});
