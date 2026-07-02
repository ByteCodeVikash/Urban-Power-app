import React, { useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, ListRenderItem, Alert, TouchableOpacity } from 'react-native';
import { Calendar, CheckCircle2 } from 'lucide-react-native';
// import { useBookings } from '../../hooks/useServices'; // Removed to use unified store
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useBookingStore, Booking } from '../../store/useBookingStore';

const BookingItem = React.memo(({ item, onCancel }: { item: Booking; onCancel: (id: string) => void }) => {
  const isCancellable = item.status === 'Pending' || item.status === 'Confirmed' || item.status === 'Booked' as any;

  return (
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
      {isCancellable && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(item.id)}>
          <Typography variant="body2" color={Colors.light.error} weight="600">
            Cancel Booking
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
});

export default function BookingsScreen() {
  const { bookings, cancelBooking } = useBookingStore();

  const handleCancel = useCallback((id: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", style: "destructive", onPress: () => cancelBooking(id) }
      ]
    );
  }, [cancelBooking]);

  const renderItem: ListRenderItem<Booking> = useCallback(({ item }) => (
    <BookingItem item={item} onCancel={handleCancel} />
  ), [handleCancel]);

  const keyExtractor = useCallback((item: Booking) => item.id, []);

  if (!bookings || bookings.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="My Bookings" />
        <View style={styles.emptyContainer}>
          <Calendar color={Colors.light.border} size={80} />
          <Typography variant="h3" weight="600" style={{ marginTop: Spacing.xl }}>
            No bookings yet
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
    paddingHorizontal: Spacing.xl,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  cancelButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});