import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ListRenderItem,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Calendar, Clock, CreditCard, Hash } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { api } from '../../services/api';

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'confirmed' || s === 'completed') {
    return {
      bg: '#ECFDF5', // Emerald 50
      text: '#059669', // Emerald 600
    };
  }
  if (s === 'cancelled') {
    return {
      bg: '#FEF2F2', // Red 50
      text: '#DC2626', // Red 600
    };
  }
  if (s === 'in_progress' || s === 'assigned') {
    return {
      bg: '#EFF6FF', // Blue 50
      text: '#2563EB', // Blue 600
    };
  }
  // Pending or other
  return {
    bg: '#FFFBEB', // Amber 50
    text: '#D97706', // Amber 600
  };
};

const BookingItem = React.memo(({ item }: { item: any }) => {
  const statusStyle = getStatusColor(item.status);

  return (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Typography
            variant="caption"
            color={statusStyle.text}
            weight="700"
            style={{ textTransform: 'capitalize' }}
          >
            {item.status.replace('_', ' ')}
          </Typography>
        </View>
        <Typography variant="body2" color={Colors.light.textSecondary}>
          {item.date}
        </Typography>
      </View>

      <Typography
        variant="body1"
        weight="700"
        style={{ marginTop: Spacing.md }}
      >
        {item.service}
      </Typography>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Hash size={14} color={Colors.light.textMuted} />
          <Typography
            variant="caption"
            color={Colors.light.textSecondary}
            style={{ marginLeft: 6 }}
            numberOfLines={1}
          >
            Booking ID: {item.booking_id}
          </Typography>
        </View>

        {item.timeslot ? (
          <View style={styles.detailItem}>
            <Clock size={14} color={Colors.light.textMuted} />
            <Typography
              variant="caption"
              color={Colors.light.textSecondary}
              style={{ marginLeft: 6 }}
            >
              Timeslot: {item.timeslot}
            </Typography>
          </View>
        ) : null}

        {item.payment_method ? (
          <View style={styles.detailItem}>
            <CreditCard size={14} color={Colors.light.textMuted} />
            <Typography
              variant="caption"
              color={Colors.light.textSecondary}
              style={{ marginLeft: 6 }}
            >
              Payment: {item.payment_method}
            </Typography>
          </View>
        ) : null}
      </View>
    </View>
  );
});

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const data = await api.bookings.getBookingHistory();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch booking history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings(false);
  }, []);

  const renderItem: ListRenderItem<any> = useCallback(
    ({ item }) => <BookingItem item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: any) => item.booking_id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Bookings" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Typography
            variant="body2"
            color={Colors.light.textSecondary}
            style={{ marginTop: 12 }}
          >
            Loading bookings...
          </Typography>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Calendar color={Colors.light.border} size={80} />
              <Typography
                variant="h3"
                weight="600"
                style={{ marginTop: Spacing.xl }}
              >
                No bookings yet
              </Typography>
              <Typography
                variant="body1"
                color={Colors.light.textSecondary}
                style={{ marginTop: Spacing.sm, textAlign: 'center' }}
              >
                You haven't booked any services yet. Pull down to refresh.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 100,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  bookingCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  detailsRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
