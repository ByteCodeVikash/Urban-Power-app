import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronRight,
  Calendar,
  CreditCard,
  Wallet,
  Star,
  MapPin,
  Settings,
  Info,
  User,
  Crown,
  LifeBuoy,
  Scale,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();

  const menuItems: {
    id: string;
    title: string;
    icon: any;
    route: string;
    highlight?: boolean;
  }[] = [
    {
      id: 'plans',
      title: 'My Plans',
      icon: Crown,
      route: 'MyPlans',
    },
    {
      id: 'wallet',
      title: 'Wallet',
      icon: Wallet,
      route: 'Wallet',
    },
    {
      id: 'account-detail',
      title: 'Account Detail',
      icon: User,
      route: 'AccountDetail',
    },

    {
      id: 'membership',
      title: 'Plus Membership',
      icon: Crown,
      route: 'PlusMembership',
    },
    {
      id: 'rating',
      title: 'My Rating',
      icon: Star,
      route: 'MyRating',
    },
    {
      id: 'addresses',
      title: 'Manage Addresses',
      icon: MapPin,
      route: 'SavedAddresses',
    },
    {
      id: 'payments',
      title: 'Manage Payment Method',
      icon: CreditCard,
      route: 'ManagePayment',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      route: 'Settings',
    },
    {
      id: 'legal',
      title: 'Legal & Info',
      icon: Scale,
      route: 'LegalHub',
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: LifeBuoy,
      route: 'HelpSupport',
    },
    {
      id: 'about',
      title: 'About App',
      icon: Info,
      route: 'AboutApp',
    },
  ];

  return (
    <View style={styles.safeArea}>
      <Header title="Account" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <User size={40} color={Colors.light.primary} />
            )}
          </View>
          <View style={styles.userInfo}>
            <Typography variant="h3" weight="700">
              {user?.name || 'User Name'}
            </Typography>
            <Typography variant="body2" color={Colors.light.textSecondary}>
              {user?.phone || '+91 00000 00000'}
            </Typography>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map(item => (
            <Pressable
              key={item.id}
              style={[
                styles.menuItem,
                item.highlight && styles.highlightedItem,
              ]}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.iconBox,
                    item.highlight && styles.highlightIconBox,
                  ]}
                >
                  <item.icon
                    size={22}
                    color={
                      item.highlight ? Colors.light.white : Colors.light.text
                    }
                  />
                </View>
                <Typography
                  variant="body1"
                  weight={item.highlight ? '700' : '700'}
                  style={{
                    color: item.highlight
                      ? Colors.light.primary
                      : Colors.light.text,
                  }}
                >
                  {item.title}
                </Typography>
              </View>
              <ChevronRight
                size={20}
                color={
                  item.highlight ? Colors.light.primary : Colors.light.textMuted
                }
              />
            </Pressable>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Typography variant="body1" weight="700" color={Colors.light.error}>
            Logout
          </Typography>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Typography variant="caption" color={Colors.light.textMuted}>
            Version 1.0.0 (2025)
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { paddingBottom: 100 },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  userInfo: {
    marginLeft: Spacing.lg,
  },
  menuContainer: {
    padding: Spacing.lg,
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
  highlightedItem: {
    borderColor: Colors.light.primaryLight,
    backgroundColor: '#F5F3FF', // Very light purple
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightIconBox: {
    backgroundColor: Colors.light.primary,
  },
  logoutBtn: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  footer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
