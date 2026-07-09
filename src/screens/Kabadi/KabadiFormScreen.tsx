import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Truck,
  Camera,
  Trash2,
  AlertCircle,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { KABADI_ITEMS } from '../../constants/MockData';
import { useAddresses } from '../../hooks/useServices';
import { useAuthStore } from '../../store/useAuthStore';
import { NetworkImage } from '../../components/NetworkImage';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../services/api';

import { useKabadiStore } from '../../store/useKabadiStore';
import { useScrapSelectionStore } from '../../store/useScrapSelectionStore';

export default function KabadiFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, subcategoryName, categoryName } = route.params || {};

  // Find the specific subcategory for pricing
  const parentCategory = KABADI_ITEMS.find(k => k.title === categoryName);
  const subcategory = parentCategory?.subcategories.find(
    s => s.id === categoryId,
  );

  const selectedItems = useScrapSelectionStore(state => state.selectedItems);
  const totalWeight = useScrapSelectionStore(state => state.totalWeight)();
  const totalEstimatedPrice = useScrapSelectionStore(
    state => state.totalEstimatedPrice,
  )();
  const clearSelection = useScrapSelectionStore(state => state.clearSelection);

  const { data: addresses } = useAddresses();
  const { user } = useAuthStore();
  const schedulePickup = useKabadiStore(state => state.schedulePickup);

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('Morning (9-12)');
  const [instructions, setInstructions] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(() => {
    const rawPhone = user?.phone || '';
    const cleaned = rawPhone.replace(/[^0-9]/g, '');
    return cleaned.slice(-10);
  });
  const [weight, setWeight] = useState(() => {
    return selectedItems.length > 0 ? String(totalWeight) : '';
  });
  const [payoutMethod, setPayoutMethod] = useState<'Cash' | 'UPI'>('Cash');

  useEffect(() => {
    if (selectedItems.length > 0) {
      setWeight(String(totalWeight));
    }
  }, [selectedItems, totalWeight]);

  // Image Upload states
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
        name: asset.fileName || `photo_${Date.now()}.${fileExt || 'jpg'}`,
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

  // Pickup Address fields — inline manual form
  const [addrHouseNo, setAddrHouseNo] = useState('');
  const [addrBuilding, setAddrBuilding] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrArea, setAddrArea] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPin, setAddrPin] = useState('');
  // Computed pickup address string for submission
  const pickupAddress = [
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

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSchedule = async () => {
    const activeWeight =
      selectedItems.length > 0 ? String(totalWeight) : weight;
    if (!name || !phone || !activeWeight) {
      alert('Please enter your name, phone and estimated weight.');
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
      // Build booking date from selected date
      const selectedDateObj = new Date();
      selectedDateObj.setDate(selectedDateObj.getDate() + selectedDate + 1);
      const bookingDateISO = selectedDateObj.toISOString();

      let finalCategoryName = categoryName || 'Mixed Scrap';
      let finalItemName = subcategoryName || 'General Scrap';
      let finalPricePerKg = subcategory?.price || 0;
      let finalEstimatedValue =
        (subcategory?.price || 0) * (parseFloat(activeWeight) || 0);

      if (selectedItems.length > 0) {
        const uniqueCategoryIds = Array.from(
          new Set(selectedItems.map(i => i.category_id)),
        );
        const catNames = uniqueCategoryIds.map(cid => {
          const cat = KABADI_ITEMS.find(k => k.id === cid);
          return cat ? cat.title : 'Scrap';
        });
        finalCategoryName = catNames.join(', ');
        finalItemName = selectedItems
          .map(i => `${i.name} (${i.quantity} kg)`)
          .join(', ');
        finalEstimatedValue = totalEstimatedPrice;
        finalPricePerKg =
          totalWeight > 0 ? totalEstimatedPrice / totalWeight : 0;
      }

      // Persist to PostgreSQL via backend API
      const response = await api.kabadi.createBooking({
        address_text: pickupAddress,
        booking_date: bookingDateISO,
        time_slot: selectedSlot,
        category_name: finalCategoryName,
        item_name: finalItemName,
        estimated_weight_kg: parseFloat(activeWeight) || 0,
        estimated_value: finalEstimatedValue,
        price_per_kg: finalPricePerKg,
        notes: instructions
          ? `${instructions} | Payout: ${payoutMethod}`
          : `Payout: ${payoutMethod}`,
        photos: uploadedUrl ? [uploadedUrl] : [],
      });

      const successTitle =
        selectedItems.length > 0
          ? `${selectedItems.length} Scrap Items`
          : `${categoryName} - ${subcategoryName}`;

      const scheduleCategories =
        selectedItems.length > 0
          ? selectedItems.map(i => `${i.name} (${i.quantity} kg)`)
          : [`${categoryName} - ${subcategoryName}`];

      // Also update local Zustand store for UI state (secondary mirror)
      schedulePickup({
        categories: scheduleCategories,
        address: pickupAddress,
        date: dates[selectedDate].full,
        timeSlot: selectedSlot,
        estimatedValue: finalEstimatedValue.toString(),
        image: uploadedUrl || undefined,
      });

      if (selectedItems.length > 0) {
        clearSelection();
      }

      navigation.navigate('GeneralBookingSuccess', {
        bookingId: response?.booking_reference || 'UP-SUCCESS',
        title: successTitle,
        date: dates[selectedDate].full,
        timeslot: selectedSlot,
        address: pickupAddress,
        paymentMethod: 'COD',
      });
    } catch (err: any) {
      console.error('Scrap booking API error:', err);
      // Skip alert for auth errors — interceptor already called logout()
      // which causes AppNavigator to redirect to LoginScreen.
      if (!err?.isAuthError) {
        const errMsg =
          err?.message || 'Failed to schedule pickup. Please try again.';
        alert(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {selectedItems.length > 0 ? (
          <View style={styles.selectedItemsSection}>
            <Typography
              variant="body1"
              weight="800"
              style={{ marginBottom: Spacing.sm }}
            >
              Selected Items ({selectedItems.length})
            </Typography>
            {selectedItems.map(item => (
              <View key={item.id} style={styles.selectedItemRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="body2" weight="700">
                    {item.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={Colors.light.textSecondary}
                  >
                    ₹{item.price_per_kg}/kg
                  </Typography>
                </View>
                <Typography
                  variant="body2"
                  weight="700"
                  style={{ marginRight: Spacing.md }}
                >
                  {item.quantity} kg
                </Typography>
                <Typography
                  variant="body2"
                  weight="800"
                  color={Colors.light.primary}
                >
                  ₹{item.price_per_kg * item.quantity}
                </Typography>
              </View>
            ))}
            <View style={styles.selectedItemsTotalRow}>
              <Typography
                variant="body2"
                weight="700"
                color={Colors.light.textSecondary}
              >
                Total Weight: {totalWeight} kg
              </Typography>
              <Typography
                variant="body2"
                weight="800"
                color={Colors.light.primary}
              >
                Total Est. Value: ₹{totalEstimatedPrice}
              </Typography>
            </View>
          </View>
        ) : (
          <View style={styles.selectedBox}>
            <View style={styles.categoryIcon}>
              <NetworkImage
                source={{ uri: parentCategory?.icon || '' }}
                style={styles.icon}
                resizeMode="cover"
              />
            </View>
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <Typography
                variant="caption"
                color={Colors.light.textSecondary}
                weight="700"
              >
                {categoryName?.toUpperCase()}
              </Typography>
              <Typography variant="body1" weight="800">
                {subcategoryName || 'General Scrap'}
              </Typography>
              <Typography
                variant="body2"
                color={Colors.light.success}
                weight="700"
              >
                ₹{subcategory?.price || 'Market Rate'}/kg
              </Typography>
            </View>
            <View style={styles.verifiedBadge}>
              <Typography
                variant="tiny"
                color={Colors.light.success}
                weight="700"
              >
                Rate Verified
              </Typography>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>
            Your Details
          </Typography>
          <View style={styles.inputGroup}>
            <View style={{ flex: 1 }}>
              <Typography
                variant="caption"
                color={Colors.light.textSecondary}
                style={{ marginBottom: 4 }}
              >
                NAME
              </Typography>
              <TextInput
                style={styles.singleLineInput}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Typography
                variant="caption"
                color={Colors.light.textSecondary}
                style={{ marginBottom: 4 }}
              >
                ESTIMATED WEIGHT (KG)
              </Typography>
              <TextInput
                style={[
                  styles.singleLineInput,
                  selectedItems.length > 0 && {
                    backgroundColor: '#F1F5F9',
                    color: Colors.light.textMuted,
                  },
                ]}
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
              <Typography
                variant="caption"
                color={Colors.light.textSecondary}
                style={{ marginBottom: 4 }}
              >
                PHONE NUMBER
              </Typography>
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
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>
            Select Date
          </Typography>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.datePicker}
          >
            {dates.map((item, index) => (
              <Pressable
                key={index}
                style={[
                  styles.dateChip,
                  selectedDate === index && styles.activeChip,
                ]}
                onPress={() => setSelectedDate(index)}
              >
                <Typography
                  variant="tiny"
                  weight="700"
                  color={
                    selectedDate === index
                      ? Colors.light.white
                      : Colors.light.textSecondary
                  }
                >
                  {item.day.toUpperCase()}
                </Typography>
                <Typography
                  variant="h3"
                  weight="800"
                  color={
                    selectedDate === index
                      ? Colors.light.white
                      : Colors.light.text
                  }
                >
                  {item.date}
                </Typography>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>
            Select Time Slot
          </Typography>
          <View style={styles.slotGrid}>
            {['Morning (9-12)', 'Afternoon (12-4)', 'Evening (4-7)'].map(
              slot => (
                <Pressable
                  key={slot}
                  style={[
                    styles.slotChip,
                    selectedSlot === slot && styles.activeChip,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Typography
                    variant="body2"
                    weight="700"
                    color={
                      selectedSlot === slot
                        ? Colors.light.white
                        : Colors.light.text
                    }
                  >
                    {slot.split(' ')[0]}
                  </Typography>
                  <Typography
                    variant="tiny"
                    color={
                      selectedSlot === slot
                        ? 'rgba(255,255,255,0.7)'
                        : Colors.light.textSecondary
                    }
                  >
                    {slot.split(' ')[1]}
                  </Typography>
                </Pressable>
              ),
            )}
          </View>
        </View>

        <View style={styles.addressSection}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>
            Pickup Address
          </Typography>
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
                style={styles.singleLineInput}
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
                style={styles.singleLineInput}
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
            style={[styles.singleLineInput, { marginBottom: Spacing.sm }]}
            placeholder="e.g. MG Road"
            value={addrStreet}
            onChangeText={setAddrStreet}
          />
          <Typography
            variant="caption"
            color={Colors.light.textSecondary}
            style={styles.fieldLabel}
          >
            AREA / LOCALITY
          </Typography>
          <TextInput
            style={[styles.singleLineInput, { marginBottom: Spacing.sm }]}
            placeholder="e.g. Sector 45"
            value={addrArea}
            onChangeText={setAddrArea}
          />
          <Typography
            variant="caption"
            color={Colors.light.textSecondary}
            style={styles.fieldLabel}
          >
            LANDMARK (OPTIONAL)
          </Typography>
          <TextInput
            style={[styles.singleLineInput, { marginBottom: Spacing.sm }]}
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
                style={styles.singleLineInput}
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
                style={styles.singleLineInput}
                placeholder="e.g. Delhi"
                value={addrState}
                onChangeText={setAddrState}
              />
            </View>
          </View>
          <Typography
            variant="caption"
            color={Colors.light.textSecondary}
            style={styles.fieldLabel}
          >
            PIN CODE *
          </Typography>
          <TextInput
            style={styles.singleLineInput}
            placeholder="e.g. 110001"
            value={addrPin}
            onChangeText={t => setAddrPin(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {/* Preferred Payout Method Section */}
        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>
            Preferred Payout Method
          </Typography>
          <Typography
            variant="caption"
            color={Colors.light.textSecondary}
            style={{ marginBottom: Spacing.md }}
          >
            Select how you would like to receive the payment for your scrap.
          </Typography>

          <Pressable
            style={[
              styles.paymentOption,
              payoutMethod === 'Cash' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPayoutMethod('Cash')}
          >
            <View style={styles.radioOutline}>
              {payoutMethod === 'Cash' && <View style={styles.radioDot} />}
            </View>
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <Typography variant="body1" weight="700">
                Cash Payout
              </Typography>
              <Typography variant="caption" color={Colors.light.textSecondary}>
                Receive instant cash in hand at the time of pickup
              </Typography>
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.paymentOption,
              payoutMethod === 'UPI' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPayoutMethod('UPI')}
          >
            <View style={styles.radioOutline}>
              {payoutMethod === 'UPI' && <View style={styles.radioDot} />}
            </View>
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <Typography variant="body1" weight="700">
                UPI Payout
              </Typography>
              <Typography variant="caption" color={Colors.light.textSecondary}>
                Receive instant transfer to your UPI ID / Phone number
              </Typography>
            </View>
          </Pressable>
        </View>

        {/* Photo Upload Section */}
        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>
            Upload Scrap Photos (Optional)
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

        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>
            Instructions (Optional)
          </Typography>
          <TextInput
            style={styles.input}
            placeholder="e.g. Call before arrival, gate code 1234..."
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />
        </View>

        <View style={styles.hintBox}>
          <Truck size={20} color={Colors.light.primary} />
          <Typography
            variant="body2"
            color={Colors.light.textSecondary}
            style={{ marginLeft: Spacing.sm, flex: 1 }}
          >
            Professional will bring a digital scale. Instant payment via UPI or
            Cash.
          </Typography>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Confirm & Schedule" onPress={handleSchedule} size="lg" />
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: Spacing.xl },
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.sm,
  },
  icon: { width: 34, height: 34 },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { marginBottom: Spacing.md },
  inputGroup: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  singleLineInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  datePicker: { paddingVertical: Spacing.sm },
  dateChip: {
    width: 70,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.surface,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  activeChip: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    ...Shadows.light.sm,
  },
  slotGrid: { flexDirection: 'row', gap: Spacing.sm },
  slotChip: {
    flex: 1,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  addressSection: { marginBottom: Spacing.xl },
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
  hintBox: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primaryLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: 40,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    ...Shadows.light.lg,
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
    height: 180,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.light.surface,
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
  paymentOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  radioOutline: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
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
});
