import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Typography } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { Gift, Star, Clock, Trophy } from 'lucide-react-native';

export default function RewardsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Your Rewards" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pointsCard}>
          <View>
            <Typography variant="body2" color={Colors.light.white} style={{ opacity: 0.8 }}>Available Points</Typography>
            <Typography variant="h1" color={Colors.light.white}>2,450</Typography>
          </View>
          <Trophy color={Colors.light.white} size={48} />
        </View>

        <Typography variant="h3" style={styles.sectionTitle}>Exclusive Offers</Typography>
        
        <View style={styles.offerCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FFEEED' }]}>
            <Gift color="#EF4444" size={24} />
          </View>
          <View style={styles.offerInfo}>
            <Typography variant="h4">50% OFF</Typography>
            <Typography variant="body2" color={Colors.light.textSecondary}>On your next Deep Cleaning</Typography>
          </View>
        </View>

        <View style={styles.offerCard}>
          <View style={[styles.iconBox, { backgroundColor: '#F0FDFA' }]}>
            <Star color="#0D9488" size={24} />
          </View>
          <View style={styles.offerInfo}>
            <Typography variant="h4">Free Consultation</Typography>
            <Typography variant="body2" color={Colors.light.textSecondary}>With our top experts</Typography>
          </View>
        </View>

        <Typography variant="h3" style={styles.sectionTitle}>Refer & Earn</Typography>
        <View style={styles.referCard}>
          <Typography variant="body1" align="center">Invite your friends and get ₹500 for each successful referral.</Typography>
          <View style={styles.codeContainer}>
             <Typography variant="h4" weight="700" color={Colors.light.primary}>URBAN500</Typography>
          </View>
        </View>
        
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.white,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  pointsCard: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.light.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  offerInfo: {
    flex: 1,
  },
  referCard: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  codeContainer: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
});
