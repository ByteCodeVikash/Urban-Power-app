import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { api } from '../../services/api';

import { useBookingStore } from '../../store/useBookingStore';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface DayItem {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
}

export default function DateSelectionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { serviceId, returnScreen, initialDate } = route.params || {};

  const selectedDateStore = useBookingStore(state => state.selectedDate);
  const setSelectedDateStore = useBookingStore(state => state.setSelectedDate);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || selectedDateStore || '',
  );

  // Calendar month/year navigation state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    async function fetchDates() {
      if (!serviceId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const dates = await api.bookings.getAvailableDates(serviceId);
        setAvailableDates(dates);
      } catch (err) {
        console.error('Failed to load available dates', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDates();
  }, [serviceId]);

  // Set the calendar view to the selected or initial date month if provided
  useEffect(() => {
    if (initialDate) {
      const [year, month] = initialDate.split('-').map(Number);
      if (year && month) {
        setCurrentYear(year);
        setCurrentMonth(month - 1);
      }
    }
  }, [initialDate]);

  // Generate days in grid for currentMonth/currentYear
  const getDaysInMonth = (year: number, month: number): DayItem[] => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const days: DayItem[] = [];

    // Previous month padding
    const prevMonthDate = new Date(year, month, 0);
    const prevMonthDays = prevMonthDate.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      const dateStr = `${py}-${String(pm + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: day, isCurrentMonth: false });
    }

    // Current month days
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: i, isCurrentMonth: true });
    }

    // Next month padding to align rows
    const totalCells = days.length;
    const remaining = totalCells % 7;
    if (remaining > 0) {
      const paddingNeeded = 7 - remaining;
      const nm = month === 11 ? 0 : month + 1;
      const ny = month === 11 ? year + 1 : year;
      for (let i = 1; i <= paddingNeeded; i++) {
        const dateStr = `${ny}-${String(nm + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({ dateStr, dayNum: i, isCurrentMonth: false });
      }
    }

    return days;
  };

  const daysGrid = getDaysInMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const checkIsPast = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const compareToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    return dateObj < compareToday;
  };

  const handleSelectDay = (day: DayItem) => {
    if (!day.isCurrentMonth) {
      // Switch month if user taps padded days of prev/next month
      const [y, m] = day.dateStr.split('-').map(Number);
      setCurrentYear(y);
      setCurrentMonth(m - 1);
    }

    const isPast = checkIsPast(day.dateStr);
    const isAvailable = availableDates.includes(day.dateStr);

    if (isPast || !isAvailable) {
      return; // Do nothing for invalid/past/unavailable dates
    }

    setSelectedDate(day.dateStr);
  };

  const handleConfirm = () => {
    if (!selectedDate) return;

    setSelectedDateStore(selectedDate);

    navigation.navigate({
      name: returnScreen,
      params: { selectedDate },
      merge: true,
    });
  };

  const formatDateLong = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderDayCell = ({ item }: { item: DayItem }) => {
    const isPast = checkIsPast(item.dateStr);
    const isAvailable = availableDates.includes(item.dateStr);
    const isSelected = selectedDate === item.dateStr;
    const isClickable = !isPast && isAvailable;

    let cellStyle: any = [styles.dayCell];
    let textStyle: any = [styles.dayText];

    if (!item.isCurrentMonth) {
      textStyle.push(styles.otherMonthText);
    }

    if (isSelected) {
      cellStyle.push(styles.selectedCell);
      textStyle.push(styles.selectedText);
    } else if (isClickable) {
      cellStyle.push(styles.availableCell);
      textStyle.push(styles.availableText);
    } else {
      cellStyle.push(styles.disabledCell);
      textStyle.push(styles.disabledText);
    }

    return (
      <TouchableOpacity
        style={cellStyle}
        disabled={!isClickable && item.isCurrentMonth}
        onPress={() => handleSelectDay(item)}
        activeOpacity={0.7}
      >
        <Typography
          variant="body2"
          weight={isSelected ? '700' : '600'}
          style={textStyle}
        >
          {item.dayNum}
        </Typography>
        {isAvailable && !isSelected && <View style={styles.dotIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Select Booking Date" showBack />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Typography variant="body2" style={{ marginTop: Spacing.md }}>
              Fetching available slots...
            </Typography>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {/* Calendar Card */}
            <View style={styles.calendarCard}>
              {/* Header Navigation */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  onPress={handlePrevMonth}
                  style={styles.navButton}
                >
                  <ChevronLeft size={24} color={Colors.light.text} />
                </TouchableOpacity>

                <Typography variant="h3" weight="700" style={styles.monthLabel}>
                  {MONTHS[currentMonth]} {currentYear}
                </Typography>

                <TouchableOpacity
                  onPress={handleNextMonth}
                  style={styles.navButton}
                >
                  <ChevronRight size={24} color={Colors.light.text} />
                </TouchableOpacity>
              </View>

              {/* Weekdays row */}
              <View style={styles.weekdaysRow}>
                {WEEKDAYS.map((day, idx) => (
                  <View key={idx} style={styles.weekdayCell}>
                    <Typography
                      variant="caption"
                      weight="700"
                      color={Colors.light.textSecondary}
                    >
                      {day.substring(0, 2).toUpperCase()}
                    </Typography>
                  </View>
                ))}
              </View>

              {/* Days Grid */}
              <FlatList
                data={daysGrid}
                renderItem={renderDayCell}
                keyExtractor={item => item.dateStr}
                numColumns={7}
                scrollEnabled={false}
                contentContainerStyle={styles.gridContainer}
              />
            </View>

            {/* Legend / Status section */}
            <View style={styles.legendCard}>
              <Typography
                variant="h4"
                weight="700"
                style={{ marginBottom: Spacing.md }}
              >
                Booking Details
              </Typography>

              <View style={styles.legendRows}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendIndicator,
                      {
                        backgroundColor: Colors.light.primaryLight,
                        borderColor: Colors.light.primary,
                        borderWidth: 1,
                      },
                    ]}
                  />
                  <Typography
                    variant="body2"
                    color={Colors.light.textSecondary}
                  >
                    Available
                  </Typography>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendIndicator,
                      { backgroundColor: Colors.light.primary },
                    ]}
                  />
                  <Typography
                    variant="body2"
                    color={Colors.light.textSecondary}
                  >
                    Selected
                  </Typography>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendIndicator,
                      { backgroundColor: Colors.light.surfaceAlt },
                    ]}
                  />
                  <Typography
                    variant="body2"
                    color={Colors.light.textSecondary}
                  >
                    Unavailable
                  </Typography>
                </View>
              </View>

              <View style={styles.divider} />

              {selectedDate ? (
                <View style={styles.selectionRow}>
                  <CheckCircle2
                    size={20}
                    color={Colors.light.success}
                    style={{ marginRight: Spacing.sm }}
                  />
                  <View style={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color={Colors.light.textSecondary}
                    >
                      Selected Date
                    </Typography>
                    <Typography
                      variant="body1"
                      weight="700"
                      color={Colors.light.text}
                    >
                      {formatDateLong(selectedDate)}
                    </Typography>
                  </View>
                </View>
              ) : (
                <View style={styles.selectionRow}>
                  <AlertCircle
                    size={20}
                    color={Colors.light.warning}
                    style={{ marginRight: Spacing.sm }}
                  />
                  <Typography
                    variant="body2"
                    color={Colors.light.textSecondary}
                  >
                    Please select an available date to proceed.
                  </Typography>
                </View>
              )}
            </View>

            {/* Confirmation Footer */}
            <View style={styles.footer}>
              <Button
                title={selectedDate ? 'Confirm Date' : 'Select a Date'}
                disabled={!selectedDate}
                onPress={handleConfirm}
                style={styles.confirmBtn}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  container: { flex: 1, padding: Spacing.md },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  calendarCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.light.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: Spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.surface,
  },
  monthLabel: {
    textAlign: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  gridContainer: {
    paddingVertical: Spacing.xs,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    marginVertical: Spacing.xxs,
    position: 'relative',
  },
  dayText: {
    color: Colors.light.text,
  },
  otherMonthText: {
    opacity: 0.3,
  },
  selectedCell: {
    backgroundColor: Colors.light.primary,
    ...Shadows.light.xs,
  },
  selectedText: {
    color: Colors.light.white,
  },
  availableCell: {
    backgroundColor: Colors.light.primaryLight,
  },
  availableText: {
    color: Colors.light.primary,
  },
  disabledCell: {
    backgroundColor: 'transparent',
  },
  disabledText: {
    color: Colors.light.textMuted,
    textDecorationLine: 'none',
  },
  dotIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
  },
  legendCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.light.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: Spacing.md,
  },
  legendRows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.md,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
  },
  confirmBtn: {
    width: '100%',
  },
});
