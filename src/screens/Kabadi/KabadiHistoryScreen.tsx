import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  ChevronRight,
  Recycle,
  TrendingUp,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { api } from '../../services/api';
import { mapBookingStatus } from '../Services/BookingsScreen';

export default function KabadiHistoryScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: rawPickups = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my-scrap-bookings'],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: api.kabadi.getMyBookings,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const pickups = (rawPickups || []).map((item: any) => {
    const dateStr = item.booking_date ? item.booking_date.split('T')[0] : '';
    return {
      id: item.id,
      date: dateStr,
      timeSlot: item.time_slot || 'Anytime',
      categories: [item.category_name || item.item_name || 'Mixed Scrap'],
      estimatedValue: item.estimated_value || 0,
      status: item.status,
    };
  });

  pickups.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const totalEarned = pickups
    .filter((p: any) => p.status === 'completed')
    .reduce((acc: number, p: any) => acc + (p.estimatedValue || 0), 0);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.historyCard}
      onPress={() =>
        navigation.navigate('KabadiStatus', { bookingId: item.id })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateRow}>
          <Calendar size={14} color={Colors.light.textMuted} />
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            style={{ marginLeft: 6 }}
          >
            {item.date}
          </Typography>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'completed'
              ? styles.statusSuccess
              : item.status === 'cancelled'
                ? styles.statusDanger
                : styles.statusWarning,
          ]}
        >
          <Typography
            variant="tiny"
            weight="800"
            color={
              item.status === 'completed'
                ? Colors.light.success
                : item.status === 'cancelled'
                  ? Colors.light.danger
                  : Colors.light.primary
            }
          >
            {mapBookingStatus(item.status).toUpperCase()}
          </Typography>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Typography variant="body1" weight="800">
          {item.categories.join(', ')}
        </Typography>
        <Typography
          variant="caption"
          color={Colors.light.textSecondary}
          style={{ marginTop: 2 }}
        >
          Slot: {item.timeSlot}
        </Typography>

        <View style={styles.impactTag}>
          <Recycle size={12} color={Colors.light.success} />
          <Typography
            variant="tiny"
            color={Colors.light.success}
            weight="700"
            style={{ marginLeft: 4 }}
          >
            {item.status === 'completed'
              ? 'Processing ecological impact...'
              : 'Pending Pickup'}
          </Typography>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Typography variant="caption" color={Colors.light.textMuted}>
            EST. VALUE
          </Typography>
          <Typography variant="h4" weight="900" color={Colors.light.primary}>
            ₹{item.estimatedValue || '---'}
          </Typography>
        </View>
        <Pressable
          style={styles.detailsBtn}
          onPress={() =>
            navigation.navigate('KabadiStatus', { bookingId: item.id })
          }
        >
          <Typography variant="body2" weight="700" color={Colors.light.primary}>
            Details
          </Typography>
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
          <Typography variant="h3" weight="900" style={{ marginLeft: 8 }}>
            ₹{totalEarned.toLocaleString()}
          </Typography>
          <Typography
            variant="tiny"
            color={Colors.light.textMuted}
            weight="700"
            style={{ marginLeft: 4 }}
          >
            TOTAL EARNED
          </Typography>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Typography
            variant="body2"
            color={Colors.light.textSecondary}
            style={{ marginTop: 12 }}
          >
            Loading pickups...
          </Typography>
        </View>
      ) : (
        <FlatList
          data={pickups}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Recycle size={60} color={Colors.light.border} />
              <Typography
                variant="body1"
                weight="700"
                style={{ marginTop: Spacing.md }}
              >
                No pickups yet
              </Typography>
            </View>
          }
        />
      )}
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
  statusWarning: { backgroundColor: '#FFFBEB' },
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
});
