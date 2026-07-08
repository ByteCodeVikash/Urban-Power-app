import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Plus, Minus, Clock } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { NetworkImage } from '../../components/NetworkImage';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import {
  useBeauticianCategories,
  useBeauticianServices,
} from '../../hooks/useBeautician';
import {
  useBeauticianStore,
  BeauticianService,
} from '../../store/useBeauticianStore';
import { RootStackParamList } from '../../navigation/Types';

type BeauticianServicesRouteProp = RouteProp<
  RootStackParamList,
  'BeauticianServices'
>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BeauticianServicesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BeauticianServicesRouteProp>();

  // Optional categoryId passed from CategoriesScreen
  const initialCategoryId = route.params?.categoryId;

  // Active category selection state for filtering
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(
    initialCategoryId,
  );

  // Sync categoryId if route params change
  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCatId(initialCategoryId);
    }
  }, [initialCategoryId]);

  // Fetch categories and services
  const { data: categories, isLoading: loadingCats } =
    useBeauticianCategories();
  const { data: services, isLoading: loadingServices } =
    useBeauticianServices(selectedCatId);

  // Zustand selection properties
  const selectedServices = useBeauticianStore(state => state.selectedServices);
  const addService = useBeauticianStore(state => state.addService);
  const removeService = useBeauticianStore(state => state.removeService);
  const getSelectedCount = useBeauticianStore(
    state => state.getSelectedCount,
  )();
  const getTotalPrice = useBeauticianStore(state => state.getTotalPrice)();
  const clearSelection = useBeauticianStore(state => state.clearSelection);

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const handleServiceToggle = (service: BeauticianService) => {
    if (isServiceSelected(service.id)) {
      removeService(service.id);
    } else {
      addService(service);
    }
  };

  const isLoading = loadingCats || loadingServices;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <Typography variant="h3" weight="700">
          Beauty Services
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      {/* Category Horizontal Filter */}
      {!loadingCats && categories && categories.length > 0 && (
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <Pressable
              style={[
                styles.filterPill,
                selectedCatId === undefined && styles.filterPillActive,
              ]}
              onPress={() => setSelectedCatId(undefined)}
            >
              <Typography
                variant="body2"
                weight="700"
                color={
                  selectedCatId === undefined
                    ? Colors.light.white
                    : Colors.light.textSecondary
                }
              >
                All
              </Typography>
            </Pressable>

            {categories.map((cat: any) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.filterPill,
                  selectedCatId === cat.id && styles.filterPillActive,
                ]}
                onPress={() => setSelectedCatId(cat.id)}
              >
                <Typography
                  variant="body2"
                  weight="700"
                  color={
                    selectedCatId === cat.id
                      ? Colors.light.white
                      : Colors.light.textSecondary
                  }
                >
                  {cat.name}
                </Typography>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Typography variant="body1" color={Colors.light.textSecondary}>
                No services found for this category.
              </Typography>
            </View>
          }
          renderItem={({ item }) => {
            const selected = isServiceSelected(item.id);
            return (
              <Pressable
                style={styles.card}
                onPress={() =>
                  navigation.navigate('BeauticianServiceDetails', {
                    serviceId: item.id,
                    serviceTitle: item.name,
                  })
                }
              >
                <View style={styles.serviceInfoSection}>
                  {item.image ? (
                    <NetworkImage
                      source={{ uri: item.image }}
                      style={styles.serviceImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.fallbackImage}>
                      <Typography
                        variant="body1"
                        color={Colors.light.primary}
                        weight="700"
                      >
                        {item.name.charAt(0)}
                      </Typography>
                    </View>
                  )}
                  <View style={styles.serviceDetails}>
                    <Typography
                      variant="body1"
                      weight="700"
                      color={Colors.light.text}
                    >
                      {item.name}
                    </Typography>
                    {item.description && (
                      <Typography
                        variant="caption"
                        color={Colors.light.textSecondary}
                        numberOfLines={2}
                        style={styles.descText}
                      >
                        {item.description}
                      </Typography>
                    )}
                    <View style={styles.metaRow}>
                      <Typography
                        variant="body2"
                        weight="800"
                        color={Colors.light.primary}
                      >
                        ₹{item.price}
                      </Typography>
                      {item.duration && (
                        <View style={styles.durationRow}>
                          <Clock size={12} color={Colors.light.textSecondary} />
                          <Typography
                            variant="caption"
                            color={Colors.light.textSecondary}
                          >
                            {item.duration} mins
                          </Typography>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View
                  style={styles.actionContainer}
                  onStartShouldSetResponder={() => true}
                >
                  <Pressable
                    style={[styles.addBtn, selected && styles.removeBtn]}
                    onPress={() => handleServiceToggle(item)}
                  >
                    {selected ? (
                      <Minus color={Colors.light.white} size={16} />
                    ) : (
                      <Plus color={Colors.light.white} size={16} />
                    )}
                    <Typography
                      variant="caption"
                      color={Colors.light.white}
                      weight="700"
                      style={styles.btnText}
                    >
                      {selected ? 'Remove' : 'Add'}
                    </Typography>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {/* Sticky Selection Footer */}
      {selectedServices.length > 0 && (
        <View style={styles.footerContainer}>
          <View style={styles.footerInfo}>
            <Typography variant="body2" weight="600" color={Colors.light.white}>
              {getSelectedCount} Service(s) Selected
            </Typography>
            <Typography variant="caption" color={Colors.light.primaryLight}>
              Total Price: ₹{getTotalPrice}
            </Typography>
          </View>
          <View style={styles.footerActions}>
            <Pressable style={styles.clearBtn} onPress={clearSelection}>
              <Typography
                variant="body2"
                color={Colors.light.primary}
                weight="700"
              >
                Clear
              </Typography>
            </Pressable>
            <Pressable
              style={styles.bookBtn}
              onPress={() => navigation.navigate('BeauticianBooking' as any)}
            >
              <Typography
                variant="body2"
                color={Colors.light.white}
                weight="700"
              >
                Book Now
              </Typography>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  filterContainer: {
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  filterPillActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
    gap: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  serviceInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  serviceImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  fallbackImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  descText: {
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  addBtn: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    gap: 4,
  },
  removeBtn: {
    backgroundColor: '#DC2626', // Red color for remove
  },
  btnText: {
    fontSize: 12,
  },
  footerContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.light.primary,
    padding: Spacing.md,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.light.md,
  },
  footerInfo: {
    flexDirection: 'column',
  },
  clearBtn: {
    backgroundColor: Colors.light.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bookBtn: {
    backgroundColor: Colors.light.primaryDark || '#5925CC',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.white,
  },
});
