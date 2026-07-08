import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  MapPin,
  Plus,
  Home,
  Briefcase,
  Trash2,
  Edit3,
  X,
  Map,
  Compass,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useAddressStore, Address } from '../../store/useAddressStore';

// Helper to parse geocoded address string into fields
const parseAddress = (fullAddress: string) => {
  const parts = fullAddress.split(',').map(p => p.trim());
  let pincode = '';
  let state = '';
  let city = '';
  let street = fullAddress;

  const pinMatch = fullAddress.match(/\b\d{6}\b/);
  if (pinMatch) {
    pincode = pinMatch[0];
  }

  if (parts.length >= 3) {
    // Attempt parsing by position
    const statePart = parts[parts.length - 2] || '';
    state = statePart.replace(pincode, '').trim();
    city = parts[parts.length - 3] || '';
    street = parts.slice(0, parts.length - 3).join(', ');
  }

  return { street, city, state, pincode };
};

export default function SavedAddressesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    addresses,
    isLoading,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddressStore();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form states
  const [addressType, setAddressType] = useState('Home');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  // Handle route params returned from MapScreen
  useEffect(() => {
    if (route.params?.latitude && route.params?.longitude) {
      const { latitude: lat, longitude: lng, address } = route.params;
      setLatitude(lat);
      setLongitude(lng);

      const parsed = parseAddress(address || '');
      setStreet(parsed.street);
      setCity(parsed.city);
      setState(parsed.state);
      setPincode(parsed.pincode);

      setModalVisible(true);

      // Clear navigation params so they don't trigger modal again on remount
      navigation.setParams({
        latitude: undefined,
        longitude: undefined,
        address: undefined,
      });
    }
  }, [route.params]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setAddressType('Home');
    setHouseNumber('');
    setStreet('');
    setLandmark('');
    setCity('');
    setState('');
    setPincode('');
    setLatitude(undefined);
    setLongitude(undefined);
    setIsDefault(false);

    navigation.navigate('MapScreen', { returnScreen: 'SavedAddresses' });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressType(address.address_type);
    setHouseNumber(address.house_number || '');
    setStreet(address.street);
    setLandmark(address.landmark || '');
    setCity(address.city);
    setState(address.state);
    setPincode(address.pincode);
    setLatitude(address.latitude);
    setLongitude(address.longitude);
    setIsDefault(address.is_default);
    setModalVisible(true);
  };

  const handleUpdateMapLocation = () => {
    setModalVisible(false);
    navigation.navigate('MapScreen', {
      returnScreen: 'SavedAddresses',
      initialLocation:
        latitude && longitude ? { latitude, longitude } : undefined,
    });
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this saved address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(id);
            } catch (err: any) {
              if (!err?.isAuthError) {
                Alert.alert('Error', 'Failed to delete address.');
              }
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
    } catch (err: any) {
      if (!err?.isAuthError) {
        Alert.alert('Error', 'Failed to update default address.');
      }
    }
  };

  const handleSave = async () => {
    if (!street.trim()) {
      Alert.alert('Validation Error', 'Street/Locality is required.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Validation Error', 'City is required.');
      return;
    }
    if (!state.trim()) {
      Alert.alert('Validation Error', 'State is required.');
      return;
    }
    if (!pincode.trim()) {
      Alert.alert('Validation Error', 'Pincode is required.');
      return;
    }

    const payload = {
      address_type: addressType,
      house_number: houseNumber.trim() || null,
      street: street.trim(),
      landmark: landmark.trim() || null,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      latitude: latitude || null,
      longitude: longitude || null,
      is_default: isDefault,
    };

    setIsSaving(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
      } else {
        await addAddress(payload);
      }
      setModalVisible(false);
      setEditingAddress(null);
    } catch (err: any) {
      if (!err?.isAuthError) {
        Alert.alert('Error', 'Failed to save address. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderAddressItem = ({ item }: { item: Address }) => {
    const formattedDetails = [
      item.house_number,
      item.street,
      item.landmark ? `(Near ${item.landmark})` : null,
      item.city,
      item.state,
      item.pincode,
    ]
      .filter(Boolean)
      .join(', ');

    return (
      <View style={styles.addressCard}>
        <View style={styles.addressIcon}>
          {item.address_type === 'Home' ? (
            <Home size={20} color={Colors.light.primary} />
          ) : item.address_type === 'Work' ? (
            <Briefcase size={20} color={Colors.light.primary} />
          ) : (
            <MapPin size={20} color={Colors.light.primary} />
          )}
        </View>

        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <View style={styles.cardHeader}>
            <Typography variant="body1" weight="700">
              {item.address_type}
            </Typography>
            {item.is_default && (
              <View style={styles.defaultBadge}>
                <Typography
                  variant="tiny"
                  weight="700"
                  color={Colors.light.success}
                >
                  DEFAULT
                </Typography>
              </View>
            )}
          </View>

          <Typography
            variant="body2"
            color={Colors.light.textSecondary}
            style={{ marginTop: 4, lineHeight: 18 }}
          >
            {formattedDetails}
          </Typography>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionLink}
              onPress={() => handleEditAddress(item)}
            >
              <Edit3
                size={14}
                color={Colors.light.primary}
                style={{ marginRight: 4 }}
              />
              <Typography
                variant="body2"
                weight="700"
                color={Colors.light.primary}
              >
                Edit
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionLink, { marginLeft: Spacing.xl }]}
              onPress={() => handleDeleteAddress(item.id)}
            >
              <Trash2
                size={14}
                color={Colors.light.error}
                style={{ marginRight: 4 }}
              />
              <Typography
                variant="body2"
                weight="700"
                color={Colors.light.error}
              >
                Delete
              </Typography>
            </TouchableOpacity>

            {!item.is_default && (
              <TouchableOpacity
                style={[styles.actionLink, { marginLeft: 'auto' }]}
                onPress={() => handleSetDefault(item.id)}
              >
                <Typography
                  variant="body2"
                  weight="700"
                  color={Colors.light.textMuted}
                >
                  Set as Default
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Compass size={48} color={Colors.light.textMuted} />
      </View>
      <Typography variant="h2" style={{ marginTop: Spacing.lg }}>
        No Addresses Saved
      </Typography>
      <Typography
        variant="body2"
        color={Colors.light.textSecondary}
        style={styles.emptyText}
      >
        You haven't saved any addresses yet. Add an address now to speed up
        checkout and booking flows.
      </Typography>
      <Button
        title="Add Address"
        onPress={handleAddNew}
        icon={<Plus size={20} color={Colors.light.white} />}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Saved Addresses" showBack />

      <View style={styles.container}>
        {isLoading && addresses.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Typography variant="body2" style={{ marginTop: Spacing.md }}>
              Loading addresses...
            </Typography>
          </View>
        ) : (
          <>
            {addresses.length > 0 && (
              <Pressable style={styles.addNew} onPress={handleAddNew}>
                <View style={styles.plusIcon}>
                  <Plus size={24} color={Colors.light.primary} />
                </View>
                <Typography
                  variant="body1"
                  weight="700"
                  color={Colors.light.primary}
                >
                  Add New Address
                </Typography>
              </Pressable>
            )}

            <FlatList
              data={addresses}
              keyExtractor={item => item.id}
              renderItem={renderAddressItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyState}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.light.primary]}
                  tintColor={Colors.light.primary}
                />
              }
            />
          </>
        )}
      </View>

      {/* Address Form Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Typography variant="h2">
                {editingAddress ? 'Edit Address' : 'New Address Details'}
              </Typography>
              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  setEditingAddress(null);
                }}
                style={styles.closeBtn}
              >
                <X size={24} color={Colors.light.text} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              {/* Map Coordinates Review & Pin update */}
              <View style={styles.coordinateReview}>
                <MapPin size={20} color={Colors.light.primary} />
                <Typography
                  variant="caption"
                  color={Colors.light.textSecondary}
                  style={styles.coordinateText}
                  numberOfLines={2}
                >
                  {latitude && longitude
                    ? `Pinned: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    : 'Location not set on map'}
                </Typography>
                <TouchableOpacity
                  style={styles.mapLink}
                  onPress={handleUpdateMapLocation}
                >
                  <Map
                    size={14}
                    color={Colors.light.primary}
                    style={{ marginRight: 4 }}
                  />
                  <Typography
                    variant="caption"
                    weight="700"
                    color={Colors.light.primary}
                  >
                    Adjust Map
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Address Type segmented buttons */}
              <Typography
                variant="body2"
                weight="700"
                style={styles.inputLabel}
              >
                Address Tag
              </Typography>
              <View style={styles.typeSelector}>
                {['Home', 'Work', 'Other'].map(type => {
                  const isSelected = addressType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setAddressType(type)}
                      style={[
                        styles.typeButton,
                        isSelected && styles.typeButtonSelected,
                      ]}
                    >
                      {type === 'Home' ? (
                        <Home
                          size={16}
                          color={
                            isSelected
                              ? Colors.light.white
                              : Colors.light.textSecondary
                          }
                          style={{ marginRight: 6 }}
                        />
                      ) : type === 'Work' ? (
                        <Briefcase
                          size={16}
                          color={
                            isSelected
                              ? Colors.light.white
                              : Colors.light.textSecondary
                          }
                          style={{ marginRight: 6 }}
                        />
                      ) : (
                        <MapPin
                          size={16}
                          color={
                            isSelected
                              ? Colors.light.white
                              : Colors.light.textSecondary
                          }
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        weight="600"
                        color={
                          isSelected
                            ? Colors.light.white
                            : Colors.light.textSecondary
                        }
                      >
                        {type}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Input Fields */}
              <Typography
                variant="body2"
                weight="700"
                style={styles.inputLabel}
              >
                Flat / House / Block No.
              </Typography>
              <TextInput
                style={styles.input}
                value={houseNumber}
                onChangeText={setHouseNumber}
                placeholder="e.g. Flat 101, Ground Floor"
                placeholderTextColor={Colors.light.textMuted}
              />

              <Typography
                variant="body2"
                weight="700"
                style={styles.inputLabel}
              >
                Street / Locality / Area *
              </Typography>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={street}
                onChangeText={setStreet}
                placeholder="e.g. 5th Main Road, HSR Layout"
                placeholderTextColor={Colors.light.textMuted}
                multiline
                numberOfLines={2}
              />

              <Typography
                variant="body2"
                weight="700"
                style={styles.inputLabel}
              >
                Landmark (Optional)
              </Typography>
              <TextInput
                style={styles.input}
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g. Near HDFC Bank"
                placeholderTextColor={Colors.light.textMuted}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: Spacing.sm }}>
                  <Typography
                    variant="body2"
                    weight="700"
                    style={styles.inputLabel}
                  >
                    City *
                  </Typography>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Bangalore"
                    placeholderTextColor={Colors.light.textMuted}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Typography
                    variant="body2"
                    weight="700"
                    style={styles.inputLabel}
                  >
                    State *
                  </Typography>
                  <TextInput
                    style={styles.input}
                    value={state}
                    onChangeText={setState}
                    placeholder="e.g. Karnataka"
                    placeholderTextColor={Colors.light.textMuted}
                  />
                </View>
              </View>

              <Typography
                variant="body2"
                weight="700"
                style={styles.inputLabel}
              >
                Pincode / Postal Code *
              </Typography>
              <TextInput
                style={styles.input}
                value={pincode}
                onChangeText={setPincode}
                placeholder="e.g. 560102"
                placeholderTextColor={Colors.light.textMuted}
                keyboardType="numeric"
              />

              {/* Set as Default Toggle */}
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="body1" weight="700">
                    Set as Default Address
                  </Typography>
                  <Typography
                    variant="caption"
                    color={Colors.light.textSecondary}
                  >
                    Make this address primary for bookings and deliveries.
                  </Typography>
                </View>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{
                    false: Colors.light.border,
                    true: Colors.light.primaryLight,
                  }}
                  thumbColor={
                    isDefault ? Colors.light.primary : Colors.light.textMuted
                  }
                />
              </View>
            </ScrollView>

            {/* Save Buttons */}
            <View style={styles.modalFooter}>
              <Button
                title={editingAddress ? 'Update Address' : 'Save Address'}
                onPress={handleSave}
                loading={isSaving}
                style={styles.saveBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  container: { flex: 1, padding: Spacing.lg },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.light.primary,
  },
  plusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  list: { paddingBottom: 40, flexGrow: 1 },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    paddingTop: Spacing.md,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  modalScroll: {
    padding: Spacing.lg,
  },
  coordinateReview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  coordinateText: {
    flex: 1,
    marginLeft: Spacing.sm,
    marginRight: Spacing.sm,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: Spacing.lg,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginHorizontal: 4,
  },
  typeButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  modalFooter: {
    paddingHorizontal: Spacing.lg,
  },
  saveBtn: {
    width: '100%',
  },
});
