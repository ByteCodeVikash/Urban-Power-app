import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  Modal,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Camera,
  Trash2,
  AlertCircle,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useAuthStore } from '../../store/useAuthStore';
import { NetworkImage } from '../../components/NetworkImage';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../services/api';
import { pincodeService } from '../../services/pincodeService';
import { useKabadiStore } from '../../store/useKabadiStore';
import { useScrapSelectionStore } from '../../store/useScrapSelectionStore';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TIMESLOTS = [
  { label: 'Morning', value: 'Morning (9-12)', sublabel: '9:00 AM – 12:00 PM' },
  { label: 'Afternoon', value: 'Afternoon (12-4)', sublabel: '12:00 PM – 4:00 PM' },
  { label: 'Evening', value: 'Evening (4-7)', sublabel: '4:00 PM – 7:00 PM' },
];

interface DayItem {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
}

export default function KabadiFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, subcategoryName, categoryName } = route.params || {};

  // Legacy flow support: when navigating from KabadiSubCategory, the route may
  // pass categoryName/subcategoryName/categoryId. These are used only for the
  // single-item display box in the "old" flow; the modern flow uses selectedItems.
  // We do not reference KABADI_ITEMS (MockData) here — if params are absent or
  // don't match anything meaningful, we gracefully fall back to undefined.
  const parentCategory: { icon?: string } | undefined = undefined;
  const subcategory: { price?: number } | undefined = undefined;

  const selectedItems = useScrapSelectionStore(state => state.selectedItems);
  const totalWeight = useScrapSelectionStore(state => state.totalWeight)();
  const totalEstimatedPrice = useScrapSelectionStore(state => state.totalEstimatedPrice)();
  const clearSelection = useScrapSelectionStore(state => state.clearSelection);

  const { user } = useAuthStore();
  const schedulePickup = useKabadiStore(state => state.schedulePickup);

  // Customer details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(() => {
    const rawPhone = user?.phone || '';
    const cleaned = rawPhone.replace(/[^0-9]/g, '');
    return cleaned.slice(-10);
  });

  // Weight (only when no selected items)
  const [weight, setWeight] = useState(() => {
    return selectedItems.length > 0 ? String(totalWeight) : '';
  });

  useEffect(() => {
    if (selectedItems.length > 0) {
      setWeight(String(totalWeight));
    }
  }, [selectedItems, totalWeight]);

  // Auto-fill name from user profile
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || '');
      if (!phone) {
        const rawPhone = user.phone || '';
        const cleaned = rawPhone.replace(/[^0-9]/g, '');
        setPhone(cleaned.slice(-10));
      }
    }
  }, [user]);

  // ── Date picker state ────────────────────────────────────────────────────
  const today = new Date();
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD
  const [selectedDateTemp, setSelectedDateTemp] = useState('');
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // ── Time slot picker state ───────────────────────────────────────────────
  const [selectedSlot, setSelectedSlot] = useState('Morning (9-12)');
  const [isTimeslotPickerVisible, setIsTimeslotPickerVisible] = useState(false);
  const [selectedSlotTemp, setSelectedSlotTemp] = useState('Morning (9-12)');

  // ── Address fields ───────────────────────────────────────────────────────
  const [addrHouseNo, setAddrHouseNo] = useState('');
  const [addrBuilding, setAddrBuilding] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrArea, setAddrArea] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPin, setAddrPin] = useState('');

  // Track last autofilled pin + values to avoid overwriting manual edits.
  // Reset this ref whenever the pin changes so a re-typed pin triggers lookup again.
  const lastAutofilledPinRef = useRef('');
  const lastAutofilledValuesRef = useRef({ city: '', state: '', area: '' });

  // Use refs to hold latest field values for the pincode effect without
  // adding them to the dependency array (prevents stale-closure issues).
  const addrCityRef = useRef(addrCity);
  const addrStateRef = useRef(addrState);
  const addrAreaRef = useRef(addrArea);
  addrCityRef.current = addrCity;
  addrStateRef.current = addrState;
  addrAreaRef.current = addrArea;

  // Pincode error / status feedback
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');

  // ── Pincode Lookup (uses refs to avoid stale-closure issues) ────────────
  useEffect(() => {
    if (addrPin.length !== 6) {
      if (pincodeStatus !== 'idle') setPincodeStatus('idle');
      return;
    }
    if (addrPin === lastAutofilledPinRef.current) return;

    setPincodeStatus('loading');

    pincodeService.lookup(addrPin).then(details => {
      if (!details) {
        setPincodeStatus('not_found');
        return;
      }

      const prev = lastAutofilledValuesRef.current;
      const currentCity = addrCityRef.current;
      const currentState = addrStateRef.current;
      const currentArea = addrAreaRef.current;

      // Only autofill if the field is empty OR still holds a previously auto-filled value
      if (!currentCity || currentCity === prev.city) setAddrCity(details.city);
      if (!currentState || currentState === prev.state) setAddrState(details.state);
      const firstLocality = details.localities[0] || '';
      if (!currentArea || currentArea === prev.area) setAddrArea(firstLocality);

      lastAutofilledPinRef.current = addrPin;
      lastAutofilledValuesRef.current = {
        city: details.city,
        state: details.state,
        area: firstLocality,
      };
      setPincodeStatus('found');
    }).catch(err => {
      console.error('Pincode lookup error:', err);
      setPincodeStatus('not_found');
    });
  }, [addrPin]); // Only re-run when PIN changes

  const pickupAddress = [addrHouseNo, addrBuilding, addrStreet, addrArea, addrLandmark, addrCity, addrState, addrPin]
    .filter(Boolean)
    .join(', ');

  // ── Image upload state ───────────────────────────────────────────────────
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [payoutMethod, setPayoutMethod] = useState<'Cash' | 'UPI'>('Cash');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Hardware back ────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isDatePickerVisible) {
          setIsDatePickerVisible(false);
          return true;
        }
        if (isTimeslotPickerVisible) {
          setIsTimeslotPickerVisible(false);
          return true;
        }
        navigation.goBack();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [isDatePickerVisible, isTimeslotPickerVisible, navigation]),
  );

  // ── Calendar helpers ─────────────────────────────────────────────────────
  const getDaysInMonth = (year: number, month: number): DayItem[] => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const days: DayItem[] = [];

    const prevMonthDate = new Date(year, month, 0);
    const prevMonthDays = prevMonthDate.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      const dateStr = `${py}-${String(pm + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: day, isCurrentMonth: false });
    }

    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: i, isCurrentMonth: true });
    }

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
    const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateObj < compareToday;
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  // ── Image selection & upload ─────────────────────────────────────────────
  const handleSelectImage = async () => {
    setUploadError(null);
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (pickerResult.canceled) return;
      const asset = pickerResult.assets[0];
      if (!asset) return;

      const mimeType = asset.mimeType || '';
      const allowedMimes = ['image/jpeg','image/jpg','image/png','image/gif','image/webp','image/heic','image/heif','image/svg+xml'];
      const fileExt = (asset.fileName || asset.uri.split('/').pop() || '').split('.').pop()?.toLowerCase();
      const allowedExts = ['jpg','jpeg','png','gif','webp','heic','heif','svg'];

      if (mimeType && !allowedMimes.includes(mimeType)) {
        setUploadError(`Unsupported MIME type: ${mimeType}`);
        return;
      }
      if (fileExt && !allowedExts.includes(fileExt)) {
        setUploadError(`Unsupported file extension: .${fileExt}`);
        return;
      }
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
        name: asset.fileName || `scrap_${Date.now()}.${fileExt || 'jpg'}`,
        type: mimeType || 'image/jpeg',
      } as any);

      const response = await api.media.upload(formData, (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      if (response && response.file_url) {
        setUploadedUrl(response.file_url);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError(err.response?.data?.detail || err.message || 'Upload failed');
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

  // ── Booking submission ───────────────────────────────────────────────────
  const handleSchedule = async () => {
    const activeWeight = selectedItems.length > 0 ? String(totalWeight) : weight;
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!phone || phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!activeWeight || parseFloat(activeWeight) <= 0) {
      alert('Please enter the estimated weight.');
      return;
    }
    if (!selectedDate) {
      alert('Please select a pickup date.');
      return;
    }
    if (!addrStreet.trim() || !addrCity.trim() || !addrPin.trim()) {
      alert('Please fill in Street, City and PIN code for the pickup address.');
      return;
    }
    if (isUploading) {
      alert('Please wait for the image upload to complete.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Build ISO booking date from YYYY-MM-DD string
      const bookingDateISO = `${selectedDate}T09:00:00.000Z`;

      const formattedPhone = `+91${phone}`;

      let finalCategoryName = categoryName || 'Mixed Scrap';
      let finalItemName = subcategoryName || 'General Scrap';
      let finalPricePerKg = subcategory?.price || 0;
      let finalEstimatedValue = (subcategory?.price || 0) * (parseFloat(activeWeight) || 0);

      if (selectedItems.length > 0) {
        // Use item names and category_id stored in the selection store.
        // We do NOT look up KABADI_ITEMS by id because selectedItems use backend
        // UUIDs, not the mock IDs in KABADI_ITEMS. Use item names directly.
        finalItemName = selectedItems.map(i => `${i.name} (${i.quantity} kg)`).join(', ');
        finalEstimatedValue = totalEstimatedPrice;
        finalPricePerKg = totalWeight > 0 ? totalEstimatedPrice / totalWeight : 0;
        // Use the first item's name as category if no separate category label is known
        finalCategoryName = selectedItems.length === 1
          ? selectedItems[0].name
          : `Mixed Scrap (${selectedItems.length} types)`;
      }

      // Pack customer name + phone + timeslot into notes (same pattern as Maintenance)
      // so Admin panel can parse them via regex
      const notesBase = `Customer Name: ${name.trim()}, Phone: ${formattedPhone} | Timeslot: ${selectedSlot}`;
      const fullNotes = instructions.trim()
        ? `${notesBase} | Notes: ${instructions.trim()} | Payout: ${payoutMethod}`
        : `${notesBase} | Payout: ${payoutMethod}`;

      const response = await api.kabadi.createBooking({
        address_text: pickupAddress,
        booking_date: bookingDateISO,
        time_slot: selectedSlot,
        category_name: finalCategoryName,
        item_name: finalItemName,
        estimated_weight_kg: parseFloat(activeWeight) || 0,
        estimated_value: finalEstimatedValue,
        price_per_kg: finalPricePerKg,
        notes: fullNotes,
        photos: uploadedUrl ? [uploadedUrl] : [],
        customer_name: name.trim(),
        customer_phone: formattedPhone,
      });

      const bookingRef = response?.booking_reference || 'UP-SUCCESS';

      const scheduleCategories = selectedItems.length > 0
        ? selectedItems.map(i => `${i.name} (${i.quantity} kg)`)
        : [`${finalCategoryName} - ${finalItemName}`];

      schedulePickup({
        categories: scheduleCategories,
        address: pickupAddress,
        date: formatDateDisplay(selectedDate),
        timeSlot: selectedSlot,
        estimatedValue: finalEstimatedValue.toString(),
        image: uploadedUrl || undefined,
      });

      if (selectedItems.length > 0) {
        clearSelection();
      }

      navigation.navigate('GeneralBookingSuccess', {
        bookingId: bookingRef,
        title: selectedItems.length > 0 ? `${selectedItems.length} Scrap Items` : finalCategoryName,
        service: finalItemName,
        date: formatDateDisplay(selectedDate),
        timeslot: selectedSlot,
        address: pickupAddress,
        paymentMethod: 'COD',
        bookingType: 'scrap',
      });
    } catch (err: any) {
      console.error('Scrap booking API error:', err);
      if (!err?.isAuthError) {
        const errMsg = err?.message || 'Failed to schedule pickup. Please try again.';
        alert(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = getDaysInMonth(currentYear, currentMonth);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <Typography variant="h3" weight="700">
          Schedule Pickup
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Selected Items Summary */}
        {selectedItems.length > 0 ? (
          <View style={styles.selectedItemsSection}>
            <Typography variant="body1" weight="800" style={{ marginBottom: Spacing.sm }}>
              Selected Items ({selectedItems.length})
            </Typography>
            {selectedItems.map(item => (
              <View key={item.id} style={styles.selectedItemRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="body2" weight="700">{item.name}</Typography>
                  <Typography variant="caption" color={Colors.light.textSecondary}>
                    ₹{item.price_per_kg}/kg
                  </Typography>
                </View>
                <Typography variant="body2" weight="700" style={{ marginRight: Spacing.md }}>
                  {item.quantity} kg
                </Typography>
                <Typography variant="body2" weight="800" color={Colors.light.primary}>
                  ₹{item.price_per_kg * item.quantity}
                </Typography>
              </View>
            ))}
            <View style={styles.selectedItemsTotalRow}>
              <Typography variant="body2" weight="700" color={Colors.light.textSecondary}>
                Total Weight: {totalWeight} kg
              </Typography>
              <Typography variant="body2" weight="800" color={Colors.light.primary}>
                Total Est. Value: ₹{totalEstimatedPrice}
              </Typography>
            </View>
          </View>
        ) : (
          <View style={styles.selectedBox}>
            <View style={styles.categoryIcon}>
              <NetworkImage source={{ uri: parentCategory?.icon || '' }} style={styles.icon} resizeMode="cover" />
            </View>
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <Typography variant="caption" color={Colors.light.textSecondary} weight="700">
                {categoryName?.toUpperCase()}
              </Typography>
              <Typography variant="body1" weight="800">
                {subcategoryName || 'General Scrap'}
              </Typography>
              <Typography variant="body2" color={Colors.light.success} weight="700">
                ₹{subcategory?.price || 'Market Rate'}/kg
              </Typography>
            </View>
            <View style={styles.verifiedBadge}>
              <Typography variant="tiny" color={Colors.light.success} weight="700">Rate Verified</Typography>
            </View>
          </View>
        )}

        {/* Customer Details */}
        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Your Details</Typography>

          <View style={styles.inputGroup}>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={Colors.light.textSecondary} style={{ marginBottom: 4 }}>NAME</Typography>
              <TextInput
                style={styles.singleLineInput}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Typography variant="caption" color={Colors.light.textSecondary} style={{ marginBottom: 4 }}>
                ESTIMATED WEIGHT (KG)
              </Typography>
              <TextInput
                style={[styles.singleLineInput, selectedItems.length > 0 && { backgroundColor: '#F1F5F9', color: Colors.light.textMuted }]}
                placeholder="e.g. 10"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                editable={selectedItems.length === 0}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { marginTop: Spacing.md }]}>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={Colors.light.textSecondary} style={{ marginBottom: 4 }}>PHONE NUMBER</Typography>
              <View style={styles.phoneInputContainer}>
                <View style={styles.phoneCountryCode}>
                  <Typography variant="body2" weight="700" color={Colors.light.primary}>+91</Typography>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="10-digit number"
                  value={phone}
                  onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Date Picker Trigger */}
        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Pickup Date</Typography>
          <Pressable
            style={[styles.dateSelectorTrigger, selectedDate ? styles.dateSelectorTriggerSelected : undefined]}
            onPress={() => {
              const cur = selectedDate || '';
              // Always sync the temp picker state from the confirmed date before opening
              setSelectedDateTemp(cur);
              if (cur) {
                const [year, month] = cur.split('-').map(Number);
                if (year && month) { setCurrentYear(year); setCurrentMonth(month - 1); }
              } else {
                setCurrentYear(today.getFullYear());
                setCurrentMonth(today.getMonth());
              }
              setIsDatePickerVisible(true);
            }}
          >
            <View style={styles.dateSelectorContent}>
              {selectedDate ? (
                <>
                  <CheckCircle2 size={18} color={Colors.light.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="tiny" color={Colors.light.primary} weight="700">Pickup Date</Typography>
                    <Typography variant="body2" weight="700" color={Colors.light.text}>
                      {formatDateDisplay(selectedDate)}
                    </Typography>
                  </View>
                  <Pressable
                    onPress={e => { e.stopPropagation(); setSelectedDate(''); setSelectedDateTemp(''); }}
                    hitSlop={8} style={{ padding: 4 }}
                  >
                    <X size={16} color={Colors.light.textMuted} />
                  </Pressable>
                </>
              ) : (
                <>
                  <Calendar size={18} color={Colors.light.textMuted} style={{ marginRight: 8 }} />
                  <Typography variant="body2" color={Colors.light.textMuted}>Select Pickup Date</Typography>
                </>
              )}
            </View>
          </Pressable>
        </View>

        {/* Time Slot Trigger */}
        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Preferred Time Slot</Typography>
          <Pressable
            style={[styles.dateSelectorTrigger, styles.dateSelectorTriggerSelected]}
            onPress={() => { setSelectedSlotTemp(selectedSlot); setIsTimeslotPickerVisible(true); }}
          >
            <View style={styles.dateSelectorContent}>
              <CheckCircle2 size={18} color={Colors.light.primary} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Typography variant="tiny" color={Colors.light.primary} weight="700">Selected Time Slot</Typography>
                <Typography variant="body2" weight="700" color={Colors.light.text}>
                  {TIMESLOTS.find(s => s.value === selectedSlot)?.label ?? 'Morning'} · {selectedSlot}
                </Typography>
              </View>
              <ChevronRight size={18} color={Colors.light.textMuted} />
            </View>
          </Pressable>
        </View>

        {/* Pickup Address */}
        <View style={styles.addressSection}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Pickup Address</Typography>
          <View style={styles.addressGrid}>
            <View style={styles.addressHalf}>
              <Typography variant="caption" color={Colors.light.textSecondary} style={styles.fieldLabel}>HOUSE / FLAT NO.</Typography>
              <TextInput style={styles.singleLineInput} placeholder="e.g. A-12" value={addrHouseNo} onChangeText={setAddrHouseNo} />
            </View>
            <View style={styles.addressHalf}>
              <Typography variant="caption" color={Colors.light.textSecondary} style={styles.fieldLabel}>BUILDING / SOCIETY</Typography>
              <TextInput style={styles.singleLineInput} placeholder="e.g. Green Park Apts" value={addrBuilding} onChangeText={setAddrBuilding} />
            </View>
          </View>
          <Typography variant="caption" color={Colors.light.textSecondary} style={styles.fieldLabel}>STREET *</Typography>
          <TextInput style={[styles.singleLineInput, { marginBottom: Spacing.sm }]} placeholder="e.g. MG Road" value={addrStreet} onChangeText={setAddrStreet} />
          <Typography variant="caption" color={Colors.light.textSecondary} style={styles.fieldLabel}>AREA / LOCALITY</Typography>
          <TextInput style={[styles.singleLineInput, { marginBottom: Spacing.sm }]} placeholder="e.g. Sector 45" value={addrArea} onChangeText={setAddrArea} />
          <Typography variant="caption" color={Colors.light.textSecondary} style={styles.fieldLabel}>LANDMARK (OPTIONAL)</Typography>
          <TextInput style={[styles.singleLineInput, { marginBottom: Spacing.sm }]} placeholder="e.g. Near Metro Station" value={addrLandmark} onChangeText={setAddrLandmark} />
          <View style={styles.addressGrid}>
            <View style={styles.addressHalf}>
              <Typography variant="caption" color={Colors.light.textSecondary} style={styles.fieldLabel}>CITY *</Typography>
              <TextInput style={styles.singleLineInput} placeholder="e.g. Delhi" value={addrCity} onChangeText={setAddrCity} />
            </View>
            <View style={styles.addressHalf}>
              <Typography variant="caption" color={Colors.light.textSecondary} style={styles.fieldLabel}>STATE *</Typography>
              <TextInput style={styles.singleLineInput} placeholder="e.g. Delhi" value={addrState} onChangeText={setAddrState} />
            </View>
          </View>
          <Typography variant="caption" color={Colors.light.textSecondary} style={styles.fieldLabel}>PIN CODE *</Typography>
          <TextInput
            style={styles.singleLineInput}
            placeholder="e.g. 110001"
            value={addrPin}
            onChangeText={t => {
              const cleaned = t.replace(/[^0-9]/g, '');
              setAddrPin(cleaned);
              setPincodeStatus('idle');
              // Reset autofill tracking so a re-typed pin triggers a fresh lookup
              if (cleaned !== lastAutofilledPinRef.current) {
                lastAutofilledPinRef.current = '';
              }
            }}
            keyboardType="number-pad"
            maxLength={6}
          />
          {pincodeStatus === 'loading' && (
            <Typography variant="caption" color={Colors.light.primary} style={{ marginTop: 4 }}>
              Looking up pincode...
            </Typography>
          )}
          {pincodeStatus === 'found' && (
            <Typography variant="caption" color={Colors.light.success} style={{ marginTop: 4 }}>
              ✓ City and state auto-filled from pincode
            </Typography>
          )}
          {pincodeStatus === 'not_found' && (
            <Typography variant="caption" color={Colors.light.error} style={{ marginTop: 4 }}>
              Pincode not found. Please fill city and state manually.
            </Typography>
          )}
        </View>

        {/* Payout Method */}
        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Preferred Payout Method</Typography>
          <Typography variant="caption" color={Colors.light.textSecondary} style={{ marginBottom: Spacing.md }}>
            Select how you would like to receive the payment for your scrap.
          </Typography>
          {(['Cash', 'UPI'] as const).map(method => (
            <Pressable
              key={method}
              style={[styles.paymentOption, payoutMethod === method && styles.paymentOptionSelected]}
              onPress={() => setPayoutMethod(method)}
            >
              <View style={styles.radioOutline}>
                {payoutMethod === method && <View style={styles.radioDot} />}
              </View>
              <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                <Typography variant="body1" weight="700">{method} Payout</Typography>
                <Typography variant="caption" color={Colors.light.textSecondary}>
                  {method === 'Cash' ? 'Receive instant cash in hand at the time of pickup' : 'Receive instant transfer to your UPI ID / Phone number'}
                </Typography>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Upload Scrap Photos (Optional)</Typography>
          {uploadError && (
            <View style={styles.errorContainer}>
              <AlertCircle color={Colors.light.error} size={18} />
              <Typography variant="body2" color={Colors.light.error} style={{ marginLeft: Spacing.sm, flex: 1 }}>
                {uploadError}
              </Typography>
            </View>
          )}
          {imageUri ? (
            <View style={styles.previewContainer}>
              <NetworkImage source={{ uri: imageUri }} style={styles.previewImage} />
              {isUploading ? (
                <View style={styles.uploadingOverlay}>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                  </View>
                  <Typography variant="caption" color={Colors.light.textSecondary} weight="700">
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
              <Typography variant="body2" color={Colors.light.textSecondary} style={{ marginTop: Spacing.sm }} weight="600">
                Tap to select photo
              </Typography>
              <Typography variant="caption" color={Colors.light.textMuted} style={{ marginTop: 2 }}>
                Max 10MB (JPEG, PNG, WEBP)
              </Typography>
            </Pressable>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Instructions (Optional)</Typography>
          <TextInput
            style={styles.input}
            placeholder="e.g. Call before arrival, gate code 1234..."
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Confirm & Schedule" onPress={handleSchedule} size="lg" loading={isSubmitting} />
      </View>

      {/* ── Date Picker Modal ─────────────────────────────────────────────── */}
      <Modal
        visible={isDatePickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setSelectedDateTemp(selectedDate);
          setIsDatePickerVisible(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setSelectedDateTemp(selectedDate);
            setIsDatePickerVisible(false);
          }}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Typography variant="h4" weight="700">Select Pickup Date</Typography>
              <Pressable onPress={() => { setSelectedDateTemp(selectedDate); setIsDatePickerVisible(false); }}>
                <X size={22} color={Colors.light.text} />
              </Pressable>
            </View>

            {/* Month navigation */}
            <View style={styles.monthNav}>
              <Pressable
                style={styles.monthNavBtn}
                onPress={() => {
                  if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                  else setCurrentMonth(m => m - 1);
                }}
              >
                <ChevronLeft size={20} color={Colors.light.primary} />
              </Pressable>
              <Typography variant="body1" weight="700">
                {MONTHS[currentMonth]} {currentYear}
              </Typography>
              <Pressable
                style={styles.monthNavBtn}
                onPress={() => {
                  if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                  else setCurrentMonth(m => m + 1);
                }}
              >
                <ChevronRight size={20} color={Colors.light.primary} />
              </Pressable>
            </View>

            {/* Weekday headers */}
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map(d => (
                <Typography key={d} variant="tiny" weight="700" color={Colors.light.textMuted} style={styles.weekdayCell}>
                  {d}
                </Typography>
              ))}
            </View>

            {/* Day grid */}
            <View style={styles.daysGrid}>
              {days.map((item, idx) => {
                const isPast = checkIsPast(item.dateStr);
                const isToday = item.dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const isSelected = item.dateStr === selectedDateTemp;
                // Other-month days are shown dimmed but not selectable (same as past days)
                const isDisabled = isPast || !item.isCurrentMonth;
                return (
                  <Pressable
                    key={idx}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      isToday && !isSelected && styles.dayCellToday,
                      isDisabled && styles.dayCellDisabled,
                    ]}
                    onPress={() => { if (!isDisabled) setSelectedDateTemp(item.dateStr); }}
                    disabled={isDisabled}
                  >
                    <Typography
                      variant="body2"
                      weight={isSelected ? '800' : '400'}
                      color={
                        isSelected
                          ? Colors.light.white
                          : !item.isCurrentMonth
                            ? Colors.light.borderLight
                            : isDisabled
                              ? Colors.light.textMuted
                              : Colors.light.text
                      }
                    >
                      {item.dayNum}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  // Dismiss without applying — restore temp to confirmed date
                  setSelectedDateTemp(selectedDate);
                  setIsDatePickerVisible(false);
                }}
                style={{ flex: 1, marginRight: Spacing.sm }}
              />
              <Button
                title="Confirm Date"
                disabled={!selectedDateTemp}
                onPress={() => {
                  if (selectedDateTemp) {
                    setSelectedDate(selectedDateTemp);
                  }
                  setIsDatePickerVisible(false);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Timeslot Picker Modal ──────────────────────────────────────────── */}
      <Modal
        visible={isTimeslotPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setSelectedSlotTemp(selectedSlot);
          setIsTimeslotPickerVisible(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            // Dismiss without applying — restore temp to confirmed slot
            setSelectedSlotTemp(selectedSlot);
            setIsTimeslotPickerVisible(false);
          }}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, { paddingBottom: 32 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Typography variant="h4" weight="700">Select Time Slot</Typography>
              <Pressable onPress={() => {
                setSelectedSlotTemp(selectedSlot);
                setIsTimeslotPickerVisible(false);
              }}>
                <X size={22} color={Colors.light.text} />
              </Pressable>
            </View>

            {TIMESLOTS.map(slot => {
              const isSelected = slot.value === selectedSlotTemp;
              return (
                <Pressable
                  key={slot.value}
                  style={[styles.timeslotOption, isSelected && styles.timeslotOptionSelected]}
                  onPress={() => setSelectedSlotTemp(slot.value)}
                >
                  <View style={styles.radioOutline}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                    <Typography variant="body1" weight="700">{slot.label}</Typography>
                    <Typography variant="caption" color={Colors.light.textSecondary}>{slot.sublabel}</Typography>
                  </View>
                  {isSelected && <CheckCircle2 size={20} color={Colors.light.primary} />}
                </Pressable>
              );
            })}

            <View style={[styles.modalFooter, { marginTop: Spacing.xl }]}>
              <Button
                title="Confirm Time Slot"
                onPress={() => {
                  // Only confirm selection; DO NOT navigate
                  setSelectedSlot(selectedSlotTemp);
                  setIsTimeslotPickerVisible(false);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  iconBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.xl, paddingBottom: 120 },

  // Selected items
  selectedItemsSection: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  selectedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  selectedItemsTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },

  // Category box (old flow)
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  categoryIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.light.white,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.light.sm,
  },
  icon: { width: 34, height: 34 },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: '#A7F3D0',
  },

  // Section
  section: { marginBottom: Spacing.xl },
  sectionTitle: { marginBottom: Spacing.md },

  // Inputs
  inputGroup: { flexDirection: 'row', gap: Spacing.md },
  singleLineInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    height: 50,
  },
  phoneCountryCode: {
    paddingHorizontal: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.light.borderLight,
    justifyContent: 'center', alignItems: 'center', height: '60%',
  },
  phoneInput: { flex: 1, paddingHorizontal: Spacing.md, fontSize: 15, color: Colors.light.text, height: '100%' },

  // Date / Timeslot trigger
  dateSelectorTrigger: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    padding: Spacing.md,
  },
  dateSelectorTriggerSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  dateSelectorContent: { flexDirection: 'row', alignItems: 'center' },

  // Address
  addressSection: { marginBottom: Spacing.xl },
  addressGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  addressHalf: { flex: 1 },
  fieldLabel: { marginBottom: 4, marginTop: 2, textTransform: 'uppercase' },

  // Payout
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: Spacing.md,
  },
  paymentOptionSelected: { borderColor: Colors.light.primary, backgroundColor: Colors.light.primaryLight },
  radioOutline: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.light.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.light.primary },

  // Image upload
  errorContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEE2E2', padding: Spacing.md,
    borderRadius: BorderRadius.lg, marginBottom: Spacing.md,
  },
  uploadBox: {
    height: 140, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderStyle: 'dashed',
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  previewContainer: {
    height: 180, borderRadius: BorderRadius.xl,
    overflow: 'hidden', position: 'relative',
    backgroundColor: Colors.light.surface,
  },
  previewImage: { width: '100%', height: '100%' },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center', alignItems: 'center', padding: Spacing.xl,
  },
  progressContainer: {
    width: '100%', height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.sm,
  },
  progressBarFill: { height: '100%', backgroundColor: Colors.light.primary },
  removeBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },

  // Instructions
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },

  // Footer
  footer: {
    padding: Spacing.xl,
    paddingBottom: 40,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    ...Shadows.light.lg,
  },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.xl,
  },
  modalFooter: { flexDirection: 'row', marginTop: Spacing.md },

  // Calendar
  monthNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.md,
  },
  monthNavBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  weekdayRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  weekdayCell: { flex: 1, textAlign: 'center' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%', aspectRatio: 1,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 20,
  },
  dayCellSelected: { backgroundColor: Colors.light.primary },
  dayCellToday: { borderWidth: 1, borderColor: Colors.light.primary },
  dayCellDisabled: { opacity: 0.3 },

  // Timeslot option
  timeslotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: Spacing.md,
  },
  timeslotOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
});
