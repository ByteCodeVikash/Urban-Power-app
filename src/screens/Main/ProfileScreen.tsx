import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  User, Wallet, Shield, HelpCircle, LogOut, ChevronRight, 
  MapPin, Calendar, Gift, Briefcase, Settings, Recycle, 
  ShoppingBag, LifeBuoy, CreditCard 
} from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useAddresses } from '../../hooks/useServices';
import { RootStackParamList } from '../../navigation/Types';
import { Typography } from '../../components/Typography';
import { SectionHeader } from '../../components/SectionHeader';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const isTab = route.params?.isTab;

  const accountMenu = [
    { icon: <Calendar size={22} color={Colors.light.text} />, label: 'My Bookings', onPress: () => navigation.navigate('Bookings') },
    { icon: <ShoppingBag size={22} color={Colors.light.text} />, label: 'My Orders', onPress: () => navigation.navigate('OrderTracking', { orderId: 'ORD-5432' }) },
    { icon: <Recycle size={22} color={Colors.light.text} />, label: 'Kabadi History', onPress: () => navigation.navigate('KabadiHistory') },
    { icon: <MapPin size={22} color={Colors.light.text} />, label: 'Saved Addresses', onPress: () => navigation.navigate('SavedAddresses') },
  ];

  const rewardsMenu = [
    { icon: <Gift size={22} color={Colors.light.text} />, label: 'Rewards & Offers', onPress: () => navigation.navigate('Rewards') },
    { icon: <Wallet size={22} color={Colors.light.text} />, label: 'UC Wallet', value: '₹450' },
  ];

  const professionalMenu = [
    { icon: <Briefcase size={22} color={Colors.light.primary} />, label: 'Partner Dashboard', onPress: () => navigation.navigate('TechnicianHub') },
    { icon: <CreditCard size={22} color="#475569" />, label: 'Earnings & Payouts', onPress: () => navigation.navigate('TechnicianEarnings') },
    { icon: <Settings size={22} color="#475569" />, label: 'Admin Console', onPress: () => navigation.navigate('AdminConsole') },
  ];

  const supportMenu = [
    { icon: <LifeBuoy size={22} color={Colors.light.text} />, label: 'Help & Support', onPress: () => navigation.navigate('HelpSupport') },
    { icon: <Shield size={22} color={Colors.light.text} />, label: 'Warranty & Protection' },
  ];

  const renderMenuSection = (title: string, items: any[]) => (
    <View style={styles.menuSection}>
      <Typography variant="tiny" weight="800" color={Colors.light.textMuted} style={styles.sectionTitle}>{title}</Typography>
      {items.map((item, index) => (
        <Pressable key={index} style={styles.menuItem} onPress={item.onPress}>
          <View style={styles.leftIcon}>{item.icon}</View>
          <Typography variant="body1" weight="700" style={styles.menuLabel}>{item.label}</Typography>
          {item.value && (
            <Typography variant="body1" color={Colors.light.primary} weight="800" style={{ marginRight: Spacing.sm }}>
              {item.value}
            </Typography>
          )}
          <ChevronRight color={Colors.light.textMuted} size={18} />
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {!isTab && (
          <View style={styles.header}>
            <Typography variant="h2" weight="900">My Profile</Typography>
          </View>
        )}

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Typography variant="h2" weight="900" color={Colors.light.white}>
              {user?.name?.[0] || 'U'}
            </Typography>
          </View>
          <View>
            <Typography variant="h3" weight="800">{user?.name || 'User'}</Typography>
            <Typography variant="body1" color={Colors.light.textSecondary} weight="600">+91 {user?.phone || '9876543210'}</Typography>
          </View>
          <Pressable style={styles.editBtn}>
             <Typography variant="tiny" weight="800" color={Colors.light.primary}>EDIT</Typography>
          </Pressable>
        </View>

        {renderMenuSection('MY ACCOUNT', accountMenu)}
        {renderMenuSection('REWARDS & PAYMENTS', rewardsMenu)}
        {renderMenuSection('PROFESSIONAL TOOLS', professionalMenu)}
        {renderMenuSection('SUPPORT & SAFETY', supportMenu)}

        <View style={styles.menuSection}>
          <Typography variant="tiny" weight="800" color={Colors.light.textMuted} style={styles.sectionTitle}>MOCK ROLE SWITCHER (DEMO)</Typography>
          <View style={styles.roleGrid}>
             {(['Customer', 'Technician', 'Admin'] as const).map((r) => (
               <Pressable 
                key={r} 
                onPress={() => {
                  useAuthStore.getState().switchRole(r);
                  alert(`Switched to ${r} mode`);
                }}
                style={[styles.roleChip, useAuthStore.getState().role === r && styles.activeChip]}
               >
                  <Typography variant="tiny" weight="800" color={useAuthStore.getState().role === r ? Colors.light.white : Colors.light.text}>{r.toUpperCase()}</Typography>
               </Pressable>
             ))}
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={logout}>
          <LogOut color={Colors.light.danger} size={22} />
          <Typography variant="body1" weight="700" color={Colors.light.danger} style={{ marginLeft: Spacing.md }}>
            Logout
          </Typography>
        </Pressable>
        
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  container: { flex: 1, backgroundColor: Colors.light.surface },
  header: { 
    padding: Spacing.xl, 
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    paddingTop: 40,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
    ...Shadows.light.sm,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
  },
  avatar: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.xl,
    borderWidth: 4, borderColor: Colors.light.primaryLight,
    ...Shadows.light.md,
  },
  editBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primaryLight,
  },
  menuSection: {
    backgroundColor: Colors.light.white,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.light.xs,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  sectionTitle: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, letterSpacing: 1 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  leftIcon: { 
    width: 40, height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F8F9FA', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  menuLabel: { flex: 1, marginLeft: Spacing.md },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.light.xs,
  },
  roleGrid: {
    flexDirection: 'row',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surface,
    borderWidth: 1, borderColor: Colors.light.border,
  },
  activeChip: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    ...Shadows.light.sm,
  },
});
