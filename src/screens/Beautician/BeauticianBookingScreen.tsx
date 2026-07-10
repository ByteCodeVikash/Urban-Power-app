import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  BackHandler,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  User,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useBookingStore } from '../../store/useBookingStore';
import { useBeauticianStore } from '../../store/useBeauticianStore';
import { useAddressStore } from '../../store/useAddressStore';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';

interface DayItem {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
}

export default function BeauticianBookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const {
    addresses,
    isLoading: isLoadingAddresses,
    fetchAddresses,
  } = useAddressStore();

  const selectedServices = useBeauticianStore(state => state.selectedServices);
  const clearSelection = useBeauticianStore(state => state.clearSelection);
  const getTotalPrice = useBeauticianStore(state => state.getTotalPrice());
  const getSelectedCount = useBeauticianStore(state =>
    state.getSelectedCount(),
  );

  // Read selectedDate & selectedTimeslot from Zustand store
  const storeSelectedDate = useBookingStore(state => state.selectedDate);
  const setSelectedDateStore = useBookingStore(state => state.setSelectedDate);
  const selectedTimeslotStore = useBookingStore(
    state => state.selectedTimeslot,
  );

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(() => {
    const rawPhone = user?.phone || '';
    const cleaned = rawPhone.replace(/[^0-9]/g, '');
    return cleaned.slice(-10);
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [date, setDate] = useState(storeSelectedDate || '');
  const [timeslot, setTimeslot] = useState<any>(selectedTimeslotStore || null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date Picker Modal State
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDateTemp, setSelectedDateTemp] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  // Calendar month/year navigation state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Weekdays & Months constants
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

  // Helper: Generate days in grid for currentMonth/currentYear
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

  // Fetch PostgreSQL addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  // Fetch available dates for the selected beauty services
  useEffect(() => {
    async function fetchAvailableDates() {
      const firstServiceId = selectedServices[0]?.id;
      if (!firstServiceId) return;
      try {
        setIsLoadingDates(true);
        const dates = await api.bookings.getAvailableDates(firstServiceId);
        setAvailableDates(dates);
      } catch (err) {
        console.error(
          'Failed to load available dates in BeauticianBookingScreen',
          err,
        );
      } finally {
        setIsLoadingDates(false);
      }
    }
    fetchAvailableDates();
  }, [selectedServices]);

  // Set default address when addresses load
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Sync local date & timeslot from store whenever this screen re-focuses
  // (i.e., after returning from DateSelectionScreen / TimeslotSelectionScreen via goBack())
  useFocusEffect(
    useCallback(() => {
      if (storeSelectedDate && storeSelectedDate !== date) {
        setDate(storeSelectedDate);
        setTimeslot(null); // Reset timeslot ONLY when date actually changes!
      }
      if (selectedTimeslotStore && selectedTimeslotStore !== timeslot) {
        setTimeslot(selectedTimeslotStore);
      }
    }, [storeSelectedDate, date, selectedTimeslotStore, timeslot]),
  );

  // Handle timeslot route param returned from TimeslotSelectionScreen (fallback)
  useEffect(() => {
    if (route.params?.selectedTimeslot) {
      setTimeslot(route.params.selectedTimeslot);
      navigation.setParams({ selectedTimeslot: undefined });
    }
  }, [route.params?.selectedTimeslot]);

  // Focus effect to refetch addresses if they go to address screen and add one
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, []),
  );

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Handle Hardware Back Button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  const handleSubmit = async () => {
    if (!name || !phone || !selectedAddressId || !date || !timeslot) {
      alert('Please fill all details and select date/timeslot/address');
      return;
    }
    if (phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Build ISO booking date with timeslot start_time
      const bookingDateISO = `${date}T${timeslot.start_time}Z`;

      const formattedPhone = `+91${phone}`;

      // Since the standard table bookings table enforces a single service_id,
      // we iterate and create a booking for each selected service.
      const bookingPromises = selectedServices.map(service => {
        const fullNotes = `Customer Name: ${name}, Phone: ${formattedPhone}${notes ? ` | Notes: ${notes}` : ''}`;
        return api.bookings.createBooking({
          service_id: service.id,
          address_id: selectedAddressId,
          booking_date: bookingDateISO,
          timeslot_id: timeslot.id,
          notes: fullNotes,
          payment_method: 'COD',
          total_price: service.price,
        });
      });

      const responses = await Promise.all(bookingPromises);
      const firstResponse = responses[0];

      // Clear selection
      clearSelection();

      // Navigate to booking success
      navigation.navigate('GeneralBookingSuccess', {
        bookingId: firstResponse?.booking_id || 'UP-SUCCESS',
        service: selectedServices.map(s => s.name).join(', '),
        date: formatDateDisplay(date),
        timeslot: `${formatTime(timeslot.start_time)} - ${formatTime(timeslot.end_time)}`,
        status: 'Pending',
        paymentMethod: 'COD',
      });
    } catch (err: any) {
      console.error('Beautician booking API error:', err);
      // Skip alert for auth errors — interceptor already called logout()
      // which causes AppNavigator to redirect to LoginScreen.
      if (!err?.isAuthError) {
        const errMsg =
          err?.message || 'Failed to book beauty services. Please try again.';
        alert(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAddrObj = addresses.find(a => a.id === selectedAddressId);
  const formattedAddress = selectedAddrObj
    ? [
        selectedAddrObj.house_number,
        selectedAddrObj.street,
        selectedAddrObj.landmark ? `(Near ${selectedAddrObj.landmark})` : null,
        selectedAddrObj.city,
        selectedAddrObj.state,
        selectedAddrObj.pincode,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Typography variant="h3" weight="800">
            Book Beauty
          </Typography>
          <Typography variant="tiny" color={Colors.light.textSecondary}>
            {getSelectedCount} Service(s) Selected
          </Typography>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Selected Services Summary */}
        <View style={styles.section}>
          <Typography variant="h4" weight="700" style={styles.sectionTitle}>
            Selected Services
          </Typography>
          {selectedServices.map(service => (
            <View key={service.id} style={styles.serviceRow}>
              <View style={styles.serviceIconContainer}>
                <Sparkles color={Colors.light.primary} size={16} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Typography variant="body2" weight="700">
                  {service.name}
                </Typography>
              </View>
              <Typography
                variant="body2"
                weight="700"
                color={Colors.light.primary}
              >
                ₹{service.price}
              </Typography>
            </View>
          ))}
        </View>

        {/* Contact/Booking details */}
        <View style={styles.section}>
          <Typography variant="h4" weight="700" style={styles.sectionTitle}>
            Booking Details
          </Typography>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={18} color={Colors.light.primary} />
              <Typography
                variant="body2"
                weight="700"
                style={{ marginLeft: 8 }}
              >
                Your Name
              </Typography>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Clock size={18} color={Colors.light.primary} />
              <Typography
                variant="body2"
                weight="700"
                style={{ marginLeft: 8 }}
              >
                Phone Number
              </Typography>
            </View>
            <View style={styles.phoneInputContainer}>
              <View style={styles.phoneCountryCode}>
                <Typography
                  variant="body2"
                  weight="700"
                  color={Colors.light.primary}
                >
                  +91
                </Typography>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter 10-digit phone number"
                value={phone}
                onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Calendar size={18} color={Colors.light.primary} />
              <Typography
                variant="body2"
                weight="700"
                style={{ marginLeft: 8 }}
              >
                Preferred Date
              </Typography>
            </View>
            <Pressable
              style={styles.trigger}
              onPress={() => {
                if (date) {
                  const [year, month] = date.split('-').map(Number);
                  if (year && month) {
                    setCurrentYear(year);
                    setCurrentMonth(month - 1);
                  }
                  setSelectedDateTemp(date);
                } else {
                  const d = new Date();
                  setCurrentYear(d.getFullYear());
                  setCurrentMonth(d.getMonth());
                  setSelectedDateTemp('');
                }
                setIsDatePickerVisible(true);
              }}
            >
              <Typography
                variant="body2"
                color={date ? Colors.light.text : Colors.light.textMuted}
              >
                {date ? formatDateDisplay(date) : 'Select Preferred Date'}
              </Typography>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Clock size={18} color={Colors.light.primary} />
              <Typography
                variant="body2"
                weight="700"
                style={{ marginLeft: 8 }}
              >
                Preferred Timeslot
              </Typography>
            </View>
            <Pressable
              style={styles.trigger}
              onPress={() => {
                if (!date) {
                  alert('Please select a date first');
                  return;
                }
                const firstServiceId = selectedServices[0]?.id || '';
                navigation.navigate('TimeslotSelection', {
                  serviceId: firstServiceId,
                  date: date,
                  returnScreen: 'BeauticianBooking',
                  initialTimeslotId: timeslot?.id,
                });
              }}
            >
              <Typography
                variant="body2"
                color={timeslot ? Colors.light.text : Colors.light.textMuted}
              >
                {timeslot
                  ? `${formatTime(timeslot.start_time)} - ${formatTime(timeslot.end_time)}`
                  : 'Select Preferred Timeslot'}
              </Typography>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <View style={[styles.inputLabel, { marginBottom: 0 }]}>
                <MapPin size={18} color={Colors.light.primary} />
                <Typography
                  variant="body2"
                  weight="700"
                  style={{ marginLeft: 8 }}
                >
                  Service Address
                </Typography>
              </View>
              <Pressable
                onPress={() => navigation.navigate('SavedAddresses')}
                style={{ paddingVertical: 2 }}
              >
                <Typography
                  variant="caption"
                  weight="700"
                  color={Colors.light.primary}
                >
                  Manage Addresses
                </Typography>
              </Pressable>
            </View>

            {isLoadingAddresses ? (
              <ActivityIndicator
                size="small"
                color={Colors.light.primary}
                style={{ marginTop: 8 }}
              />
            ) : addresses.length === 0 ? (
              <Pressable
                style={styles.noAddressBtn}
                onPress={() => navigation.navigate('SavedAddresses')}
              >
                <Typography
                  variant="body2"
                  color={Colors.light.primary}
                  weight="700"
                >
                  + Add Service Address
                </Typography>
              </Pressable>
            ) : (
              <View style={styles.addressContainer}>
                {addresses.map(addr => {
                  const isSelected = addr.id === selectedAddressId;
                  const details = [
                    addr.house_number,
                    addr.street,
                    addr.landmark ? `(Near ${addr.landmark})` : null,
                    addr.city,
                    addr.state,
                    addr.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <Pressable
                      key={addr.id}
                      style={[
                        styles.addressCard,
                        isSelected && styles.addressCardSelected,
                      ]}
                      onPress={() => setSelectedAddressId(addr.id)}
                    >
                      <View style={styles.addressCardHeader}>
                        <Typography variant="body2" weight="800">
                          {addr.address_type}
                        </Typography>
                        {addr.is_default && (
                          <View style={styles.defaultBadge}>
                            <Typography
                              variant="tiny"
                              color={Colors.light.success}
                              weight="800"
                            >
                              DEFAULT
                            </Typography>
                          </View>
                        )}
                      </View>
                      <Typography
                        variant="caption"
                        color={Colors.light.textSecondary}
                        style={{ marginTop: 4 }}
                      >
                        {details}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="body2" weight="700" style={styles.inputLabel}>
              Any Notes / Instructions (Optional)
            </Typography>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Please wear a mask, ring bell twice"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>
      </ScrollView>

      {/* Booking confirmation footer */}
      <View style={styles.footerContainer}>
        <View style={styles.footerInfo}>
          <Typography variant="caption" color={Colors.light.textSecondary}>
            Total Amount
          </Typography>
          <Typography variant="h2" weight="800" color={Colors.light.primary}>
            ₹{getTotalPrice}
          </Typography>
        </View>
        <Button
          title="Confirm Booking"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.confirmBtn}
        />
      </View>

      {/* Custom Modal Date Picker */}
      <Modal
        visible={isDatePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDatePickerVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Typography variant="h3" weight="800" style={styles.modalTitle}>
                Select Preferred Date
              </Typography>
              <TouchableOpacity
                onPress={() => setIsDatePickerVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>

            {isLoadingDates ? (
              <View
                style={{ paddingVertical: Spacing.xl, alignItems: 'center' }}
              >
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Typography variant="body2" style={{ marginTop: Spacing.md }}>
                  Loading available dates...
                </Typography>
              </View>
            ) : (
              <View>
                {/* Calendar Navigation */}
                <View style={styles.modalCalendarHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(prev => prev - 1);
                      } else {
                        setCurrentMonth(prev => prev - 1);
                      }
                    }}
                    style={styles.modalNavButton}
                  >
                    <ChevronLeft size={20} color={Colors.light.text} />
                  </TouchableOpacity>

                  <Typography
                    variant="body1"
                    weight="800"
                    style={styles.modalMonthLabel}
                  >
                    {MONTHS[currentMonth]} {currentYear}
                  </Typography>

                  <TouchableOpacity
                    onPress={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(prev => prev + 1);
                      } else {
                        setCurrentMonth(prev => prev + 1);
                      }
                    }}
                    style={styles.modalNavButton}
                  >
                    <ChevronRight size={20} color={Colors.light.text} />
                  </TouchableOpacity>
                </View>

                {/* Weekdays Row */}
                <View style={styles.modalWeekdaysRow}>
                  {WEEKDAYS.map((day, idx) => (
                    <View key={idx} style={styles.modalWeekdayCell}>
                      <Typography
                        variant="caption"
                        weight="800"
                        color={Colors.light.textMuted}
                      >
                        {day.substring(0, 2).toUpperCase()}
                      </Typography>
                    </View>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.modalGridContainer}>
                  {getDaysInMonth(currentYear, currentMonth).map(dayItem => {
                    const isPast = checkIsPast(dayItem.dateStr);
                    const isAvailable = availableDates.includes(
                      dayItem.dateStr,
                    );
                    const isSelected = selectedDateTemp === dayItem.dateStr;
                    const isClickable = !isPast && isAvailable;

                    let cellStyle: any = [styles.modalDayCell];
                    let textStyle: any = [styles.modalDayText];

                    if (!dayItem.isCurrentMonth) {
                      textStyle.push(styles.modalOtherMonthText);
                    }

                    if (isSelected) {
                      cellStyle.push(styles.modalSelectedCell);
                      textStyle.push(styles.modalSelectedText);
                    } else if (isClickable) {
                      cellStyle.push(styles.modalAvailableCell);
                      textStyle.push(styles.modalAvailableText);
                    } else {
                      cellStyle.push(styles.modalDisabledCell);
                      textStyle.push(styles.modalDisabledText);
                    }

                    return (
                      <TouchableOpacity
                        key={dayItem.dateStr}
                        style={cellStyle}
                        disabled={!isClickable}
                        onPress={() => {
                          if (!dayItem.isCurrentMonth) {
                            const [y, m] = dayItem.dateStr
                              .split('-')
                              .map(Number);
                            setCurrentYear(y);
                            setCurrentMonth(m - 1);
                          }
                          setSelectedDateTemp(dayItem.dateStr);
                        }}
                        activeOpacity={0.7}
                      >
                        <Typography
                          variant="body2"
                          weight={isSelected ? '800' : '600'}
                          style={textStyle}
                        >
                          {dayItem.dayNum}
                        </Typography>
                        {isAvailable && !isSelected && (
                          <View style={styles.modalDotIndicator} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Legend */}
                <View style={styles.modalLegendSection}>
                  <View style={styles.modalLegendRow}>
                    <View style={styles.modalLegendItem}>
                      <View
                        style={[
                          styles.modalLegendIndicator,
                          {
                            backgroundColor: Colors.light.primaryLight,
                            borderColor: Colors.light.primary,
                            borderWidth: 1,
                          },
                        ]}
                      />
                      <Typography
                        variant="caption"
                        color={Colors.light.textSecondary}
                      >
                        Available
                      </Typography>
                    </View>
                    <View style={styles.modalLegendItem}>
                      <View
                        style={[
                          styles.modalLegendIndicator,
                          { backgroundColor: Colors.light.primary },
                        ]}
                      />
                      <Typography
                        variant="caption"
                        color={Colors.light.textSecondary}
                      >
                        Selected
                      </Typography>
                    </View>
                    <View style={styles.modalLegendItem}>
                      <View
                        style={[
                          styles.modalLegendIndicator,
                          {
                            backgroundColor: Colors.light.transparent,
                            borderColor: Colors.light.border,
                            borderWidth: 1,
                          },
                        ]}
                      />
                      <Typography
                        variant="caption"
                        color={Colors.light.textSecondary}
                      >
                        Unavailable
                      </Typography>
                    </View>
                  </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.modalFooter}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setIsDatePickerVisible(false)}
                    style={styles.modalCancelBtn}
                  />
                  <Button
                    title="Confirm"
                    disabled={!selectedDateTemp}
                    onPress={() => {
                      if (selectedDateTemp) {
                        const hasChanged = selectedDateTemp !== date;
                        setDate(selectedDateTemp);
                        setSelectedDateStore(selectedDateTemp);
                        if (hasChanged) {
                          setTimeslot(null);
                        }
                        setIsDatePickerVisible(false);
                      }
                    }}
                    style={styles.modalConfirmBtn}
                  />
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    height: 56,
  },
  phoneCountryCode: {
    paddingHorizontal: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    height: '60%',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
    color: Colors.light.text,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    alignItems: 'center',
  },
  container: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  section: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    color: Colors.light.text,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  serviceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.light.text,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  trigger: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  noAddressBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  addressContainer: {
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  addressCard: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  addressCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  addressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.light.md,
  },
  footerInfo: {
    flexDirection: 'column',
  },
  confirmBtn: {
    paddingHorizontal: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 360,
    ...Shadows.light.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    color: Colors.light.text,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  modalCalendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  modalNavButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.white,
    ...Shadows.light.xs,
  },
  modalMonthLabel: {
    textAlign: 'center',
    color: Colors.light.text,
  },
  modalWeekdaysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  modalWeekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  modalGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: Spacing.xs,
  },
  modalDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    marginVertical: Spacing.xxs,
    position: 'relative',
  },
  modalDayText: {
    color: Colors.light.text,
  },
  modalOtherMonthText: {
    opacity: 0.3,
  },
  modalSelectedCell: {
    backgroundColor: Colors.light.primary,
    ...Shadows.light.xs,
  },
  modalSelectedText: {
    color: Colors.light.white,
  },
  modalAvailableCell: {
    backgroundColor: Colors.light.primaryLight,
  },
  modalAvailableText: {
    color: Colors.light.primary,
  },
  modalDisabledCell: {
    backgroundColor: 'transparent',
  },
  modalDisabledText: {
    color: Colors.light.textMuted,
  },
  modalDotIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
  },
  modalLegendSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  modalLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  modalLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalLegendIndicator: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    borderColor: Colors.light.border,
    borderWidth: 1,
  },
  modalConfirmBtn: {
    flex: 1,
  },
});
