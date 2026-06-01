import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, TextInput, Dimensions, BackHandler } from 'react-native';
import { NetworkImage } from '../../components/NetworkImage';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Calendar, User, MapPin, CheckCircle2, Star, Clock, ShieldCheck } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { CATEGORIES } from '../../constants/MockData';
import { useBookingStore } from '../../store/useBookingStore';

const { width } = Dimensions.get('window');

export default function ServiceBookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, categoryName, selectedServiceId, subcategoryName } =
    route.params || { categoryId: 'c1', categoryName: 'Cleaning' };
  const addBooking = useBookingStore((state) => state.addBooking);

  const category = CATEGORIES.find(c => c.id === categoryId);

  // If a service was pre-selected (from SubcategoryScreen), start at step 2
  const preSelected = selectedServiceId
    ? category?.services.find(s => s.id === selectedServiceId) ?? null
    : null;

  const [step, setStep] = useState(preSelected ? 2 : 1);
  const [selectedService, setSelectedService] = useState<any>(preSelected);

  const bookingTitle = selectedService
    ? subcategoryName
      ? `${selectedService.title} — ${subcategoryName}`
      : selectedService.title
    : '';

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');

  // Handle Hardware Back Button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (step === 3) {
          navigation.navigate('Home');
          return true;
        } else if (step === 2) {
          // If service was pre-selected from SubcategoryScreen go back there
          if (preSelected) {
            navigation.goBack();
          } else {
            setStep(1);
          }
          return true;
        } else if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        } else {
          navigation.navigate('Home');
          return true;
        }
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [step, navigation])
  );

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!name || !phone || !address || !date) {
      alert('Please fill all details');
      return;
    }

    addBooking({
      id: Math.random().toString(36).substr(2, 9),
      type: 'Service',
      title: bookingTitle,
      subtitle: categoryName,
      customerName: name,
      phone: phone,
      address: address,
      date: date,
      price: selectedService.price,
      status: 'Upcoming',
    });

    setStep(3);
  };

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
      <Typography variant="h3" weight="800" style={styles.stepTitle}>Select Service Type</Typography>
      {category?.services.map((item) => (
        <Pressable 
          key={item.id} 
          style={styles.serviceCard}
          onPress={() => handleServiceSelect(item)}
        >
          <NetworkImage source={{ uri: item.image }} style={styles.serviceImage} />
          <View style={styles.serviceInfo}>
            <Typography variant="body1" weight="800">{item.title}</Typography>
            <View style={styles.metaRow}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Typography variant="tiny" weight="700" style={{ marginLeft: 4 }}>{item.rating}</Typography>
              <Typography variant="tiny" color={Colors.light.textMuted}> • {item.duration}</Typography>
            </View>
            <Typography variant="h4" color={Colors.light.primary} weight="900" style={{ marginTop: 6 }}>
              ₹{item.price}
            </Typography>
          </View>
          <View style={styles.addButtonMini}>
            <Typography variant="tiny" weight="900" color={Colors.light.primary}>SELECT</Typography>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
      <View style={styles.selectedHeader}>
        <NetworkImage source={{ uri: selectedService.image }} style={styles.smallImage} />
        <View style={{ marginLeft: Spacing.md }}>
          <Typography variant="body1" weight="800">{bookingTitle}</Typography>
          <Typography variant="tiny" color={Colors.light.textSecondary}>Professional {categoryName}</Typography>
        </View>
      </View>

      <Typography variant="h3" weight="800" style={styles.stepTitle}>Booking Details</Typography>

      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <User size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Customer Name</Typography>
        </View>
        <TextInput 
          style={styles.input}
          placeholder="Enter full name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <Clock size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Phone Number</Typography>
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
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Pickup/Service Date</Typography>
        </View>
        <TextInput 
          style={styles.input}
          placeholder="e.g. 25th Oct, 10:00 AM"
          value={date}
          onChangeText={setDate}
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <MapPin size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Service Address</Typography>
        </View>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Enter complete address"
          multiline
          numberOfLines={3}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Typography variant="body2" color={Colors.light.textSecondary}>Service Total</Typography>
          <Typography variant="h3" weight="900" color={Colors.light.primary}>₹{selectedService.price}</Typography>
        </View>
        <Typography variant="tiny" color={Colors.light.textMuted} style={{ marginTop: 4 }}>
          Inclusive of all taxes and professional fees
        </Typography>
      </View>

      <Button 
        title="Confirm & Book" 
        onPress={handleSubmit}
        size="lg"
        style={styles.submitBtn}
      />
    </ScrollView>
  );

  const renderStep3 = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIconWrapper}>
        <CheckCircle2 size={60} color={Colors.light.white} />
      </View>
      <Typography variant="h2" weight="900" style={styles.successTitle}>Booking Confirmed!</Typography>
      <Typography variant="body1" align="center" color={Colors.light.textSecondary} style={styles.successSubtitle}>
        Your {bookingTitle} has been scheduled for {date}. A professional will contact you soon.
      </Typography>
      
      <View style={styles.infoCard}>
        <ShieldCheck size={20} color="#10B981" />
        <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>
          UP Verified Professional Assigned
        </Typography>
      </View>

      <Button 
        title="Back to Home" 
        onPress={() => navigation.navigate('Home')}
        size="lg"
        style={{ width: '100%', marginTop: Spacing.xxl }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable 
          style={styles.backBtn} 
          onPress={() => {
            if (step === 3) navigation.navigate('Home');
            else if (step === 2 && preSelected) navigation.goBack();
            else if (step === 2) setStep(1);
            else navigation.goBack();
          }}
        >
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Typography variant="h3" weight="800">{categoryName}</Typography>
          {step < 3 && (
            <Typography variant="tiny" color={Colors.light.textSecondary}>
              Step {step} of 2
            </Typography>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {step < 3 && (
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: step === 1 ? '50%' : '100%' }]} />
        </View>
      )}

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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
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
  listContainer: { paddingBottom: 150 },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  serviceImage: {
    width: 70, height: 70, borderRadius: BorderRadius.lg,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  addButtonMini: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.primaryLight,
  },
  formContainer: { paddingHorizontal: Spacing.xl, paddingBottom: 150 },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
    borderWidth: 1, borderColor: '#DDD6FE',
  },
  smallImage: {
    width: 50, height: 50, borderRadius: BorderRadius.md,
  },
  inputGroup: { marginBottom: Spacing.xl },
  inputLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  summaryCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.lg,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  submitBtn: { marginTop: Spacing.xl },

  // Success State
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  successIconWrapper: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.light.md,
  },
  successTitle: { marginBottom: Spacing.sm },
  successSubtitle: { lineHeight: 22, marginBottom: Spacing.xl },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: '#A7F3D0',
  },
});
