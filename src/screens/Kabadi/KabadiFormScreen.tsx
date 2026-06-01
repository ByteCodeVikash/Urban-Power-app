import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, TextInput, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Calendar, Clock, MapPin, Truck } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { KABADI_ITEMS } from '../../constants/MockData';
import { useAddresses } from '../../hooks/useServices';
import { useAuthStore } from '../../store/useAuthStore';
import { NetworkImage } from '../../components/NetworkImage';

import { useKabadiStore } from '../../store/useKabadiStore';

export default function KabadiFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, subcategoryName, categoryName } = route.params || {};
  
  // Find the specific subcategory for pricing
  const parentCategory = KABADI_ITEMS.find(k => k.title === categoryName);
  const subcategory = parentCategory?.subcategories.find(s => s.id === categoryId);
  
  const { data: addresses } = useAddresses();
  const { user } = useAuthStore();
  const schedulePickup = useKabadiStore((state) => state.schedulePickup);

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('Morning (9-12)');
  const [instructions, setInstructions] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [weight, setWeight] = useState('');

  // Pickup Address state
  const defaultAddress = addresses?.[0]?.details || 'Add address in profile';
  const defaultLabel   = addresses?.[0]?.type   || 'Home';
  const [pickupAddress, setPickupAddress] = useState(defaultAddress);
  const [addressLabel,  setAddressLabel]  = useState(defaultLabel);

  // Address‑edit modal state
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [draftHouse,    setDraftHouse]    = useState('');
  const [draftArea,     setDraftArea]     = useState('');
  const [draftCity,     setDraftCity]     = useState('');
  const [draftLandmark, setDraftLandmark] = useState('');

  const openAddressModal = () => {
    // Pre-fill draft fields from current address
    setDraftHouse('');
    setDraftArea('');
    setDraftCity('');
    setDraftLandmark('');
    setAddressModalVisible(true);
  };

  const saveAddress = () => {
    const parts = [draftHouse, draftArea, draftCity, draftLandmark].filter(Boolean);
    if (parts.length === 0) {
      setAddressModalVisible(false);
      return;
    }
    setPickupAddress(parts.join(', '));
    setAddressLabel('Custom');
    setAddressModalVisible(false);
  };

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    };
  });

  const handleSchedule = () => {
    if (!name || !phone || !weight) {
      alert('Please enter your name, phone and estimated weight.');
      return;
    }
    schedulePickup({
      categories: [`${categoryName} - ${subcategoryName}`],
      address: addresses?.[0]?.details || 'Default Home',
      date: dates[selectedDate].full,
      timeSlot: selectedSlot,
      estimatedValue: (subcategory?.price || 0) * (parseFloat(weight) || 0),
      userName: name,
      phone: phone,
      estimatedWeight: weight
    });
    alert('Pickup scheduled successfully!');
    navigation.navigate('KabadiBooking' as any); // Navigate to confirmation/booking flow
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <Typography variant="h3" weight="700">Schedule Pickup</Typography>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.selectedBox}>
           <View style={styles.categoryIcon}>
              <NetworkImage source={{ uri: parentCategory?.icon || '' }} style={styles.icon} resizeMode="cover" />
           </View>
           <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <Typography variant="caption" color={Colors.light.textSecondary} weight="700">
                {categoryName?.toUpperCase()}
              </Typography>
              <Typography variant="body1" weight="800">{subcategoryName || 'General Scrap'}</Typography>
              <Typography variant="body2" color={Colors.light.success} weight="700">₹{subcategory?.price || 'Market Rate'}/kg</Typography>
           </View>
           <View style={styles.verifiedBadge}>
              <Typography variant="tiny" color={Colors.light.success} weight="700">Rate Verified</Typography>
           </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Your Details</Typography>
          <View style={styles.inputGroup}>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={Colors.light.textSecondary} style={{ marginBottom: 4 }}>NAME</Typography>
              <TextInput 
                style={styles.singleLineInput}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Typography variant="caption" color={Colors.light.textSecondary} style={{ marginBottom: 4 }}>ESTIMATED WEIGHT (KG)</Typography>
              <TextInput 
                style={styles.singleLineInput}
                placeholder="e.g. 10"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={[styles.inputGroup, { marginTop: Spacing.md }]}>
             <View style={{ flex: 1 }}>
                <Typography variant="caption" color={Colors.light.textSecondary} style={{ marginBottom: 4 }}>PHONE NUMBER</Typography>
                <TextInput 
                  style={styles.singleLineInput}
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
             </View>
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Select Date</Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePicker}>
            {dates.map((item, index) => (
              <Pressable 
                key={index} 
                style={[styles.dateChip, selectedDate === index && styles.activeChip]}
                onPress={() => setSelectedDate(index)}
              >
                <Typography variant="tiny" weight="700" color={selectedDate === index ? Colors.light.white : Colors.light.textSecondary}>
                  {item.day.toUpperCase()}
                </Typography>
                <Typography variant="h3" weight="800" color={selectedDate === index ? Colors.light.white : Colors.light.text}>
                  {item.date}
                </Typography>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Select Time Slot</Typography>
          <View style={styles.slotGrid}>
            {['Morning (9-12)', 'Afternoon (12-4)', 'Evening (4-7)'].map((slot) => (
              <Pressable 
                key={slot} 
                style={[styles.slotChip, selectedSlot === slot && styles.activeChip]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Typography variant="body2" weight="700" color={selectedSlot === slot ? Colors.light.white : Colors.light.text}>
                  {slot.split(' ')[0]}
                </Typography>
                <Typography variant="tiny" color={selectedSlot === slot ? 'rgba(255,255,255,0.7)' : Colors.light.textSecondary}>
                   {slot.split(' ')[1]}
                </Typography>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.addressSection}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Pickup Address</Typography>
          <View style={styles.addressCard}>
            <MapPin color={Colors.light.primary} size={24} />
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <Typography variant="body1" weight="800">{addressLabel}</Typography>
              <Typography variant="body2" color={Colors.light.textSecondary} numberOfLines={2}>
                {pickupAddress}
              </Typography>
            </View>
            <TouchableOpacity style={styles.changeBtn} onPress={openAddressModal} activeOpacity={0.7}>
              <Typography variant="tiny" color={Colors.light.primary} weight="700">CHANGE</Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* ──── Address Edit Modal ──── */}
        <Modal
          visible={addressModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAddressModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalSheet}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Typography variant="h3" weight="800">Change Pickup Address</Typography>
                <TouchableOpacity onPress={() => setAddressModalVisible(false)} activeOpacity={0.7}>
                  <Typography variant="body1" color={Colors.light.textSecondary}>✕</Typography>
                </TouchableOpacity>
              </View>

              {/* House / Flat */}
              <Typography variant="caption" color={Colors.light.textSecondary} style={styles.modalLabel}>HOUSE / FLAT NO.</Typography>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. A-421, Shunya Apartments"
                placeholderTextColor={Colors.light.textMuted}
                value={draftHouse}
                onChangeText={setDraftHouse}
              />

              {/* Area / Street */}
              <Typography variant="caption" color={Colors.light.textSecondary} style={styles.modalLabel}>AREA / STREET</Typography>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Sector 45, Gurugram"
                placeholderTextColor={Colors.light.textMuted}
                value={draftArea}
                onChangeText={setDraftArea}
              />

              {/* City */}
              <Typography variant="caption" color={Colors.light.textSecondary} style={styles.modalLabel}>CITY</Typography>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Delhi"
                placeholderTextColor={Colors.light.textMuted}
                value={draftCity}
                onChangeText={setDraftCity}
              />

              {/* Landmark */}
              <Typography variant="caption" color={Colors.light.textSecondary} style={styles.modalLabel}>LANDMARK (OPTIONAL)</Typography>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Near Metro Station"
                placeholderTextColor={Colors.light.textMuted}
                value={draftLandmark}
                onChangeText={setDraftLandmark}
              />

              {/* Save Button */}
              <TouchableOpacity style={styles.saveBtn} onPress={saveAddress} activeOpacity={0.85}>
                <Typography variant="body1" weight="800" color={Colors.light.white}>SAVE ADDRESS</Typography>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

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

        <View style={styles.hintBox}>
           <Truck size={20} color={Colors.light.primary} />
           <Typography variant="body2" color={Colors.light.textSecondary} style={{ marginLeft: Spacing.sm, flex: 1 }}>
              Professional will bring a digital scale. Instant payment via UPI or Cash.
           </Typography>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Confirm & Schedule" 
          onPress={handleSchedule} 
          size="lg"
        />
      </View>
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
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
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
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.light.white,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.light.sm,
  },
  icon: { width: 34, height: 34 },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1, borderColor: '#A7F3D0',
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
    width: 70, height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.surface,
    marginRight: Spacing.md,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  activeChip: { 
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    ...Shadows.light.sm,
  },
  slotGrid: { flexDirection: 'row', gap: Spacing.sm },
  slotChip: {
    flex: 1, height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  addressSection: { marginBottom: Spacing.xl },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  changeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1, borderColor: Colors.light.borderLight,
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
    borderTopWidth: 1, borderTopColor: Colors.light.borderLight,
    ...Shadows.light.lg,
  },

  // ── Address Modal Styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: 40,
    ...Shadows.light.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalLabel: {
    marginBottom: 4,
    marginTop: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: Spacing.sm,
  },
  saveBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.light.sm,
  },
});

