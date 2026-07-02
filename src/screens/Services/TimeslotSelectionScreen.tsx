import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Clock, AlertCircle, Check } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { api } from '../../services/api';
import { useBookingStore } from '../../store/useBookingStore';

interface TimeslotItem {
  id: string;
  start_time: string;
  end_time: string;
  available: boolean;
}

export default function TimeslotSelectionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { serviceId, date, returnScreen, initialTimeslotId } =
    route.params || {};

  const [timeslots, setTimeslots] = useState<TimeslotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeslotItem | null>(null);

  const bookings = useBookingStore(state => state.bookings);
  const selectedTimeslotStore = useBookingStore(
    state => state.selectedTimeslot,
  );
  const setSelectedTimeslotStore = useBookingStore(
    state => state.setSelectedTimeslot,
  );

  useEffect(() => {
    async function fetchTimeslots() {
      if (!serviceId || !date) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const slots = await api.bookings.getAvailableTimeslots(serviceId, date);

        // Filter out already booked slots from the local Zustand store
        const updatedSlots = slots.map(slot => {
          const isBookedLocally = bookings.some(
            b =>
              b.serviceId === serviceId &&
              b.rawDate === date &&
              b.timeslotId === slot.id &&
              b.status !== 'Cancelled',
          );
          return {
            ...slot,
            available: slot.available && !isBookedLocally,
          };
        });

        setTimeslots(updatedSlots);

        // Auto-select initial slot if provided and still available
        const currentSelectedId =
          initialTimeslotId || selectedTimeslotStore?.id;
        if (currentSelectedId) {
          const match = updatedSlots.find(
            s => s.id === currentSelectedId && s.available,
          );
          if (match) {
            setSelectedSlot(match);
          }
        }
      } catch (err) {
        console.error('Failed to load available timeslots', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTimeslots();
  }, [serviceId, date, initialTimeslotId, selectedTimeslotStore, bookings]);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const formatDateLong = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;

    setSelectedTimeslotStore(selectedSlot);

    navigation.navigate({
      name: returnScreen,
      params: { selectedTimeslot: selectedSlot },
      merge: true,
    });
  };

  const renderSlotCell = ({ item }: { item: TimeslotItem }) => {
    const isSelected = selectedSlot?.id === item.id;
    const isAvailable = item.available;

    return (
      <TouchableOpacity
        style={[
          styles.slotCard,
          !isAvailable && styles.disabledCard,
          isSelected && styles.selectedCard,
        ]}
        disabled={!isAvailable}
        onPress={() => setSelectedSlot(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <Clock
            size={18}
            color={
              isSelected
                ? Colors.light.primary
                : isAvailable
                  ? Colors.light.text
                  : Colors.light.textMuted
            }
          />
          <View style={styles.timeTextContainer}>
            <Typography
              variant="body2"
              weight="700"
              style={[
                styles.timeText,
                !isAvailable && styles.disabledText,
                isSelected && styles.selectedText,
              ]}
            >
              {formatTime(item.start_time)} - {formatTime(item.end_time)}
            </Typography>
            <Typography
              variant="caption"
              style={[
                styles.statusText,
                !isAvailable && styles.disabledStatusText,
                isSelected && styles.selectedStatusText,
              ]}
            >
              {isAvailable ? 'Available' : 'Fully Booked / Past'}
            </Typography>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Check size={12} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Select Timeslot" showBack />

      <View style={styles.content}>
        <View style={styles.dateHeader}>
          <Typography variant="body2" style={styles.dateLabel}>
            Selected Date:
          </Typography>
          <Typography variant="body1" weight="700" style={styles.dateValue}>
            {formatDateLong(date)}
          </Typography>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Typography variant="body2" style={styles.loadingText}>
              Fetching available timeslots...
            </Typography>
          </View>
        ) : timeslots.length === 0 ? (
          <View style={styles.centerContainer}>
            <AlertCircle size={48} color={Colors.light.textMuted} />
            <Typography variant="body1" weight="700" style={styles.emptyTitle}>
              No Timeslots Available
            </Typography>
            <Typography variant="caption" style={styles.emptySubtitle}>
              Please select a different date or try again later.
            </Typography>
          </View>
        ) : (
          <FlatList
            data={timeslots}
            renderItem={renderSlotCell}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="Confirm Timeslot"
          onPress={handleConfirm}
          disabled={!selectedSlot}
          variant="primary"
          style={styles.confirmButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  dateHeader: {
    marginVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    ...Shadows.light.sm,
  },
  dateLabel: {
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  dateValue: {
    color: Colors.light.text,
  },
  listContainer: {
    paddingBottom: Spacing.xl,
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    position: 'relative',
    ...Shadows.light.sm,
  },
  selectedCard: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  disabledCard: {
    backgroundColor: '#E9ECEF',
    borderColor: '#DEE2E6',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTextContainer: {
    marginLeft: Spacing.md,
  },
  timeText: {
    color: Colors.light.text,
  },
  selectedText: {
    color: Colors.light.primary,
  },
  disabledText: {
    color: Colors.light.textMuted,
    textDecorationLine: 'line-through',
  },
  statusText: {
    color: Colors.light.success,
    marginTop: 2,
  },
  selectedStatusText: {
    color: Colors.light.primary,
  },
  disabledStatusText: {
    color: Colors.light.textMuted,
  },
  checkBadge: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.light.textSecondary,
  },
  emptyTitle: {
    marginTop: Spacing.md,
    color: Colors.light.textSecondary,
  },
  emptySubtitle: {
    marginTop: Spacing.xs,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E9ECEF',
  },
  confirmButton: {
    width: '100%',
  },
});
