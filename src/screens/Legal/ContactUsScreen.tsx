import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  ExternalLink,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

const LAST_UPDATED = 'June 1, 2025';

interface ContactCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  actionLabel?: string;
  onPress?: () => void;
}

function ContactCard({
  icon: Icon,
  label,
  value,
  actionLabel,
  onPress,
}: ContactCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIconBox}>
        <Icon size={22} color={Colors.light.primary} />
      </View>
      <View style={styles.cardContent}>
        <Typography
          variant="caption"
          color={Colors.light.textMuted}
          weight="600"
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          weight="600"
          color={Colors.light.text}
          style={styles.cardValue}
        >
          {value}
        </Typography>
      </View>
      {onPress && actionLabel ? (
        <TouchableOpacity
          style={styles.cardAction}
          onPress={onPress}
          hitSlop={8}
        >
          <Typography
            variant="caption"
            color={Colors.light.primary}
            weight="700"
          >
            {actionLabel}
          </Typography>
          <ExternalLink size={12} color={Colors.light.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

interface HourRowProps {
  day: string;
  hours: string;
}

function HourRow({ day, hours }: HourRowProps) {
  return (
    <View style={styles.hourRow}>
      <Typography
        variant="body2"
        color={Colors.light.textSecondary}
        weight="500"
      >
        {day}
      </Typography>
      <Typography variant="body2" color={Colors.light.text} weight="600">
        {hours}
      </Typography>
    </View>
  );
}

function openLink(url: string) {
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Unable to open', `Please contact us at: ${url}`);
    }
  });
}

export default function ContactUsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Contact Us"
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
        {/* Last Updated */}
        <View style={styles.updatedBadge}>
          <Typography
            variant="caption"
            color={Colors.light.primary}
            weight="600"
          >
            Last Updated: {LAST_UPDATED}
          </Typography>
        </View>

        {/* Hero */}
        <Typography variant="h2" weight="800" style={styles.pageTitle}>
          We're Here to Help
        </Typography>
        <Typography
          variant="body1"
          color={Colors.light.textSecondary}
          style={styles.intro}
        >
          Our support team is available 7 days a week. Reach out through any of
          the channels below and we'll get back to you as quickly as possible.
        </Typography>

        <View style={styles.divider} />

        {/* Contact Channels */}
        <Typography variant="h4" weight="700" style={styles.sectionTitle}>
          Get in Touch
        </Typography>

        <ContactCard
          icon={Mail}
          label="Email Support"
          value="support@urbanpowers.com"
          actionLabel="Send Email"
          onPress={() => openLink('mailto:support@urbanpowers.com')}
        />

        <ContactCard
          icon={MessageCircle}
          label="Customer Care"
          value="For booking issues, cancellations, or complaints"
          actionLabel="In-App Chat"
          onPress={() => navigation.navigate('HelpSupport' as never)}
        />

        <ContactCard
          icon={Mail}
          label="Legal & Privacy"
          value="legal@urbanpowers.com"
          actionLabel="Send Email"
          onPress={() => openLink('mailto:legal@urbanpowers.com')}
        />

        <ContactCard
          icon={Mail}
          label="Business Partnerships"
          value="partnerships@urbanpowers.com"
          actionLabel="Send Email"
          onPress={() => openLink('mailto:partnerships@urbanpowers.com')}
        />

        <ContactCard
          icon={MapPin}
          label="Registered Address"
          value={'Urban Power Services Pvt. Ltd.\nBengaluru, Karnataka, India'}
        />

        <View style={styles.divider} />

        {/* Support Hours */}
        <Typography variant="h4" weight="700" style={styles.sectionTitle}>
          Support Hours
        </Typography>
        <View style={styles.hoursCard}>
          <View style={styles.hoursHeader}>
            <Clock size={18} color={Colors.light.primary} />
            <Typography
              variant="body2"
              weight="700"
              color={Colors.light.primary}
              style={{ marginLeft: 8 }}
            >
              All times are in IST (UTC+5:30)
            </Typography>
          </View>
          <HourRow day="Monday – Friday" hours="8:00 AM – 9:00 PM" />
          <HourRow day="Saturday" hours="9:00 AM – 7:00 PM" />
          <HourRow day="Sunday & Holidays" hours="10:00 AM – 5:00 PM" />
        </View>

        <View style={styles.divider} />

        {/* Response Time */}
        <Typography variant="h4" weight="700" style={styles.sectionTitle}>
          Expected Response Times
        </Typography>

        <View style={styles.responseCard}>
          <ResponseItem label="In-App Chat" time="Within 2 hours" />
          <ResponseItem label="Email" time="Within 24 hours" />
          <ResponseItem label="Legal / Privacy" time="Within 3 business days" />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            align="center"
          >
            © {new Date().getFullYear()} Urban Power Services Pvt. Ltd. All
            rights reserved.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResponseItem({ label, time }: { label: string; time: string }) {
  return (
    <View style={styles.responseRow}>
      <View style={styles.responseDot} />
      <View style={styles.responseContent}>
        <Typography variant="body2" weight="600" color={Colors.light.text}>
          {label}
        </Typography>
        <Typography variant="caption" color={Colors.light.textSecondary}>
          {time}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 60,
  },
  backButton: {
    padding: 4,
  },
  updatedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  pageTitle: {
    marginBottom: Spacing.sm,
    color: Colors.light.text,
  },
  intro: {
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    color: Colors.light.text,
  },
  // Contact Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cardValue: {
    marginTop: 2,
    lineHeight: 22,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: Spacing.sm,
  },
  // Hours Card
  hoursCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  // Response card
  responseCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
    gap: Spacing.md,
  },
  responseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  responseDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    marginTop: 4,
    flexShrink: 0,
  },
  responseContent: {
    flex: 1,
    gap: 2,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
