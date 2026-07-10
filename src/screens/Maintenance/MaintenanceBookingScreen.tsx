import React, { useState, useCallback, useEffect } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  User,
  MapPin,
  Clock,
  Camera,
  Trash2,
  AlertCircle,
  Wrench,
  CheckCircle2,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useBookingStore } from '../../store/useBookingStore';
import { useMaintenanceStore } from '../../store/useMaintenanceStore';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useAddressStore } from '../../store/useAddressStore';
import { NetworkImage } from '../../components/NetworkImage';

interface DayItem {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
}

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

const TIMESLOTS = [
  { label: 'Morning', value: '09:00 AM - 12:00 PM', sublabel: '9:00 AM – 12:00 PM' },
  { label: 'Afternoon', value: '12:00 PM - 03:00 PM', sublabel: '12:00 PM – 3:00 PM' },
  { label: 'Evening', value: '03:00 PM - 06:00 PM', sublabel: '3:00 PM – 6:00 PM' },
];

export default function MaintenanceBookingScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const {
    addresses,
    isLoading: isLoadingAddresses,
    fetchAddresses,
  } = useAddressStore();

  const selectedServices = useMaintenanceStore(state => state.selectedServices);
  const clearSelection = useMaintenanceStore(state => state.clearSelection);
  const getTotalPrice = useMaintenanceStore(state => state.getTotalPrice());
  const getSelectedCount = useMaintenanceStore(state =>
    state.getSelectedCount(),
  );

  const addBooking = useBookingStore(state => state.addBooking);
  const storeSelectedDate = useBookingStore(state => state.selectedDate);
  const setSelectedDateStore = useBookingStore(state => state.setSelectedDate);
  const clearSelectedSlot = useBookingStore(state => state.clearSelectedSlot);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(() => {
    const rawPhone = user?.phone || '';
    const cleaned = rawPhone.replace(/[^0-9]/g, '');
    return cleaned.slice(-10);
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [selectedTimeslot, setSelectedTimeslot] = useState(
    '09:00 AM - 12:00 PM',
  );
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(storeSelectedDate || '');

  // Date Picker Modal States
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDateTemp, setSelectedDateTemp] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  // Timeslot Picker Modal States
  const [isTimeslotPickerVisible, setIsTimeslotPickerVisible] = useState(false);
  const [selectedTimeslotTemp, setSelectedTimeslotTemp] = useState(
    '09:00 AM - 12:00 PM',
  );

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Load available dates for maintenance services
  useEffect(() => {
    async function loadDates() {
      const firstServiceId = selectedServices[0]?.id;
      if (!firstServiceId) return;

      setIsLoadingDates(true);
      try {
        const dates = await api.bookings.getAvailableDates(firstServiceId);
        setAvailableDates(dates);
      } catch (err) {
        console.error('Error loading dates in MaintenanceBookingScreen:', err);
      } finally {
        setIsLoadingDates(false);
      }
    }
    loadDates();
  }, [selectedServices]);

  // Calendar Helpers
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

  // Initialize & Sync Autofill Info
  useEffect(() => {
    if (user) {
      if (!name) {
        setName(user.name || '');
      }
      if (!phone) {
        const rawPhone = user.phone || '';
        const cleaned = rawPhone.replace(/[^0-9]/g, '');
        setPhone(cleaned.slice(-10));
      }
    }
  }, [user]);

  // Fetch addresses on mount & focus
  useEffect(() => {
    fetchAddresses();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, []),
  );

  // Auto-select default address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    }
  }, [addresses, selectedAddressId]);

  // Sync local date state from store whenever this screen comes into focus.
  // Always overwrite — this ensures date persists across navigation and
  // also correctly clears a stale date if the store was reset elsewhere.
  useFocusEffect(
    useCallback(() => {
      setDate(storeSelectedDate || '');
    }, [storeSelectedDate]),
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

  // Image Upload states
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleSelectImage = async () => {
    setUploadError(null);
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (pickerResult.canceled) {
        return;
      }

      const asset = pickerResult.assets[0];
      if (!asset) return;

      // Validate MIME type
      const mimeType = asset.mimeType || '';
      const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/svg+xml',
      ];
      const fileExt = (asset.fileName || asset.uri.split('/').pop() || '')
        .split('.')
        .pop()
        ?.toLowerCase();
      const allowedExts = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'heic',
        'heif',
        'svg',
      ];

      if (mimeType && !allowedMimes.includes(mimeType)) {
        setUploadError(`Unsupported MIME type: ${mimeType}`);
        return;
      }
      if (fileExt && !allowedExts.includes(fileExt)) {
        setUploadError(`Unsupported file extension: .${fileExt}`);
        return;
      }

      // Validate file size (10MB limit)
      const maxSizeBytes = 10 * 1024 * 1024;
      if (asset.fileSize && asset.fileSize > maxSizeBytes) {
        setUploadError('File size exceeds the 10MB limit.');
        return;
      }

      setImageUri(asset.uri);
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName || `maintenance_${Date.now()}.${fileExt || 'jpg'}`,
        type: mimeType || 'image/jpeg',
      } as any);

      const response = await api.media.upload(
        formData,
        (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      );

      if (response && response.file_url) {
        setUploadedUrl(response.file_url);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Image selection or upload failed:', err);
      setUploadError(
        err.response?.data?.detail || err.message || 'Upload failed',
      );
      setImageUri(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setUploadedUrl(null);
    setUploadProgress(0);
    setUploadError(null);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || !date) {
      alert('Please fill in your name, phone number, and preferred date');
      return;
    }
    if (phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    if (!selectedAddressId) {
      alert('Please select a service address');
      return;
    }
    const selectedAddrObj = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddrObj) {
      alert('Selected address not found');
      return;
    }

    const formattedAddress = [
      selectedAddrObj.house_number,
      selectedAddrObj.street,
      selectedAddrObj.landmark ? `(Near ${selectedAddrObj.landmark})` : null,
      selectedAddrObj.city,
      selectedAddrObj.state,
      selectedAddrObj.pincode,
    ]
      .filter(Boolean)
      .join(', ');

    if (isUploading) {
      alert('Please wait for the image upload to complete.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const title =
        selectedServices.length > 1
          ? `${selectedServices[0].name} & ${selectedServices.length - 1} more`
          : selectedServices[0]?.name || 'Maintenance Service';

      // Build ISO booking date from selected date string (YYYY-MM-DD)
      const bookingDateISO = date
        ? `${date}T09:00:00.000Z`
        : new Date().toISOString();

      const formattedPhone = `+91${phone}`;

      const fullNotes = `Customer Name: ${name}, Phone: ${formattedPhone} | Timeslot: ${selectedTimeslot}${notes ? ` | Notes: ${notes}` : ''}`;

      // Persist to PostgreSQL via backend API
      const bookingResponse = await api.maintenance.createBooking({
        address_id: selectedAddressId,
        address_text: formattedAddress,
        booking_date: bookingDateISO,
        service_ids: selectedServices.map(s => String(s.id)),
        service_names: selectedServices.map(s => s.name),
        total_price: getTotalPrice,
        customer_name: name,
        customer_phone: formattedPhone,
        notes: fullNotes,
        photos: uploadedUrl ? [uploadedUrl] : [],
      });

      const actualBookingId = bookingResponse?.id || 'UP-PENDING';

      // Also update local Zustand store for UI state (secondary mirror)
      addBooking({
        type: 'Service',
        title: title,
        subtitle: 'Maintenance Booking',
        customerName: name,
        phone: formattedPhone,
        address: formattedAddress,
        date: date,
        time: selectedTimeslot,
        price: getTotalPrice,
        image: uploadedUrl || undefined,
      });

      // Clear maintenance cart selection and booking date
      clearSelection();
      clearSelectedSlot();

      // Navigate to booking success
      navigation.navigate('GeneralBookingSuccess', {
        bookingId: actualBookingId,
        title: title,
        service: title,
        date: date,
        timeslot: selectedTimeslot,
        address: formattedAddress,
        bookingType: 'maintenance',
      });
    } catch (err: any) {
      console.error('Maintenance booking API error:', err);
      // Skip alert for auth errors — interceptor already called logout()
      // which causes AppNavigator to redirect to LoginScreen.
      if (!err?.isAuthError) {
        const errMsg =
          err?.message ||
          'Failed to book maintenance service. Please try again.';
        alert(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Typography variant="h3" weight="800">
            Book Maintenance
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
                <Wrench color={Colors.light.primary} size={16} />
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
              style={[
                styles.dateSelectorTrigger,
                date ? styles.dateSelectorTriggerSelected : undefined,
              ]}
              onPress={() => {
                // Always sync temp state from current confirmed date before opening
                const currentDate = date || storeSelectedDate || '';
                if (currentDate) {
                  const [year, month] = currentDate.split('-').map(Number);
                  if (year && month) {
                    setCurrentYear(year);
                    setCurrentMonth(month - 1);
                  }
                } else {
                  const d = new Date();
                  setCurrentYear(d.getFullYear());
                  setCurrentMonth(d.getMonth());
                }
                setSelectedDateTemp(currentDate);
                setIsDatePickerVisible(true);
              }}
            >
              <View style={styles.dateSelectorContent}>
                {date ? (
                  <>
                    <CheckCircle2
                      size={18}
                      color={Colors.light.primary}
                      style={{ marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Typography
                        variant="tiny"
                        color={Colors.light.primary}
                        weight="700"
                      >
                        Pickup / Service Date
                      </Typography>
                      <Typography
                        variant="body2"
                        weight="700"
                        color={Colors.light.text}
                      >
                        {formatDateDisplay(date)}
                      </Typography>
                    </View>
                    <Pressable
                      onPress={e => {
                        e.stopPropagation();
                        setDate('');
                        setSelectedDateStore('');
                        setSelectedDateTemp('');
                      }}
                      hitSlop={8}
                      style={{ padding: 4 }}
                    >
                      <X size={16} color={Colors.light.textMuted} />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Calendar
                      size={18}
                      color={Colors.light.textMuted}
                      style={{ marginRight: 8 }}
                    />
                    <Typography
                      variant="body2"
                      color={Colors.light.textMuted}
                    >
                      Select Preferred Date
                    </Typography>
                  </>
                )}
              </View>
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
                Preferred Time Slot
              </Typography>
            </View>
            <Pressable
              style={[
                styles.dateSelectorTrigger,
                styles.dateSelectorTriggerSelected,
              ]}
              onPress={() => {
                // Always pre-load temp from the current confirmed value before opening
                setSelectedTimeslotTemp(selectedTimeslot);
                setIsTimeslotPickerVisible(true);
              }}
            >
              <View style={styles.dateSelectorContent}>
                <CheckCircle2
                  size={18}
                  color={Colors.light.primary}
                  style={{ marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Typography
                    variant="tiny"
                    color={Colors.light.primary}
                    weight="700"
                  >
                    Selected Time Slot
                  </Typography>
                  <Typography
                    variant="body2"
                    weight="700"
                    color={Colors.light.text}
                  >
                    {TIMESLOTS.find(s => s.value === selectedTimeslot)?.label ??
                      'Morning'}{' '}
                    · {selectedTimeslot}
                  </Typography>
                </View>
              </View>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={18} color={Colors.light.primary} />
                <Typography
                  variant="body2"
                  weight="700"
                  style={{ marginLeft: 8 }}
                >
                  Service Address
                </Typography>
              </View>
              {addresses && addresses.length > 0 && (
                <Pressable
                  onPress={() => navigation.navigate('SavedAddresses')}
                >
                  <Typography
                    variant="caption"
                    color={Colors.light.primary}
                    weight="700"
                  >
                    + Manage
                  </Typography>
                </Pressable>
              )}
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
            <View style={styles.inputLabel}>
              <Typography variant="body2" weight="700">
                Any Notes / Instructions (Optional)
              </Typography>
            </View>
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

        {/* Photo Upload Section */}
        <View style={styles.section}>
          <Typography variant="h4" weight="700" style={styles.sectionTitle}>
            Reference Photos (Optional)
          </Typography>
          <Typography
            variant="caption"
            color={Colors.light.textSecondary}
            style={{ marginBottom: Spacing.md }}
          >
            Upload photos of the issue for a more accurate diagnostic check.
          </Typography>

          {uploadError && (
            <View style={styles.errorContainer}>
              <AlertCircle color={Colors.light.error} size={18} />
              <Typography
                variant="body2"
                color={Colors.light.error}
                style={{ marginLeft: Spacing.sm, flex: 1 }}
              >
                {uploadError}
              </Typography>
            </View>
          )}

          {imageUri ? (
            <View style={styles.previewContainer}>
              <NetworkImage
                source={{ uri: imageUri }}
                style={styles.previewImage}
              />
              {isUploading ? (
                <View style={styles.uploadingOverlay}>
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${uploadProgress}%` },
                      ]}
                    />
                  </View>
                  <Typography
                    variant="caption"
                    color={Colors.light.textSecondary}
                    weight="700"
                  >
                    Uploading... {uploadProgress}%
                  </Typography>
                </View>
              ) : (
                <Pressable style={styles.removeBtn} onPress={handleRemoveImage}>
                  <Trash2 color={Colors.light.white} size={16} />
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable style={styles.uploadBox} onPress={handleSelectImage}>
              <Camera color={Colors.light.primary} size={32} />
              <Typography
                variant="body2"
                color={Colors.light.textSecondary}
                style={{ marginTop: Spacing.sm }}
                weight="600"
              >
                Tap to select photo
              </Typography>
              <Typography
                variant="caption"
                color={Colors.light.textMuted}
                style={{ marginTop: 2 }}
              >
                Max 10MB (JPEG, PNG, WEBP)
              </Typography>
            </Pressable>
          )}
        </View>

        {/* Pricing Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Typography variant="body2" color={Colors.light.textSecondary}>
              Total Amount
            </Typography>
            <Typography variant="h2" weight="900" color={Colors.light.primary}>
              ₹{getTotalPrice}
            </Typography>
          </View>
          <Typography
            variant="tiny"
            color={Colors.light.textMuted}
            style={{ marginTop: 4 }}
          >
            Inclusive of all taxes and diagnostic/service fees
          </Typography>
        </View>

        <Button
          title="Confirm & Book"
          onPress={handleSubmit}
          size="lg"
          style={styles.submitBtn}
        />

        <View style={{ height: 60 }} />
      </ScrollView>

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

                {/* Legend Row */}
                <View style={styles.modalLegendSection}>
                  <View style={styles.modalLegendRow}>
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
                          { backgroundColor: Colors.light.primaryLight },
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
                          {
                            backgroundColor: 'transparent',
                            borderWidth: 1,
                            borderColor: Colors.light.border,
                          },
                        ]}
                      />
                      <Typography
                        variant="caption"
                        color={Colors.light.textMuted}
                      >
                        Unavailable
                      </Typography>
                    </View>
                  </View>
                </View>

                {/* Selected Date Preview Banner */}
                {selectedDateTemp ? (
                  <View style={styles.modalSelectedBanner}>
                    <CheckCircle2
                      size={16}
                      color={Colors.light.primary}
                      style={{ marginRight: 6 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Typography variant="tiny" color={Colors.light.primary} weight="700">
                        Tap "Confirm Date" to save
                      </Typography>
                      <Typography variant="body2" weight="700" color={Colors.light.text}>
                        {formatDateDisplay(selectedDateTemp)}
                      </Typography>
                    </View>
                  </View>
                ) : (
                  <View style={styles.modalNoBanner}>
                    <AlertCircle size={16} color={Colors.light.warning} style={{ marginRight: 6 }} />
                    <Typography variant="caption" color={Colors.light.textSecondary}>
                      Tap an available date above to select it
                    </Typography>
                  </View>
                )}

                {/* Modal Footer (Buttons) */}
                <View style={styles.modalFooter}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => {
                      // Dismiss without applying — restore temp to confirmed date
                      setSelectedDateTemp(date);
                      setIsDatePickerVisible(false);
                    }}
                    style={styles.modalCancelBtn}
                  />
                  <Button
                    title="Confirm Date"
                    onPress={() => {
                      if (selectedDateTemp) {
                        // Persist to local state and Zustand store simultaneously
                        setDate(selectedDateTemp);
                        setSelectedDateStore(selectedDateTemp);
                      }
                      setIsDatePickerVisible(false);
                    }}
                    style={styles.modalConfirmBtn}
                    disabled={!selectedDateTemp}
                  />
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Timeslot Picker Modal */}
      <Modal
        visible={isTimeslotPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setSelectedTimeslotTemp(selectedTimeslot);
          setIsTimeslotPickerVisible(false);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setSelectedTimeslotTemp(selectedTimeslot);
            setIsTimeslotPickerVisible(false);
          }}
        >
          <Pressable
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Typography variant="h3" weight="800" style={styles.modalTitle}>
                Select Time Slot
              </Typography>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTimeslotTemp(selectedTimeslot);
                  setIsTimeslotPickerVisible(false);
                }}
                style={styles.closeBtn}
              >
                <X size={20} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Slot Pills */}
            <View style={styles.timeslotModalPillsContainer}>
              {TIMESLOTS.map(slot => {
                const isSelected = selectedTimeslotTemp === slot.value;
                return (
                  <Pressable
                    key={slot.value}
                    style={[
                      styles.timeslotModalPill,
                      isSelected && styles.timeslotModalPillSelected,
                    ]}
                    onPress={() => setSelectedTimeslotTemp(slot.value)}
                  >
                    <View style={styles.timeslotModalPillLeft}>
                      {isSelected ? (
                        <CheckCircle2
                          size={20}
                          color={Colors.light.primary}
                        />
                      ) : (
                        <Clock
                          size={20}
                          color={Colors.light.textMuted}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        weight="700"
                        color={
                          isSelected
                            ? Colors.light.primary
                            : Colors.light.text
                        }
                      >
                        {slot.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={
                          isSelected
                            ? Colors.light.primary
                            : Colors.light.textSecondary
                        }
                      >
                        {slot.sublabel}
                      </Typography>
                    </View>
                    {isSelected && (
                      <View style={styles.timeslotModalCheckBadge}>
                        <Typography
                          variant="tiny"
                          weight="700"
                          color={Colors.light.primary}
                        >
                          Selected
                        </Typography>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Preview Banner */}
            <View style={styles.modalSelectedBanner}>
              <Clock
                size={15}
                color={Colors.light.primary}
                style={{ marginRight: 6 }}
              />
              <View style={{ flex: 1 }}>
                <Typography variant="tiny" color={Colors.light.primary} weight="700">
                  Tap "Confirm Time Slot" to save
                </Typography>
                <Typography variant="body2" weight="700" color={Colors.light.text}>
                  {TIMESLOTS.find(s => s.value === selectedTimeslotTemp)?.label ?? ''}{' '}
                  · {selectedTimeslotTemp}
                </Typography>
              </View>
            </View>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  // Dismiss without applying — restore temp to confirmed value
                  setSelectedTimeslotTemp(selectedTimeslot);
                  setIsTimeslotPickerVisible(false);
                }}
                style={styles.modalCancelBtn}
              />
              <Button
                title="Confirm Time Slot"
                onPress={() => {
                  // Only update local state and close — no navigation
                  setSelectedTimeslot(selectedTimeslotTemp);
                  setIsTimeslotPickerVisible(false);
                }}
                style={styles.modalConfirmBtn}
              />
            </View>
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
    padding: Spacing.lg,
  },
  headerTitle: { alignItems: 'center' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  serviceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: { marginBottom: Spacing.xl },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  dateSelectorTrigger: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    justifyContent: 'center',
    minHeight: 56,
  },
  dateSelectorTriggerSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  addressGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  addressHalf: { flex: 1 },
  fieldLabel: {
    marginBottom: 4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  uploadBox: {
    height: 140,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    height: 140,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  addressContainer: {
    marginTop: Spacing.sm,
  },
  addressCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: Spacing.md,
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
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  noAddressBtn: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  timeslotRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  timeslotPill: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.light.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeslotPillSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  // Timeslot modal styles
  timeslotModalPillsContainer: {
    marginBottom: Spacing.md,
  },
  timeslotModalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.borderLight,
    backgroundColor: Colors.light.surface,
    marginBottom: Spacing.sm,
  },
  timeslotModalPillSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  timeslotModalPillLeft: {
    width: 32,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  timeslotModalCheckBadge: {
    backgroundColor: Colors.light.primaryLight,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginLeft: Spacing.sm,
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
  modalSelectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  modalNoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
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
