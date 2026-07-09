import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  RotateCcw,
  Phone,
  Info,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

interface LegalItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  route: string;
}

const LEGAL_ITEMS: LegalItem[] = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your data',
    icon: Shield,
    route: 'PrivacyPolicy',
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    subtitle: 'Rules and guidelines for using Urban Power',
    icon: FileText,
    route: 'TermsAndConditions',
  },
  {
    id: 'refund',
    title: 'Refund & Cancellation Policy',
    subtitle: 'Cancellation windows, refund timelines, and warranty',
    icon: RotateCcw,
    route: 'RefundPolicy',
  },
  {
    id: 'contact',
    title: 'Contact Us',
    subtitle: 'Reach our support team anytime',
    icon: Phone,
    route: 'ContactUs',
  },
  {
    id: 'about',
    title: 'About Urban Power',
    subtitle: 'Our mission, values, and company information',
    icon: Info,
    route: 'AboutUrbanPower',
  },
];

export default function LegalHubScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Legal & Info"
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
        <Typography
          variant="body2"
          color={Colors.light.textSecondary}
          style={styles.intro}
        >
          Review our policies, learn about our services, or get in touch with
          our support team.
        </Typography>

        <View style={styles.menuContainer}>
          {LEGAL_ITEMS.map((item, index) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.itemLeft}>
                <View style={styles.iconBox}>
                  <item.icon size={22} color={Colors.light.primary} />
                </View>
                <View style={styles.itemText}>
                  <Typography
                    variant="body1"
                    weight="700"
                    color={Colors.light.text}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={Colors.light.textSecondary}
                    style={styles.subtitle}
                  >
                    {item.subtitle}
                  </Typography>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.light.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            align="center"
          >
            © {new Date().getFullYear()} Urban Power Services Pvt. Ltd.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  intro: {
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  menuContainer: {
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  menuItemPressed: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
    lineHeight: 18,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
