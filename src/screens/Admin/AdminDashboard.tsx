import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarChart3, Users, Settings, Bell, TrendingUp, AlertCircle, Package, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/Types';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AdminDashboard() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
         <Pressable onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={Colors.light.text} />
         </Pressable>
         <Typography variant="h2" weight="900">Admin Console</Typography>
         <Pressable style={styles.settingsBtn}>
            <Settings size={20} color={Colors.light.text} />
         </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Revenue Overview */}
        <Pressable style={styles.overviewCard}>
           <View style={{ flex: 1 }}>
              <Typography variant="caption" color="rgba(255,255,255,0.8)" weight="600">Total Revenue (MTD)</Typography>
              <Typography variant="h1" color={Colors.light.white} weight="900">₹4,25,000</Typography>
           </View>
           <View style={styles.growthTag}>
              <TrendingUp size={14} color={Colors.light.success} />
              <Typography variant="tiny" weight="700" color={Colors.light.success} style={{ marginLeft: 4 }}>+12.5%</Typography>
           </View>
        </Pressable>

        {/* Interactive Stats Grid */}
        <View style={styles.statsGrid}>
           <Pressable 
              style={[styles.statBox, { backgroundColor: '#F3E8FF' }]}
              onPress={() => navigation.navigate('AdminOrderList')}
           >
              <Package size={22} color="#7C3AED" />
              <Typography variant="h2" weight="900" style={{ marginTop: 8 }}>156</Typography>
              <Typography variant="tiny" color="#7C3AED" weight="700">NEW ORDERS</Typography>
           </Pressable>
           <Pressable 
              style={[styles.statBox, { backgroundColor: '#DCFCE7' }]}
              onPress={() => navigation.navigate('AdminUserManagement')}
           >
              <Users size={22} color="#059669" />
              <Typography variant="h2" weight="900" style={{ marginTop: 8 }}>42</Typography>
              <Typography variant="tiny" color="#059669" weight="700">PROVIDERS</Typography>
           </Pressable>
        </View>

        {/* Global Activity Preview */}
        <View style={styles.sectionHeader}>
           <Typography variant="h3" weight="800">Global Activity</Typography>
           <Pressable onPress={() => navigation.navigate('AdminOrderList')}>
              <Typography variant="body2" color={Colors.light.primary} weight="700">See All</Typography>
           </Pressable>
        </View>
        
        {[
          { id: '1', type: 'Service', item: 'Electrician (Assigned)', customer: 'Amit K.', time: '2m ago' },
          { id: '2', type: 'Shop', item: 'Cleaning Kit (Shipped)', customer: 'Priya S.', time: '15m ago' },
          { id: '3', type: 'Kabadi', item: 'Paper Scrap (Scheduled)', customer: 'Rohit T.', time: '1h ago' },
        ].map((feed) => (
          <Pressable 
            key={feed.id} 
            style={styles.feedCard}
            onPress={() => navigation.navigate('AdminOrderList')}
          >
            <View style={[styles.typeBadge, { backgroundColor: feed.type === 'Service' ? '#DBEAFE' : feed.type === 'Shop' ? '#FDF2F8' : '#ECFDF5' }]}>
               <Typography variant="tiny" weight="700" color={feed.type === 'Service' ? '#1E40AF' : feed.type === 'Shop' ? '#9D174D' : '#047857'}>
                  {feed.type.toUpperCase()}
               </Typography>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
               <Typography variant="body2" weight="800">{feed.item}</Typography>
               <Typography variant="tiny" color={Colors.light.textSecondary}>{feed.customer} • {feed.time}</Typography>
            </View>
            <ChevronRight size={16} color={Colors.light.textMuted} />
          </Pressable>
        ))}

        {/* System Health Monitor */}
        <Typography variant="h3" weight="800" style={styles.sectionTitle}>System Health</Typography>
        <View style={styles.healthRow}>
           <View style={styles.healthItem}>
              <View style={[styles.dot, { backgroundColor: Colors.light.success }]} />
              <Typography variant="tiny" weight="700">API: 99.9%</Typography>
           </View>
           <View style={styles.healthItem}>
              <View style={[styles.dot, { backgroundColor: Colors.light.success }]} />
              <Typography variant="tiny" weight="700">GATEWAY: OK</Typography>
           </View>
           <View style={styles.healthItem}>
              <View style={[styles.dot, { backgroundColor: Colors.light.warning }]} />
              <Typography variant="tiny" weight="700">SMS: LAG</Typography>
           </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Admin Navigation Dock */}
      <View style={styles.tabSim}>
         <Pressable style={styles.tabActive}>
            <Typography variant="tiny" weight="800" color={Colors.light.primary}>DASHBOARD</Typography>
         </Pressable>
         <Pressable onPress={() => navigation.navigate('AdminUserManagement')}>
            <Typography variant="tiny" weight="700" color={Colors.light.textMuted}>USERS</Typography>
         </Pressable>
         <Pressable onPress={() => navigation.navigate('AdminOrderList')}>
            <Typography variant="tiny" weight="700" color={Colors.light.textMuted}>ORDERS</Typography>
         </Pressable>
         <Pressable>
            <Typography variant="tiny" weight="700" color={Colors.light.textMuted}>REPORTS</Typography>
         </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  content: { padding: Spacing.xl },
  overviewCard: {
    backgroundColor: '#1E293B',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.light.md,
  },
  growthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    alignItems: 'center',
    ...Shadows.light.sm,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, marginTop: Spacing.lg },
  sectionTitle: { marginBottom: Spacing.lg, marginTop: Spacing.lg },
  feedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  typeBadge: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row', alignItems: 'center',
  },
  healthRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  healthItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    marginRight: 6,
  },
  tabSim: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 80,
    backgroundColor: Colors.light.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 25,
    borderTopWidth: 1, borderTopColor: Colors.light.borderLight,
    ...Shadows.light.lg,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
    paddingBottom: 4,
  },
});
