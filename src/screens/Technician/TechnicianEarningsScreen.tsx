import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, FlatList } from 'react-native';
import { TrendingUp, Wallet, Download, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

const MOCK_TRANSACTIONS = [
  { id: '1', service: 'AC Repair', amount: 850, date: 'Today, 2:30 PM', status: 'Credited' },
  { id: '2', service: 'Deep Cleaning', amount: 1200, date: 'Today, 11:00 AM', status: 'Credited' },
  { id: '3', service: 'Withdrawal', amount: 2000, date: 'Yesterday', status: 'Debited' },
  { id: '4', service: 'Sofa Cleaning', amount: 450, date: '10 Oct 2023', status: 'Credited' },
];

export default function TechnicianEarningsScreen() {
  const [activeTab, setActiveTab] = useState('Weekly');

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Earnings" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Main Wallet Card */}
        <View style={styles.walletCard}>
           <View style={{ flex: 1 }}>
              <Typography variant="body2" color="rgba(255,255,255,0.8)" weight="600">Total Balance</Typography>
              <Typography variant="h1" color={Colors.light.white} weight="900" style={{ marginTop: 4 }}>₹12,450</Typography>
           </View>
           <Pressable style={styles.withdrawBtn}>
              <Typography variant="body2" weight="800" color={Colors.light.primary}>WITHDRAW</Typography>
           </Pressable>
        </View>

        {/* Filters */}
        <View style={styles.tabs}>
           {['Daily', 'Weekly', 'Monthly'].map(tab => (
             <Pressable 
               key={tab} 
               onPress={() => setActiveTab(tab)}
               style={[styles.tab, activeTab === tab && styles.activeTab]}
             >
                <Typography variant="body2" weight="700" color={activeTab === tab ? Colors.light.white : Colors.light.textSecondary}>
                  {tab}
                </Typography>
             </Pressable>
           ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
           <View style={styles.statBox}>
              <TrendingUp size={20} color={Colors.light.success} />
              <Typography variant="h3" weight="900" style={{ marginTop: 8 }}>₹8,240</Typography>
              <Typography variant="tiny" color={Colors.light.textMuted} weight="700">NET EARNINGS</Typography>
           </View>
           <View style={styles.statBox}>
              <Calendar size={20} color={Colors.light.primary} />
              <Typography variant="h3" weight="900" style={{ marginTop: 8 }}>18</Typography>
              <Typography variant="tiny" color={Colors.light.textMuted} weight="700">JOBS DONE</Typography>
           </View>
        </View>

        {/* Transaction History */}
        <View style={styles.historySection}>
           <View style={styles.sectionHeader}>
              <Typography variant="h4" weight="800">Transaction History</Typography>
              <Pressable style={styles.downloadBtn}>
                 <Download size={16} color={Colors.light.primary} />
                 <Typography variant="body2" weight="700" color={Colors.light.primary} style={{ marginLeft: 6 }}>Invoice</Typography>
              </Pressable>
           </View>

           {MOCK_TRANSACTIONS.map((tx) => (
             <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: tx.status === 'Credited' ? '#ECFDF5' : '#FEF2F2' }]}>
                   {tx.status === 'Credited' ? (
                     <ArrowUpRight size={18} color={Colors.light.success} />
                   ) : (
                     <ArrowDownLeft size={18} color={Colors.light.danger} />
                   )}
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                   <Typography variant="body1" weight="800">{tx.service}</Typography>
                   <Typography variant="caption" color={Colors.light.textMuted}>{tx.date}</Typography>
                </View>
                <Typography variant="body1" weight="800" color={tx.status === 'Credited' ? Colors.light.success : Colors.light.danger}>
                   {tx.status === 'Credited' ? '+' : '-'}₹{tx.amount}
                </Typography>
             </View>
           ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.lg },
  walletCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.light.md,
  },
  withdrawBtn: {
    backgroundColor: Colors.light.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.white,
    alignItems: 'center',
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Shadows.light.sm,
  },
  historySection: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Shadows.light.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  downloadBtn: { flexDirection: 'row', alignItems: 'center' },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surface,
  },
  txIcon: {
    width: 44, height: 44,
    borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
});
