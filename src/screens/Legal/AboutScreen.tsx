import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Zap } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

const APP_VERSION = '1.0.2';
const BUILD_YEAR = '2025';

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Typography variant="h3" weight="800" color={Colors.light.primary}>
        {value}
      </Typography>
      <Typography
        variant="caption"
        color={Colors.light.textSecondary}
        align="center"
        weight="500"
      >
        {label}
      </Typography>
    </View>
  );
}

interface ValueCardProps {
  emoji: string;
  title: string;
  description: string;
}

function ValueCard({ emoji, title, description }: ValueCardProps) {
  return (
    <View style={styles.valueCard}>
      <Typography variant="h3" style={styles.valueEmoji}>
        {emoji}
      </Typography>
      <View style={styles.valueContent}>
        <Typography variant="body1" weight="700" color={Colors.light.text}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color={Colors.light.textSecondary}
          style={styles.valueDesc}
        >
          {description}
        </Typography>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="About Urban Power"
        leftComponent={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={8}
          >
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Hero */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Zap
              size={40}
              color={Colors.light.white}
              fill={Colors.light.white}
            />
          </View>
          <Typography
            variant="h2"
            weight="800"
            align="center"
            style={styles.brandName}
          >
            Urban Power
          </Typography>
          <Typography
            variant="body2"
            color={Colors.light.textSecondary}
            align="center"
          >
            Your Trusted Home Services Partner
          </Typography>
          <View style={styles.versionBadge}>
            <Typography
              variant="caption"
              color={Colors.light.primary}
              weight="700"
            >
              Version {APP_VERSION}
            </Typography>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatItem value="50K+" label="Happy Customers" />
          <View style={styles.statDivider} />
          <StatItem value="1,200+" label="Professionals" />
          <View style={styles.statDivider} />
          <StatItem value="20+" label="Cities" />
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Typography variant="h4" weight="700" style={styles.sectionTitle}>
            Our Mission
          </Typography>
          <Typography
            variant="body1"
            color={Colors.light.textSecondary}
            style={styles.paragraph}
          >
            Urban Power was founded with a single mission: to make high-quality
            home services accessible, reliable, and stress-free for every
            household. We believe that your time is valuable, and your home
            deserves the best care — delivered by verified professionals, on
            your schedule.
          </Typography>
        </View>

        <View style={styles.divider} />

        {/* What We Do */}
        <View style={styles.section}>
          <Typography variant="h4" weight="700" style={styles.sectionTitle}>
            What We Do
          </Typography>
          <Typography
            variant="body1"
            color={Colors.light.textSecondary}
            style={styles.paragraph}
          >
            We connect homeowners and renters with skilled, background-verified
            service professionals across a wide range of categories — from
            electrical repairs, plumbing, and AC servicing to beauty and
            wellness, kabadi (scrap) pickup, and more. Every professional on our
            platform is trained, vetted, and equipped to deliver a consistent,
            safe service experience.
          </Typography>
        </View>

        <View style={styles.divider} />

        {/* Our Values */}
        <View style={styles.section}>
          <Typography variant="h4" weight="700" style={styles.sectionTitle}>
            Our Values
          </Typography>
          <ValueCard
            emoji="🛡️"
            title="Safety First"
            description="Every professional undergoes thorough background verification and safety training before joining our platform."
          />
          <ValueCard
            emoji="⭐"
            title="Quality Guaranteed"
            description="We maintain strict quality standards and offer a 7-day service warranty on all completed jobs."
          />
          <ValueCard
            emoji="⏱️"
            title="Punctuality"
            description="We respect your time. Our professionals are committed to on-time arrival and efficient service delivery."
          />
          <ValueCard
            emoji="💰"
            title="Transparent Pricing"
            description="No hidden charges. The price you see at booking is the price you pay — always."
          />
          <ValueCard
            emoji="🌱"
            title="Sustainability"
            description="Our kabadi pickup service promotes responsible scrap recycling, contributing to a greener India."
          />
        </View>

        <View style={styles.divider} />

        {/* Our Journey */}
        <View style={styles.section}>
          <Typography variant="h4" weight="700" style={styles.sectionTitle}>
            Our Journey
          </Typography>
          <Typography
            variant="body1"
            color={Colors.light.textSecondary}
            style={styles.paragraph}
          >
            Urban Power began as a small team with a big idea — that home
            maintenance should never be a headache. Starting with a handful of
            electricians and plumbers in Bengaluru, we have grown into a
            full-service home solutions platform, now serving thousands of
            customers across multiple Indian cities. Our professionals complete
            hundreds of bookings every day, earning 4.8★ average satisfaction.
          </Typography>
        </View>

        <View style={styles.divider} />

        {/* Compliance */}
        <View style={styles.section}>
          <Typography variant="h4" weight="700" style={styles.sectionTitle}>
            Legal & Compliance
          </Typography>
          <View style={styles.complianceCard}>
            <ComplianceRow
              label="Registered Entity"
              value="Urban Power Services Pvt. Ltd."
            />
            <ComplianceRow label="Country of Operation" value="India" />
            <ComplianceRow
              label="GST Registration"
              value="Registered under GST"
            />
            <ComplianceRow label="App Platform" value="Android (Google Play)" />
            <ComplianceRow
              label="Data Protection"
              value="Compliant with IT Act, 2000"
              last
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            align="center"
          >
            © {BUILD_YEAR} Urban Power Services Pvt. Ltd.
          </Typography>
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            align="center"
            style={{ marginTop: 4 }}
          >
            Made with ❤️ in India
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ComplianceRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.complianceRow, last && { borderBottomWidth: 0 }]}>
      <Typography
        variant="body2"
        color={Colors.light.textSecondary}
        weight="500"
        style={{ flex: 1 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        color={Colors.light.text}
        weight="600"
        style={{ flex: 1, textAlign: 'right' }}
      >
        {value}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  content: {
    paddingBottom: 60,
  },
  backButton: {
    padding: 4,
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.light.md,
  },
  brandName: {
    color: Colors.light.text,
    marginBottom: 4,
  },
  versionBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.light.white,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.light.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
  },
  // Sections
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    color: Colors.light.text,
  },
  paragraph: {
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  // Value Cards
  valueCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  valueEmoji: {
    fontSize: 28,
    lineHeight: 36,
    flexShrink: 0,
  },
  valueContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  valueDesc: {
    marginTop: 4,
    lineHeight: 20,
  },
  // Compliance
  complianceCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    overflow: 'hidden',
    ...Shadows.light.sm,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  // Footer
  footer: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
