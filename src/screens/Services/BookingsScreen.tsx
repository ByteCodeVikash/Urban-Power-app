import React, { useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, ListRenderItem } from 'react-native';
import { Calendar, CheckCircle2 } from 'lucide-react-native';
// import { useBookings } from '../../hooks/useServices'; // Removed to use unified store
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useBookingStore, Booking } from '../../store/useBookingStore';

const BookingItem = React.memo(({ item }: { item: Booking }) => (
  <View style={styles.bookingCard}>
    <View style={styles.cardHeader}>
      <View style={styles.statusBadge}>
        <CheckCircle2 color={Colors.light.success} size={14} />
        <Typography variant="caption" color={Colors.light.success} weight="600" style={{ marginLeft: 4 }}>
          {item.status}
        </Typography>
      </View>
      <Typography variant="body2" color={Colors.light.textSecondary}>
        {item.date}
      </Typography>
    </View>
    <Typography variant="body1" weight="600" style={{ marginTop: Spacing.sm }}>
      {item.title}
    </Typography>
    {item.subtitle && (
      <Typography variant="tiny" color={Colors.light.textSecondary}>
        {item.subtitle}
      </Typography>
    )}
    <View style={styles.cardFooter}>
      <Typography variant="body2" color={Colors.light.textSecondary}>
        Booking ID: {item.id}
      </Typography>
      <Typography variant="body1" weight="700">
        ₹{item.price}
      </Typography>
    </View>
  </View>
));

export default function BookingsScreen() {
  const { bookings } = useBookingStore();

  const renderItem: ListRenderItem<Booking> = useCallback(({ item }) => (
    <BookingItem item={item} />
  ), []);

  const keyExtractor = useCallback((item: Booking) => item.id, []);

  if (!bookings || bookings.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="My Bookings" />
        <View style={styles.emptyContainer}>
          <Calendar color={Colors.light.border} size={80} />
          <Typography variant="h3" weight="600" style={{ marginTop: Spacing.xl }}>
            No bookings found
          </Typography>
          <Typography variant="body1" color={Colors.light.textSecondary} style={{ marginTop: Spacing.sm, textAlign: 'center' }}>
            You haven't booked any services yet.
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Bookings" />
      <FlatList
        data={bookings}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        windowSize={5}
        ListEmptyComponent={null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  listContent: {
    padding: Spacing.lg,
  },
  bookingCard: {
    backgroundColor: Colors.light.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.light.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.surface,
  },
});
