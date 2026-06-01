import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Home,
  Zap,
  LayoutGrid,
  Info,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Camera,
  Hash,
  Wrench,
  ShoppingBag,
  Recycle,
  Headphones,
  FileText,
  Shield,
  HelpCircle,
} from 'lucide-react-native';
import { Typography } from './Typography';
import { Colors, Spacing, BorderRadius } from '../constants/Theme';

// ─── Footer link data ────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'home_services',
    title: 'Home Services',
    Icon: Home,
    links: [
      { id: 'cleaning',   label: 'Cleaning',      route: 'Subcategory',   params: { categoryId: 'c1', categoryName: 'Cleaning', isTab: false } },
      { id: 'ac_repair',  label: 'Maintenance',   route: 'Subcategory',   params: { categoryId: 'c3', categoryName: 'Maintenance', isTab: false } },
      { id: 'repair',     label: 'Repair',        route: 'Subcategory',   params: { categoryId: 'c4', categoryName: 'Repair', isTab: false } },
      { id: 'auto',       label: 'Auto Service',  route: 'Subcategory',   params: { categoryId: 'c5', categoryName: 'Auto Service', isTab: false } },
      { id: 'beauty',     label: 'Beauty & Spa',  route: 'GenderPicker',  params: { categoryId: 'c2', categoryName: 'Beauty', isTab: false } },
    ],
  },
  {
    id: 'instant_help',
    title: 'Instant Help',
    Icon: Zap,
    links: [
      { id: 'shop',     label: 'Urban Shop',    route: 'Main',         params: { screen: 'Shopping' } },
      { id: 'grocery',  label: 'Grocery',       route: 'Main',         params: { screen: 'Grocery' } },
      { id: 'kabadi',   label: 'Kabadi Pickup', route: 'KabadiBooking', params: undefined },
      { id: 'tracking', label: 'Track Order',   route: 'Bookings',     params: undefined },
    ],
  },
  {
    id: 'my_services',
    title: 'My Account',
    Icon: LayoutGrid,
    links: [
      { id: 'bookings',  label: 'My Bookings',   route: 'Bookings',      params: undefined },
      { id: 'rewards',   label: 'Rewards',        route: 'Rewards',       params: undefined },
      { id: 'addresses', label: 'Saved Address',  route: 'SavedAddresses', params: undefined },
      { id: 'support',   label: 'Help & Support', route: 'HelpSupport',   params: undefined },
    ],
  },
  {
    id: 'about',
    title: 'About Us',
    Icon: Info,
    links: [
      { id: 'about',    label: 'About Urban Power', route: null, params: null, url: 'https://urbanpower.in/about' },
      { id: 'careers',  label: 'Careers',           route: null, params: null, url: 'https://urbanpower.in/careers' },
      { id: 'privacy',  label: 'Privacy Policy',    route: null, params: null, url: 'https://urbanpower.in/privacy' },
      { id: 'terms',    label: 'Terms of Service',  route: null, params: null, url: 'https://urbanpower.in/terms' },
    ],
  },
];

// ─── Social links ────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  { id: 'facebook',  Icon: MessageCircle,  url: 'https://facebook.com/urbanpower' },
  { id: 'instagram', Icon: Camera, url: 'https://instagram.com/urbanpower' },
  { id: 'twitter',   Icon: Hash,   url: 'https://twitter.com/urbanpower' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export const AppFooter: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleLinkPress = (link: any) => {
    if (link.url) {
      Linking.openURL(link.url).catch(() => {});
    } else if (link.route) {
      navigation.navigate(link.route, link.params || undefined);
    }
  };

  return (
    <View style={styles.footer}>

      {/* ── Brand strip ── */}
      <View style={styles.brandStrip}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Typography variant="tiny" color={Colors.light.primary} weight="900" style={styles.brandBadgeText}>UP</Typography>
          </View>
          <View style={styles.brandTextBlock}>
            <Typography variant="h4" weight="900" color="#FFFFFF" style={{ letterSpacing: -0.5 }}>Urban Power</Typography>
            <Typography variant="tiny" color="rgba(255,255,255,0.6)" weight="600">Your Neighbourhood Super App</Typography>
          </View>
        </View>

        {/* Contact row */}
        <View style={styles.contactRow}>
          <Pressable
            style={styles.contactChip}
            onPress={() => Linking.openURL('tel:+919999999999')}
          >
            <Phone size={13} color={Colors.light.accent} />
            <Typography variant="tiny" color="#FFFFFF" weight="700" style={{ marginLeft: 5 }}>+91 99999 99999</Typography>
          </Pressable>
          <Pressable
            style={styles.contactChip}
            onPress={() => Linking.openURL('mailto:hello@urbanpower.in')}
          >
            <Mail size={13} color={Colors.light.accent} />
            <Typography variant="tiny" color="#FFFFFF" weight="700" style={{ marginLeft: 5 }}>hello@urbanpower.in</Typography>
          </Pressable>
        </View>
      </View>

      {/* ── 4-column link grid ── */}
      <View style={styles.linkGrid}>
        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.linkColumn}>
            {/* Section heading */}
            <View style={styles.sectionHeading}>
              <section.Icon size={13} color={Colors.light.accent} strokeWidth={2} />
              <Typography
                variant="tiny"
                weight="900"
                color="#FFFFFF"
                style={styles.sectionTitle}
              >
                {section.title}
              </Typography>
            </View>

            {/* Links */}
            {section.links.map((link) => (
              <Pressable
                key={link.id}
                style={({ pressed }) => [styles.linkItem, pressed && styles.linkItemPressed]}
                onPress={() => handleLinkPress(link)}
              >
                <Typography variant="tiny" color="rgba(255,255,255,0.65)" weight="600" style={styles.linkText}>
                  {link.label}
                </Typography>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Bottom: Social + Copyright ── */}
      <View style={styles.bottomRow}>
        <Typography variant="tiny" color="rgba(255,255,255,0.4)" style={{ flex: 1 }}>
          © 2025 Urban Power. All rights reserved.
        </Typography>
        <View style={styles.socialRow}>
          {SOCIAL_LINKS.map((s) => (
            <Pressable
              key={s.id}
              style={styles.socialBtn}
              onPress={() => Linking.openURL(s.url)}
            >
              <s.Icon size={15} color="rgba(255,255,255,0.75)" />
            </Pressable>
          ))}
        </View>
      </View>

    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#110B2A',   // Very dark purple — premium feel
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },

  /* Brand strip */
  brandStrip: {
    marginBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  brandBadgeText: {
    fontSize: 16,
    lineHeight: 20,
  },
  brandTextBlock: {
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  /* Link grid */
  linkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  linkColumn: {
    width: '47%',      // 2 per row on mobile
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    marginLeft: 6,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  linkItem: {
    paddingVertical: 5,
  },
  linkItemPressed: {
    opacity: 0.5,
  },
  linkText: {
    fontSize: 12,
    lineHeight: 18,
  },

  /* Bottom row */
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: Spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  socialBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
