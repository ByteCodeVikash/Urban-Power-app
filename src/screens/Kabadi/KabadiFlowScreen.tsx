import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, TextInput, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Calendar, User, MapPin, Scale, CheckCircle2 } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { KABADI_ITEMS } from '../../constants/MockData';
import { useBookingStore } from '../../store/useBookingStore';
import { NetworkImage } from '../../components/NetworkImage';

export default function KabadiFlowScreen() {
  const navigation = useNavigation<any>();
  const addBooking = useBookingStore((state) => state.addBooking);

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [weight, setWeight] = useState('');
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
          setStep(1);
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

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!name || !phone || !weight || !address || !date) {
      alert('Please fill all fields');
      return;
    }

    addBooking({
      id: Math.random().toString(36).substr(2, 9),
      type: 'Kabadi',
      title: selectedCategory.title,
      subtitle: `${weight}kg Pickup`,
      customerName: name,
      address: address,
      date: date,
      price: parseFloat(weight) * selectedCategory.price,
      status: 'Upcoming',
    });

    setStep(3);
  };

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
      <Typography variant="h3" weight="800" style={styles.stepTitle}>Select Scrap Category</Typography>
      <View style={styles.gridRow}>
        {KABADI_ITEMS.map((item) => (
          <Pressable 
            key={item.id} 
            style={styles.categoryCard}
            onPress={() => handleCategorySelect(item)}
          >
            <View style={styles.iconWrapper}>
              <NetworkImage source={{ uri: item.icon }} style={styles.icon} resizeMode="cover" />
            </View>
            <Typography variant="tiny" weight="800" align="center" style={styles.categoryName}>
              {item.title}
            </Typography>
            <View style={styles.priceTag}>
               <Typography variant="tiny" color={Colors.light.white} weight="800">
                ₹{item.price}/kg
              </Typography>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
      <View style={styles.selectedHeader}>
        <View style={styles.smallIconWrapper}>
          <NetworkImage source={{ uri: selectedCategory.icon }} style={styles.smallIcon} resizeMode="cover" />
        </View>
        <View style={{ marginLeft: Spacing.md }}>
          <Typography variant="body1" weight="800">{selectedCategory.title}</Typography>
          <Typography variant="tiny" color={Colors.light.textSecondary}>Selected Category</Typography>
        </View>
      </View>

      <Typography variant="h3" weight="800" style={styles.stepTitle}>Pickup Details</Typography>

      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <User size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Name</Typography>
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
          <Scale size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Approx Weight (kg)</Typography>
        </View>
        <TextInput 
          style={styles.input}
          placeholder="e.g. 10"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <MapPin size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Pickup Address</Typography>
        </View>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Enter complete pickup address"
          multiline
          numberOfLines={3}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <Calendar size={18} color={Colors.light.primary} />
          <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Pickup Date</Typography>
        </View>
        <TextInput 
          style={styles.input}
          placeholder="e.g. 25th Oct, 2025"
          value={date}
          onChangeText={setDate}
        />
      </View>

      <Button 
        title="Confirm Pickup Request" 
        onPress={handleSubmit}
        size="lg"
        style={styles.submitBtn}
      />
    </ScrollView>
  );

  const renderStep3 = () => (
    <View style={styles.successContainer}>
      <CheckCircle2 size={80} color="#10B981" />
      <Typography variant="h2" weight="900" style={styles.successTitle}>Booking Successful!</Typography>
      <Typography variant="body1" align="center" color={Colors.light.textSecondary} style={styles.successSubtitle}>
        Our pickup agent will arrive at your address on {date}. Keep your {selectedCategory.title} ready!
      </Typography>
      
      <View style={styles.summaryCard}>
        <Typography variant="body2" color={Colors.light.textSecondary}>Approx Value</Typography>
        <Typography variant="h3" weight="900" color={Colors.light.primary}>
          ₹{(parseFloat(weight) * selectedCategory.price).toFixed(2)}
        </Typography>
      </View>

      <Button 
        title="Done" 
        onPress={() => navigation.navigate('Home')}
        size="lg"
        style={{ width: '100%', marginTop: Spacing.xl }}
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
            else if (step === 2) setStep(1);
            else navigation.goBack();
          }}
        >
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Typography variant="h3" weight="800">Kabadi Pickup</Typography>
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
  grid: { paddingBottom: 150 }, // Increased padding for bottom tab
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
  },
  categoryCard: {
    width: '33.33%',
    padding: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconWrapper: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  icon: { width: 32, height: 32 },
  categoryName: { marginTop: 4, height: 32 },
  priceTag: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.full,
  },
  
  formContainer: { paddingHorizontal: Spacing.xl, paddingBottom: 150 }, // Increased padding for bottom tab
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  smallIconWrapper: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.light.white,
    justifyContent: 'center', alignItems: 'center',
  },
  smallIcon: { width: 24, height: 24 },
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
  submitBtn: { marginTop: Spacing.lg },

  // Success Step Styles
  successContainer: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: Colors.light.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
});
