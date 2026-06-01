import React from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, ChevronRight, Recycle, TrendingUp } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

import { useKabadiStore, PickupRequest } from '../../store/useKabadiStore';

export default function KabadiHistoryScreen() {
  const navigation = useNavigation();
  const { pickups } = useKabadiStore();

  const renderItem = ({ item }: { item: PickupRequest }) => (
    <Pressable style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dateRow}>
          <Calendar size={14} color={Colors.light.textMuted} />
          <Typography variant="caption" color={Colors.light.textMuted} style={{ marginLeft: 6 }}>
            {item.date}
          </Typography>
        </View>
        <View style={[
          styles.statusBadge, 
          item.status === 'Completed' ? styles.statusSuccess : styles.statusDanger
        ]}>
          <Typography variant="tiny" weight="800" color={item.status === 'Completed' ? Colors.light.success : Colors.light.danger}>
            {item.status.toUpperCase()}
          </Typography>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Typography variant="body1" weight="800">{item.categories.join(', ')}</Typography>
        <Typography variant="caption" color={Colors.light.textSecondary} style={{ marginTop: 2 }}>
           Slot: {item.timeSlot}
        </Typography>
        
        <View style={styles.impactTag}>
           <Recycle size={12} color={Colors.light.success} />
           <Typography variant="tiny" color={Colors.light.success} weight="700" style={{ marginLeft: 4 }}>
             {item.status === 'Completed' ? 'Processing ecological impact...' : 'Pending Pickup'}
           </Typography>
        </View>
      </View>

      <View style={styles.cardFooter}>
         <View>
            <Typography variant="caption" color={Colors.light.textMuted}>EST. VALUE</Typography>
            <Typography variant="h4" weight="900" color={Colors.light.primary}>₹{item.estimatedValue || '---'}</Typography>
         </View>
         <Pressable style={styles.detailsBtn} onPress={() => {}}>
            <Typography variant="body2" weight="700" color={Colors.light.primary}>Details</Typography>
            <ChevronRight size={16} color={Colors.light.primary} />
         </Pressable>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Pickup History" showBack />
      
      <View style={styles.summaryBanner}>
         <View style={styles.summaryItem}>
            <TrendingUp size={20} color={Colors.light.success} />
            <Typography variant="h3" weight="900" style={{ marginLeft: 8 }}>₹2,480</Typography>
            <Typography variant="tiny" color={Colors.light.textMuted} weight="700" style={{ marginLeft: 4 }}>TOTAL EARNED</Typography>
         </View>
      </View>

      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Recycle size={60} color={Colors.light.border} />
            <Typography variant="body1" weight="700" style={{ marginTop: Spacing.md }}>No pickups yet</Typography>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  list: { padding: Spacing.lg },
  summaryBanner: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.light.sm,
  },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  historyCard: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusSuccess: { backgroundColor: '#ECFDF5' },
  statusDanger: { backgroundColor: '#FEF2F2' },
  cardBody: { marginBottom: Spacing.md },
  impactTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.surface,
  },
  detailsBtn: { flexDirection: 'row', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
});
