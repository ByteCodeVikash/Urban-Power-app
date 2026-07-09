import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  BackHandler,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ChevronLeft,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  Camera,
  Trash2,
  AlertCircle,
  Wrench,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useBookingStore } from '../../store/useBookingStore';
import { useMaintenanceStore } from '../../store/useMaintenanceStore';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useAddresses } from '../../hooks/useServices';
import { NetworkImage } from '../../components/NetworkImage';

export default function MaintenanceBookingScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { data: addresses } = useAddresses();

  const selectedServices = useMaintenanceStore(state => state.selectedServices);
  const clearSelection = useMaintenanceStore(state => state.clearSelection);
  const getTotalPrice = useMaintenanceStore(state => state.getTotalPrice());
  const getSelectedCount = useMaintenanceStore(state =>
    state.getSelectedCount(),
  );

  const addBooking = useBookingStore(state => state.addBooking);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(() => {
    const rawPhone = user?.phone || '';
    const cleaned = rawPhone.replace(/[^0-9]/g, '');
    return cleaned.slice(-10);
  });
  // Manual address fields
  const [addrHouseNo, setAddrHouseNo] = useState('');
  const [addrBuilding, setAddrBuilding] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrArea, setAddrArea] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPin, setAddrPin] = useState('');
  // Computed address string for submission
  const address = [
    addrHouseNo,
    addrBuilding,
    addrStreet,
    addrArea,
    addrLandmark,
    addrCity,
    addrState,
    addrPin,
  ]
    .filter(Boolean)
    .join(', ');
  const [date, setDate] = useState('');

  // Read selectedDate from Zustand store (set by DateSelectionScreen before goBack())
  const storeSelectedDate = useBookingStore(state => state.selectedDate);

  // Sync local date state from store whenever this screen comes into focus
  // (i.e., after returning from DateSelectionScreen via goBack())
  useFocusEffect(
    useCallback(() => {
      if (storeSelectedDate) {
        setDate(storeSelectedDate);
      }
    }, [storeSelectedDate]),
  );

  // Address is intentionally left empty; user must type it manually.

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
    if (!name || !phone || !addrCity || !addrStreet || !date) {
      alert('Please fill all details including street and city');
      return;
    }
    if (phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
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

      // Persist to PostgreSQL via backend API
      await api.maintenance.createBooking({
        address_text: address,
        booking_date: bookingDateISO,
        service_ids: selectedServices.map(s => String(s.id)),
        service_names: selectedServices.map(s => s.name),
        total_price: getTotalPrice,
        customer_name: name,
        customer_phone: formattedPhone,
        photos: uploadedUrl ? [uploadedUrl] : [],
      });

      // Also update local Zustand store for UI state (secondary mirror)
      addBooking({
        type: 'Service',
        title: title,
        subtitle: 'Maintenance Booking',
        customerName: name,
        phone: formattedPhone,
        address: address,
        date: date,
        price: getTotalPrice,
        image: uploadedUrl || undefined,
      });

      // Clear maintenance cart selection
      clearSelection();

      // Navigate to booking success
      navigation.navigate('GeneralBookingSuccess', {
        title: title,
        date: date,
        address: address,
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
              style={styles.dateSelectorTrigger}
              onPress={() => {
                const firstServiceId = selectedServices[0]?.id || '';
                navigation.navigate('DateSelection', {
                  serviceId: firstServiceId,
                  returnScreen: 'MaintenanceBooking',
                  initialDate: date,
                });
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
              <MapPin size={18} color={Colors.light.primary} />
              <Typography
                variant="body2"
                weight="700"
                style={{ marginLeft: 8 }}
              >
                Service Address
              </Typography>
            </View>
            <View style={styles.addressGrid}>
              <View style={styles.addressHalf}>
                <Typography
                  variant="caption"
                  color={Colors.light.textSecondary}
                  style={styles.fieldLabel}
                >
                  HOUSE / FLAT NO.
                </Typography>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. A-12"
                  value={addrHouseNo}
                  onChangeText={setAddrHouseNo}
                />
              </View>
              <View style={styles.addressHalf}>
                <Typography
                  variant="caption"
                  color={Colors.light.textSecondary}
                  style={styles.fieldLabel}
                >
                  BUILDING / SOCIETY
                </Typography>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Green Park Apts"
                  value={addrBuilding}
                  onChangeText={setAddrBuilding}
                />
              </View>
            </View>
            <Typography
              variant="caption"
              color={Colors.light.textSecondary}
              style={styles.fieldLabel}
            >
              STREET *
            </Typography>
            <TextInput
              style={styles.input}
              placeholder="e.g. MG Road"
              value={addrStreet}
              onChangeText={setAddrStreet}
            />
            <Typography
              variant="caption"
              color={Colors.light.textSecondary}
              style={[styles.fieldLabel, { marginTop: Spacing.sm }]}
            >
              AREA / LOCALITY
            </Typography>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sector 45"
              value={addrArea}
              onChangeText={setAddrArea}
            />
            <Typography
              variant="caption"
              color={Colors.light.textSecondary}
              style={[styles.fieldLabel, { marginTop: Spacing.sm }]}
            >
              LANDMARK (OPTIONAL)
            </Typography>
            <TextInput
              style={styles.input}
              placeholder="e.g. Near Metro Station"
              value={addrLandmark}
              onChangeText={setAddrLandmark}
            />
            <View style={styles.addressGrid}>
              <View style={styles.addressHalf}>
                <Typography
                  variant="caption"
                  color={Colors.light.textSecondary}
                  style={styles.fieldLabel}
                >
                  CITY *
                </Typography>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Delhi"
                  value={addrCity}
                  onChangeText={setAddrCity}
                />
              </View>
              <View style={styles.addressHalf}>
                <Typography
                  variant="caption"
                  color={Colors.light.textSecondary}
                  style={styles.fieldLabel}
                >
                  STATE *
                </Typography>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Delhi"
                  value={addrState}
                  onChangeText={setAddrState}
                />
              </View>
            </View>
            <Typography
              variant="caption"
              color={Colors.light.textSecondary}
              style={[styles.fieldLabel, { marginTop: Spacing.sm }]}
            >
              PIN CODE *
            </Typography>
            <TextInput
              style={styles.input}
              placeholder="e.g. 110001"
              value={addrPin}
              onChangeText={t => setAddrPin(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={6}
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
});
