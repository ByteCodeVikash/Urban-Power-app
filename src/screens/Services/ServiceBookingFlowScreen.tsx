import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Calendar, User, MapPin, CheckCircle2 } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { CATEGORIES } from '../../constants/MockData';
import { useBookingStore } from '../../store/useBookingStore';
import { NetworkImage } from '../../components/NetworkImage';

export default function ServiceBookingFlowScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, categoryName } = route.params;
  const addBooking = useBookingStore((state) => state.addBooking);

  const category = CATEGORIES.find(c => c.id === categoryId);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');

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
      type: 'Service',
      title: selectedService.title,
      subtitle: categoryName,
      customerName: name,
      phone: phone,
      address: address,
      date: date,
      price: selectedService.price,
    });

    // Reuse Kabadi success screen or create a generic one
    navigation.navigate('GeneralBookingSuccess', {
      title: selectedService.title,
      date: date,
      address: address,
    });
  };

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
      <Typography variant="h3" weight="800" style={styles.stepTitle}>Select Subcategory</Typography>
      {category?.services.map((item) => (
        <Pressable 
          key={item.id} 
          style={styles.serviceCard}
          onPress={() => handleServiceSelect(item)}
        >
          <NetworkImage source={{ uri: item.image }} style={styles.serviceImage} resizeMode="cover" />
          <View style={styles.serviceInfo}>
            <Typography variant="body1" weight="800">{item.title}</Typography>
            <Typography variant="body2" color={Colors.light.textSecondary}>{item.duration}</Typography>
            <Typography variant="h4" color={Colors.light.primary} weight="800" style={{ marginTop: 4 }}>
              ₹{item.price}
            </Typography>
          </View>
          <ChevronLeft color={Colors.light.textMuted} size={20} style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
      ))}
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
      <View style={styles.selectedHeader}>
        <NetworkImage source={{ uri: selectedService.image }} style={styles.smallImage} resizeMode="cover" />
        <View style={{ marginLeft: Spacing.md }}>
          <Typography variant="body1" weight="800">{selectedService.title}</Typography>
          <Typography variant="tiny" color={Colors.light.textSecondary}>{categoryName}</Typography>
        </View>
      </View>

      <Typography variant="h3" weight="800" style={styles.stepTitle}>Booking Details</Typography>

      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <User size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Your Name</Typography>
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
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Preferred Date</Typography>
        </View>
        <TextInput 
          style={styles.input}
          placeholder="e.g. 25th Oct, 2025"
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
          placeholder="Enter complete address for service"
          multiline
          numberOfLines={3}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <View style={styles.priceSummary}>
        <Typography variant="body2" color={Colors.light.textSecondary}>Total Amount</Typography>
        <Typography variant="h2" weight="900" color={Colors.light.primary}>₹{selectedService.price}</Typography>
      </View>

      <Button 
        title="Confirm Booking" 
        onPress={handleSubmit}
        size="lg"
        style={styles.submitBtn}
      />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable 
          style={styles.backBtn} 
          onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
        >
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Typography variant="h3" weight="800">{categoryName}</Typography>
          <Typography variant="tiny" color={Colors.light.textSecondary}>
            Step {step} of 2
          </Typography>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: step === 1 ? '50%' : '100%' }]} />
      </View>

      {step === 1 ? renderStep1() : renderStep2()}
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
  listContainer: { paddingBottom: Spacing.xxl },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  serviceImage: {
    width: 80, height: 80, borderRadius: BorderRadius.lg,
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
    borderWidth: 1, borderColor: Colors.light.borderLight,
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
});
