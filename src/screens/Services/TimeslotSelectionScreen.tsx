import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Clock,
  AlertCircle,
  Check,
  Sun,
  CloudSun,
  Moon,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { api } from '../../services/api';
import { useBookingStore } from '../../store/useBookingStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeslotItem {
  id: string;
  start_time: string;
  end_time: string;
  available: boolean;
}

type PeriodKey = 'Morning' | 'Afternoon' | 'Evening';

interface Period {
  key: PeriodKey;
  label: string;
  sublabel: string;
  startHour: number; // inclusive
  endHour: number; // exclusive
  Icon: React.ComponentType<any>;
  accentColor: string;
  bgColor: string;
}

// ─── Period Config ─────────────────────────────────────────────────────────────

const PERIODS: Period[] = [
  {
    key: 'Morning',
    label: 'Morning',
    sublabel: '6:00 AM – 12:00 PM',
    startHour: 6,
    endHour: 12,
    Icon: Sun,
    accentColor: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  {
    key: 'Afternoon',
    label: 'Afternoon',
    sublabel: '12:00 PM – 5:00 PM',
    startHour: 12,
    endHour: 17,
    Icon: CloudSun,
    accentColor: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    key: 'Evening',
    label: 'Evening',
    sublabel: '5:00 PM – 9:00 PM',
    startHour: 17,
    endHour: 21,
    Icon: Moon,
    accentColor: Colors.light.primary,
    bgColor: Colors.light.primaryLight,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseHour = (timeStr: string): number => {
  if (!timeStr) return 0;
  return parseInt(timeStr.split(':')[0], 10);
};

const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
};

const formatDateLong = (dateStr: string): string => {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimeslotSelectionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { serviceId, date, initialTimeslotId } = route.params || {};

  const [timeslots, setTimeslots] = useState<TimeslotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeslotItem | null>(null);

  // ── Store ──
  const bookings = useBookingStore(state => state.bookings);
  const selectedTimeslotStore = useBookingStore(
    state => state.selectedTimeslot,
  );
  const setSelectedTimeslotStore = useBookingStore(
    state => state.setSelectedTimeslot,
  );

  // ── Fetch & enrich timeslots ──
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

  // ── Confirm handler (unchanged logic) ──
  const handleConfirm = () => {
    if (!selectedSlot) return;
    setSelectedTimeslotStore(selectedSlot);
    navigation.goBack();
  };

  // ── Single-selection handler ──
  const handleSelectSlot = (slot: TimeslotItem) => {
    if (!slot.available) return;
    // Single selection: replace any previous selection
    setSelectedSlot(prev => (prev?.id === slot.id ? null : slot));
  };

  // ── Group slots into periods ──
  const groupedSlots = (periodKey: PeriodKey): TimeslotItem[] => {
    const period = PERIODS.find(p => p.key === periodKey)!;
    return timeslots.filter(s => {
      const h = parseHour(s.start_time);
      return h >= period.startHour && h < period.endHour;
    });
  };

  // ── Render a single slot pill ──
  const renderSlotPill = (item: TimeslotItem, accentColor: string) => {
    const isSelected = selectedSlot?.id === item.id;
    const isAvailable = item.available;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.slotPill,
          isAvailable ? styles.slotPillAvailable : styles.slotPillDisabled,
          isSelected && {
            ...styles.slotPillSelected,
            borderColor: accentColor,
          },
        ]}
        disabled={!isAvailable}
        onPress={() => handleSelectSlot(item)}
        activeOpacity={0.75}
      >
        {isSelected && (
          <View style={[styles.pillCheckDot, { backgroundColor: accentColor }]}>
            <Check size={10} color="#FFFFFF" strokeWidth={3} />
          </View>
        )}
        <Typography
          variant="body2"
          weight="700"
          style={[
            styles.pillTimeText,
            !isAvailable && styles.pillTimeTextDisabled,
            isSelected && { color: accentColor },
          ]}
        >
          {formatTime(item.start_time)}
        </Typography>
        <Typography
          variant="tiny"
          style={[
            styles.pillSepText,
            !isAvailable && styles.pillTimeTextDisabled,
          ]}
        >
          –
        </Typography>
        <Typography
          variant="body2"
          weight="700"
          style={[
            styles.pillTimeText,
            !isAvailable && styles.pillTimeTextDisabled,
            isSelected && { color: accentColor },
          ]}
        >
          {formatTime(item.end_time)}
        </Typography>
        {!isAvailable && (
          <View style={styles.pillUnavailableBadge}>
            <Typography variant="tiny" style={styles.pillUnavailableText}>
              Full
            </Typography>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ── Render a period section ──
  const renderPeriodSection = (period: Period) => {
    const slots = groupedSlots(period.key);
    if (slots.length === 0) return null;

    const availableCount = slots.filter(s => s.available).length;
    const { Icon, accentColor, bgColor, label, sublabel } = period;

    return (
      <View key={period.key} style={styles.periodCard}>
        {/* Period header */}
        <View style={styles.periodHeader}>
          <View style={[styles.periodIconBg, { backgroundColor: bgColor }]}>
            <Icon size={18} color={accentColor} strokeWidth={2.2} />
          </View>
          <View style={styles.periodHeaderText}>
            <Typography variant="body1" weight="700" style={styles.periodLabel}>
              {label}
            </Typography>
            <Typography
              variant="caption"
              style={[
                styles.periodSublabel,
                { color: Colors.light.textSecondary },
              ]}
            >
              {sublabel}
            </Typography>
          </View>
          <View
            style={[
              styles.availBadge,
              availableCount === 0 && styles.availBadgeNone,
              { borderColor: availableCount > 0 ? accentColor : '#D1D5DB' },
            ]}
          >
            <Typography
              variant="tiny"
              weight="700"
              style={{
                color:
                  availableCount > 0 ? accentColor : Colors.light.textMuted,
              }}
            >
              {availableCount === 0 ? 'Full' : `${availableCount} open`}
            </Typography>
          </View>
        </View>

        {/* Slot pills grid */}
        <View style={styles.pillGrid}>
          {slots.map(s => renderSlotPill(s, accentColor))}
        </View>
      </View>
    );
  };

  // ── Main render ──
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Select Timeslot" showBack />

      {/* Date banner */}
      <View style={styles.dateBanner}>
        <Clock size={15} color={Colors.light.primary} strokeWidth={2.2} />
        <Typography
          variant="body2"
          weight="600"
          style={styles.dateBannerText}
          numberOfLines={1}
        >
          {formatDateLong(date)}
        </Typography>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Typography variant="body2" style={styles.loadingText}>
            Fetching available timeslots…
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Legend row */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors.light.primary },
                ]}
              />
              <Typography variant="tiny" color={Colors.light.textSecondary}>
                Available
              </Typography>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#D1D5DB' }]}
              />
              <Typography variant="tiny" color={Colors.light.textSecondary}>
                Fully Booked
              </Typography>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors.light.primary, opacity: 0.9 },
                ]}
              />
              <Check
                size={9}
                color="#fff"
                strokeWidth={3}
                style={{ position: 'absolute' }}
              />
              <Typography variant="tiny" color={Colors.light.textSecondary}>
                Selected
              </Typography>
            </View>
          </View>

          {PERIODS.map(renderPeriodSection)}
          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      )}

      {/* Footer CTA */}
      <View style={styles.footer}>
        {selectedSlot && (
          <View style={styles.selectedSummary}>
            <Clock size={14} color={Colors.light.primary} />
            <Typography
              variant="caption"
              weight="700"
              style={styles.selectedSummaryText}
              numberOfLines={1}
            >
              {formatTime(selectedSlot.start_time)} –{' '}
              {formatTime(selectedSlot.end_time)}
            </Typography>
          </View>
        )}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#F4F5F9',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  centerContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  // Date banner
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#E0DBFF',
  },
  dateBannerText: {
    color: Colors.light.primary,
    flex: 1,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    position: 'relative',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Period card
  periodCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.light.sm,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  periodIconBg: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodHeaderText: {
    flex: 1,
  },
  periodLabel: {
    color: Colors.light.text,
    lineHeight: 20,
  },
  periodSublabel: {
    marginTop: 1,
  },
  availBadge: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  availBadgeNone: {
    borderColor: '#D1D5DB',
  },

  // Pill grid
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  // Slot pill
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: 3,
    position: 'relative',
  },
  slotPillAvailable: {
    backgroundColor: Colors.light.surface,
    borderColor: '#D1D5DB',
  },
  slotPillDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.65,
  },
  slotPillSelected: {
    backgroundColor: Colors.light.primaryLight,
    // borderColor set dynamically per period accent
  },
  pillCheckDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  pillTimeText: {
    color: Colors.light.text,
    fontSize: 13,
  },
  pillTimeTextDisabled: {
    color: Colors.light.textMuted,
    textDecorationLine: 'line-through',
  },
  pillSepText: {
    color: Colors.light.textMuted,
    fontSize: 12,
  },
  pillUnavailableBadge: {
    marginLeft: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pillUnavailableText: {
    color: Colors.light.textMuted,
    fontSize: 9,
  },

  // Loading / empty
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

  // Footer
  footer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.light.md,
  },
  selectedSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  selectedSummaryText: {
    color: Colors.light.primary,
  },
  confirmButton: {
    width: '100%',
  },
});
