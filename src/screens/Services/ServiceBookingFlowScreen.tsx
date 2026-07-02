import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  Calendar,
  User,
  MapPin,
  Clock,
  Camera,
  Trash2,
  AlertCircle,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { CATEGORIES } from '../../constants/MockData';
import { useBookingStore } from '../../store/useBookingStore';
import { useAddressStore } from '../../store/useAddressStore';
import { useAuthStore } from '../../store/useAuthStore';
import { NetworkImage } from '../../components/NetworkImage';
import { api } from '../../services/api';
import { openRazorpayCheckout } from '../../services/razorpay';

export default function ServiceBookingFlowScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, categoryName } = route.params;
  const addBooking = useBookingStore(state => state.addBooking);

  const category = CATEGORIES.find(c => c.id === categoryId);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { user } = useAuthStore();
  const { addresses, fetchAddresses, addAddress } = useAddressStore();

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');

  // Zustand Store Date & Timeslot
  const date = useBookingStore(state => state.selectedDate);
  const selectedTimeslot = useBookingStore(state => state.selectedTimeslot);
  const setSelectedDate = useBookingStore(state => state.setSelectedDate);
  const setSelectedTimeslot = useBookingStore(
    state => state.setSelectedTimeslot,
  );
  const clearSelectedSlot = useBookingStore(state => state.clearSelectedSlot);

  const selectedPaymentMethod = useBookingStore(
    state => state.selectedPaymentMethod,
  );
  const setSelectedPaymentMethod = useBookingStore(
    state => state.setSelectedPaymentMethod,
  );

  // Clear selected slot on mount and fetch addresses
  useEffect(() => {
    clearSelectedSlot();
    fetchAddresses();
  }, []);

  // Autofill address when addresses are loaded
  useEffect(() => {
    if (addresses && addresses.length > 0 && !address) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      const formatted = [
        defaultAddr.house_number,
        defaultAddr.street,
        defaultAddr.landmark,
        defaultAddr.city,
        defaultAddr.state,
        defaultAddr.pincode,
      ]
        .filter(Boolean)
        .join(', ');
      setAddress(formatted);
    }
  }, [addresses]);

  useEffect(() => {
    if (route.params?.selectedDate) {
      setSelectedDate(route.params.selectedDate);
      navigation.setParams({ selectedDate: undefined });
    }
    if (route.params?.selectedTimeslot) {
      setSelectedTimeslot(route.params.selectedTimeslot);
      navigation.setParams({ selectedTimeslot: undefined });
    }
  }, [route.params?.selectedDate, route.params?.selectedTimeslot, navigation]);

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
        name: asset.fileName || `service_${Date.now()}.${fileExt || 'jpg'}`,
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

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleProceedToSummary = () => {
    if (!name || !phone || !address || !date || !selectedTimeslot) {
      alert('Please fill all details, including date and timeslot');
      return;
    }
    if (isUploading) {
      alert('Please wait for the image upload to complete.');
      return;
    }
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    const bookingDateStr = `${date} ${formatTime(selectedTimeslot!.start_time)} - ${formatTime(selectedTimeslot!.end_time)}`;
    setIsProcessingPayment(true);

    try {
      let addressId = '';
      if (addresses && addresses.length > 0) {
        const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
        addressId = defaultAddr.id;
      } else {
        const newAddr = await addAddress({
          address_type: 'Home',
          street: address || 'Default Street',
          city: 'City',
          state: 'State',
          pincode: '123456',
          is_default: true,
        });
        addressId = newAddr.id;
      }

      const bookingDateTime = `${date}T${selectedTimeslot!.start_time}Z`;

      // 1. Create booking in the backend
      const bookingResponse = await api.bookings.createBooking({
        service_id: selectedService.id,
        address_id: addressId,
        booking_date: bookingDateTime,
        timeslot_id: selectedTimeslot!.id,
        notes: `Customer Name: ${name}, Phone: ${phone}`,
        photos: uploadedUrl ? [uploadedUrl] : [],
        payment_method: selectedPaymentMethod,
      });

      const bookingId = bookingResponse.id || bookingResponse.booking_id;

      // 2. Razorpay online payment flow
      if (selectedPaymentMethod === 'Razorpay') {
        try {
          const orderResponse = await api.payments.createOrder(
            bookingId,
            selectedService.price,
          );

          const checkoutResponse = await openRazorpayCheckout({
            key: 'rzp_test_dummy_key',
            amount: Math.round(selectedService.price * 100),
            currency: 'INR',
            name: 'Urban Power',
            description: `Payment for booking ${bookingResponse.booking_reference}`,
            order_id: orderResponse.order_id,
            prefill: {
              name: name,
              email: user?.email || 'customer@urbanpower.com',
              contact: phone,
            },
            theme: { color: '#7C3AED' },
          });

          await api.payments.verifyPayment({
            razorpay_payment_id: checkoutResponse.razorpay_payment_id,
            razorpay_order_id: checkoutResponse.razorpay_order_id,
            razorpay_signature: checkoutResponse.razorpay_signature,
          });
        } catch (paymentErr: any) {
          console.error('Payment flow failed:', paymentErr);
          alert(
            paymentErr.description ||
              paymentErr.message ||
              'Payment failed or cancelled.',
          );
          setIsProcessingPayment(false);
          return;
        }
      }

      // 3. Save to local Zustand store
      addBooking({
        type: 'Service',
        title: selectedService.title,
        subtitle: categoryName,
        customerName: name,
        phone: phone,
        address: address,
        date: bookingDateStr,
        price: selectedService.price,
        serviceId: selectedService.id,
        timeslotId: selectedTimeslot!.id,
        rawDate: date,
        images: uploadedUrl ? [uploadedUrl] : [],
        image: uploadedUrl || undefined,
        paymentMethod: selectedPaymentMethod,
      });

      navigation.navigate('GeneralBookingSuccess', {
        bookingId: bookingResponse.booking_reference || bookingId,
        service: selectedService.title,
        date: date,
        timeslot: `${formatTime(selectedTimeslot!.start_time)} - ${formatTime(selectedTimeslot!.end_time)}`,
        status:
          bookingResponse.status || bookingResponse.booking_status || 'Pending',
        paymentMethod: selectedPaymentMethod,
        title: selectedService.title,
        address: address,
      });
    } catch (error: any) {
      console.error('Failed to save booking:', error);
      alert(
        error.response?.data?.detail ||
          error.message ||
          'An error occurred while confirming booking.',
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const renderStep1 = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    >
      <Typography variant="h3" weight="800" style={styles.stepTitle}>
        Select Subcategory
      </Typography>
      {category?.services.map(item => (
        <Pressable
          key={item.id}
          style={styles.serviceCard}
          onPress={() => handleServiceSelect(item)}
        >
          <NetworkImage
            source={{ uri: item.image }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
          <View style={styles.serviceInfo}>
            <Typography variant="body1" weight="800">
              {item.title}
            </Typography>
            <Typography variant="body2" color={Colors.light.textSecondary}>
              {item.duration}
            </Typography>
            <Typography
              variant="h4"
              color={Colors.light.primary}
              weight="800"
              style={{ marginTop: 4 }}
            >
              ₹{item.price}
            </Typography>
          </View>
          <ChevronLeft
            color={Colors.light.textMuted}
            size={20}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </Pressable>
      ))}
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.formContainer}
    >
      <View style={styles.selectedHeader}>
        <NetworkImage
          source={{ uri: selectedService.image }}
          style={styles.smallImage}
          resizeMode="cover"
        />
        <View style={{ marginLeft: Spacing.md }}>
          <Typography variant="body1" weight="800">
            {selectedService.title}
          </Typography>
          <Typography variant="tiny" color={Colors.light.textSecondary}>
            {categoryName}
          </Typography>
        </View>
      </View>

      <Typography variant="h3" weight="800" style={styles.stepTitle}>
        Booking Details
      </Typography>

      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <User size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>
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
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>
            Phone Number
          </Typography>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter 10-digit phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <Calendar size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>
            Preferred Date
          </Typography>
        </View>
        <Pressable
          style={styles.dateSelectorTrigger}
          onPress={() => {
            navigation.navigate('DateSelection', {
              serviceId: selectedService?.id || '',
              returnScreen: 'ServiceBookingFlow',
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
          <Clock size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>
            Preferred Timeslot
          </Typography>
        </View>
        <Pressable
          style={[
            styles.dateSelectorTrigger,
            !date && styles.disabledSelectorTrigger,
          ]}
          onPress={() => {
            if (!date) {
              alert('Please select a service date first');
              return;
            }
            navigation.navigate('TimeslotSelection', {
              serviceId: selectedService?.id || '',
              date: date,
              returnScreen: 'ServiceBookingFlow',
              initialTimeslotId: selectedTimeslot?.id,
            });
          }}
        >
          <Typography
            variant="body2"
            color={
              selectedTimeslot ? Colors.light.text : Colors.light.textMuted
            }
          >
            {selectedTimeslot
              ? `${formatTime(selectedTimeslot.start_time)} - ${formatTime(selectedTimeslot.end_time)}`
              : 'Select Preferred Timeslot'}
          </Typography>
        </Pressable>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <MapPin size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>
            Service Address
          </Typography>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter complete address for service"
          multiline
          numberOfLines={3}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* Reference Photos Section */}
      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <Camera size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>
            Reference Photos (Optional)
          </Typography>
        </View>
        <Typography
          variant="caption"
          color={Colors.light.textSecondary}
          style={{ marginBottom: Spacing.sm }}
        >
          Upload reference photos for a more accurate diagnostic check.
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

      <View style={styles.priceSummary}>
        <Typography variant="body2" color={Colors.light.textSecondary}>
          Total Amount
        </Typography>
        <Typography variant="h2" weight="900" color={Colors.light.primary}>
          ₹{selectedService.price}
        </Typography>
      </View>

      <Button
        title="Proceed to Summary"
        onPress={handleProceedToSummary}
        size="lg"
        style={styles.submitBtn}
      />
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.formContainer}
    >
      <Typography variant="h3" weight="800" style={styles.stepTitle}>
        Booking Summary
      </Typography>

      <View style={styles.summaryCard}>
        {/* Service Details */}
        <Typography
          variant="body1"
          weight="800"
          style={{ marginBottom: Spacing.sm }}
        >
          Service Selected
        </Typography>
        <View style={styles.summaryRowItem}>
          <Typography variant="body2" color={Colors.light.textSecondary}>
            Category:
          </Typography>
          <Typography variant="body2" weight="600">
            {categoryName}
          </Typography>
        </View>
        <View style={styles.summaryRowItem}>
          <Typography variant="body2" color={Colors.light.textSecondary}>
            Service:
          </Typography>
          <Typography variant="body2" weight="600">
            {selectedService?.title}
          </Typography>
        </View>
        <View style={styles.summaryRowItem}>
          <Typography variant="body2" color={Colors.light.textSecondary}>
            Price:
          </Typography>
          <Typography variant="body2" weight="700" color={Colors.light.primary}>
            ₹{selectedService?.price}
          </Typography>
        </View>

        <View style={styles.summaryDivider} />

        {/* Schedule */}
        <Typography
          variant="body1"
          weight="800"
          style={{ marginBottom: Spacing.sm }}
        >
          Schedule Details
        </Typography>
        <View style={styles.summaryRowItem}>
          <Typography variant="body2" color={Colors.light.textSecondary}>
            Date:
          </Typography>
          <Typography variant="body2" weight="600">
            {formatDateDisplay(date)}
          </Typography>
        </View>
        <View style={styles.summaryRowItem}>
          <Typography variant="body2" color={Colors.light.textSecondary}>
            Timeslot:
          </Typography>
          <Typography variant="body2" weight="600">
            {selectedTimeslot
              ? `${formatTime(selectedTimeslot.start_time)} - ${formatTime(selectedTimeslot.end_time)}`
              : ''}
          </Typography>
        </View>

        <View style={styles.summaryDivider} />

        {/* Address & Contact */}
        <Typography
          variant="body1"
          weight="800"
          style={{ marginBottom: Spacing.sm }}
        >
          Customer Details
        </Typography>
        <View style={styles.summaryRowItem}>
          <Typography variant="body2" color={Colors.light.textSecondary}>
            Name:
          </Typography>
          <Typography variant="body2" weight="600">
            {name}
          </Typography>
        </View>
        <View style={styles.summaryRowItem}>
          <Typography variant="body2" color={Colors.light.textSecondary}>
            Phone:
          </Typography>
          <Typography variant="body2" weight="600">
            {phone}
          </Typography>
        </View>
        <View style={styles.summaryRowItem}>
          <Typography variant="body2" color={Colors.light.textSecondary}>
            Address:
          </Typography>
          <Typography
            variant="body2"
            weight="600"
            style={{ flex: 1, textAlign: 'right', marginLeft: Spacing.lg }}
          >
            {address}
          </Typography>
        </View>

        {uploadedUrl && (
          <>
            <View style={styles.summaryDivider} />
            <Typography
              variant="body1"
              weight="800"
              style={{ marginBottom: Spacing.sm }}
            >
              Reference Photo
            </Typography>
            <NetworkImage
              source={{ uri: uploadedUrl }}
              style={styles.summaryPreviewImage}
            />
          </>
        )}

        <View style={styles.summaryDivider} />

        <Typography
          variant="body1"
          weight="800"
          style={{ marginBottom: Spacing.sm }}
        >
          Payment Method
        </Typography>
        <Pressable
          style={[
            styles.paymentOption,
            selectedPaymentMethod === 'COD' && styles.paymentOptionSelected,
          ]}
          onPress={() => setSelectedPaymentMethod('COD')}
        >
          <View style={styles.radioOutline}>
            {selectedPaymentMethod === 'COD' && (
              <View style={styles.radioDot} />
            )}
          </View>
          <View style={{ marginLeft: Spacing.md, flex: 1 }}>
            <Typography variant="body1" weight="700">
              Cash On Delivery (COD)
            </Typography>
            <Typography variant="caption" color={Colors.light.textSecondary}>
              Pay in cash after the service is completed
            </Typography>
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.paymentOption,
            selectedPaymentMethod === 'Razorpay' &&
              styles.paymentOptionSelected,
          ]}
          onPress={() => setSelectedPaymentMethod('Razorpay')}
        >
          <View style={styles.radioOutline}>
            {selectedPaymentMethod === 'Razorpay' && (
              <View style={styles.radioDot} />
            )}
          </View>
          <View style={{ marginLeft: Spacing.md, flex: 1 }}>
            <Typography variant="body1" weight="700">
              Razorpay (Online Payment)
            </Typography>
            <Typography variant="caption" color={Colors.light.textSecondary}>
              Pay securely online using UPI, Cards or NetBanking
            </Typography>
          </View>
        </Pressable>
      </View>

      <View style={styles.summaryPriceCard}>
        <View style={styles.summaryRow}>
          <Typography variant="body1" weight="700">
            Total Price
          </Typography>
          <Typography variant="h2" weight="900" color={Colors.light.primary}>
            ₹{selectedService?.price}
          </Typography>
        </View>
      </View>

      <Button
        title="Confirm & Book"
        onPress={handleConfirmBooking}
        size="lg"
        loading={isProcessingPayment}
        disabled={isProcessingPayment}
        style={styles.submitBtn}
      />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            if (step === 3) setStep(2);
            else if (step === 2) setStep(1);
            else navigation.goBack();
          }}
        >
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Typography variant="h3" weight="800">
            {categoryName}
          </Typography>
          <Typography variant="tiny" color={Colors.light.textSecondary}>
            Step {step} of 3
          </Typography>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progress,
            { width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' },
          ]}
        />
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
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
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.surface,
    width: '100%',
  },
  progress: {
    height: '100%',
    backgroundColor: Colors.light.primary,
  },
  stepTitle: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  listContainer: { paddingBottom: Spacing.xxl },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  formContainer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  smallImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
  },
  inputGroup: { marginBottom: Spacing.xl },
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
  disabledSelectorTrigger: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    marginTop: Spacing.md,
  },
  submitBtn: { marginTop: Spacing.lg },

  summaryCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.md,
  },
  summaryPriceCard: {
    padding: Spacing.xl,
    backgroundColor: '#F5F3FF',
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  summaryPreviewImage: {
    width: '100%',
    height: 150,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
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
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    backgroundColor: Colors.light.white,
    marginBottom: Spacing.md,
  },
  paymentOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F5F3FF',
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
});
